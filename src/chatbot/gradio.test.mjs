// Le dialogue avec le Space Hugging Face : une soumission, puis un flux
// d'evenements SSE. Tout est teste avec un faux `fetch`, donc sans reseau :
// ces tests doivent rester verts meme si le Space est eteint.

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { buildHistory, parseGradioEvent, streamChatbotResponse } from './gradio.js';

// Construit une reponse HTTP dont le corps est un flux SSE, comme le fait le Space.
const streamingResponse = (blocks) => {
  const encoder = new TextEncoder();
  const body = new ReadableStream({
    start(controller) {
      for (const block of blocks) controller.enqueue(encoder.encode(block));
      controller.close();
    },
  });
  return new Response(body, { status: 200 });
};

const generating = (text) => `event: generating\ndata: ${JSON.stringify([text])}\n\n`;
const complete = (text) => `event: complete\ndata: ${JSON.stringify([text])}\n\n`;

// Faux fetch en deux temps : la soumission rend un identifiant, l'appel suivant
// rend le flux.
const createFetchDouble = (blocks, { submitStatus = 200, streamStatus = 200 } = {}) => {
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push({ url, options });
    if (calls.length === 1) {
      if (submitStatus !== 200) return new Response('nope', { status: submitStatus });
      return new Response(JSON.stringify({ event_id: 'evt-1' }), { status: 200 });
    }
    if (streamStatus !== 200) return new Response('nope', { status: streamStatus });
    return streamingResponse(blocks);
  };
  return { calls, fetchImpl };
};

describe('parseGradioEvent', () => {
  it('extrait le texte d\'un evenement de generation', () => {
    const { event, response } = parseGradioEvent(generating('Bonjour').trim());

    assert.equal(event, 'generating');
    assert.equal(response, 'Bonjour');
  });

  it('recolle une donnee etalee sur plusieurs lignes', () => {
    // SSE autorise le serveur a couper sa donnee en plusieurs lignes `data:`,
    // que le client doit recoller avant de lire le JSON.
    const block = 'event: complete\ndata: [\ndata: "Deux lignes"\ndata: ]';

    const { response } = parseGradioEvent(block);

    assert.equal(response, 'Deux lignes');
  });

  it('leve une erreur sur un evenement d\'erreur du Space', () => {
    assert.throws(() => parseGradioEvent('event: error\ndata: null'), /Space/);
  });

  it('ignore un evenement sans texte exploitable', () => {
    const { response } = parseGradioEvent('event: heartbeat\ndata:');

    assert.equal(response, null);
  });
});

describe('buildHistory', () => {
  it('apparie chaque question a sa reponse', () => {
    const messages = [
      { role: 'bot', content: 'Message d\'accueil' },
      { role: 'user', content: 'Ton parcours ?' },
      { role: 'bot', content: 'Un master.' },
      { role: 'user', content: 'Tes projets ?' },
      { role: 'bot', content: 'Ce portfolio.' },
    ];

    assert.deepEqual(buildHistory(messages), [
      ['Ton parcours ?', 'Un master.'],
      ['Tes projets ?', 'Ce portfolio.'],
    ]);
  });

  it('comprend le vocabulaire de deep-chat, qui nomme le bot "ai"', () => {
    const messages = [
      { role: 'ai', text: 'Message d\'accueil' },
      { role: 'user', text: 'Ton parcours ?' },
      { role: 'ai', text: 'Un master.' },
    ];

    assert.deepEqual(buildHistory(messages), [['Ton parcours ?', 'Un master.']]);
  });

  it('laisse de cote une question restee sans reponse', () => {
    const messages = [
      { role: 'bot', content: 'Message d\'accueil' },
      { role: 'user', content: 'En cours...' },
    ];

    assert.deepEqual(buildHistory(messages), []);
  });
});

describe('streamChatbotResponse', () => {
  it('envoie la question et l\'historique au Space', async () => {
    const { calls, fetchImpl } = createFetchDouble([complete('Salut')]);

    await streamChatbotResponse({
      message: 'Ton parcours ?',
      history: [['Bonjour', 'Salut']],
      onUpdate: () => {},
      fetchImpl,
    });

    assert.equal(calls[0].options.method, 'POST');
    assert.deepEqual(JSON.parse(calls[0].options.body), {
      data: ['Ton parcours ?', [['Bonjour', 'Salut']]],
    });
    assert.ok(calls[1].url.endsWith('/evt-1'), 'le flux est lu sur l\'identifiant rendu');
  });

  it('remonte chaque etape puis rend la reponse finale', async () => {
    const { fetchImpl } = createFetchDouble([
      generating('Bon'),
      generating('Bonjour a'),
      complete('Bonjour a toi'),
    ]);
    const updates = [];

    const result = await streamChatbotResponse({
      message: 'Salut',
      history: [],
      onUpdate: (text) => updates.push(text),
      fetchImpl,
    });

    assert.deepEqual(updates, ['Bon', 'Bonjour a', 'Bonjour a toi']);
    assert.equal(result, 'Bonjour a toi');
  });

  it('supporte un evenement coupe en deux paquets reseau', async () => {
    const whole = complete('Reponse entiere');
    const { fetchImpl } = createFetchDouble([whole.slice(0, 12), whole.slice(12)]);

    const result = await streamChatbotResponse({
      message: 'Salut',
      history: [],
      onUpdate: () => {},
      fetchImpl,
    });

    assert.equal(result, 'Reponse entiere');
  });

  it('expose le code HTTP pour distinguer un demarrage a froid', async () => {
    const { fetchImpl } = createFetchDouble([], { submitStatus: 503 });

    await assert.rejects(
      streamChatbotResponse({ message: 'Salut', history: [], onUpdate: () => {}, fetchImpl }),
      (error) => error.status === 503,
    );
  });

  it('refuse un flux interrompu avant la fin', async () => {
    const { fetchImpl } = createFetchDouble([generating('Bonj')]);

    await assert.rejects(
      streamChatbotResponse({ message: 'Salut', history: [], onUpdate: () => {}, fetchImpl }),
      /incompl/i,
    );
  });

  it('refuse une reponse vide', async () => {
    const { fetchImpl } = createFetchDouble([complete('   ')]);

    await assert.rejects(
      streamChatbotResponse({ message: 'Salut', history: [], onUpdate: () => {}, fetchImpl }),
      /vide/i,
    );
  });

  it('traduit une interruption pour delai depasse en message lisible', async () => {
    const fetchImpl = async () => {
      const error = new Error('The operation was aborted');
      error.name = 'AbortError';
      throw error;
    };

    await assert.rejects(
      streamChatbotResponse({ message: 'Salut', history: [], onUpdate: () => {}, fetchImpl }),
      /trop longtemps/i,
    );
  });
});
