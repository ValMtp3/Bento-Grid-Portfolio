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
import { sumContributions, valueHoldings } from './performance.mjs';
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

// Cours actuel d'un solde : direct, ou converti via son coffre de depot.
// Meme regle que valueHoldings, reprise ici pour verifier que la valeur
// actuelle et les apports portent sur les memes actifs avant de publier quoi
// que ce soit.
const currentPriceOf = (holding, prices, vaults) => {
  const key = priceKey(holding);
  const vault = vaults?.[key];
  const price = Number(vault ? prices?.[vault.underlyingKey] : prices?.[key]);
  return Number.isFinite(price) && price > 0 ? price : null;
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
  const included = (targets ?? []).filter((target) => !EXCLUDED_NETWORKS.has(target.network));
  if (included.length === 0) return null;

  const results = await Promise.all(
    included.map((target) => readers[target.family](target.address, target.network)),
  );
  if (results.some((result) => result.truncated)) {
    onWarn?.('historique trop long ou coupe');
    return null;
  }

  const flows = results.flatMap((result) => result.flows);
  const assets = flowAssets(flows);

  // Seuls les jetons cotes aujourd'hui meritent un appel d'historique : les
  // autres sont du spam, absent aussi de la valeur actuelle.
  const tokens = assets.filter((asset) => asset.contract);
  let listingFailed = false;
  const listed = tokens.length > 0
    ? await listPrices(tokens, { apiKey, onFallback: () => { listingFailed = true; } })
    : {};
  if (listingFailed) {
    onWarn?.('cotation des jetons indisponible');
    return null;
  }

  const wanted = dedupe([
    ...assets.filter((asset) => (asset.contract ? listed[asset.key] || prices?.[asset.key] : COINGECKO_IDS[asset.symbol])),
    ...Object.values(vaults ?? {}).map((vault) => vault.underlying),
  ]);

  const histories = await fetchHistories(wanted, { apiKey });

  // Un actif demande mais sans historique compterait pour zero dans les
  // apports tout en pesant dans la valeur actuelle : le gain serait fausse
  // sans le moindre signal.
  if (wanted.some((asset) => !(histories[asset.key]?.length > 0))) {
    onWarn?.('historique de cours manquant');
    return null;
  }

  const { complete, total } = sumContributions(flows, histories, vaults);
  if (!complete) {
    onWarn?.('flux plus ancien que l historique des cours');
    return null;
  }

  const includedHoldings = (holdings ?? []).filter((holding) => !EXCLUDED_NETWORKS.has(holding.network));
  const wantedKeys = new Set(wanted.map((asset) => asset.key));
  const flowKeys = new Set(flows.map((flow) => flow.key));

  // La valeur actuelle et les apports doivent porter sur les memes actifs :
  // sinon un solde compte d'un cote et pas de l'autre produirait un chiffre
  // faux mais credible a l'ecran.
  for (const holding of includedHoldings) {
    const key = priceKey(holding);
    const vault = vaults?.[key];
    const price = currentPriceOf(holding, prices, vaults);

    if ((wantedKeys.has(key) || vault) && price === null) {
      onWarn?.('cours actuel manquant');
      return null;
    }

    if (price !== null && holding.amount > 0 && !flowKeys.has(key)) {
      onWarn?.('solde sans mouvement connu');
      return null;
    }
  }

  const current = valueHoldings(includedHoldings, prices, vaults);

  return { cost: total, gain: current - total };
};
