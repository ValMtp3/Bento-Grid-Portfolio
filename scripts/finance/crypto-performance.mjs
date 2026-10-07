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
import { COINGECKO_IDS, fetchPrices } from './prices.mjs';

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
  const { complete, total } = sumContributions(flows, histories, vaults);
  if (!complete) {
    onWarn?.('flux plus ancien que l historique des cours');
    return null;
  }

  const current = valueHoldings(
    (holdings ?? []).filter((holding) => !EXCLUDED_NETWORKS.has(holding.network)),
    prices,
    vaults,
  );

  return { cost: total, gain: current - total };
};
