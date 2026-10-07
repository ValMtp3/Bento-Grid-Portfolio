// Calcul de la performance, sans reseau.
//
// Bourse : plus-value latente fournie par le courtier, rapportee a son cout.
// Crypto : apports nets. Une blockchain dit ce qui est entre et sorti, jamais
// a quel prix ; chaque mouvement est donc valorise au cours du jour, et la
// valeur actuelle est comparee a la somme de ces apports.
//
// Les montants naissent et meurent ici ou dans anonymize.mjs : seuls des
// pourcentages entiers en sortent.

import { priceKey } from './prices.mjs';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Cours d'un actif a une date, dans une serie [[ms, cours]] : celui du point
 * le plus proche, avant ou apres, car la source rend le cours le plus proche
 * du moment demande. Rend null quand ce point est a plus d'un jour : ce n'est
 * plus le cours du mouvement, et l'utiliser serait inventer.
 */
export const priceAt = (series, time) => {
  if (!Array.isArray(series) || series.length === 0 || !Number.isFinite(time)) return null;

  let nearest = null;
  for (const [pointTime, pointPrice] of series) {
    const gap = Math.abs(pointTime - time);
    if (nearest === null || gap < nearest.gap) nearest = { gap, price: pointPrice };
  }

  return nearest.gap <= MS_PER_DAY ? nearest.price : null;
};

/**
 * Apports nets en euros : une entree compte en plus, une sortie en moins, au
 * cours du jour du mouvement. Un swap ou un transfert entre ses propres
 * wallets sort et rentre le meme jour : il s'annule de lui-meme.
 */
export const sumContributions = (flows, histories, vaults = {}) => {
  let total = 0;

  for (const flow of flows ?? []) {
    const vault = vaults[flow.key];
    const series = histories?.[vault ? vault.underlyingKey : flow.key];
    // Actif jamais cote : jeton de spam ou inconnu de l'agregateur. Il est aussi
    // absent de la valeur actuelle, l'ignorer garde les deux cotes alignes.
    if (!series || series.length === 0) continue;

    const price = priceAt(series, flow.time);
    if (price === null) return { complete: false, total: null };

    // Part de coffre convertie au taux d'aujourd'hui, pas a celui du depot :
    // le rendement accumule par le coffre n'est donc pas compte comme gain.
    total += flow.amount * (vault ? vault.rate : 1) * price;
  }

  return { complete: true, total };
};

const positivePrice = (value) => {
  const price = Number(value);
  return Number.isFinite(price) && price > 0 ? price : null;
};

/**
 * Cours actuel d'un solde : son cours direct, ou, pour une part de coffre, le
 * cours du sous-jacent multiplie par le taux part -> sous-jacent. Rend null
 * sans cours exploitable. Regle unique, partagee par la valorisation et par le
 * controle de couverture de la perf crypto : les deux doivent voir les memes
 * actifs.
 */
export const currentPrice = (holding, prices, vaults = {}) => {
  const key = priceKey(holding);
  const direct = positivePrice(prices?.[key]);
  if (direct !== null) return direct;

  const vault = vaults?.[key];
  if (!vault) return null;
  const underlying = positivePrice(prices?.[vault.underlyingKey]);
  return underlying === null ? null : positivePrice(underlying * vault.rate);
};

/**
 * Valeur actuelle des soldes, avec la meme regle que les flux : une part de
 * coffre vaut son sous-jacent, un actif sans cours ne vaut rien.
 */
export const valueHoldings = (holdings, prices, vaults = {}) =>
  (holdings ?? []).reduce((sum, holding) => {
    const price = currentPrice(holding, prices, vaults);
    return price === null ? sum : sum + holding.amount * price;
  }, 0);

// Un apport net minuscule face a la valeur actuelle (gains deja sortis vers
// une plateforme, puis revenus) donnerait un % absurde a quatre chiffres.
const MIN_CONTRIBUTION_SHARE = 0.1;

const usable = (part) =>
  part && Number.isFinite(part.cost) && Number.isFinite(part.gain) && part.cost > 0 ? part : null;

// Plancher propre a la crypto : en bourse, le cout vient du courtier et reste
// le prix d'achat reel des titres detenus.
const usableCrypto = (part) => {
  const candidate = usable(part);
  if (!candidate) return null;
  return candidate.cost < MIN_CONTRIBUTION_SHARE * (candidate.cost + candidate.gain) ? null : candidate;
};

// "|| 0" : Math.round(-0.4) vaut -0, qui s'afficherait "-0 %".
const percent = (gain, cost) => Math.round((gain / cost) * 100) || 0;

/**
 * Reduit les mesures en pourcentages publiables. Le global n'existe que si les
 * deux mesures existent : un global calcule sur la seule bourse se lirait
 * comme le portefeuille entier.
 */
export const toPerformance = ({ stocks, crypto } = {}) => {
  const stocksPart = usable(stocks);
  const cryptoPart = usableCrypto(crypto);
  if (!stocksPart && !cryptoPart) return null;

  return {
    overall:
      stocksPart && cryptoPart
        ? percent(stocksPart.gain + cryptoPart.gain, stocksPart.cost + cryptoPart.cost)
        : null,
    stocks: stocksPart ? percent(stocksPart.gain, stocksPart.cost) : null,
    crypto: cryptoPart ? percent(cryptoPart.gain, cryptoPart.cost) : null,
  };
};
