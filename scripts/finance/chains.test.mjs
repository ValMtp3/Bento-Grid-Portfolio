// Les charges utiles de ces tests sont les reponses reelles relevees sur
// chaque service, pas des exemples inventes : c'est le parsing des unites qui
// casse en silence, jamais l'appel lui-meme.

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  encodeBalanceOf,
  fromBaseUnits,
  parseBep20Balance,
  parseBitcoin,
  parseBlockscoutNative,
  parseBlockscoutTokens,
  parseDogecoin,
  parseSolanaBalance,
  parseSolanaTokens,
} from './chains.mjs';

describe('fromBaseUnits', () => {
  // 6,71 ETH en wei depasse Number.MAX_SAFE_INTEGER : un parseInt naif renvoie
  // une valeur fausse sans lever la moindre erreur.
  it('convertit un montant plus grand que l entier sur JSON', () => {
    const eth = fromBaseUnits('6712150561938689668', 18);
    assert.ok(Math.abs(eth - 6.712150561938689) < 1e-9, `recu ${eth}`);
  });

  it('accepte des decimales fournies en chaine, comme chez Blockscout', () => {
    assert.equal(fromBaseUnits('1500000', '6'), 1.5);
  });

  it('gere le zero et les entrees inutilisables sans exploser', () => {
    assert.equal(fromBaseUnits('0', 18), 0);
    assert.equal(fromBaseUnits(null, 18), 0);
    assert.equal(fromBaseUnits('pas un nombre', 18), 0);
  });

  it('ne perd pas la partie entiere des tres gros soldes', () => {
    assert.equal(fromBaseUnits('1000000000000000000000', 18), 1000);
  });
});

describe('parseBlockscoutNative', () => {
  it('lit coin_balance, un wei decimal en chaine', () => {
    const holding = parseBlockscoutNative({ coin_balance: '6712150561938689668' }, 'ETH');
    assert.equal(holding.symbol, 'ETH');
    assert.ok(holding.amount > 6.7 && holding.amount < 6.72);
  });

  it('rend un solde nul quand le champ manque', () => {
    assert.equal(parseBlockscoutNative({}, 'ETH').amount, 0);
  });
});

describe('parseBlockscoutTokens', () => {
  it('applique les decimales propres a chaque jeton et retient son contrat', () => {
    const holdings = parseBlockscoutTokens(
      {
        items: [
          { value: '2500000', token: { symbol: 'USDC', decimals: '6', address_hash: '0xA0b8' } },
          { value: '3000000000000000000', token: { symbol: 'DAI', decimals: '18', address_hash: '0x6B17' } },
        ],
      },
      'ethereum',
    );

    assert.deepEqual(holdings, [
      { symbol: 'USDC', amount: 2.5, platform: 'ethereum', contract: '0xA0b8' },
      { symbol: 'DAI', amount: 3, platform: 'ethereum', contract: '0x6B17' },
    ]);
  });

  it('ecarte les jetons a solde nul', () => {
    const holdings = parseBlockscoutTokens(
      { items: [{ value: '0', token: { symbol: 'SPAM', decimals: '18', address_hash: '0x1' } }] },
      'ethereum',
    );

    assert.deepEqual(holdings, []);
  });

  // Sans contrat, un jeton ne peut etre ni cote ni distingue d'une
  // contrefacon portant le meme symbole.
  it('ecarte un jeton sans adresse de contrat', () => {
    const holdings = parseBlockscoutTokens(
      { items: [{ value: '1000000', token: { symbol: 'USDC', decimals: '6' } }] },
      'ethereum',
    );

    assert.deepEqual(holdings, []);
  });

  it('survit a une reponse vide ou malformee', () => {
    assert.deepEqual(parseBlockscoutTokens({}, 'ethereum'), []);
    assert.deepEqual(parseBlockscoutTokens({ items: null }, 'ethereum'), []);
  });
});

describe('parseSolanaBalance', () => {
  it('convertit les lamports en SOL', () => {
    const holding = parseSolanaBalance({ result: { value: 1500000000 } });
    assert.deepEqual(holding, { symbol: 'SOL', amount: 1.5 });
  });

  it('rend zero quand le RPC ne renvoie pas de valeur', () => {
    assert.equal(parseSolanaBalance({ result: {} }).amount, 0);
  });
});

