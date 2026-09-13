// Lecture des soldes on-chain, sans aucune cle API.
//
// Les adresses ne circulent qu'ici, depuis les secrets du depot vers les
// services publics. Elles ne ressortent jamais : ce module rend des quantites
// d'actifs, que le collecteur valorise puis reduit en pourcentages.
//
// Services retenus apres tests reels depuis une IP de datacenter, proche de
// celle d'un runner GitHub : Blockscout (EVM), RPC officiel Solana, Blockstream
// Esplora (Bitcoin), BlockCypher (Dogecoin). Les alternatives connues sont soit
// mortes, soit passees payantes, soit elles bannissent les IP partagees.

import { fetchJson, withFallback } from './http.mjs';
import { STAKE_PROGRAM, WITHDRAWER_OFFSET, sumStakeAccounts } from './staking.mjs';

const LAMPORTS_PER_SOL = 1_000_000_000;
const SATOSHIS_PER_BTC = 100_000_000;
const KOINU_PER_DOGE = 100_000_000;

/**
 * Convertit un montant exprime en plus petite unite vers l'unite courante.
 * Passe par BigInt : 6,7 ETH en wei depasse le plus grand entier representable
 * en JavaScript, et un parseInt direct renverrait un nombre faux en silence.
 */
export const fromBaseUnits = (raw, decimals) => {
  if (raw === null || raw === undefined) return 0;

  let value;
  try {
    value = BigInt(raw);
  } catch {
    // Champ absent, vide ou non numerique : un solde inconnu vaut zero, il ne
    // doit pas faire echouer toute la collecte.
    return 0;
  }

  const divisor = 10n ** BigInt(Number(decimals) || 0);
  const whole = value / divisor;
  const remainder = value % divisor;

  return Number(whole) + Number(remainder) / Number(divisor);
};

const holding = (symbol, amount) => ({ symbol, amount });

// --- EVM (Ethereum, Polygon, Base, Arbitrum) via Blockscout -----------------

export const parseBlockscoutNative = (payload, symbol) =>
  holding(symbol, fromBaseUnits(payload?.coin_balance, 18));

export const parseBlockscoutTokens = (payload, chainName) =>
  (Array.isArray(payload?.items) ? payload.items : [])
    .map((item) => ({
      ...holding(item?.token?.symbol, fromBaseUnits(item?.value, item?.token?.decimals)),
      platform: chainName,
      contract: item?.token?.address_hash ?? item?.token?.address ?? null,
    }))
    // Tout wallet accumule des jetons de spam envoyes sans consentement. Sans
    // contrat, un jeton ne peut pas etre cote : il ne servirait a rien de le
    // garder, et son symbole peut usurper celui d'un actif connu.
    .filter((entry) => entry.symbol && entry.contract && entry.amount > 0);

// --- Solana -----------------------------------------------------------------

export const parseSolanaBalance = (payload) =>
  holding('SOL', (Number(payload?.result?.value) || 0) / LAMPORTS_PER_SOL);

export const parseSolanaTokens = (payload) =>
  (Array.isArray(payload?.result?.value) ? payload.result.value : [])
    .map((entry) => {
      const info = entry?.account?.data?.parsed?.info;
      const token = info?.tokenAmount;
      if (!token) return null;

      // uiAmountString avant uiAmount : le second est un flottant que le RPC
      // arrondit faux sur les gros montants.
      const amount =
        token.uiAmountString !== undefined && token.uiAmountString !== null
          ? Number(token.uiAmountString)
          : fromBaseUnits(token.amount, token.decimals);

      return {
        ...holding(info.mint, Number.isFinite(amount) ? amount : 0),
        platform: 'solana',
        // Sur Solana l'adresse du jeton s'appelle le mint : c'est l'equivalent
        // exact d'une adresse de contrat ailleurs.
        contract: info.mint,
      };
    })
    .filter((entry) => entry && entry.contract && entry.amount > 0);

// --- Bitcoin via Blockstream Esplora ----------------------------------------

/**
 * Bitcoin ne tient pas de compte avec un solde : il tient des recus (UTXO).
 * Le solde est donc la somme recue moins la somme depensee, comme un carnet de
 * cheques. Les transactions encore en attente comptent : ce sont des fonds
 * reellement engages.
 */
