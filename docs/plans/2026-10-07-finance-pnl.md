# Performance du portefeuille (PnL bourse + crypto) — plan d'implémentation

> **Pour les agents :** sous-skill requis : `superpowers:executing-plans` (ou
> `superpowers:subagent-driven-development`) pour suivre ce plan tâche par tâche.
> Les étapes utilisent des cases à cocher (`- [ ]`) pour le suivi.
> **Aucun commit sans l'accord explicite de Valentin** (règle du dépôt) : chaque
> étape « Commit » commence par lui demander.

**Objectif :** afficher dans la carte « Portefeuille » la performance en %
(global, bourse, crypto), sans jamais publier de montant.

**Architecture :** la bourse lit la plus-value latente de Trading 212
(`/equity/account/summary`). La crypto est estimée par les **apports nets** :
chaque mouvement on-chain entrant ou sortant est valorisé au cours CoinGecko du
jour, puis comparé à la valeur actuelle. Les montants restent dans le collecteur.
Seuls des % entiers sortent, par `anonymize.mjs`, comme le reste de la carte.

**Stack :** Node 22 (`node:test`, `fetch`, aucune dépendance ajoutée), Vue 3
`<script setup>`, Tailwind 4, GitHub Actions.

**Spec :** décisions prises avec Valentin le 2026-10-07 (pas de document séparé) :

| Sujet | Décision |
| --- | --- |
| Format public | % seulement, jamais d'euros |
| Bourse | latent seulement (`unrealizedProfitLoss / totalCost`) |
| Crypto | estimation on-chain par apports nets |
| Historique incomplet (flux > 1 an, source en panne, pagination coupée) | PnL crypto masqué, la carte affiche la bourse seule et pas de global |
| BNB Chain | exclue du PnL crypto (aucun historique sans clé), mention « hors BNB Chain » |
| Affichage | % global + détail bourse / crypto |

## Contraintes globales

