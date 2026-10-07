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