export const parseBitcoin = (payload) => {
  const confirmed =
    (payload?.chain_stats?.funded_txo_sum ?? 0) - (payload?.chain_stats?.spent_txo_sum ?? 0);
  const pending =
    (payload?.mempool_stats?.funded_txo_sum ?? 0) - (payload?.mempool_stats?.spent_txo_sum ?? 0);

  return holding('BTC', Math.max(confirmed + pending, 0) / SATOSHIS_PER_BTC);
};

/**
 * Format de blockchain.info, le service de secours : il expose directement un
 * solde en satoshis, sans calcul d'UTXO a faire.
 */
export const parseBitcoinBalance = (payload, address) =>
  holding('BTC', Math.max(Number(payload?.[address]?.final_balance) || 0, 0) / SATOSHIS_PER_BTC);

// --- Dogecoin via BlockCypher, secours BitPay Bitcore -----------------------

/**
 * Les deux services ne nomment pas le champ pareil. On ne lit que le solde :
 * total_received de BlockCypher depasse le plus grand entier representable en
 * JavaScript et arrive deja fausse dans la reponse.
 */
export const parseDogecoin = (payload) => {
  const koinu = payload?.final_balance ?? payload?.balance ?? 0;
  return holding('DOGE', Math.max(Number(koinu) || 0, 0) / KOINU_PER_DOGE);
};

// --- Appels reseau ----------------------------------------------------------


// Une adresse EVM est identique sur toutes les chaines compatibles : la meme
// cle publique y detient des soldes differents.
export const EVM_CHAINS = {
  ethereum: {
    host: 'https://eth.blockscout.com',
    symbol: 'ETH',
    rpc: 'https://ethereum-rpc.publicnode.com',
  },
  polygon: {
    host: 'https://polygon.blockscout.com',
    symbol: 'POL',
    rpc: 'https://polygon-bor-rpc.publicnode.com',
  },
  base: {
    host: 'https://base.blockscout.com',
    symbol: 'ETH',
    rpc: 'https://base-rpc.publicnode.com',
  },
  arbitrum: {
    host: 'https://arbitrum.blockscout.com',
    symbol: 'ETH',
    rpc: 'https://arbitrum-one-rpc.publicnode.com',
  },
  // optimism.blockscout.com repond 301 vers cet hote. Viser la redirection
  // directement evite de dependre du suivi automatique du client HTTP : un
  // wrapper qui ne la suit pas lirait un corps vide, donc un solde nul.
  optimism: {
    host: 'https://explorer.optimism.io',
    symbol: 'ETH',
    rpc: 'https://optimism-rpc.publicnode.com',
  },
  // Aucune instance Blockscout n'existe pour BNB Chain, et toutes les API
  // publiques testees exigent une cle pour *decouvrir* les jetons d'une
  // adresse. Lire le solde d'un contrat connu, en revanche, ne demande rien :
  // la liste ci-dessous est donc fixee a la main.
  bnb: {
    host: null,
    symbol: 'BNB',
    rpc: 'https://bsc-dataseed.bnbchain.org',
  },
};

// Jetons BEP-20 suivis sur BNB Chain. Contrats releves chez l'agregateur de
// cours puis verifies sur la chaine ; les decimales sont lues une fois pour
// toutes, un contrat deploye ne les change jamais.
export const BEP20_TOKENS = [
  { symbol: 'LINK', contract: '0xf8a0bf9cf54bb92f17374d9e9a321e6a111a51bd', decimals: 18 },
  // Filecoin circule sur BNB Chain sous sa version pontee par la plateforme,
  // qui a son propre contrat et son propre cours.
  { symbol: 'FIL', contract: '0x0d8ce2a99bb6e3b7db580ed848240e4a0f9ae153', decimals: 18 },
  { symbol: 'VINU', contract: '0xfebe8c1ed424dbf688551d4e2267e7a53698f0aa', decimals: 18 },
];

// Quatre premiers octets du hachage de balanceOf(address).
const SELECTOR_BALANCE_OF = '0x70a08231';
const WORD_HEX_LENGTH = 64;

// Blockscout pagine a 50 jetons et refuse qu'on lui impose une taille de page :
// le parametre limit fait echouer la requete. Sans boucle sur next_page_params,
// un wallet actif perd ses jetons au-dela du cinquantieme, sans aucun signal.
// Au-dela de dix pages, le wallet est noye sous le spam et la part reelle des
// jetons suivants est negligeable.
const MAX_TOKEN_PAGES = 10;

