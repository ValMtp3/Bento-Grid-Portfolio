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
