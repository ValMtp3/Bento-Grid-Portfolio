// Collecte les statistiques de portefeuille dans un JSON unique.
//
// Meme principe que scripts/fetch-pulse.mjs : le site etant deploye a la main,
// ce fichier est lu au runtime depuis raw.githubusercontent.com. Un commit du
// JSON suffit a rafraichir la carte, sans redeploiement.
//
// Ce qui entre ici : une cle de courtier et des adresses de wallet, toutes
// venues des secrets du depot. Ce qui en sort : des pourcentages et des
// compteurs. La frontiere est scripts/finance/anonymize.mjs, et elle est
// verifiee par ses propres tests avant chaque execution en CI.
//
// Execution locale : `pnpm finance`, qui charge .env — node ne le lit pas seul.

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

import { anonymize } from './finance/anonymize.mjs';
import { EVM_CHAINS, readBitcoin, readDogecoin, readEvm, readSolana } from './finance/chains.mjs';
import { collectAll, CollectError } from './finance/collect.mjs';
import { mergeHoldings, toCryptoPositions } from './finance/holdings.mjs';
import { fetchPrices, priceKey } from './finance/prices.mjs';
import { fetchOrders, fetchPositions } from './finance/trading212.mjs';
import { readVault } from './finance/vaults.mjs';

const OUTPUT_PATH = resolve('public/data/finance.json');

// Une adresse EVM vaut sur toutes les chaines compatibles, mais chacune coute
// deux appels. Par defaut on s'en tient a Ethereum ; EVM_CHAINS elargit sans
// toucher au code.
const DEFAULT_EVM_CHAINS = ['ethereum'];

const warn = (label) => (error) =>
  console.warn(`  repli ${label} : ${error?.message ?? error}`);

// Plusieurs adresses peuvent cohabiter sur un meme reseau : une adresse
// historique et une adresse courante, par exemple. Chacune devient une source
// a part entiere, pour qu'une panne sur l'une reste identifiable.
const splitAddresses = (value) =>
  (value ?? '')
    .split(',')
    .map((address) => address.trim())
    .filter(Boolean);

const buildSources = (env) => {
  const sources = [];

  if (env.TRADING212_API_KEY) {
    sources.push({
      name: 'Trading 212',
      kind: 'positions',
      collect: () =>
        fetchPositions({
          apiKey: env.TRADING212_API_KEY,
          apiSecret: env.TRADING212_API_SECRET,
        }),
    });
  }

  if (env.WALLET_EVM) {
    const requested = (env.EVM_CHAINS ?? '')
      .split(',')
      .map((name) => name.trim().toLowerCase())
      .filter(Boolean);

    const unknown = requested.filter((name) => !(name in EVM_CHAINS));
    if (unknown.length > 0) {
      throw new Error(
        `Chaines EVM inconnues : ${unknown.join(', ')}. `
        + `Chaines disponibles : ${Object.keys(EVM_CHAINS).join(', ')}.`,
      );
    }

    for (const chain of requested.length > 0 ? requested : DEFAULT_EVM_CHAINS) {
      for (const address of splitAddresses(env.WALLET_EVM)) {
        sources.push({
          name: `EVM ${chain}`,
          kind: 'holdings',
          collect: () => readEvm(address, chain, { onFallback: warn(chain) }),
        });
      }
    }
  }

  for (const [index, address] of splitAddresses(env.WALLET_SOLANA).entries()) {
    sources.push({
      name: splitAddresses(env.WALLET_SOLANA).length > 1 ? `Solana #${index + 1}` : 'Solana',
      kind: 'holdings',
      collect: () => readSolana(address, { onFallback: warn('solana') }),
    });
  }

  for (const [index, address] of splitAddresses(env.WALLET_BITCOIN).entries()) {
    sources.push({
      name: splitAddresses(env.WALLET_BITCOIN).length > 1 ? `Bitcoin #${index + 1}` : 'Bitcoin',
      kind: 'holdings',
      collect: () => readBitcoin(address, { onFallback: warn('bitcoin') }),
    });
  }

  for (const [index, address] of splitAddresses(env.WALLET_DOGECOIN).entries()) {
    sources.push({
      name: splitAddresses(env.WALLET_DOGECOIN).length > 1 ? `Dogecoin #${index + 1}` : 'Dogecoin',
      kind: 'holdings',
      collect: () => readDogecoin(address, { onFallback: warn('dogecoin') }),
    });
  }

  return sources;
};

const readPrevious = async () => {
  try {
    return JSON.parse(await readFile(OUTPUT_PATH, 'utf8'));
  } catch {
    // Premiere execution : il n'y a rien a comparer, ce n'est pas une erreur.
    return null;
  }
};

const sources = buildSources(process.env);

if (sources.length === 0) {
  throw new Error(
    'Aucune source configuree. Renseignez au moins TRADING212_API_KEY ou une adresse WALLET_*.',
  );
}