const SOLANA_RPC = 'https://api.mainnet.solana.com';
const SOLANA_RPC_FALLBACK = 'https://api.mainnet-beta.solana.com';
// Deux programmes de jetons coexistent sur Solana : le classique et Token-2022.
// Interroger un seul des deux ferait disparaitre la moitie des jetons.
const SOLANA_TOKEN_PROGRAMS = [
  'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
  'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb',
];

/**
 * Parcourt toutes les pages de jetons. Blockscout en renvoie 50 par page et
 * indique la suite dans next_page_params : sans cette boucle, un wallet actif
 * verrait ses jetons tronques sans le moindre avertissement.
 */
const readEvmTokens = async (host, address, chainName, onFallback) => {
  const tokens = [];
  let query = '?type=ERC-20';

  for (let page = 0; page < MAX_TOKEN_PAGES; page += 1) {
    try {
      const payload = await fetchJson(`${host}/api/v2/addresses/${address}/tokens${query}`);
      tokens.push(...parseBlockscoutTokens(payload, chainName));

      const next = payload?.next_page_params;
      if (!next) break;

      query = `?type=ERC-20&${new URLSearchParams(next)}`;
    } catch (error) {
      // Volontairement relance : une pagination interrompue rendrait une liste
      // tronquee que rien ne distinguerait d'un wallet reellement plus petit.
      onFallback?.(error);
      throw error;
    }
  }

  return tokens;
};


export const encodeBalanceOf = (address) =>
  `${SELECTOR_BALANCE_OF}${address.slice(2).toLowerCase().padStart(WORD_HEX_LENGTH, '0')}`;

export const parseBep20Balance = (payload, token) => ({
  ...holding(token.symbol, fromBaseUnits(decodeHexAmount(payload?.result), token.decimals)),
  platform: 'bnb',
  contract: token.contract,
});

// Un contrat qui ne repond pas renvoie une chaine vide, pas une erreur.
const decodeHexAmount = (hex) => {
  if (typeof hex !== 'string' || hex.length <= 2) return '0';
  try {
    return BigInt(hex).toString();
  } catch {
    return '0';
  }
};

/**
 * Lit les soldes des jetons BEP-20 suivis, un appel par contrat.
 * Aucune decouverte possible sans cle sur cette chaine : on interroge donc
 * directement les contrats dont on connait l'adresse.
 */
export const readBep20 = async (rpc, address, tokens = BEP20_TOKENS) => {
  const balances = [];

  for (const token of tokens) {
    const payload = await fetchJson(rpc, {
      body: {
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_call',
        params: [{ to: token.contract, data: encodeBalanceOf(address) }, 'latest'],
      },
    });

    balances.push(parseBep20Balance(payload, token));
  }

  return balances.filter((entry) => entry.amount > 0);
};

/**
 * Solde natif et jetons d'une adresse EVM, sur une chaine.
 * Blockscout est le seul service sans cle qui decouvre les jetons detenus et
 * fournit leurs decimales ; le RPC public ne sert que de secours pour le natif,
 * un RPC ne sachant pas lister les jetons d'une adresse.
 */
export const readEvm = async (address, chainName, { onFallback } = {}) => {
  const chain = EVM_CHAINS[chainName];
  if (!chain) throw new Error(`chaine EVM inconnue : ${chainName}`);

  const readNativeByRpc = async () => {
    const rpc = await fetchJson(chain.rpc, {
      body: { jsonrpc: '2.0', id: 1, method: 'eth_getBalance', params: [address, 'latest'] },
    });
    // Le RPC repond en hexadecimal, Blockscout en decimal.
    return holding(chain.symbol, fromBaseUnits(BigInt(rpc?.result ?? '0x0').toString(), 18));
  };

  const native = chain.host
    ? await withFallback(
        async () =>
          parseBlockscoutNative(
            await fetchJson(`${chain.host}/api/v2/addresses/${address}`),
            chain.symbol,
          ),
        readNativeByRpc,
        { onFallback },
      )
    : await readNativeByRpc();

  // Les jetons ne sont pas vitaux : leur absence ne doit pas faire echouer la
  // chaine entiere, alors que le solde natif, lui, est indispensable.
  // Sans explorateur, on se rabat sur la liste de contrats connus : c'est le
  // cas de BNB Chain, ou aucune API gratuite ne sait lister les jetons detenus.
  const tokens = chain.host
    ? await readEvmTokens(chain.host, address, chainName, onFallback)
    : await readBep20(chain.rpc, address);

  return [native, ...tokens].filter((entry) => entry.amount > 0);
};

