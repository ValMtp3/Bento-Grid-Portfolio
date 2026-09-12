// Les coffres de depot (Morpho, et tout ce qui suit la meme norme) remettent
// des parts, pas le jeton depose. Sans conversion, ces parts n'ont aucun cours
// et l'argent qui dort dedans disparait purement et simplement du total.

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { decodeAddress, decodeUint, encodeConvertToAssets, sharesToAssets } from './vaults.mjs';

describe('decodeAddress', () => {
  it('extrait une adresse des trente-deux octets renvoyes par le contrat', () => {
    assert.equal(
      decodeAddress('0x000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'),
      '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    );
  });

  it('rend null sur une reponse vide ou trop courte', () => {
    assert.equal(decodeAddress('0x'), null);
    assert.equal(decodeAddress(null), null);
  });
});

describe('decodeUint', () => {
  it('lit un entier hexadecimal renvoye par le contrat', () => {
    assert.equal(decodeUint('0x00000000000000000000000000000000000000000000000000000000000ffcd6'), 1047766n);
  });

  it('rend zero sur une reponse illisible', () => {
    assert.equal(decodeUint('0x'), 0n);
    assert.equal(decodeUint('pas hexadecimal'), 0n);
  });
});

describe('encodeConvertToAssets', () => {
  // Selecteur de convertToAssets(uint256) suivi de l'argument sur trente-deux
  // octets : toute erreur ici renvoie une reponse vide, pas une erreur.
  it('assemble le selecteur et son argument', () => {
    const data = encodeConvertToAssets(10n ** 18n);

    assert.ok(data.startsWith('0x07a2d13a'), data.slice(0, 10));
    assert.equal(data.length, 10 + 64);
    assert.ok(data.endsWith('de0b6b3a7640000'));
  });
});

describe('sharesToAssets', () => {
  // Cas reel mesure sur un coffre Morpho : une part vaut 1,047766 USDC, le
  // rendement accumule depuis le depot.
  it('convertit des parts en montant du jeton sous-jacent', () => {
    const assets = sharesToAssets({
      shares: 100,
      shareDecimals: 18,
      assetsPerShare: 1047766n,
      assetDecimals: 6,
    });

    assert.ok(Math.abs(assets - 104.7766) < 1e-6, `recu ${assets}`);
  });

  it('gere un coffre a parite exacte', () => {
    const assets = sharesToAssets({
      shares: 50,
      shareDecimals: 18,
      assetsPerShare: 10n ** 18n,
      assetDecimals: 18,
    });

    assert.equal(assets, 50);
  });

  it('rend zero plutot que NaN sur une conversion impossible', () => {
    assert.equal(sharesToAssets({ shares: 10, assetsPerShare: 0n, assetDecimals: 6 }), 0);
    assert.equal(sharesToAssets({ shares: 0, assetsPerShare: 1047766n, assetDecimals: 6 }), 0);
  });
});
