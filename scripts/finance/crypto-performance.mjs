// Mesure de la performance crypto par les apports nets.
//
// Lit l'historique de chaque adresse, valorise chaque mouvement au cours du
// moment (DefiLlama en dollars, converti au taux BCE), puis compare a la
// valeur actuelle (cours CoinGecko en euros). Tout echec rend null : la carte
// affiche alors la bourse seule, plutot qu'un chiffre faux mais credible.
//
// Regle unique de cotation : un actif sans cours historique (spam, jeton
// inconnu de DefiLlama) est ignore des deux cotes, apports et valeur actuelle.
//
// BNB Chain est exclue des deux cotes : aucune API gratuite sans cle ne donne
// son historique.

import { readEvmFlows } from './flows-evm.mjs';
import { readSolanaFlows } from './flows-solana.mjs';
import { readBitcoinFlows, readDogecoinFlows } from './flows-utxo.mjs';
import { fetchFlowPrices as fetchDefaultFlowPrices } from './historical-prices.mjs';
import { currentPrice, sumContributions, valueHoldings } from './performance.mjs';
import { priceKey } from './prices.mjs';

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

// Les verifications ci-dessous rendent un motif fixe, sans montant ni
// adresse, qui masque la mesure ; ou null quand tout est en ordre.

const holdingAsset = (holding) => ({
  key: priceKey(holding),
  symbol: holding.symbol,
  contract: holding.contract ?? null,
  platform: holding.platform ?? null,
});

// Ce qu'il faut demander a la source de cours historiques :
//   - chaque actif aux dates de ses mouvements ;
//   - pour une part de coffre, son sous-jacent aux dates des mouvements de
//     parts, puisque la part est valorisee par lui ;
//   - un solde sans aucun mouvement, a la date du jour : seule facon de savoir
//     s'il est cote (vrai actif, historique incomplet) ou non (spam).
const planPriceRequests = (flows, holdings, vaults, now) => {
  const seriesAsset = (asset) => vaults[asset.key]?.underlying ?? asset;
  const flowKeys = new Set(flows.map((flow) => flow.key));
  const unseen = holdings.map(holdingAsset).filter((asset) => !flowKeys.has(asset.key));

  const requests = [
    ...flows.map((flow) => ({ ...flow, key: seriesAsset(flow).key })),
    ...unseen.map((asset) => ({ ...seriesAsset(asset), time: now, amount: 0 })),
  ];
  const assets = dedupe([...flowAssets(flows), ...unseen].map(seriesAsset));
  return { requests, assets };
};

// Cle de la serie qui valorise un actif : le sous-jacent pour une part de coffre.
const seriesKeyOf = (key, vaults) => vaults[key]?.underlyingKey ?? key;

// Une serie presente mais vide vient d'un actif connu de la source sans cours
// exploitable : l'ignorer fausserait les apports sans le moindre signal.
const checkHistories = (histories) =>
  Object.values(histories).some((series) => !(series?.length > 0)) ? 'historique de cours manquant' : null;

// La valeur actuelle et les apports doivent porter sur les memes actifs :
// sinon un solde compte d'un cote et pas de l'autre produirait un chiffre
// faux mais credible a l'ecran.
const checkCoverage = (pricedHoldings, { flows, prices, vaults }) => {
  const flowKeys = new Set(flows.map((flow) => flow.key));

  for (const holding of pricedHoldings) {
    if (currentPrice(holding, prices, vaults) === null) return 'cours actuel manquant';
    if (holding.amount > 0 && !flowKeys.has(priceKey(holding))) return 'solde sans mouvement connu';
  }
  return null;
};

export const measureCryptoPerformance = async ({
  targets,
  holdings,
  prices,
  vaults: vaultsOption,
  onWarn,
  readers = DEFAULT_READERS,
  fetchFlowPrices = fetchDefaultFlowPrices,
  now = Date.now(),
}) => {
  const masked = (warning) => {
    onWarn?.(warning);
    return null;
  };
  const vaults = vaultsOption ?? {};

  const included = (targets ?? []).filter((target) => !EXCLUDED_NETWORKS.has(target.network));
  if (included.length === 0) return null;

  const results = await readAllFlows(included, readers);
  if (results.some((result) => result.truncated)) return masked('historique trop long ou coupe');
  const flows = results.flatMap((result) => result.flows);

  const includedHoldings = (holdings ?? []).filter((holding) => !EXCLUDED_NETWORKS.has(holding.network));
  const { requests, assets } = planPriceRequests(flows, includedHoldings, vaults, now);
  const histories = await fetchFlowPrices(requests, assets, { now });

  const emptyHistory = checkHistories(histories);
  if (emptyHistory) return masked(emptyHistory);

  const { complete, total } = sumContributions(flows, histories, vaults);
  if (!complete) return masked('flux plus ancien que l historique des cours');

  // Un solde dont l'actif n'a pas de cours historique est ignore, comme ses
  // mouvements dans sumContributions.
  const pricedHoldings = includedHoldings.filter((holding) => histories[seriesKeyOf(priceKey(holding), vaults)]);
  const uncovered = checkCoverage(pricedHoldings, { flows, prices, vaults });
  if (uncovered) return masked(uncovered);

  const current = valueHoldings(pricedHoldings, prices, vaults);
  return { cost: total, gain: current - total };
};