const solanaCall = (endpoint, method, params) =>
  fetchJson(endpoint, { body: { jsonrpc: '2.0', id: 1, method, params } });

/**
 * Solde SOL et jetons SPL. Le RPC officiel est le seul endpoint sans cle qui
 * accepte encore getTokenAccountsByOwner : les autres RPC publics desactivent
 * la methode, trop couteuse pour eux.
 */
export const readSolana = async (address, { onFallback } = {}) => {
  const endpoint = await withFallback(
    async () => {
      await solanaCall(SOLANA_RPC, 'getHealth', []);
      return SOLANA_RPC;
    },
    async () => SOLANA_RPC_FALLBACK,
    { onFallback },
  );

  const native = parseSolanaBalance(
    await solanaCall(endpoint, 'getBalance', [address, { commitment: 'finalized' }]),
  );

  // Le SOL stake vit dans des comptes separes, invisibles pour getBalance : un
  // portefeuille majoritairement stake paraitrait presque vide sans cette
  // lecture. Une panne ici ne doit pas emporter le solde liquide.
  let staked = holding('SOL', 0);
  try {
    const [epochInfo, stakeAccounts] = await Promise.all([
      solanaCall(endpoint, 'getEpochInfo', []),
      solanaCall(endpoint, 'getProgramAccounts', [
        STAKE_PROGRAM,
        {
          encoding: 'jsonParsed',
          filters: [{ memcmp: { offset: WITHDRAWER_OFFSET, bytes: address } }],
        },
      ]),
    ]);

    staked = {
      ...holding('SOL', sumStakeAccounts(stakeAccounts?.result, epochInfo?.result?.epoch).total),
      // Marque ce qui produit un rendement, pour la part "qui travaille".
      staked: true,
    };
  } catch (error) {
    // Relance aussi : un staking illisible ferait passer un portefeuille
    // majoritairement stake pour un portefeuille presque vide.
    onFallback?.(error);
    throw error;
  }

  const tokens = [];
  for (const programId of SOLANA_TOKEN_PROGRAMS) {
    try {
      const response = await solanaCall(endpoint, 'getTokenAccountsByOwner', [
        address,
        { programId },
        { encoding: 'jsonParsed', commitment: 'finalized' },
      ]);
      tokens.push(...parseSolanaTokens(response));
    } catch (error) {
      onFallback?.(error);
      throw error;
    }
  }

  // Le staking liquide (mSOL, jitoSOL) figure deja parmi les jetons SPL : les
  // deux sources sont disjointes, elles s'additionnent sans double comptage.
  return [native, staked, ...tokens].filter((entry) => entry.amount > 0);
};

/**
 * Solde Bitcoin. Esplora en premier : c'est le seul service a n'avoir montre
 * aucune degradation depuis une IP de datacenter pendant les tests.
 */
export const readBitcoin = (address, { onFallback } = {}) =>
  withFallback(
    async () => [parseBitcoin(await fetchJson(`https://blockstream.info/api/address/${address}`))],
    async () => [
      parseBitcoinBalance(await fetchJson(`https://blockchain.info/balance?active=${address}`), address),
    ],
    { onFallback },
  );

/**
 * Solde Dogecoin. Le quota BlockCypher est compte par IP et peut deja etre
 * epuise par un autre job sur le meme runner, d'ou un secours opere par un
 * acteur totalement different.
 */
export const readDogecoin = (address, { onFallback } = {}) =>
  withFallback(
    async () => [
      parseDogecoin(
        await fetchJson(`https://api.blockcypher.com/v1/doge/main/addrs/${address}/balance`),
      ),
    ],
    async () => [
      parseDogecoin(
        await fetchJson(`https://api.bitcore.io/api/DOGE/mainnet/address/${address}/balance`),
      ),
    ],
    { onFallback },
  );
