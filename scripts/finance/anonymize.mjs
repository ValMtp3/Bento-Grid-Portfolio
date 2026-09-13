// Frontiere unique entre les donnees brutes du courtier / des blockchains et le
// fichier publie sur le depot. Rien ne doit sortir d'ici qui permette de
// reconstituer un montant, une position nominative ou une adresse de wallet.
//
// Le principe tient en une phrase : on publie des formes, jamais des sommes.

// Pas d'arrondi des parts. Une precision au pourcent pres permettrait, croisee
// avec le cours public d'un actif, de remonter a des montants.
const SHARE_STEP = 5;
// En dessous, la part s'affiche comme une barre invisible avec sa legende.
const MIN_VISIBLE_SHARE = SHARE_STEP;
const RECENT_ORDERS_DAYS = 30;
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const DAYS_PER_MONTH = 30;
const TOP_POSITIONS = 3;

// Sous-chaines cherchees dans les noms de cles, insensibles a la casse : elles
// attrapent aussi les composes du type "marketValue" ou "cashAmount".
const FORBIDDEN_KEYS = [
  'address',
  'amount',
  'balance',
  'cash',
  'equity',
  'invested',
  'isin',
  'pnl',
  'price',
  'profit',
  'quantity',
  'symbol',
  'ticker',
  'total',
  'value',
  'wallet',
];

const EVM_ADDRESS = /0x[a-fA-F0-9]{40}/;
const BECH32_ADDRESS = /\b(?:bc1|tb1)[a-z0-9]{25,62}\b/i;
// Base58 couvre d'un coup Bitcoin en format historique, Dogecoin et Solana :
// les trois excluent les memes caracteres ambigus (0, O, I, l).
const BASE58_ADDRESS = /\b[1-9A-HJ-NP-Za-km-z]{32,44}\b/;
// Seuil sous lequel une chaine est trop courte pour etre une adresse : evite de
// soupconner un libelle comme "Consommation discretionnaire".
const ADDRESS_MIN_LENGTH = 25;

const roundToStep = (percent) => Math.round(percent / SHARE_STEP) * SHARE_STEP;

/**
 * Convertit des valeurs monetaires en parts entieres dont la somme fait 100.
 * Les valeurs d'entree sont consommees ici et ne ressortent jamais.
 */
export const toShares = (entries) => {
  const total = entries.reduce((sum, entry) => sum + Math.max(entry.value ?? 0, 0), 0);
  if (total <= 0) return [];

  const shares = entries
    .map((entry) => ({
      label: entry.label,
      share: roundToStep((Math.max(entry.value ?? 0, 0) / total) * 100),
    }))
    .filter((entry) => entry.share >= MIN_VISIBLE_SHARE)
    .sort((a, b) => b.share - a.share);

  if (shares.length === 0) return [];

  // Les arrondis independants tombent rarement sur 100 pile : le reste est
  // absorbe par la plus grosse part, la seule ou il reste invisible.
  const drift = 100 - shares.reduce((sum, entry) => sum + entry.share, 0);
  shares[0] = { ...shares[0], share: shares[0].share + drift };

  return shares.filter((entry) => entry.share > 0).sort((a, b) => b.share - a.share);
};

const groupShares = (positions, pick) => {
  const groups = new Map();

  for (const position of positions) {
    const label = pick(position);
    if (!label) continue;
    groups.set(label, (groups.get(label) ?? 0) + Math.max(position.value ?? 0, 0));
  }

  return toShares([...groups].map(([label, value]) => ({ label, value })));
};

const looksLikeAddress = (text) => {
  if (typeof text !== 'string' || text.length < ADDRESS_MIN_LENGTH) return false;
  // Une date ISO est plus longue que le seuil mais ne peut pas etre une adresse.
  if (!Number.isNaN(Date.parse(text)) && text.includes('-')) return false;

  return EVM_ADDRESS.test(text) || BECH32_ADDRESS.test(text) || BASE58_ADDRESS.test(text);
};

/**
 * Detecteur de fumee du pipeline. Il ne repare rien : il fait echouer la
 * collecte avant l'ecriture du fichier, pour qu'un champ ajoute par distraction
 * ne se retrouve jamais commite.
 */
export const assertSafe = (payload, path = 'racine') => {
  if (payload === null || payload === undefined) return payload;

  if (typeof payload === 'number') {
    if (!Number.isInteger(payload)) {
      throw new Error(`${path} : nombre non entier (${payload}), signe d'un montant recopie`);
    }
    return payload;
  }

  if (typeof payload === 'string') {
    if (looksLikeAddress(payload)) {
      throw new Error(`${path} : adresse de wallet detectee dans une chaine`);
    }
    return payload;
  }

  if (Array.isArray(payload)) {
    payload.forEach((item, index) => assertSafe(item, `${path}[${index}]`));
    return payload;
  }

  if (typeof payload === 'object') {
    for (const [key, item] of Object.entries(payload)) {
      const forbidden = FORBIDDEN_KEYS.find((word) => key.toLowerCase().includes(word));
      if (forbidden) {
        throw new Error(`${path}.${key} : cle interdite (contient "${forbidden}")`);
      }
      assertSafe(item, `${path}.${key}`);
    }
  }

  return payload;
};

