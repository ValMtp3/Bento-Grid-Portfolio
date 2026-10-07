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
 * Cours d'un actif a une date, dans une serie [[ms, cours]] triee.
 * Rend null quand le flux precede la serie de plus d'un jour : il est plus
 * ancien que l'historique disponible, et l'estimer serait inventer.
 */
export const priceAt = (series, time) => {
  if (!Array.isArray(series) || series.length === 0 || !Number.isFinite(time)) return null;
  if (time < series[0][0] - MS_PER_DAY) return null;

  let price = series[0][1];
  for (const [pointTime, pointPrice] of series) {
    if (pointTime > time) break;
    price = pointPrice;
  }

  return price;
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

    total += flow.amount * (vault ? vault.rate : 1) * price;
  }

  return { complete: true, total };
};

const positivePrice = (value) => {
  const price = Number(value);
  return Number.isFinite(price) && price > 0 ? price : null;
};

/**
 * Valeur actuelle des soldes, avec la meme regle que les flux : une part de
 * coffre vaut son sous-jacent, un actif sans cours ne vaut rien.
 */
export const valueHoldings = (holdings, prices, vaults = {}) =>
  (holdings ?? []).reduce((sum, holding) => {
    const key = priceKey(holding);
    const direct = positivePrice(prices?.[key]);
    if (direct !== null) return sum + holding.amount * direct;

    const vault = vaults[key];
    const underlying = positivePrice(prices?.[vault?.underlyingKey]);
    if (vault && underlying !== null) return sum + holding.amount * vault.rate * underlying;

    return sum;
  }, 0);

const usable = (part) =>
  part && Number.isFinite(part.cost) && Number.isFinite(part.gain) && part.cost > 0 ? part : null;

// "|| 0" : Math.round(-0.4) vaut -0, qui s'afficherait "-0 %".
const percent = (gain, cost) => Math.round((gain / cost) * 100) || 0;

/**
 * Reduit les mesures en pourcentages publiables. Le global n'existe que si les
 * deux mesures existent : un global calcule sur la seule bourse se lirait
 * comme le portefeuille entier.
 */
export const toPerformance = ({ stocks, crypto } = {}) => {
  const stocksPart = usable(stocks);
  const cryptoPart = usable(crypto);
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
