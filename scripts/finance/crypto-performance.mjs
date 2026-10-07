// Mesure de la performance crypto par les apports nets.
//
// Lit l'historique de chaque adresse, valorise chaque mouvement au cours du
// jour, puis compare a la valeur actuelle. Tout echec rend null : la carte
// affiche alors la bourse seule, plutot qu'un chiffre faux mais credible.
//
// BNB Chain est exclue des deux cotes : aucune API gratuite sans cle ne donne
// son historique.

import { readEvmFlows } from './flows-evm.mjs';
import { readSolanaFlows } from './flows-solana.mjs';
import { readBitcoinFlows, readDogecoinFlows } from './flows-utxo.mjs';
import { currentPrice, sumContributions, valueHoldings } from './performance.mjs';
import { fetchPriceHistories } from './price-history.mjs';
import { COINGECKO_IDS, fetchPrices, priceKey } from './prices.mjs';

export const EXCLUDED_NETWORKS = new Set(['bnb']);

const DEFAULT_READERS = {
  evm: (address, network) => readEvmFlows(address, network),
  bitcoin: (address) => readBitcoinFlows(address),
  dogecoin: (address) => readDogecoinFlows(address),
  solana: (address) => readSolanaFlows(address),
};

export const flowAssets = (flows) => {
  const assets = new Map();
  for (const flow of flows ?? []) {
    if (!assets.has(flow.key)) {
      assets.set(flow.key, { key: flow.key, symbol: flow.symbol, contract: flow.contract, platform: flow.platform });
    }
  }
  return [...assets.values()];
};

const dedupe = (assets) => [...new Map(assets.map((asset) => [asset.key, asset])).values()];

// Le RPC Solana public limite le debit par IP : deux adresses lues en meme
// temps cumuleraient les refus et les reprises. Les autres reseaux, servis par
// des explorateurs differents, restent lus en parallele.
const readAllFlows = async (targets, readers) => {
  const read = (target) => readers[target.family](target.address, target.network);
  const solana = targets.filter((target) => target.family === 'solana');
  const others = targets.filter((target) => target.family !== 'solana');

  const readSolanaInSequence = async () => {
    const results = [];
    for (const target of solana) results.push(await read(target));
    return results;
  };

  const [otherResults, solanaResults] = await Promise.all([
    Promise.all(others.map(read)),
    readSolanaInSequence(),
  ]);
  return [...otherResults, ...solanaResults];
};

// Chaque etape ci-dessous rend soit son resultat, soit { warning } : un motif
// fixe, sans montant ni adresse, qui masque la mesure.

// Seuls les jetons cotes aujourd'hui meritent un appel d'historique : les
// autres sont du spam, absent aussi de la valeur actuelle.
const pickWantedAssets = async (assets, { prices, vaults, apiKey, listPrices }) => {
  const tokens = assets.filter((asset) => asset.contract);
  let listingFailed = false;
  const listed = tokens.length > 0
    ? await listPrices(tokens, { apiKey, onFallback: () => { listingFailed = true; } })
    : {};
  if (listingFailed) return { warning: 'cotation des jetons indisponible' };

  return {
    wanted: dedupe([
      ...assets.filter((asset) => (asset.contract ? listed[asset.key] || prices?.[asset.key] : COINGECKO_IDS[asset.symbol])),
      ...Object.values(vaults ?? {}).map((vault) => vault.underlying),
    ]),
  };
};

const valueContributions = (flows, wanted, histories, vaults) => {
  // Un actif demande mais sans historique compterait pour zero dans les
  // apports tout en pesant dans la valeur actuelle : le gain serait fausse
  // sans le moindre signal.
  if (wanted.some((asset) => !(histories[asset.key]?.length > 0))) {
    return { warning: 'historique de cours manquant' };
  }

  const { complete, total } = sumContributions(flows, histories, vaults);
  return complete ? { total } : { warning: 'flux plus ancien que l historique des cours' };
};

// La valeur actuelle et les apports doivent porter sur les memes actifs :
// sinon un solde compte d'un cote et pas de l'autre produirait un chiffre
// faux mais credible a l'ecran. Rend le motif de refus, ou null.
const checkCoverage = (holdings, { wanted, flows, prices, vaults }) => {
  const wantedKeys = new Set(wanted.map((asset) => asset.key));
  const flowKeys = new Set(flows.map((flow) => flow.key));

  for (const holding of holdings) {
    const key = priceKey(holding);
    const price = currentPrice(holding, prices, vaults ?? {});

    if ((wantedKeys.has(key) || vaults?.[key]) && price === null) return 'cours actuel manquant';
    if (price !== null && holding.amount > 0 && !flowKeys.has(key)) return 'solde sans mouvement connu';
  }
  return null;
};

export const measureCryptoPerformance = async ({
  targets,
  holdings,
  prices,
  vaults,
  apiKey,
  onWarn,
  readers = DEFAULT_READERS,
  listPrices = fetchPrices,
  fetchHistories = fetchPriceHistories,
}) => {
  const masked = (warning) => {
    onWarn?.(warning);
    return null;
  };

  const included = (targets ?? []).filter((target) => !EXCLUDED_NETWORKS.has(target.network));
  if (included.length === 0) return null;

  const results = await readAllFlows(included, readers);
  if (results.some((result) => result.truncated)) return masked('historique trop long ou coupe');
  const flows = results.flatMap((result) => result.flows);

  const picked = await pickWantedAssets(flowAssets(flows), { prices, vaults, apiKey, listPrices });
  if (picked.warning) return masked(picked.warning);

  const histories = await fetchHistories(picked.wanted, { apiKey });
  const contributions = valueContributions(flows, picked.wanted, histories, vaults);
  if (contributions.warning) return masked(contributions.warning);

  const includedHoldings = (holdings ?? []).filter((holding) => !EXCLUDED_NETWORKS.has(holding.network));
  const uncovered = checkCoverage(includedHoldings, { wanted: picked.wanted, flows, prices, vaults });
  if (uncovered) return masked(uncovered);

  const current = valueHoldings(includedHoldings, prices, vaults ?? {});
  return { cost: contributions.total, gain: current - contributions.total };
};