// Les sources portent le nom du reseau, parfois suffixe quand plusieurs
// adresses y cohabitent : deux adresses Bitcoin restent un seul reseau.
const countNetworks = (sources) =>
  new Set(
    (sources ?? [])
      .filter((name) => name !== 'Trading 212')
      .map((name) => name.replace(/\s*#\d+$/, '')),
  ).size;

const KIND_LABELS = { etf: 'ETF', stock: 'Actions', crypto: 'Crypto' };

const dayFormatter = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'long',
  timeZone: 'Europe/Paris',
});

const favouriteDay = (orders) => {
  if (orders.length === 0) return null;

  const counts = new Map();
  for (const order of orders) {
    const date = new Date(order.date);
    if (Number.isNaN(date.getTime())) continue;
    const day = dayFormatter.format(date);
    counts.set(day, (counts.get(day) ?? 0) + 1);
  }

  const ranked = [...counts].sort((a, b) => b[1] - a[1]);
  return ranked[0]?.[0] ?? null;
};

const holdingStats = (positions, now) => {
  const ages = positions
    .map((position) => Date.parse(position.openedAt))
    .filter((time) => !Number.isNaN(time))
    .map((time) => (now.getTime() - time) / MS_PER_DAY)
    .filter((days) => days >= 0);

  if (ages.length === 0) return { avgHoldingDays: null, oldestPositionMonths: null };

  const average = ages.reduce((sum, days) => sum + days, 0) / ages.length;

  return {
    avgHoldingDays: Math.round(average),
    oldestPositionMonths: Math.round(Math.max(...ages) / DAYS_PER_MONTH),
  };
};

const countDistinct = (positions, pick) =>
  new Set(positions.map(pick).filter(Boolean)).size;

/**
 * Transforme un portefeuille brut en statistiques publiables.
 * Rend null quand il n'y a rien a montrer : une carte vide vaut mieux qu'une
 * carte qui affiche des zeros et laisse croire a une panne.
 */
export const anonymize = (portfolio, now = new Date()) => {
  const positions = (portfolio?.positions ?? []).filter((position) => (position.value ?? 0) > 0);
  if (positions.length === 0) return null;

  // Distinguer "pas collecte" de "collecte et vide" : afficher "aucun ordre ce
  // mois-ci" alors qu'on n'a pas acces a l'historique serait une affirmation
  // fausse, pas une absence d'information.
  const orders = Array.isArray(portfolio?.orders) ? portfolio.orders : null;
  const recentOrders = orders?.filter((order) => {
    const time = Date.parse(order.date);
    return !Number.isNaN(time) && now.getTime() - time <= RECENT_ORDERS_DAYS * MS_PER_DAY;
  });

  const buyCount = recentOrders?.filter((order) => order.side === 'buy').length ?? 0;
  const sorted = [...positions].sort((a, b) => b.value - a.value);
  const grandTotal = positions.reduce((sum, position) => sum + position.value, 0);
  const topSlice = sorted.slice(0, TOP_POSITIONS).reduce((sum, position) => sum + position.value, 0);

  // Actifs qui produisent un rendement au lieu de dormir : staking natif et
  // depots sur protocoles de pret.
  const workingTotal = positions
    .filter((position) => position.staked)
    .reduce((sum, position) => sum + position.value, 0);

  const payload = {
    generatedAt: now.toISOString(),
    mix: groupShares(positions, (position) => KIND_LABELS[position.kind] ?? null),
    // Pas de repartition sectorielle : le courtier ne fournit pas le secteur,
    // et aucune source gratuite ne couvre les actions europeennes sans exiger
    // la publication de la liste des positions.
    regions: groupShares(positions, (position) => position.region),
    // Devises de cotation : un portefeuille en trois devises ne se pilote pas
    // comme un portefeuille en une seule.
    currencies: groupShares(positions, (position) => position.currency),
    structure: {
      positions: positions.length,
      topThreeShare: roundToStep((topSlice / grandTotal) * 100),
      countries: countDistinct(positions, (position) => position.country),
      currencies: countDistinct(positions, (position) => position.currency),
      networks: countNetworks(portfolio?.sources),
      workingShare: workingTotal > 0 ? roundToStep((workingTotal / grandTotal) * 100) : null,
    },
    behaviour: {
      ...holdingStats(positions, now),
      ordersLast30d: recentOrders?.length ?? null,
      buyRatio: recentOrders?.length ? roundToStep((buyCount / recentOrders.length) * 100) : null,
      favouriteDay: recentOrders ? favouriteDay(recentOrders) : null,
    },
    sources: portfolio?.sources ?? [],
  };

  return assertSafe(payload);
};
