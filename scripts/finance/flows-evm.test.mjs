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