describe('parseSolanaTokens', () => {
  const response = (amount, decimals, uiAmountString) => ({
    result: {
      value: [
        {
          account: {
            data: {
              parsed: {
                info: {
                  mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
                  tokenAmount: { amount, decimals, uiAmountString },
                },
              },
            },
          },
        },
      ],
    },
  });

  // uiAmount est un flottant qui arrondit faux sur les gros montants ; la
  // chaine uiAmountString est la seule valeur fiable renvoyee par le RPC.
  it('prefere uiAmountString au flottant uiAmount', () => {
    const holdings = parseSolanaTokens(response('123456789', 6, '123.456789'));
    assert.equal(holdings[0].amount, 123.456789);
    assert.equal(holdings[0].platform, 'solana');
    assert.equal(holdings[0].contract, 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
  });

  it('retombe sur le montant brut si la chaine manque', () => {
    const holdings = parseSolanaTokens(response('2000000', 6, undefined));
    assert.equal(holdings[0].amount, 2);
  });

  it('ecarte les comptes de jetons vides', () => {
    assert.deepEqual(parseSolanaTokens(response('0', 6, '0')), []);
  });
});

describe('parseBitcoin', () => {
  // Bitcoin ne stocke pas de solde mais des recus : il faut soustraire les
  // sorties des entrees, sans quoi on affiche le total recu depuis l'origine.
  it('calcule le solde a partir des UTXO, confirmes et en attente', () => {
    const btc = parseBitcoin({
      chain_stats: { funded_txo_sum: 5743423379, spent_txo_sum: 743423379 },
      mempool_stats: { funded_txo_sum: 100000000, spent_txo_sum: 0 },
    });

    assert.deepEqual(btc, { symbol: 'BTC', amount: 51 });
  });

  it('ne descend jamais sous zero sur une reponse incoherente', () => {
    const btc = parseBitcoin({
      chain_stats: { funded_txo_sum: 0, spent_txo_sum: 500 },
      mempool_stats: { funded_txo_sum: 0, spent_txo_sum: 0 },
    });

    assert.equal(btc.amount, 0);
  });

  it('tolere l absence de section mempool', () => {
    const btc = parseBitcoin({ chain_stats: { funded_txo_sum: 100000000, spent_txo_sum: 0 } });
    assert.equal(btc.amount, 1);
  });
});

describe('parseDogecoin', () => {
  it('lit final_balance en koinu', () => {
    const doge = parseDogecoin({ final_balance: 6221159392701 });
    assert.equal(doge.symbol, 'DOGE');
    assert.ok(Math.abs(doge.amount - 62211.59392701) < 1e-6, `recu ${doge.amount}`);
  });

  it('accepte le champ balance du service de secours', () => {
    assert.equal(parseDogecoin({ balance: 100000000 }).amount, 1);
  });

  it('rend zero sur une reponse sans solde', () => {
    assert.equal(parseDogecoin({}).amount, 0);
  });
});

describe('parseBep20Balance', () => {
  it('convertit un solde hexadecimal en quantite', () => {
    const entry = parseBep20Balance(
      { result: '0x0de0b6b3a7640000' },
      { symbol: 'LINK', contract: '0xf8a0', decimals: 18 },
    );

    assert.deepEqual(entry, {
      symbol: 'LINK',
      amount: 1,
      platform: 'bnb',
      contract: '0xf8a0',
    });
  });

  it('rend un solde nul quand le contrat ne repond rien', () => {
    const entry = parseBep20Balance({}, { symbol: 'FIL', contract: '0x0d8c', decimals: 18 });
    assert.equal(entry.amount, 0);
  });

  it('survit a une reponse illisible', () => {
    const entry = parseBep20Balance(
      { result: '0x' },
      { symbol: 'VINU', contract: '0xfebe', decimals: 18 },
    );
    assert.equal(entry.amount, 0);
  });
});

describe('encodeBalanceOf', () => {
  // Selecteur de balanceOf(address) suivi de l'adresse sur trente-deux octets.
  it('assemble le selecteur et l adresse', () => {
    const data = encodeBalanceOf('0x04385CEa829035DEdCfe1a2E1D8A0388AA98F165');

    assert.ok(data.startsWith('0x70a08231'), data.slice(0, 10));
    assert.equal(data.length, 10 + 64);
    assert.ok(data.toLowerCase().endsWith('04385cea829035dedcfe1a2e1d8a0388aa98f165'));
  });
});