- `pnpm` uniquement ; aucune dépendance ajoutée (le workflow finance n'installe rien).
- Commentaires en français **sans accents** dans `scripts/`, qui expliquent le pourquoi.
- Immutabilité : retourner des copies, ne pas muter les arguments.
- Aucun montant, aucune adresse, aucun symbole dans `public/data/finance.json` ;
  `assertSafe` doit continuer de passer sans être assoupli (`pnl`, `profit`, `value`,
  `total` restent interdits).
- **Aucun montant dans les logs** du collecteur : les logs GitHub Actions d'un dépôt
  public sont publics. Seuls des % ou des compteurs peuvent être affichés.
- Clés publiques : `performance: { overall, stocks, crypto }`, chacune entier ou `null`.
- Dark mode via `prefers-color-scheme` (pas de classe `.dark` sur `<html>`).
- Tests : `node --test` (`pnpm test`), même style que `scripts/finance/*.test.mjs`.

## Points de vigilance (Review Focus)

1. **Coffre Morpho (ERC-4626) détenu** : le dépôt d'USDC sort du wallet et la part
   reçue n'est pas cotée. Sans traitement, le gain serait gonflé du montant déposé.
   Attendu : les parts sont valorisées au taux actuel × cours historique du
   sous-jacent → test dans la tâche 2.
2. **Transferts internes Blockscout en double** : si l'API renvoie l'appel racine
   (index 0) en plus de la transaction, l'ETH serait compté deux fois. Attendu :
   index 0 ignoré → test dans la tâche 4.
3. **Jetons de spam** reçus sans consentement. Attendu : non cotés, donc ignorés
   dans les flux comme dans la valeur actuelle → test dans la tâche 8.
4. **Apports nets ≤ 0** (plus retiré que déposé). Un % n'a pas de sens. Attendu :
   crypto `null` → test dans la tâche 2.
5. **Quota Trading 212 déguisé en HTTP 200**. Attendu : erreur levée, bourse `null`,
   la collecte continue → test dans la tâche 1.

Limites connues, non testables hors réseau et à observer au premier vrai lancement :
- Solana : un compte de jeton **fermé** est retrouvé dès qu'une transaction
  lue cite le wallet comme propriétaire de ce compte (soldes de jetons avant /
  après). Seul un compte fermé qu'aucune transaction lue ne cite échappe encore
  à l'historique (gain surestimé).
- Bitcoin/Dogecoin : les frais d'une transaction sortante comptent comme une
  sortie et non comme une perte (écart négligeable).
- Le % global mélange du latent (bourse) et des apports nets (crypto) : les
  libellés de la carte le disent.
- Coffres de dépôt (Morpho) : leur rendement est effacé, car les parts sont
  valorisées au taux actuel des deux côtés (apports et valeur actuelle). La
  perf crypto est donc prudente, jamais gonflée. Décision de Valentin : limite
  acceptée.
- Emballage ETH → WETH : à vérifier au premier vrai lancement que Blockscout
  indexe bien le WETH reçu sur Base et Arbitrum.
- Mémoire de 24 h : la date retenue est celle de la dernière **publication**
  d'une valeur. Une valeur restée stable plus de 24 h (écart < 2 points), puis
  suivie d'une panne de mesure, est donc masquée au lieu d'être reportée.
- Cours historiques : DefiLlama (en dollars, sans limite d'ancienneté),
  convertis en euros au taux BCE du jour publié par Frankfurter. La valeur
  actuelle reste en cours CoinGecko en euros : l'écart entre les deux sources
  est faible devant un pourcentage arrondi à l'entier.
- Jetons sans cours DefiLlama (spam, jetons obscurs) : ignorés **des deux
  côtés**, apports et valeur actuelle. Un solde sans mouvement est sondé à la
  date du jour : coté chez DefiLlama, il masque la perf (historique incomplet) ;
  non coté, il est ignoré. Un actif coté chez DefiLlama mais sans cours actuel
  CoinGecko masque la perf.

## Fichiers

| Fichier | Rôle |
| --- | --- |
| `scripts/finance/trading212.mjs` (modif.) | + `parseAccountSummary`, `fetchAccountSummary` |
| `scripts/finance/performance.mjs` (nouveau) | calcul pur : `priceAt`, `sumContributions`, `valueHoldings`, `toPerformance` |
| `scripts/finance/historical-prices.mjs` (nouveau) | cours historiques DefiLlama (USD) convertis au taux BCE (Frankfurter) |
| `scripts/finance/flows-evm.mjs` (nouveau) | flux EVM via Blockscout |
| `scripts/finance/flows-utxo.mjs` (nouveau) | flux Bitcoin (Esplora) et Dogecoin (BlockCypher) |
| `scripts/finance/flows-solana.mjs` (nouveau) | flux Solana via RPC |
| `scripts/finance/crypto-performance.mjs` (nouveau) | orchestration réseau de la perf crypto |
| `scripts/finance/stabilize.mjs` (nouveau) | seuil de 2 points et report de 24 h de la perf publiée |
| `scripts/finance/anonymize.mjs` (modif.) | publie `performance` |
| `scripts/finance/chains.mjs` (modif.) | exporte `SOLANA_RPC`, `SOLANA_TOKEN_PROGRAMS` |
| `scripts/fetch-finance.mjs` (modif.) | branchement, tag `network`, cibles, coffres |
| `.github/workflows/finance.yml` (modif.) | `timeout-minutes` |
| `src/data/finance.js` (modif.) | `formatPerformance` |
| `src/components/FinanceComponent.vue` (modif.) | tuiles de performance |

Forme d'un **flux** (partagée par les tâches 2, 4, 5, 6, 8) :

```js
// time : ms epoch ; key : priceKey (symbole natif en majuscules ou contrat en minuscules)
// amount : quantite signee en unite courante (+ entree, - sortie)
{ time: 1759840000000, key: 'ETH', symbol: 'ETH', contract: null, platform: null, amount: 0.5 }
{ time: 1759840000000, key: '0xa0b8...', symbol: 'USDC', contract: '0xA0b8...', platform: 'ethereum', amount: -100 }
```

Forme d'une entrée de **coffre** (`vaults[shareKey]`) :

```js
{ underlyingKey: '0xa0b8...', rate: 1.04, underlying: { key: '0xa0b8...', symbol: '0xa0b8...', contract: '0xA0b8...', platform: 'base' } }
```

---

### Tâche 1 : résumé de compte Trading 212

**Fichiers :**
- Modifier : `scripts/finance/trading212.mjs` (après `fetchPositions`)
- Test : `scripts/finance/trading212.test.mjs`

**Interfaces :**
- Produit : `parseAccountSummary(payload) → { cost: number, gain: number } | null`,
  `fetchAccountSummary({ apiKey, apiSecret, fetchImpl?, timeoutMs? }) → Promise<{ cost, gain } | null>`

- [ ] **Étape 1 : écrire les tests qui échouent** (ajouter à l'import `fetchAccountSummary, parseAccountSummary`)

```js
describe('parseAccountSummary', () => {
  it('garde le cout et la plus-value latente', () => {
    const summary = parseAccountSummary({
      cash: { availableToTrade: 12 },
      id: 123,
      investments: { currentValue: 5500, totalCost: 5000, unrealizedProfitLoss: 500, realizedProfitLoss: 80 },
    });

    assert.deepEqual(summary, { cost: 5000, gain: 500 });
  });

  // Sans cout, un pourcentage serait une division par zero : mieux vaut rien.
  it('rend null sans cout exploitable', () => {
    assert.equal(parseAccountSummary({ investments: { totalCost: 0, unrealizedProfitLoss: 0 } }), null);
    assert.equal(parseAccountSummary({}), null);
    assert.equal(parseAccountSummary(null), null);
  });
});

const fakeFetch = (status, body) => async () => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body,
});

describe('fetchAccountSummary', () => {
  it('rend le resume neutralise', async () => {
    const summary = await fetchAccountSummary({
      apiKey: 'k',
      fetchImpl: fakeFetch(200, { investments: { totalCost: 100, unrealizedProfitLoss: -5 } }),
    });

    assert.deepEqual(summary, { cost: 100, gain: -5 });
  });

  // Le quota depasse arrive parfois en 200 : le lire comme un compte vide
  // publierait une performance fausse.
  it('leve sur un quota depasse deguise en 200', async () => {
    await assert.rejects(
      fetchAccountSummary({ apiKey: 'k', fetchImpl: fakeFetch(200, { context: { type: 'TooManyRequests' } }) }),
      /quota/,
    );
  });

  it('leve une HttpError definitive sur une cle refusee', async () => {
    await assert.rejects(
      fetchAccountSummary({ apiKey: 'k', fetchImpl: fakeFetch(401, {}) }),
      (error) => error.permanent === true,
    );
  });
});
```

- [ ] **Étape 2 : lancer et voir l'échec**

Run : `node --test scripts/finance/trading212.test.mjs`
Attendu : FAIL, `fetchAccountSummary` / `parseAccountSummary` non exportés.

- [ ] **Étape 3 : implémenter** (ajouter `const SUMMARY_PATH = '/equity/account/summary';` près de `ORDERS_PATH`)

```js
/**
 * Reduit le resume de compte au couple cout / plus-value latente. Le cash et le
 * numero de compte n'ont rien a faire hors de ce module.
 */
export const parseAccountSummary = (payload) => {
  const cost = Number(payload?.investments?.totalCost);
  const gain = Number(payload?.investments?.unrealizedProfitLoss);
  if (!Number.isFinite(cost) || !Number.isFinite(gain) || cost <= 0) return null;

  return { cost, gain };
};

/**
 * Plus-value latente du compte, deja convertie dans la devise du compte par le
 * courtier : la recalculer ligne a ligne obligerait a gerer les taux de change.
 */
export const fetchAccountSummary = async ({ apiKey, apiSecret, fetchImpl = fetch, timeoutMs = 15000 }) => {
  const url = `${BASE_URL}${SUMMARY_PATH}`;
  const response = await fetchImpl(url, {
    headers: {
      Authorization: authHeader(apiKey, apiSecret),
      Accept: 'application/json',
      'User-Agent': 'Bento-Grid-Portfolio/1.0',
    },
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!response.ok) throw new HttpError(response.status, url);

  const payload = await response.json();
  if (payload?.context?.type === 'TooManyRequests') {
    throw new Error('Trading 212 : quota depasse sur le resume de compte');
  }

  return parseAccountSummary(payload);
};
```

- [ ] **Étape 4 : relancer** — `node --test scripts/finance/trading212.test.mjs` → PASS.
- [ ] **Étape 5 : commit (après accord)** — `feat(finance): lit la plus-value latente Trading 212`

---

### Tâche 2 : calcul pur de la performance

**Fichiers :**
- Créer : `scripts/finance/performance.mjs`
- Test : `scripts/finance/performance.test.mjs`

**Interfaces :**
- Consomme : `priceKey` de `./prices.mjs`
- Produit :
  - `priceAt(series: [ms, number][], time: number) → number | null`
  - `sumContributions(flows, histories: Record<key, series>, vaults?) → { complete: boolean, total: number | null }`
  - `valueHoldings(holdings, prices: Record<key, number>, vaults?) → number`
  - `toPerformance({ stocks?: {cost, gain} | null, crypto?: {cost, gain} | null }) → { overall, stocks, crypto } | null` (entiers ou `null`)

- [ ] **Étape 1 : écrire les tests qui échouent**

```js
// Tout ce qui touche a l'argent passe ici : les chiffres sont choisis a la main
// pour que chaque attente se verifie de tete.

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { priceAt, sumContributions, toPerformance, valueHoldings } from './performance.mjs';

const DAY = 24 * 60 * 60 * 1000;
const T0 = Date.UTC(2026, 0, 1);
const series = [[T0, 100], [T0 + DAY, 110], [T0 + 2 * DAY, 120]];

const flow = (time, key, amount) => ({ time, key, symbol: key, contract: null, platform: null, amount });

describe('priceAt', () => {
  it('prend le dernier cours connu a la date du flux', () => {
    assert.equal(priceAt(series, T0 + DAY + 3600_000), 110);
    assert.equal(priceAt(series, T0 + 10 * DAY), 120);
  });

  it('tolere un flux le jour precedant le premier point', () => {
    assert.equal(priceAt(series, T0 - 3600_000), 100);
  });

  // Un flux plus vieux que l'historique ne peut pas etre valorise : l'estimer
  // au plus vieux cours connu serait inventer un chiffre.
  it('rend null pour un flux plus ancien que la serie', () => {
    assert.equal(priceAt(series, T0 - 3 * DAY), null);
  });

  it('rend null sur une serie vide', () => {
    assert.equal(priceAt([], T0), null);
  });
});

describe('sumContributions', () => {
  it('additionne les entrees et retranche les sorties au cours du jour', () => {
    const result = sumContributions(
      [flow(T0, 'ETH', 2), flow(T0 + 2 * DAY, 'ETH', -1)],
      { ETH: series },
    );

    assert.deepEqual(result, { complete: true, total: 2 * 100 - 120 });
  });

  // Un swap sort et rentre le meme jour pour la meme valeur : il s'annule.
  it('neutralise un swap entre deux actifs cotes', () => {
    const result = sumContributions(
      [flow(T0, 'USDC', -100), flow(T0, 'ETH', 1)],
      { USDC: [[T0, 1]], ETH: series },
    );

    assert.equal(result.total, 0);
  });

  it('ignore un actif sans historique, comme un jeton de spam', () => {
    const result = sumContributions([flow(T0, 'SPAM', 1e9)], { ETH: series });

    assert.deepEqual(result, { complete: true, total: 0 });
  });

  it('signale un flux plus ancien que l historique', () => {
    const result = sumContributions([flow(T0 - 30 * DAY, 'ETH', 1)], { ETH: series });

    assert.deepEqual(result, { complete: false, total: null });
  });

  // Sans ce traitement, l'USDC depose sort du total alors que le coffre est
  // compte dans la valeur actuelle : le gain serait gonfle du depot entier.
  it('valorise les parts d un coffre au taux actuel et au cours du sous-jacent', () => {
    const vaults = { share: { underlyingKey: 'USDC', rate: 1.05, underlying: {} } };
    const result = sumContributions(
      [flow(T0, 'USDC', -100), flow(T0, 'share', 100)],
      { USDC: [[T0, 1]] },
      vaults,
    );

    assert.ok(Math.abs(result.total - 5) < 1e-9);
  });
});

describe('valueHoldings', () => {
  it('valorise au cours actuel et passe par le sous-jacent pour un coffre', () => {
    const total = valueHoldings(
      [
        { symbol: 'ETH', amount: 2 },
        { symbol: 'X', contract: '0xSHARE', amount: 10 },
        { symbol: 'Y', contract: '0xNOPRICE', amount: 99 },
      ],
      { ETH: 1000, '0xusdc': 1 },
      { '0xshare': { underlyingKey: '0xusdc', rate: 1.5, underlying: {} } },
    );

    assert.equal(total, 2000 + 15);
  });
});

describe('toPerformance', () => {
  it('pondere le global par les couts, en pourcentages entiers', () => {
    assert.deepEqual(
      toPerformance({ stocks: { cost: 1000, gain: 100 }, crypto: { cost: 3000, gain: 900 } }),
      { overall: 25, stocks: 10, crypto: 30 },
    );
  });

  it('masque le global quand une des deux mesures manque', () => {
    assert.deepEqual(
      toPerformance({ stocks: { cost: 1000, gain: -50 }, crypto: null }),
      { overall: null, stocks: -5, crypto: null },
    );
  });

  // Plus retire que depose : le rapport gain / apport n'a plus de sens.
  it('ecarte des apports nets nuls ou negatifs', () => {
    assert.deepEqual(
      toPerformance({ stocks: null, crypto: { cost: -200, gain: 900 } }),
      null,
    );
  });

  it('ne rend jamais -0', () => {
    assert.equal(Object.is(toPerformance({ stocks: { cost: 1000, gain: -1 } }).stocks, 0), true);
  });

  it('rend null sans aucune mesure', () => {
    assert.equal(toPerformance({}), null);
    assert.equal(toPerformance(undefined), null);
  });
});
```

- [ ] **Étape 2 : lancer et voir l'échec** — `node --test scripts/finance/performance.test.mjs` → FAIL, module absent.

- [ ] **Étape 3 : implémenter**

```js
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
```

Note : `toPerformance(undefined)` doit marcher → la signature `({ stocks, crypto } = {})` le couvre.

- [ ] **Étape 4 : relancer** — `node --test scripts/finance/performance.test.mjs` → PASS.
- [ ] **Étape 5 : commit (après accord)** — `feat(finance): calcule la performance par apports nets`

---

### Tâche 3 : cours historiques CoinGecko

**Fichiers :**
- Créer : `scripts/finance/price-history.mjs`
- Test : `scripts/finance/price-history.test.mjs`

**Interfaces :**
- Consomme : `fetchJson` (`./http.mjs`), `withRetry` (`./collect.mjs`), `COINGECKO_IDS`, `PLATFORMS`, `VS_CURRENCY` (`./prices.mjs`)
- Produit : `historyUrl(asset) → string | null`, `parseMarketChart(payload) → [ms, number][]`,
  `fetchPriceHistories(assets, { apiKey?, fetch?, pauseMs?, retry? }) → Promise<Record<key, series>>`
  où `asset = { key, symbol, contract, platform }`

- [ ] **Étape 1 : tests qui échouent**

```js
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { fetchPriceHistories, historyUrl, parseMarketChart } from './price-history.mjs';

describe('historyUrl', () => {
  it('cote un actif natif par son identifiant', () => {
    assert.match(historyUrl({ key: 'ETH', symbol: 'ETH', contract: null }), /\/coins\/ethereum\/market_chart\?vs_currency=eur&days=365&interval=daily$/);
  });

  // Les mints Solana sont sensibles a la casse : le contrat d'origine est garde.
  it('cote un jeton par plateforme et contrat d origine', () => {
    const url = historyUrl({ key: 'epjf', symbol: 'EPjF', contract: 'EPjFWdd5', platform: 'solana' });
    assert.match(url, /\/coins\/solana\/contract\/EPjFWdd5\/market_chart\?/);
  });

  it('rend null pour un actif impossible a coter', () => {
    assert.equal(historyUrl({ key: 'BNB?', symbol: 'XYZ', contract: null }), null);
    assert.equal(historyUrl({ key: '0x1', symbol: 'A', contract: '0x1', platform: 'inconnue' }), null);
  });
});

describe('parseMarketChart', () => {
  it('trie et ecarte les points inutilisables', () => {
    assert.deepEqual(
      parseMarketChart({ prices: [[2, 20], [1, 10], [3, 0], ['x', 5], [4, null]] }),
      [[1, 10], [2, 20]],
    );
  });

  it('rend une serie vide sur une reponse inattendue', () => {
    assert.deepEqual(parseMarketChart(null), []);
  });
});

describe('fetchPriceHistories', () => {
  it('indexe chaque serie par la cle de l actif et envoie la cle API', async () => {
    const calls = [];
    const fetch = async (url, options) => {
      calls.push({ url, options });
      return { prices: [[1, url.includes('bitcoin') ? 50000 : 2000]] };
    };

    const histories = await fetchPriceHistories(
      [
        { key: 'BTC', symbol: 'BTC', contract: null },
        { key: 'ETH', symbol: 'ETH', contract: null },
        { key: 'ZZZ', symbol: 'ZZZ', contract: null },
      ],
      { apiKey: 'demo', fetch, pauseMs: 0, retry: (task) => task() },
    );

    assert.deepEqual(histories, { BTC: [[1, 50000]], ETH: [[1, 2000]] });
    assert.equal(calls.length, 2);
    assert.equal(calls[0].options.headers['x-cg-demo-api-key'], 'demo');
  });

  // Un trou dans les cours ferait ignorer un actif reel : la perf serait
  // fausse sans le moindre signal. On prefere echouer.
  it('propage une erreur reseau', async () => {
    const fetch = async () => { throw new Error('HTTP 429'); };
    await assert.rejects(
      fetchPriceHistories([{ key: 'ETH', symbol: 'ETH', contract: null }], { fetch, pauseMs: 0, retry: (task) => task() }),
      /429/,
    );
  });
});
```

- [ ] **Étape 2 : lancer** — `node --test scripts/finance/price-history.test.mjs` → FAIL.

- [ ] **Étape 3 : implémenter**

```js
// Cours historiques, un point par jour sur un an, pour valoriser chaque
// mouvement on-chain au cours de sa date.
//
// Un an est la limite du plan gratuit de l'agregateur : un flux plus ancien ne
// peut pas etre valorise, et la performance crypto est alors masquee.

import { withRetry } from './collect.mjs';
import { fetchJson } from './http.mjs';
import { COINGECKO_IDS, PLATFORMS, VS_CURRENCY } from './prices.mjs';

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';
const HISTORY_DAYS = 365;
// Plan gratuit : 30 appels par minute. 2,1 s entre deux appels garde une marge
// pour les appels de cours actuels du meme job.
const PAUSE_MS = 2100;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const historyUrl = (asset) => {
  const query = `vs_currency=${VS_CURRENCY}&days=${HISTORY_DAYS}&interval=daily`;

  if (!asset?.contract) {
    const id = COINGECKO_IDS[asset?.symbol];
    return id ? `${COINGECKO_BASE}/coins/${id}/market_chart?${query}` : null;
  }

  const platform = PLATFORMS[asset.platform];
  return platform
    ? `${COINGECKO_BASE}/coins/${platform}/contract/${asset.contract}/market_chart?${query}`
    : null;
};

export const parseMarketChart = (payload) =>
  (Array.isArray(payload?.prices) ? payload.prices : [])
    .filter(
      (point) =>
        Array.isArray(point)
        && Number.isFinite(point[0])
        && Number.isFinite(point[1])
        && point[1] > 0,
    )
    .map(([time, price]) => [time, price])
    .sort((a, b) => a[0] - b[0]);

/**
 * Un appel par actif, en serie : l'agregateur limite le debit par minute, et
 * des appels paralleles se feraient refuser en rafale.
 */
export const fetchPriceHistories = async (
  assets,
  { apiKey, fetch = fetchJson, pauseMs = PAUSE_MS, retry = withRetry } = {},
) => {
  const histories = {};
  const headers = apiKey ? { 'x-cg-demo-api-key': apiKey } : {};
  let calls = 0;

  for (const asset of assets ?? []) {
    const url = historyUrl(asset);
    if (!url) continue;

    if (calls > 0) await wait(pauseMs);
    calls += 1;

    histories[asset.key] = parseMarketChart(await retry(() => fetch(url, { headers })));
  }

  return histories;
};
```

- [ ] **Étape 4 : relancer** → PASS.
- [ ] **Étape 5 : commit (après accord)** — `feat(finance): lit les cours historiques des cryptos`

---

### Tâche 4 : flux EVM (Blockscout)

**Fichiers :**
- Créer : `scripts/finance/flows-evm.mjs`
- Test : `scripts/finance/flows-evm.test.mjs`

**Interfaces :**
- Consomme : `fetchJson` (`./http.mjs`), `EVM_CHAINS`, `fromBaseUnits` (`./chains.mjs`)
- Produit : `parseEvmTransactions(payload, address, chainName)`, `parseEvmInternal(payload, address, chainName)`,
  `parseEvmTokenTransfers(payload, address, chainName)` → `Flow[]` ;
  `readEvmFlows(address, chainName, { fetch?, maxPages? }) → Promise<{ flows: Flow[], truncated: boolean }>`

- [ ] **Étape 1 : tests qui échouent**

```js
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  parseEvmInternal,
  parseEvmTokenTransfers,
  parseEvmTransactions,
  readEvmFlows,
} from './flows-evm.mjs';

const ME = '0xAbC0000000000000000000000000000000000001';
const OTHER = '0x9990000000000000000000000000000000000002';
const WEI = '1000000000000000000';
const at = '2026-03-12T10:00:00.000000Z';

describe('parseEvmTransactions', () => {
  it('signe les entrees et les sorties, casse ignoree', () => {
    const flows = parseEvmTransactions({
      items: [
        { status: 'ok', timestamp: at, value: WEI, from: { hash: OTHER }, to: { hash: ME.toLowerCase() } },
        { status: 'ok', timestamp: at, value: WEI, from: { hash: ME }, to: { hash: OTHER } },
      ],
    }, ME, 'base');

    assert.deepEqual(flows.map((flow) => flow.amount), [1, -1]);
    assert.deepEqual(flows[0], { time: Date.parse(at), key: 'ETH', symbol: 'ETH', contract: null, platform: null, amount: 1 });
  });

  // Une transaction echouee consomme du gaz mais ne transfere pas sa valeur.
  it('ignore les transactions echouees, nulles et vers soi-meme', () => {
    const flows = parseEvmTransactions({
      items: [
        { status: 'error', timestamp: at, value: WEI, from: { hash: OTHER }, to: { hash: ME } },
        { status: 'ok', timestamp: at, value: '0', from: { hash: ME }, to: { hash: OTHER } },
        { status: 'ok', timestamp: at, value: WEI, from: { hash: ME }, to: { hash: ME } },
      ],
    }, ME, 'ethereum');

    assert.deepEqual(flows, []);
  });

  it('prend le natif de la chaine', () => {
    const [flow] = parseEvmTransactions({
      items: [{ status: 'ok', timestamp: at, value: WEI, from: { hash: OTHER }, to: { hash: ME } }],
    }, ME, 'polygon');
    assert.equal(flow.key, 'POL');
  });
});

describe('parseEvmInternal', () => {
  // L'ETH recu d'un routeur de swap arrive en transfert interne, pas en
  // transaction : sans lui, chaque swap vers de l'ETH paraitrait un retrait.
  it('compte l ETH recu par appel interne', () => {
    const flows = parseEvmInternal({
      items: [{ index: 3, success: true, timestamp: at, value: WEI, from: { hash: OTHER }, to: { hash: ME } }],
    }, ME, 'ethereum');
    assert.equal(flows[0].amount, 1);
  });

  // L'appel racine (index 0) double la transaction deja comptee.
  it('ignore l appel racine et les appels echoues', () => {
    const flows = parseEvmInternal({
      items: [
        { index: 0, success: true, timestamp: at, value: WEI, from: { hash: OTHER }, to: { hash: ME } },
        { index: 2, success: false, timestamp: at, value: WEI, from: { hash: OTHER }, to: { hash: ME } },
      ],
    }, ME, 'ethereum');
    assert.deepEqual(flows, []);
  });
});

describe('parseEvmTokenTransfers', () => {
  it('lit contrat, decimales et sens', () => {
    const flows = parseEvmTokenTransfers({
      items: [{
        timestamp: at,
        from: { hash: ME },
        to: { hash: OTHER },
        token: { address_hash: '0xA0B8', symbol: 'USDC', decimals: '6' },
        total: { value: '2500000', decimals: '6' },
      }],
    }, ME, 'ethereum');

    assert.deepEqual(flows, [{
      time: Date.parse(at), key: '0xa0b8', symbol: 'USDC', contract: '0xA0B8', platform: 'ethereum', amount: -2.5,
    }]);
  });

  it('ecarte un transfert sans contrat', () => {
    const flows = parseEvmTokenTransfers({
      items: [{ timestamp: at, from: { hash: OTHER }, to: { hash: ME }, token: { symbol: 'X' }, total: { value: '1', decimals: '0' } }],
    }, ME, 'ethereum');
    assert.deepEqual(flows, []);
  });
});

describe('readEvmFlows', () => {
  const page = (items, next) => ({ items, next_page_params: next ?? null });

  it('suit la pagination des trois listes', async () => {
    const urls = [];
    const fetch = async (url) => {
      urls.push(url);
      if (url.includes('/transactions') && !url.includes('block_number')) {
        return page([{ status: 'ok', timestamp: at, value: WEI, from: { hash: OTHER }, to: { hash: ME } }], { block_number: 9 });
      }
      if (url.includes('/transactions')) {
        return page([{ status: 'ok', timestamp: at, value: WEI, from: { hash: OTHER }, to: { hash: ME } }]);
      }
      return page([]);
    };

    const result = await readEvmFlows(ME, 'ethereum', { fetch });

    assert.equal(result.truncated, false);
    assert.equal(result.flows.length, 2);
    assert.ok(urls.some((url) => url.includes('/internal-transactions')));
    assert.ok(urls.some((url) => url.includes('/token-transfers?type=ERC-20')));
    assert.ok(urls.some((url) => url.includes('block_number=9')));
  });

  it('signale une pagination coupee', async () => {
    const fetch = async () => page([], { block_number: 1 });
    const result = await readEvmFlows(ME, 'ethereum', { fetch, maxPages: 2 });
    assert.equal(result.truncated, true);
  });

  it('refuse une chaine sans explorateur', async () => {
    await assert.rejects(readEvmFlows(ME, 'bnb', { fetch: async () => ({}) }), /explorateur/);
  });
});
```

- [ ] **Étape 2 : lancer** → FAIL.

- [ ] **Étape 3 : implémenter**

```js
// Historique des mouvements d'une adresse EVM, via Blockscout.
//
// Trois listes sont necessaires : les transactions (natif envoye ou recu
// directement), les appels internes (natif recu d'un contrat, typiquement un
// routeur de swap) et les transferts de jetons. Une seule manquante ferait
// passer chaque swap pour un depot ou un retrait.

import { EVM_CHAINS, fromBaseUnits } from './chains.mjs';
import { fetchJson } from './http.mjs';

// Au-dela, l'historique est juge incomplet : mieux vaut masquer la performance
// crypto que la calculer sur une partie des mouvements.
const MAX_PAGES = 20;
const NATIVE_DECIMALS = 18;

const items = (payload) => (Array.isArray(payload?.items) ? payload.items : []);

// +1 entree, -1 sortie, 0 sans rapport ou envoi a soi-meme.
const direction = (item, owner) => {
  const from = item?.from?.hash?.toLowerCase();
  const to = item?.to?.hash?.toLowerCase();
  if (from === to) return 0;
  if (to === owner) return 1;
  if (from === owner) return -1;
  return 0;
};

const nativeFlow = (item, owner, chainName) => {
  const sign = direction(item, owner);
  const amount = fromBaseUnits(item?.value, NATIVE_DECIMALS);
  const time = Date.parse(item?.timestamp);
  if (sign === 0 || amount <= 0 || Number.isNaN(time)) return null;

  const symbol = EVM_CHAINS[chainName].symbol;
  return { time, key: symbol, symbol, contract: null, platform: null, amount: sign * amount };
};

export const parseEvmTransactions = (payload, address, chainName) =>
  items(payload)
    .filter((item) => item?.status === 'ok')
    .map((item) => nativeFlow(item, address.toLowerCase(), chainName))
    .filter(Boolean);

// L'appel racine (index 0) reprend la transaction deja comptee : le garder
// doublerait chaque envoi.
export const parseEvmInternal = (payload, address, chainName) =>
  items(payload)
    .filter((item) => item?.success !== false && item?.index !== 0)
    .map((item) => nativeFlow(item, address.toLowerCase(), chainName))
    .filter(Boolean);

export const parseEvmTokenTransfers = (payload, address, chainName) => {
  const owner = address.toLowerCase();

  return items(payload)
    .map((item) => {
      const contract = item?.token?.address_hash ?? item?.token?.address ?? null;
      const sign = direction(item, owner);
      const amount = fromBaseUnits(item?.total?.value, item?.total?.decimals ?? item?.token?.decimals);
      const time = Date.parse(item?.timestamp);
      if (!contract || sign === 0 || amount <= 0 || Number.isNaN(time)) return null;

      return {
        time,
        key: contract.toLowerCase(),
        symbol: item?.token?.symbol ?? contract,
        contract,
        platform: chainName,
        amount: sign * amount,
      };
    })
    .filter(Boolean);
};

const readPages = async (url, fetch, maxPages) => {
  const pages = [];
  let query = '';

  for (let page = 0; page < maxPages; page += 1) {
    const separator = url.includes('?') ? '&' : '?';
    const payload = await fetch(query ? `${url}${separator}${query}` : url);
    pages.push(payload);

    const next = payload?.next_page_params;
    if (!next) return { pages, truncated: false };
    query = new URLSearchParams(next).toString();
  }

  return { pages, truncated: true };
};

/**
 * Tous les mouvements d'une adresse sur une chaine. Une erreur reseau est
 * propagee : un historique partiel ne se distingue pas d'un historique court.
 */
export const readEvmFlows = async (address, chainName, { fetch = fetchJson, maxPages = MAX_PAGES } = {}) => {
  const host = EVM_CHAINS[chainName]?.host;
  if (!host) throw new Error(`${chainName} : pas d'explorateur pour lire l'historique`);

  const base = `${host}/api/v2/addresses/${address}`;
  const [transactions, internal, tokens] = await Promise.all([
    readPages(`${base}/transactions`, fetch, maxPages),
    readPages(`${base}/internal-transactions`, fetch, maxPages),
    readPages(`${base}/token-transfers?type=ERC-20`, fetch, maxPages),
  ]);

  return {
    flows: [
      ...transactions.pages.flatMap((payload) => parseEvmTransactions(payload, address, chainName)),
      ...internal.pages.flatMap((payload) => parseEvmInternal(payload, address, chainName)),
      ...tokens.pages.flatMap((payload) => parseEvmTokenTransfers(payload, address, chainName)),
    ],
    truncated: transactions.truncated || internal.truncated || tokens.truncated,
  };
};
```

- [ ] **Étape 4 : relancer** → PASS.
- [ ] **Étape 5 : commit (après accord)** — `feat(finance): lit l'historique des adresses EVM`

---

### Tâche 5 : flux Bitcoin et Dogecoin

**Fichiers :**
- Créer : `scripts/finance/flows-utxo.mjs`
- Test : `scripts/finance/flows-utxo.test.mjs`

**Interfaces :**
- Consomme : `fetchJson` (`./http.mjs`)
- Produit : `parseBitcoinTransactions(txs, address) → Flow[]`, `parseDogecoinTxrefs(payload) → Flow[]`,
  `readBitcoinFlows(address, { fetch?, maxPages? })`, `readDogecoinFlows(address, { fetch? })`
  → `Promise<{ flows, truncated }>`

- [ ] **Étape 1 : tests qui échouent**

```js
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  parseBitcoinTransactions,
  parseDogecoinTxrefs,
  readBitcoinFlows,
  readDogecoinFlows,
} from './flows-utxo.mjs';

const ME = 'bc1qmoi';
const tx = (txid, vin, vout, confirmed = true) => ({
  txid,
  status: { confirmed, block_time: 1_760_000_000 },
  vin: vin.map(([address, value]) => ({ prevout: { scriptpubkey_address: address, value } })),
  vout: vout.map(([address, value]) => ({ scriptpubkey_address: address, value })),
});

describe('parseBitcoinTransactions', () => {
  it('compte une reception', () => {
    const [flow] = parseBitcoinTransactions([tx('a', [['autre', 2e8]], [[ME, 1e8], ['autre', 0.9e8]])], ME);
    assert.deepEqual(flow, { time: 1_760_000_000_000, key: 'BTC', symbol: 'BTC', contract: null, platform: null, amount: 1 });
  });

  // La monnaie rendue revient sur la meme adresse : seul le net sort.
  it('retranche la monnaie rendue d un envoi', () => {
    const [flow] = parseBitcoinTransactions([tx('b', [[ME, 1e8]], [['autre', 0.3e8], [ME, 0.69e8]])], ME);
    assert.ok(Math.abs(flow.amount + 0.31) < 1e-12);
  });

  it('ignore les transactions non confirmees', () => {
    assert.deepEqual(parseBitcoinTransactions([tx('c', [], [[ME, 1e8]], false)], ME), []);
  });
});

describe('readBitcoinFlows', () => {
  it('pagine par le dernier txid tant que la page est pleine', async () => {
    const urls = [];
    const full = Array.from({ length: 25 }, (_, index) => tx(`t${index}`, [['autre', 1]], [[ME, 1]]));
    const fetch = async (url) => {
      urls.push(url);
      return url.endsWith('/txs/chain') ? full : [tx('fin', [['autre', 1]], [[ME, 1]])];
    };

    const result = await readBitcoinFlows(ME, { fetch });

    assert.equal(result.truncated, false);
    assert.equal(result.flows.length, 26);
    assert.ok(urls[1].endsWith('/txs/chain/t24'));
  });

  it('signale un historique trop long', async () => {
    const full = Array.from({ length: 25 }, (_, index) => tx(`t${index}`, [['autre', 1]], [[ME, 1]]));
    const result = await readBitcoinFlows(ME, { fetch: async () => full, maxPages: 2 });
    assert.equal(result.truncated, true);
  });
});

describe('parseDogecoinTxrefs', () => {
  // BlockCypher eclate une transaction en une ligne par entree et par sortie :
  // il faut les regrouper pour obtenir le net de la transaction.
  it('regroupe les lignes d une meme transaction', () => {
    const flows = parseDogecoinTxrefs({
      txrefs: [
        { tx_hash: 'a', tx_input_n: -1, tx_output_n: 0, value: 500e8, confirmed: '2026-02-01T00:00:00Z' },
        { tx_hash: 'b', tx_input_n: 0, tx_output_n: -1, value: 500e8, confirmed: '2026-03-01T00:00:00Z' },
        { tx_hash: 'b', tx_input_n: -1, tx_output_n: 1, value: 120e8, confirmed: '2026-03-01T00:00:00Z' },
      ],
    });

    assert.deepEqual(flows.map((flow) => flow.amount), [500, -380]);
    assert.equal(flows[0].key, 'DOGE');
  });
});

describe('readDogecoinFlows', () => {
  it('signale un historique coupe par hasMore', async () => {
    const result = await readDogecoinFlows('D123', { fetch: async () => ({ txrefs: [], hasMore: true }) });
    assert.equal(result.truncated, true);
  });
});
```

- [ ] **Étape 2 : lancer** → FAIL.

- [ ] **Étape 3 : implémenter**

```js
// Historique Bitcoin et Dogecoin. Ces deux reseaux ne tiennent pas de compte
// avec un solde mais des recus (UTXO) : le mouvement net d'une transaction est
// ce qu'elle verse a l'adresse moins ce qu'elle y depense, monnaie rendue
// comprise.

import { fetchJson } from './http.mjs';

const UNITS_PER_COIN = 100_000_000;
const ESPLORA = 'https://blockstream.info/api';
// Taille de page fixe d'Esplora : une page plus courte est la derniere.
const ESPLORA_PAGE_SIZE = 25;
const MAX_BITCOIN_PAGES = 40;
const BLOCKCYPHER = 'https://api.blockcypher.com/v1/doge/main';
const BLOCKCYPHER_LIMIT = 2000;

const coinFlow = (symbol, time, units) => ({
  time,
  key: symbol,
  symbol,
  contract: null,
  platform: null,
  amount: units / UNITS_PER_COIN,
});

const sumTo = (entries, address, pick) =>
  (entries ?? [])
    .map(pick)
    .filter((output) => output?.scriptpubkey_address === address)
    .reduce((sum, output) => sum + (Number(output.value) || 0), 0);

export const parseBitcoinTransactions = (txs, address) =>
  (Array.isArray(txs) ? txs : [])
    .filter((tx) => tx?.status?.confirmed && Number.isFinite(tx.status.block_time))
    .map((tx) => {
      const received = sumTo(tx.vout, address, (output) => output);
      const spent = sumTo(tx.vin, address, (input) => input?.prevout);
      return coinFlow('BTC', tx.status.block_time * 1000, received - spent);
    })
    .filter((flow) => flow.amount !== 0);

export const readBitcoinFlows = async (address, { fetch = fetchJson, maxPages = MAX_BITCOIN_PAGES } = {}) => {
  const txs = [];
  let url = `${ESPLORA}/address/${address}/txs/chain`;

  for (let page = 0; page < maxPages; page += 1) {
    const batch = await fetch(url);
    const list = Array.isArray(batch) ? batch : [];
    txs.push(...list);

    if (list.length < ESPLORA_PAGE_SIZE) {
      return { flows: parseBitcoinTransactions(txs, address), truncated: false };
    }
    url = `${ESPLORA}/address/${address}/txs/chain/${list.at(-1).txid}`;
  }

  return { flows: parseBitcoinTransactions(txs, address), truncated: true };
};

export const parseDogecoinTxrefs = (payload) => {
  const totals = new Map();

  for (const ref of payload?.txrefs ?? []) {
    const time = Date.parse(ref?.confirmed);
    if (!ref?.tx_hash || Number.isNaN(time)) continue;

    // tx_input_n >= 0 : la ligne depense un recu de l'adresse, donc une sortie.
    const sign = ref.tx_input_n >= 0 ? -1 : 1;
    const current = totals.get(ref.tx_hash) ?? { time, units: 0 };
    totals.set(ref.tx_hash, { ...current, units: current.units + sign * (Number(ref.value) || 0) });
  }

  return [...totals.values()]
    .map((entry) => coinFlow('DOGE', entry.time, entry.units))
    .filter((flow) => flow.amount !== 0);
};

/**
 * Un seul appel : BlockCypher rend jusqu'a 2000 lignes et signale la suite
 * par hasMore. Le secours BitPay ne fournit pas d'historique comparable.
 */
export const readDogecoinFlows = async (address, { fetch = fetchJson } = {}) => {
  const payload = await fetch(`${BLOCKCYPHER}/addrs/${address}?limit=${BLOCKCYPHER_LIMIT}`);
  return { flows: parseDogecoinTxrefs(payload), truncated: Boolean(payload?.hasMore) };
};
```

- [ ] **Étape 4 : relancer** → PASS.
- [ ] **Étape 5 : commit (après accord)** — `feat(finance): lit l'historique Bitcoin et Dogecoin`

---

### Tâche 6 : flux Solana

**Fichiers :**
- Modifier : `scripts/finance/chains.mjs:194-201` — ajouter `export` devant `SOLANA_RPC` et `SOLANA_TOKEN_PROGRAMS` (rien d'autre)
- Créer : `scripts/finance/flows-solana.mjs`
- Test : `scripts/finance/flows-solana.test.mjs`

**Interfaces :**
- Consomme : `SOLANA_RPC`, `SOLANA_TOKEN_PROGRAMS` (`./chains.mjs`), `STAKE_PROGRAM` (`./staking.mjs`), `fetchJson`, `withRetry`
- Produit : `parseSolanaTransaction(result, address) → Flow[]`,
  `readSolanaFlows(address, { call?, pauseMs?, maxTransactions? }) → Promise<{ flows, truncated }>`
  où `call(method, params) → Promise<result>` (la valeur de `result` du JSON-RPC)

- [ ] **Étape 1 : tests qui échouent**

```js
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { parseSolanaTransaction, readSolanaFlows } from './flows-solana.mjs';

const ME = 'MoiWa11et1111111111111111111111111111111111';
const STAKE = 'Stake11111111111111111111111111111111111111';
const USDC = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

const tx = ({ pre = [0, 0], post = [0, 0], fee = 5000, preTokens = [], postTokens = [], programs = [], err = null } = {}) => ({
  blockTime: 1_760_000_000,
  meta: {
    err,
    fee,
    preBalances: pre,
    postBalances: post,
    preTokenBalances: preTokens,
    postTokenBalances: postTokens,
    innerInstructions: [],
  },
  transaction: {
    message: {
      accountKeys: [{ pubkey: ME }, { pubkey: 'Autre' }],
      instructions: programs.map((programId) => ({ programId })),
    },
  },
});

const token = (owner, amount) => ({ owner, mint: USDC, uiTokenAmount: { uiAmountString: String(amount) } });

describe('parseSolanaTransaction', () => {
  // Les frais sont une perte, pas un retrait : on les rajoute au mouvement net.
  it('compte le SOL recu hors frais', () => {
    const [flow] = parseSolanaTransaction(tx({ pre: [1e9, 0], post: [3e9 - 5000, 0] }), ME);
    assert.deepEqual(flow, { time: 1_760_000_000_000, key: 'SOL', symbol: 'SOL', contract: null, platform: null, amount: 2 });
  });

  it('compte les jetons du proprietaire par mint, contrat d origine garde', () => {
    const flows = parseSolanaTransaction(
      tx({ preTokens: [token(ME, 10), token('Autre', 50)], postTokens: [token(ME, 4), token('Autre', 56)] }),
      ME,
    );
    assert.deepEqual(flows, [
      { time: 1_760_000_000_000, key: USDC.toLowerCase(), symbol: USDC, contract: USDC, platform: 'solana', amount: -6 },
    ]);
  });

  // Deleguer du SOL le deplace vers un compte de stake qui reste a soi : ce
  // n'est pas un retrait. Les recompenses recuperees au retrait ne sont pas un
  // depot non plus : ce sont des gains.
  it('ignore le SOL deplace par une operation de staking natif', () => {
    assert.deepEqual(parseSolanaTransaction(tx({ pre: [5e9, 0], post: [1e9, 0], programs: [STAKE] }), ME), []);
  });

  // Le staking liquide echange du SOL contre un jeton : les deux cotes comptent.
  it('garde le SOL d un staking liquide qui rend un jeton', () => {
    const flows = parseSolanaTransaction(
      tx({ pre: [5e9, 0], post: [4e9 - 5000, 0], programs: [STAKE], preTokens: [], postTokens: [token(ME, 1)] }),
      ME,
    );
    assert.deepEqual(flows.map((flow) => flow.key).sort(), [USDC.toLowerCase(), 'SOL'].sort());
  });

  it('ignore une transaction echouee', () => {
    assert.deepEqual(parseSolanaTransaction(tx({ pre: [1e9, 0], post: [0, 0], err: { x: 1 } }), ME), []);
  });
});

describe('readSolanaFlows', () => {
  it('lit le wallet et ses comptes de jetons, sans doublon de signature', async () => {
    const asked = [];
    const call = async (method, params) => {
      asked.push([method, params[0]]);
      if (method === 'getTokenAccountsByOwner') return { value: [{ pubkey: 'CompteUSDC' }] };
      if (method === 'getSignaturesForAddress') return [{ signature: 'sig1', err: null }, { signature: 'sig2', err: { e: 1 } }];
      if (method === 'getTransaction') return tx({ pre: [0, 0], post: [1e9 - 5000, 0] });
      throw new Error(method);
    };

    const result = await readSolanaFlows(ME, { call, pauseMs: 0 });

    assert.equal(result.truncated, false);
    assert.equal(result.flows.length, 1);
    assert.ok(asked.some(([method, target]) => method === 'getSignaturesForAddress' && target === 'CompteUSDC'));
    assert.equal(asked.filter(([method]) => method === 'getTransaction').length, 1);
  });

  it('signale un historique trop long sans lire les transactions', async () => {
    const call = async (method) => {
      if (method === 'getTokenAccountsByOwner') return { value: [] };
      if (method === 'getSignaturesForAddress') return [{ signature: 'a', err: null }, { signature: 'b', err: null }];
      throw new Error(`appel inattendu : ${method}`);
    };

    const result = await readSolanaFlows(ME, { call, pauseMs: 0, maxTransactions: 1 });
    assert.deepEqual(result, { flows: [], truncated: true });
  });
});
```

- [ ] **Étape 2 : lancer** → FAIL.

- [ ] **Étape 3 : implémenter**

```js
// Historique Solana, via le RPC officiel.
//
// Le RPC ne fournit pas de liste de transferts : on relit chaque transaction et
// on compare les soldes avant / apres. Cette lecture par ecart couvre d'un coup
// les envois, les swaps et le staking liquide.
//
// Un jeton recu arrive sur un compte de jetons, pas sur le wallet : ces comptes
// sont donc lus aussi, sinon un depot d'USDC depuis une plateforme passerait
// inapercu.

import { SOLANA_RPC, SOLANA_TOKEN_PROGRAMS } from './chains.mjs';
import { withRetry } from './collect.mjs';
import { fetchJson } from './http.mjs';
import { STAKE_PROGRAM } from './staking.mjs';

const LAMPORTS_PER_SOL = 1_000_000_000;
const SIGNATURES_PAGE = 1000;
// Au-dela, le job deviendrait trop long pour le RPC public : l'historique est
// juge incomplet et la performance crypto masquee.
const MAX_TRANSACTIONS = 1500;
// Le RPC public limite le debit par IP : une pause courte evite les 429.
const PAUSE_MS = 200;
// Les sommes de flottants laissent des residus du type 1e-17.
const DUST = 1e-12;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const defaultCall = (method, params) =>
  withRetry(async () => {
    const response = await fetchJson(SOLANA_RPC, { body: { jsonrpc: '2.0', id: 1, method, params } });
    // Le RPC renvoie ses refus en HTTP 200 avec un champ error.
    if (response?.error) throw new Error(`Solana ${method} : ${response.error.message ?? 'erreur'}`);
    return response?.result;
  });

const tokenDeltas = (meta, address) => {
  const totals = new Map();
  const add = (balances, sign) => {
    for (const balance of balances ?? []) {
      if (balance?.owner !== address || !balance?.mint) continue;
      const amount = Number(balance.uiTokenAmount?.uiAmountString ?? balance.uiTokenAmount?.uiAmount ?? 0);
      totals.set(balance.mint, (totals.get(balance.mint) ?? 0) + sign * (Number.isFinite(amount) ? amount : 0));
    }
  };

  add(meta?.preTokenBalances, -1);
  add(meta?.postTokenBalances, 1);
  return [...totals].filter(([, amount]) => Math.abs(amount) > DUST);
};

export const parseSolanaTransaction = (result, address) => {
  const meta = result?.meta;
  const time = Number(result?.blockTime) * 1000;
  if (!meta || meta.err || !Number.isFinite(time)) return [];

  const message = result?.transaction?.message ?? {};
  const keys = (message.accountKeys ?? []).map((key) => (typeof key === 'string' ? key : key?.pubkey));
  const instructions = [
    ...(message.instructions ?? []),
    ...(meta.innerInstructions ?? []).flatMap((group) => group?.instructions ?? []),
  ];
  const touchesStake = instructions.some(
    (instruction) => (instruction?.programId ?? keys[instruction?.programIdIndex]) === STAKE_PROGRAM,
  );

  const tokens = tokenDeltas(meta, address).map(([mint, amount]) => ({
    time,
    key: mint.toLowerCase(),
    symbol: mint,
    contract: mint,
    platform: 'solana',
    amount,
  }));

  // Staking natif sans jeton en retour : le SOL reste a soi, ce n'est ni un
  // depot ni un retrait.
  const index = keys.indexOf(address);
  if (index < 0 || (touchesStake && tokens.length === 0)) return tokens;

  // Le payeur des frais est toujours le premier compte : les frais sont une
  // perte, pas un retrait, on les rajoute au mouvement.
  const fee = index === 0 ? Number(meta.fee) || 0 : 0;
  const lamports = (Number(meta.postBalances?.[index]) || 0) - (Number(meta.preBalances?.[index]) || 0) + fee;
  if (lamports === 0) return tokens;

  return [
    { time, key: 'SOL', symbol: 'SOL', contract: null, platform: null, amount: lamports / LAMPORTS_PER_SOL },
    ...tokens,
  ];
};

const tokenAccounts = async (address, call) => {
  const accounts = [];
  for (const programId of SOLANA_TOKEN_PROGRAMS) {
    const result = await call('getTokenAccountsByOwner', [address, { programId }, { encoding: 'jsonParsed' }]);
    accounts.push(...(result?.value ?? []).map((entry) => entry?.pubkey).filter(Boolean));
  }
  return accounts;
};

export const readSolanaFlows = async (
  address,
  { call = defaultCall, pauseMs = PAUSE_MS, maxTransactions = MAX_TRANSACTIONS } = {},
) => {
  const accounts = [address, ...(await tokenAccounts(address, call))];
  const signatures = new Set();

  for (const account of accounts) {
    let before;
    for (;;) {
      const page = await call('getSignaturesForAddress', [
        account,
        { limit: SIGNATURES_PAGE, ...(before ? { before } : {}) },
      ]);
      const list = Array.isArray(page) ? page : [];
      for (const entry of list) {
        if (entry?.signature && entry.err === null) signatures.add(entry.signature);
      }

      if (signatures.size > maxTransactions) return { flows: [], truncated: true };
      if (list.length < SIGNATURES_PAGE) break;
      before = list.at(-1).signature;
    }
  }

  const flows = [];
  for (const signature of signatures) {
    if (pauseMs > 0) await wait(pauseMs);
    const result = await call('getTransaction', [
      signature,
      { encoding: 'jsonParsed', maxSupportedTransactionVersion: 0, commitment: 'finalized' },
    ]);
    flows.push(...parseSolanaTransaction(result, address));
  }

  return { flows, truncated: false };
};
```

- [ ] **Étape 4 : relancer** — `node --test scripts/finance/flows-solana.test.mjs scripts/finance/chains.test.mjs` → PASS.
- [ ] **Étape 5 : commit (après accord)** — `feat(finance): lit l'historique Solana`

---

### Tâche 7 : publier la performance

**Fichiers :**
- Modifier : `scripts/finance/anonymize.mjs` (import + clé `performance` du payload)
- Test : `scripts/finance/anonymize.test.mjs`

**Interfaces :**
- Consomme : `toPerformance` (`./performance.mjs`)
- Produit : `anonymize(portfolio)` accepte `portfolio.performance = { stocks: {cost, gain} | null, crypto: {cost, gain} | null }`
  et publie `payload.performance = { overall, stocks, crypto } | null`

- [ ] **Étape 1 : tests qui échouent** — ajouter dans le `describe('anonymize')` existant, en réutilisant le portefeuille de test déjà défini dans le fichier (ou une position minimale `{ kind: 'etf', value: 100 }`) :

```js
  it('publie la performance en pourcentages entiers, sans montant', () => {
    const payload = anonymize({
      positions: [{ kind: 'etf', value: 100 }],
      performance: { stocks: { cost: 1000, gain: 100 }, crypto: { cost: 3000, gain: 900 } },
      sources: ['Trading 212'],
    });

    assert.deepEqual(payload.performance, { overall: 25, stocks: 10, crypto: 30 });
    assert.doesNotMatch(JSON.stringify(payload), /1000|3000|"cost"|"gain"/);
  });

  it('publie null quand aucune performance n est mesuree', () => {
    const payload = anonymize({ positions: [{ kind: 'etf', value: 100 }], sources: [] });
    assert.equal(payload.performance, null);
  });
```

- [ ] **Étape 2 : lancer** — `node --test scripts/finance/anonymize.test.mjs` → FAIL (`performance` undefined).

- [ ] **Étape 3 : implémenter** dans `anonymize.mjs` :

```js
import { toPerformance } from './performance.mjs';
```

puis, dans l'objet `payload`, après `behaviour` :

```js
    // Pourcentages entiers seulement : sans montant publie a cote, un rendement
    // ne permet de remonter a aucune somme.
    performance: toPerformance(portfolio?.performance),
```

- [ ] **Étape 4 : relancer** → PASS, et `node --test "scripts/finance/**/*.test.mjs"` → PASS (le garde-fou valide les nouvelles clés).
- [ ] **Étape 5 : commit (après accord)** — `feat(finance): publie la performance anonymisee`

---

### Tâche 8 : orchestration crypto et branchement du collecteur

**Fichiers :**
- Créer : `scripts/finance/crypto-performance.mjs`
- Test : `scripts/finance/crypto-performance.test.mjs`
- Modifier : `scripts/fetch-finance.mjs`, `.github/workflows/finance.yml`

**Interfaces :**
- Consomme : tâches 2 à 6, `fetchPrices` (`./prices.mjs`)
- Produit : `EXCLUDED_NETWORKS: Set<string>`, `flowAssets(flows) → Asset[]`,
  `measureCryptoPerformance({ targets, holdings, prices, vaults, apiKey?, onWarn?, readers?, listPrices?, fetchHistories? }) → Promise<{ cost, gain } | null>`
  où `target = { family: 'evm' | 'bitcoin' | 'dogecoin' | 'solana', network: string, address: string }`
  et `holdings` = soldes bruts portant `network`.

- [ ] **Étape 1 : tests qui échouent**

```js
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { flowAssets, measureCryptoPerformance } from './crypto-performance.mjs';

const DAY = 24 * 60 * 60 * 1000;
const T0 = Date.UTC(2026, 0, 1);
const flow = (key, amount, extra = {}) => ({ time: T0, key, symbol: key, contract: null, platform: null, amount, ...extra });

const baseOptions = (overrides = {}) => ({
  targets: [{ family: 'evm', network: 'ethereum', address: '0xme' }],
  holdings: [{ symbol: 'ETH', amount: 2, network: 'ethereum' }],
  prices: { ETH: 150 },
  vaults: {},
  readers: { evm: async () => ({ flows: [flow('ETH', 2)], truncated: false }) },
  listPrices: async () => ({}),
  fetchHistories: async () => ({ ETH: [[T0, 100]] }),
  ...overrides,
});

describe('flowAssets', () => {
  it('rend un actif par cle', () => {
    assert.deepEqual(flowAssets([flow('ETH', 1), flow('ETH', -1)]), [
      { key: 'ETH', symbol: 'ETH', contract: null, platform: null },
    ]);
  });
});

describe('measureCryptoPerformance', () => {
  it('compare la valeur actuelle aux apports nets', async () => {
    assert.deepEqual(await measureCryptoPerformance(baseOptions()), { cost: 200, gain: 100 });
  });

  it('masque la mesure si une source est tronquee', async () => {
    const result = await measureCryptoPerformance(baseOptions({
      readers: { evm: async () => ({ flows: [], truncated: true }) },
    }));
    assert.equal(result, null);
  });

  it('masque la mesure si un flux precede l historique des cours', async () => {
    const result = await measureCryptoPerformance(baseOptions({
      readers: { evm: async () => ({ flows: [{ ...flow('ETH', 2), time: T0 - 30 * DAY }], truncated: false }) },
    }));
    assert.equal(result, null);
  });

  // Un jeton de spam non cote ne doit ni couter un appel d'historique, ni
  // peser dans les apports.
  it('ne demande l historique que des jetons cotes', async () => {
    const asked = [];
    await measureCryptoPerformance(baseOptions({
      readers: {
        evm: async () => ({
          flows: [flow('ETH', 2), flow('0xspam', 1e9, { contract: '0xSPAM', platform: 'ethereum' })],
          truncated: false,
        }),
      },
      listPrices: async () => ({}),
      fetchHistories: async (assets) => { asked.push(...assets.map((asset) => asset.key)); return { ETH: [[T0, 100]] }; },
    }));
    assert.deepEqual(asked, ['ETH']);
  });

  // Une cotation en panne ferait ignorer un vrai jeton : le resultat serait
  // faux sans signal.
  it('masque la mesure si la cotation des jetons echoue', async () => {
    const result = await measureCryptoPerformance(baseOptions({
      readers: { evm: async () => ({ flows: [flow('0xusdc', 5, { contract: '0xUSDC', platform: 'ethereum' })], truncated: false }) },
      listPrices: async (_assets, { onFallback }) => { onFallback(new Error('HTTP 500')); return {}; },
    }));
    assert.equal(result, null);
  });

  it('exclut BNB Chain des flux et de la valeur actuelle', async () => {
    const read = [];
    const result = await measureCryptoPerformance(baseOptions({
      targets: [
        { family: 'evm', network: 'ethereum', address: '0xme' },
        { family: 'evm', network: 'bnb', address: '0xme' },
      ],
      holdings: [{ symbol: 'ETH', amount: 2, network: 'ethereum' }, { symbol: 'BNB', amount: 10, network: 'bnb' }],
      prices: { ETH: 150, BNB: 500 },
      readers: { evm: async (_address, network) => { read.push(network); return { flows: [flow('ETH', 2)], truncated: false }; } },
    }));
    assert.deepEqual(read, ['ethereum']);
    assert.deepEqual(result, { cost: 200, gain: 100 });
  });

  it('rend null sans cible mesurable', async () => {
    assert.equal(await measureCryptoPerformance(baseOptions({ targets: [{ family: 'evm', network: 'bnb', address: '0x' }] })), null);
  });
});
```

- [ ] **Étape 2 : lancer** → FAIL.

- [ ] **Étape 3 : implémenter `crypto-performance.mjs`**

```js
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
```

- [ ] **Étape 4 : relancer** — `node --test scripts/finance/crypto-performance.test.mjs` → PASS.

- [ ] **Étape 5 : brancher `scripts/fetch-finance.mjs`**

1. Imports :

```js
import { measureCryptoPerformance } from './finance/crypto-performance.mjs';
import { fetchAccountSummary, fetchOrders, fetchPositions } from './finance/trading212.mjs';
```

2. Avant `buildSources`, deux aides. `requestedEvmChains` reprend tel quel le
   bloc de validation existant de `buildSources`, qui l'appelle ensuite (pas de
   double logique) :

```js
// Chaque solde porte son reseau : la performance crypto en a besoin pour
// exclure BNB Chain, dont l'historique est illisible sans cle.
const tagNetwork = (holdings, network) => holdings.map((entry) => ({ ...entry, network }));

const requestedEvmChains = (env) => {
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

  return requested.length > 0 ? requested : DEFAULT_EVM_CHAINS;
};
```

3. Dans `buildSources`, le bloc EVM devient `for (const chain of requestedEvmChains(env))`
   et chaque `collect` de blockchain enveloppe son résultat :
   - EVM : `collect: async () => tagNetwork(await readEvm(address, chain, { onFallback: warn(chain) }), chain)`
   - Solana : `collect: async () => tagNetwork(await readSolana(address, { onFallback: warn('solana') }), 'solana')`
   - Bitcoin : `… tagNetwork(await readBitcoin(…), 'bitcoin')`
   - Dogecoin : `… tagNetwork(await readDogecoin(…), 'dogecoin')`

4. Après `buildSources`, les cibles d'historique :

```js
const buildTargets = (env) => [
  ...(env.WALLET_EVM
    ? requestedEvmChains(env).flatMap((network) =>
        splitAddresses(env.WALLET_EVM).map((address) => ({ family: 'evm', network, address })))
    : []),
  ...splitAddresses(env.WALLET_SOLANA).map((address) => ({ family: 'solana', network: 'solana', address })),
  ...splitAddresses(env.WALLET_BITCOIN).map((address) => ({ family: 'bitcoin', network: 'bitcoin', address })),
  ...splitAddresses(env.WALLET_DOGECOIN).map((address) => ({ family: 'dogecoin', network: 'dogecoin', address })),
];
```

5. Dans la boucle des coffres (`for (const holding of unpriced)`), juste après
   `if (vault) {`, mémoriser le taux (déclarer `const vaults = {};` à côté de
   `const resolved = [];`) :

```js
      // Taux part -> sous-jacent, reutilise pour valoriser les depots passes.
      vaults[priceKey(holding)] = {
        underlyingKey: priceKey(vault),
        rate: vault.amount / holding.amount,
        underlying: {
          key: priceKey(vault),
          symbol: vault.contract,
          contract: vault.contract,
          platform: holding.platform,
        },
      };
```

6. Après la lecture des ordres :

```js
// Les deux mesures sont facultatives : leur echec masque la ligne concernee
// sur la carte, sans priver le site des repartitions.
let stocksPerformance = null;
if (process.env.TRADING212_API_KEY) {
  try {
    stocksPerformance = await fetchAccountSummary({
      apiKey: process.env.TRADING212_API_KEY,
      apiSecret: process.env.TRADING212_API_SECRET,
    });
  } catch (error) {
    warn('resume de compte')(error);
  }
}

let cryptoPerformance = null;
try {
  cryptoPerformance = await measureCryptoPerformance({
    targets: buildTargets(process.env),
    holdings: chains.positions,
    prices,
    vaults,
    apiKey: process.env.COINGECKO_API_KEY,
    onWarn: warn('performance crypto'),
  });
} catch (error) {
  warn('performance crypto')(error);
}
```

7. Passer `performance: { stocks: stocksPerformance, crypto: cryptoPerformance }`
   à `anonymize({...})`, et ajouter en fin de script un log **en % seulement** :

```js
const performance = payload.performance;
console.log(`  performance : ${performance
  ? ['overall', 'stocks', 'crypto'].map((key) => `${key} ${performance[key] ?? '-'} %`).join(' · ')
  : 'indisponible'}`);
```

- [ ] **Étape 6 : workflow** — dans `.github/workflows/finance.yml`, sous `runs-on: ubuntu-latest` :

```yaml
    # L'historique Solana et les cours historiques allongent le job : sans
    # plafond, un service qui ne repond plus le garderait six heures.
    timeout-minutes: 30
```

- [ ] **Étape 7 : vérifier** — `pnpm test` → tout PASS ; `node --check scripts/fetch-finance.mjs` → aucune sortie.
- [ ] **Étape 8 : commit (après accord)** — `feat(finance): mesure la performance crypto par apports nets`

---

### Tâche 9 : affichage dans la carte

**Fichiers :**
- Modifier : `src/data/finance.js` (+ `formatPerformance`, commentaire d'en-tête)
- Test : `src/data/finance.test.mjs`
- Modifier : `src/components/FinanceComponent.vue`

**Interfaces :**
- Consomme : `finance.performance = { overall, stocks, crypto } | null | undefined`
- Produit : `formatPerformance(n) → '+12 %' | '−3 %' | '0 %' | null`

- [ ] **Étape 1 : test qui échoue** (ajouter `formatPerformance` à l'import)

```js
describe('formatPerformance', () => {
  it('signe toujours le resultat', () => {
    assert.equal(formatPerformance(12), '+12 %');
    assert.equal(formatPerformance(0), '0 %');
  });

  // Vrai signe moins (U+2212) : le tiret court se lit mal a cote d'un chiffre.
  it('utilise le vrai signe moins', () => {
    assert.equal(formatPerformance(-3), '−3 %');
  });

  it('rend null hors entier', () => {
    for (const input of [null, undefined, Number.NaN, 1.5, '12']) {
      assert.equal(formatPerformance(input), null, String(input));
    }
  });
});
```

- [ ] **Étape 2 : lancer** — `node --test src/data/finance.test.mjs` → FAIL.

- [ ] **Étape 3 : implémenter** dans `src/data/finance.js` :

```js
// Le signe est toujours ecrit : la couleur seule ne doit pas porter le sens,
// un daltonien ou un lecteur d'ecran ne la voit pas.
export const formatPerformance = (percent) => {
  if (!Number.isInteger(percent)) return null;
  if (percent > 0) return `+${percent} %`;
  if (percent < 0) return `−${Math.abs(percent)} %`;
  return '0 %';
};
```

et compléter le commentaire d'en-tête : « Le fichier distant ne contient que des
parts, des compteurs et des rendements en pourcentage. »

- [ ] **Étape 4 : relancer** → PASS.

- [ ] **Étape 5 : composant** — dans `FinanceComponent.vue` :

Script (importer `formatPerformance`) :

```js
const performance = computed(() => finance.value?.performance ?? null);

// Le global n'existe que si bourse et crypto sont toutes deux mesurees : sinon
// seule la ligne disponible s'affiche, avec un libelle qui dit son perimetre.
const performanceTiles = computed(() => {
  if (!performance.value) return [];

  return [
    { key: 'overall', percent: performance.value.overall, label: 'Global', hint: 'bourse et crypto réunies' },
    { key: 'stocks', percent: performance.value.stocks, label: 'Bourse', hint: 'plus-value latente' },
    { key: 'crypto', percent: performance.value.crypto, label: 'Crypto', hint: 'face aux dépôts, hors BNB Chain' },
  ]
    .map((tile) => ({ ...tile, value: formatPerformance(tile.percent) }))
    .filter((tile) => tile.value !== null);
});

// Classes ecrites en entier : Tailwind ne detecte pas une classe construite.
const PERFORMANCE_COLUMNS = { 1: 'grid-cols-1', 2: 'grid-cols-2', 3: 'grid-cols-3' };

const performanceTone = (percent) =>
  percent < 0
    ? 'text-spicy-paprika-600 dark:text-spicy-paprika-400'
    : 'text-regal-navy-700 dark:text-regal-navy-300';
```

Sous-titre : `Performance, répartitions et rythme — jamais de montant`.

Template, en tête de `<template v-if="finance">` (avant le bloc des `ShareBar`) :

```html
      <dl
        v-if="performanceTiles.length"
        class="grid gap-2.5"
        :class="PERFORMANCE_COLUMNS[performanceTiles.length]"
      >
        <div
          v-for="(tile, index) in performanceTiles"
          :key="tile.key"
          class="stat-reveal rounded-lg border border-coffee-bean-100 bg-soft-blush-50/60 px-3 py-2.5 dark:border-soft-blush-50/10 dark:bg-soft-blush-50/[0.04]"
          :style="{ '--stat-delay': `${index * 50}ms` }"
        >
          <dd
            class="font-heading text-2xl font-bold leading-none tabular-nums"
            :class="performanceTone(tile.percent)"
          >
            {{ tile.value }}
          </dd>
          <dt class="mt-1.5">
            <span class="block text-xs font-semibold leading-tight text-coffee-bean-800 dark:text-soft-blush-100">
              {{ tile.label }}
            </span>
            <span class="mt-0.5 block text-[11px] leading-snug text-pretty text-coffee-bean-500 dark:text-soft-blush-400">
              {{ tile.hint }}
            </span>
          </dt>
        </div>
      </dl>
```

- [ ] **Étape 6 : vérifier** — `pnpm test` puis `pnpm build` → PASS.
  Contrôle visuel : `pnpm dev`, placer temporairement un bloc
  `"performance": { "overall": 12, "stocks": -3, "crypto": 20 }` dans
  `public/data/finance.json`, puis dans les DevTools (onglet Réseau) bloquer
  `raw.githubusercontent.com` pour forcer le repli local. Vérifier clair et
  sombre, largeur 375 px et desktop, puis les cas « bourse seule » (overall et
  crypto à `null`). **Remettre `finance.json` dans son état d'origine** (demander
  avant tout `git restore`).
- [ ] **Étape 7 : commit (après accord)** — `feat(finance): affiche la performance dans la carte`

---

### Tâche 10 : vérification de bout en bout

- [ ] **Étape 1** — `pnpm test` et `pnpm build` → PASS (sortie à citer).
- [ ] **Étape 2** — vrai lancement local : `pnpm finance` (lit `.env`). À relever :
  durée totale, avertissements `repli performance crypto`, ligne `performance : …`.
  Vérifier que **aucun montant** n'apparaît dans la sortie.
- [ ] **Étape 3** — lire le `public/data/finance.json` produit : clés `performance`
  présentes, entiers ou `null`. Si la crypto est `null`, en donner la raison à
  Valentin (flux > 1 an, pagination, cotation…). Demander s'il faut garder ou
  annuler ce fichier modifié (c'est le workflow qui le commite normalement).
- [ ] **Étape 4** — revues avant PR (règle du dépôt) : `/refactor-clean`, puis
  ECC `/code-review` et mattpocock `code-review` en parallèle, puis
  `superpowers:verification-before-completion` et
  `superpowers:finishing-a-development-branch`. Présenter le résultat et attendre
  l'accord pour la PR.
