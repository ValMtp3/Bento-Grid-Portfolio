// Coffres de depot : Morpho, et tout contrat suivant la meme norme ERC-4626.
//
// Deposer de l'USDC dans un coffre ne laisse pas de l'USDC dans le wallet :
// on recoit des parts du coffre, un jeton distinct qu'aucun agregateur ne cote.
// Sans conversion, l'argent qui y dort disparait du total.
//
// Le contrat sait faire la conversion lui-meme : on lui demande quel jeton il
// detient (asset) et combien de ce jeton vaut une part (convertToAssets). Une
// seule implementation couvre donc tous les coffres de cette norme, sans avoir
// a connaitre les protocoles un par un.

import { fetchJson } from './http.mjs';

// Quatre premiers octets du hachage de la signature de chaque fonction.
const SELECTOR_ASSET = '0x38d52e0f';
const SELECTOR_DECIMALS = '0x313ce567';
const SELECTOR_CONVERT_TO_ASSETS = '0x07a2d13a';

const WORD_HEX_LENGTH = 64;
// Unite de reference pour interroger le taux : une part entiere.
const ONE_SHARE = 10n ** 18n;

export const decodeAddress = (hex) => {
  if (typeof hex !== 'string' || hex.length < 2 + WORD_HEX_LENGTH) return null;
  return `0x${hex.slice(-40)}`;
};

export const decodeUint = (hex) => {
  if (typeof hex !== 'string' || !/^0x[0-9a-f]*$/i.test(hex) || hex.length <= 2) return 0n;
  try {
    return BigInt(hex);
  } catch {
    return 0n;
  }
};

export const encodeConvertToAssets = (shares) =>
  `${SELECTOR_CONVERT_TO_ASSETS}${shares.toString(16).padStart(WORD_HEX_LENGTH, '0')}`;

/**
 * Applique le taux du coffre a un nombre de parts.
 * Le taux est exprime pour une part entiere : il faut donc le ramener a
 * l'echelle des parts detenues, puis a celle du jeton sous-jacent.
 */
export const sharesToAssets = ({ shares, assetsPerShare, assetDecimals }) => {
  if (!Number.isFinite(shares) || shares <= 0 || assetsPerShare <= 0n) return 0;

  const rate = Number(assetsPerShare) / 10 ** Number(assetDecimals ?? 0);
  return Number.isFinite(rate) ? shares * rate : 0;
};

const call = async (rpc, to, data) => {
  const response = await fetchJson(rpc, {
    body: { jsonrpc: '2.0', id: 1, method: 'eth_call', params: [{ to, data }, 'latest'] },
  });

  return response?.result ?? null;
};

/**
 * Tente de lire un jeton comme un coffre de depot.
 *
 * Rend null si le contrat ne repond pas a la norme : un jeton ordinaire
 * renvoie une donnee vide a ces appels, sans lever d'erreur. Ce n'est donc pas
 * un echec, seulement la reponse "ce n'est pas un coffre".
 */
export const readVault = async (rpc, contract, shares) => {
  const assetRaw = await call(rpc, contract, SELECTOR_ASSET);
  const asset = decodeAddress(assetRaw);
  if (!asset) return null;

  const [decimalsRaw, rateRaw] = await Promise.all([
    call(rpc, asset, SELECTOR_DECIMALS),
    call(rpc, contract, encodeConvertToAssets(ONE_SHARE)),
  ]);

  const assetsPerShare = decodeUint(rateRaw);
  if (assetsPerShare <= 0n) return null;

  const assetDecimals = Number(decodeUint(decimalsRaw));
  const amount = sharesToAssets({ shares, assetsPerShare, assetDecimals });

  return amount > 0 ? { contract: asset, amount } : null;
};