console.log(`Sources actives : ${sources.map((source) => source.name).join(', ')}`);

const brokerSources = sources.filter((source) => source.kind === 'positions');
const chainSources = sources.filter((source) => source.kind === 'holdings');

// Les deux familles sont collectees ensemble pour que l'echec de n'importe
// laquelle interrompe la publication : une allocation amputee d'une source
// reste credible a l'ecran tout en etant fausse.
let broker = { positions: [], sources: [] };
let chains = { positions: [], sources: [] };

try {
  [broker, chains] = await Promise.all([
    brokerSources.length > 0 ? collectAll(brokerSources) : broker,
    chainSources.length > 0 ? collectAll(chainSources) : chains,
  ]);
} catch (error) {
  if (error instanceof CollectError) {
    for (const failure of error.failures) {
      console.error(`  ${failure.name} : ${failure.cause?.message ?? failure.cause}`);
    }
  }
  throw error;
}

const holdings = mergeHoldings(chains.positions);

const prices = holdings.length > 0
  ? await fetchPrices(holdings, {
      apiKey: process.env.COINGECKO_API_KEY,
      onFallback: warn('cours crypto'),
    })
  : {};

// Les jetons sans cours sont souvent des parts de coffre de depot : le coffre
// sait les convertir en jeton sous-jacent, qui lui est cote. Sans cette etape,
// l'argent place sur un protocole de rendement disparait du total.
const unpriced = holdings.filter((holding) => holding.contract && !prices[priceKey(holding)]);
const resolved = [];

for (const holding of unpriced) {
  const chain = EVM_CHAINS[holding.platform];
  if (!chain) continue;

  try {
    const vault = await readVault(chain.rpc, holding.contract, holding.amount);
    if (vault) {
      resolved.push({
        ...holding,
        contract: vault.contract,
        amount: vault.amount,
        // Un depot sur un coffre de rendement travaille, par definition.
        staked: true,
      });
    }
  } catch (error) {
    // Un jeton ordinaire repond une donnee vide a ces appels : ce n'est pas un
    // echec de collecte, seulement "ce contrat n'est pas un coffre".
    warn('coffre')(error);
  }
}

if (resolved.length > 0) {
  console.log(`  coffres de depot resolus : ${resolved.length}`);
  Object.assign(prices, await fetchPrices(resolved, {
    apiKey: process.env.COINGECKO_API_KEY,
    onFallback: warn('cours des sous-jacents'),
  }));
}

const priced = [...holdings.filter((holding) => prices[priceKey(holding)]), ...resolved];

const cryptoPositions = toCryptoPositions(priced, prices, {
  onSkip: (symbol) => console.warn(`  actif sans cours connu, ecarte : ${symbol}`),
});

// Rend null quand la cle n'a pas la permission : la charge utile omet alors
// les metriques de rythme, au lieu de publier un zero qui se lirait
// "aucun ordre ce mois-ci".
let orders = null;
if (process.env.TRADING212_API_KEY) {
  try {
    orders = await fetchOrders({
      apiKey: process.env.TRADING212_API_KEY,
      apiSecret: process.env.TRADING212_API_SECRET,
    });
  } catch (error) {
    warn('historique des ordres')(error);
  }
}

console.log(`  ordres lus : ${orders ? orders.length : 'permission absente'}`);

const payload = anonymize({
  positions: [...broker.positions, ...cryptoPositions],
  ...(orders ? { orders } : {}),
  sources: [...broker.sources, ...chains.sources],
});

if (!payload) {
  throw new Error('Aucune position exploitable, on garde le finance.json precedent.');
}

// Le workflow tourne toutes les 6 h alors que des parts arrondies a 5 % bougent
// rarement. Sans cette comparaison, l'horodatage seul produirait un commit a
// chaque execution et noierait l'historique du depot.
const previous = await readPrevious();
if (previous) {
  const { generatedAt: _previousDate, ...previousPayload } = previous;
  const { generatedAt: _currentDate, ...currentPayload } = payload;

  if (JSON.stringify(previousPayload) === JSON.stringify(currentPayload)) {
    console.log('Finance inchange, aucune ecriture.');
    process.exit(0);
  }
}

await mkdir(dirname(OUTPUT_PATH), { recursive: true });
await writeFile(OUTPUT_PATH, `${JSON.stringify(payload, null, 2)}\n`);

console.log(`Finance ecrit : ${OUTPUT_PATH}`);
console.log(`  positions : ${payload.structure.positions}`);
console.log(`  melange   : ${payload.mix.map((part) => `${part.label} ${part.share} %`).join(' · ')}`);
console.log(`  zones     : ${payload.regions.map((part) => `${part.label} ${part.share} %`).join(' · ') || 'aucune'}`);
