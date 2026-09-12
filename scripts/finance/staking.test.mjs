// Le staking natif Solana vit dans des comptes separes de l'adresse du wallet.
// Deux pieges y sont invisibles a la lecture et couteux a l'affichage : le
// mauvais champ d'identite, et le mauvais champ de montant.

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { U64_MAX, WITHDRAWER_OFFSET, sumStakeAccounts } from './staking.mjs';

const delegated = (lamports, activationEpoch, deactivationEpoch = U64_MAX) => ({
  account: {
    lamports,
    data: {
      parsed: {
        type: 'delegated',
        info: {
          stake: {
            delegation: {
              activationEpoch: String(activationEpoch),
              deactivationEpoch: String(deactivationEpoch),
              // Valeur historique volontairement absurde : elle ne doit jamais
              // etre lue a la place des lamports.
              stake: '49999997717120',
            },
          },
        },
      },
    },
  },
});

describe('WITHDRAWER_OFFSET', () => {
  // Les interfaces de staking deleguent souvent le role "staker" a leur propre
  // programme et ne laissent au client que le "withdrawer". Filtrer sur le
  // staker ramenerait zero compte sur ces wallets.
  it('vise le proprietaire des fonds et non le gestionnaire', () => {
    assert.equal(WITHDRAWER_OFFSET, 44);
  });
});

describe('sumStakeAccounts', () => {
  const epoch = 1032;

  // Piege majeur : delegation.stake n'est pas remis a zero apres un retrait.
  // Un compte vide peut afficher 50 000 SOL delegues.
  it('lit les lamports du compte et jamais le montant delegue', () => {
    const total = sumStakeAccounts([delegated(3_000_000_000, 987)], epoch);
    assert.equal(total.total, 3);
    assert.equal(total.active, 3);
  });

  it('classe un compte en cours d activation', () => {
    const total = sumStakeAccounts([delegated(1_000_000_000, 1032)], epoch);
    assert.equal(total.activating, 1);
    assert.equal(total.active, 0);
  });

  it('classe un compte en cours de retrait', () => {
    const total = sumStakeAccounts([delegated(2_000_000_000, 1016, 1032)], epoch);
    assert.equal(total.deactivating, 2);
  });

  it('classe un compte deja retirable', () => {
    const total = sumStakeAccounts([delegated(5_000_000_000, 981, 1019)], epoch);
    assert.equal(total.inactive, 5);
  });

  // Un compte cree mais jamais delegue porte quand meme des lamports.
  it('compte un compte initialise mais jamais delegue', () => {
    const account = { account: { lamports: 2_282_880, data: { parsed: { type: 'initialized' } } } };
    const total = sumStakeAccounts([account], epoch);

    assert.ok(total.undelegated > 0);
    assert.equal(total.active, 0);
  });

  it('additionne les quatre etats dans un total unique', () => {
    const total = sumStakeAccounts(
      [
        delegated(1_000_000_000, 900),
        delegated(2_000_000_000, 1032),
        delegated(3_000_000_000, 1000, 1032),
        delegated(4_000_000_000, 900, 1000),
      ],
      epoch,
    );

    assert.equal(total.total, 10);
  });

  it('rend un total nul sans compte, sans division ni NaN', () => {
    assert.equal(sumStakeAccounts([], epoch).total, 0);
    assert.equal(sumStakeAccounts(null, epoch).total, 0);
  });

  it('ignore un compte au format inattendu plutot que de tout faire echouer', () => {
    const total = sumStakeAccounts([{ account: null }, delegated(1_000_000_000, 900)], epoch);
    assert.equal(total.total, 1);
  });
});

describe('sumStakeAccounts face a une reponse inattendue', () => {
  // Le RPC enveloppe sa reponse dans "result". Recevoir l'enveloppe entiere au
  // lieu du tableau faisait echouer toute la lecture de Solana.
  it('ignore un objet non iterable plutot que de lever', () => {
    assert.equal(sumStakeAccounts({ result: [] }, 1032).total, 0);
    assert.equal(sumStakeAccounts('pas un tableau', 1032).total, 0);
    assert.equal(sumStakeAccounts(undefined, 1032).total, 0);
  });

  // Une epoque absente classait tous les comptes en activation, donc un
  // portefeuille entierement stake s'affichait comme en cours de demarrage.
  it('reste coherent quand l epoque est absente', () => {
    const account = {
      account: {
        lamports: 1_000_000_000,
        data: {
          parsed: {
            type: 'delegated',
            info: { stake: { delegation: { activationEpoch: '900', deactivationEpoch: String(U64_MAX) } } },
          },
        },
      },
    };

    assert.equal(sumStakeAccounts([account], undefined).total, 1);
  });
});
