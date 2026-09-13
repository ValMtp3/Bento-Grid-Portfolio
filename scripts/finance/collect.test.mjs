// Cinq sources externes gratuites : un hoquet est certain, une panne durable
// est possible. Ces tests figent la seule regle qui compte : on ne publie
// jamais une allocation amputee d'une source, car elle serait fausse sans
// jamais avoir l'air fausse.

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { CollectError, collectAll, withRetry } from './collect.mjs';

const position = (kind, value) => ({ kind, value, openedAt: '2025-01-01' });
const source = (name, collect) => ({ name, collect });

describe('withRetry', () => {
  it('rend le resultat du premier essai reussi', async () => {
    assert.equal(await withRetry(async () => 'ok', { delayMs: 0 }), 'ok');
  });

  it('retente apres un echec passager', async () => {
    let calls = 0;
    const flaky = async () => {
      calls += 1;
      if (calls < 3) throw new Error('502');
      return 'ok';
    };

    assert.equal(await withRetry(flaky, { attempts: 3, delayMs: 0 }), 'ok');
    assert.equal(calls, 3);
  });

  it('abandonne apres le dernier essai en gardant la cause', async () => {
    const always = async () => {
      throw new Error('service indisponible');
    };

    await assert.rejects(withRetry(always, { attempts: 2, delayMs: 0 }), /service indisponible/);
  });
});

describe('collectAll', () => {
  it('fusionne les positions de toutes les sources', async () => {
    const result = await collectAll(
      [
        source('Courtier', async () => [position('etf', 100)]),
        source('Ethereum', async () => [position('crypto', 50)]),
      ],
      { delayMs: 0 },
    );

    assert.equal(result.positions.length, 2);
    assert.deepEqual(result.sources, ['Courtier', 'Ethereum']);
  });

  // Le coeur du sujet : sans crypto, les actions passeraient a 100 % et la
  // carte afficherait une repartition credible mais mensongere.
  it('refuse de rendre un resultat partiel quand une source tombe', async () => {
    const failing = collectAll(
      [
        source('Courtier', async () => [position('etf', 100)]),
        source('Ethereum', async () => {
          throw new Error('rpc down');
        }),
      ],
      { attempts: 1, delayMs: 0 },
    );

    await assert.rejects(failing, CollectError);
  });

  it('nomme les sources fautives dans l erreur, pour un journal exploitable', async () => {
    try {
      await collectAll(
        [
          source('Solana', async () => {
            throw new Error('429');
          }),
          source('Dogecoin', async () => {
            throw new Error('timeout');
          }),
        ],
        { attempts: 1, delayMs: 0 },
      );
      assert.fail('collectAll aurait du rejeter');
    } catch (error) {
      assert.ok(error instanceof CollectError);
      assert.deepEqual(error.failures.map((failure) => failure.name), ['Solana', 'Dogecoin']);
      assert.match(error.message, /Solana/);
    }
  });

  // Une source lente bloquerait le job GitHub jusqu'au timeout global de six
  // heures, et le cron suivant se chevaucherait.
  it('coupe une source qui ne repond pas', async () => {
    const hanging = collectAll(
      [source('Lente', () => new Promise(() => {}))],
      { attempts: 1, delayMs: 0, timeoutMs: 20 },
    );

    await assert.rejects(hanging, /Lente/);
  });

  it('tolere une source qui ne detient rien', async () => {
    const result = await collectAll(
      [
        source('Courtier', async () => [position('etf', 100)]),
        source('Dogecoin vide', async () => []),
      ],
      { delayMs: 0 },
    );

    assert.equal(result.positions.length, 1);
    assert.deepEqual(result.sources, ['Courtier', 'Dogecoin vide']);
  });
});

describe('withRetry face aux erreurs definitives', () => {
  // Une cle refusee ou une IP bannie renverront la meme reponse dans deux
  // secondes. Insister allonge le job et, sur certains services, aggrave le
  // blocage.
  it('abandonne des le premier essai sur une erreur marquee definitive', async () => {
    let calls = 0;
    const denied = async () => {
      calls += 1;
      const error = new Error('HTTP 401');
      error.permanent = true;
      throw error;
    };

    await assert.rejects(withRetry(denied, { attempts: 3, delayMs: 0 }), /401/);
    assert.equal(calls, 1);
  });

  it('retente normalement une erreur sans marquage', async () => {
    let calls = 0;
    const flaky = async () => {
      calls += 1;
      throw new Error('502');
    };

    await assert.rejects(withRetry(flaky, { attempts: 3, delayMs: 0 }));
    assert.equal(calls, 3);
  });
});
