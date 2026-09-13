// Le pont entre deep-chat et le Space.
//
// deep-chat tient lui-meme la liste des messages : ce module ne fait que lui
// envoyer du texte au fil de l'eau. Particularite a ne pas perdre de vue, et
// testee ici : en mode flux, deep-chat AJOUTE le texte recu a la bulle en cours.
// Il faut donc lui envoyer des morceaux, jamais la reponse complete a chaque
// fois, sinon elle se repete a l'ecran.

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createChatHandler } from './handler.js';

// Minuteurs immediats : la machine a ecrire deroule son texte sans temporiser.
const immediateTimers = {
  setTimer: (callback) => globalThis.setTimeout(callback, 0),
  clearTimer: (id) => globalThis.clearTimeout(id),
  tickMs: 0,
};

const createSignalsDouble = () => {
  const state = { texts: [], errors: [], opened: 0, closed: 0 };
  const signals = {
    onResponse: ({ text, error }) => {
      if (typeof text === 'string') state.texts.push(text);
      if (error) state.errors.push(error);
    },
    onOpen: () => {
      state.opened += 1;
    },
    onClose: () => {
      state.closed += 1;
    },
    stopClicked: {},
  };
  return { state, signals, displayed: () => state.texts.join('') };
};

const createHandler = (streamResponse, options = {}) =>
  createChatHandler({
    streamResponse,
    typewriterOptions: immediateTimers,
    getTurnstileToken: () => 'jeton-valide',
    ...options,
  });

const respondWith = (text) => async ({ onUpdate }) => {
  onUpdate(text);
  return text;
};

const bodyWith = (messages) => ({ messages });

describe('createChatHandler', () => {
  it('envoie la derniere question et l\'historique au Space', async () => {
    const received = [];
    const handler = createHandler(async ({ message, history, onUpdate }) => {
      received.push({ message, history });
      onUpdate('ok');
      return 'ok';
    });
    const { signals } = createSignalsDouble();

    await handler(
      bodyWith([
        { role: 'ai', text: 'Message d\'accueil' },
        { role: 'user', text: 'Ton parcours ?' },
        { role: 'ai', text: 'Un master.' },
        { role: 'user', text: 'Tes projets ?' },
      ]),
      signals,
    );

    assert.equal(received[0].message, 'Tes projets ?');
    assert.deepEqual(received[0].history, [['Ton parcours ?', 'Un master.']]);
  });

  it('envoie des morceaux dont la somme reconstitue exactement la reponse', async () => {
    const response = 'Valentin a construit ce portfolio en Vue 3. '.repeat(6);
    const handler = createHandler(respondWith(response));
    const { signals, displayed, state } = createSignalsDouble();

    await handler(bodyWith([{ role: 'user', text: 'Ton portfolio ?' }]), signals);

    assert.equal(displayed(), response);
    assert.ok(state.texts.length > 1, 'la reponse doit arriver en plusieurs morceaux');
  });

  it('desamorce un lien dangereux renvoye par le Space', async () => {
    // deep-chat accepte n'importe quel schema d'URL dans les liens Markdown.
    // La reponse du modele n'est pas du contenu de confiance : une question
    // piegee peut lui faire produire un lien `javascript:`.
    const handler = createHandler(respondWith('Regarde [ici](javascript:alert(1)) donc.'));
    const { signals, displayed } = createSignalsDouble();

    await handler(bodyWith([{ role: 'user', text: 'Salut' }]), signals);

    assert.doesNotMatch(displayed(), /javascript:/i);
    assert.match(displayed(), /ici/, 'le texte de la reponse doit rester lisible');
  });

  it('arrete la bulle de chargement avant d\'ecrire le premier morceau', async () => {
    const handler = createHandler(respondWith('Une reponse.'));
    const { signals, state } = createSignalsDouble();

    await handler(bodyWith([{ role: 'user', text: 'Salut' }]), signals);

    assert.equal(state.opened, 1, 'onOpen doit etre appele une seule fois');
  });

  it('ferme le flux une fois la reponse terminee', async () => {
    const handler = createHandler(respondWith('Une reponse.'));
    const { signals, state } = createSignalsDouble();

    await handler(bodyWith([{ role: 'user', text: 'Salut' }]), signals);

    assert.equal(state.closed, 1);
  });

  it('explique le demarrage a froid plutot que d\'afficher une erreur brute', async () => {
    const handler = createHandler(async () => {
      const error = new Error('Erreur HTTP 503');
      error.status = 503;
      throw error;
    });
    const { signals, displayed, state } = createSignalsDouble();

    await handler(bodyWith([{ role: 'user', text: 'Salut' }]), signals);

    assert.match(displayed(), /démarre/i);
    assert.equal(state.closed, 1, 'le flux doit se fermer meme en erreur');
  });

  it('ne laisse pas fuiter le detail technique d\'une panne inconnue', async () => {
    const handler = createHandler(async () => {
      throw new Error('socket hang up');
    });
    const { signals, displayed } = createSignalsDouble();

    await handler(bodyWith([{ role: 'user', text: 'Salut' }]), signals);

    assert.doesNotMatch(displayed(), /socket hang up/);
    assert.match(displayed(), /erreur/i);
  });

  it('previent le suivi d\'audience du type de panne, sans le message', async () => {
    const kinds = [];
    const handler = createHandler(
      async () => {
        const error = new Error('Erreur HTTP 503');
        error.status = 503;
        throw error;
      },
      { onError: (kind) => kinds.push(kind) },
    );
    const { signals } = createSignalsDouble();

    await handler(bodyWith([{ role: 'user', text: 'Salut' }]), signals);

    assert.deepEqual(kinds, ['cold_start']);
  });

  it('n\'appelle pas le Space tant que la verification de securite n\'est pas passee', async () => {
    const handler = createHandler(
      () => assert.fail('le Space ne doit pas etre appele sans jeton'),
      { getTurnstileToken: () => null },
    );
    const { signals, displayed, state } = createSignalsDouble();

    await handler(bodyWith([{ role: 'user', text: 'Salut' }]), signals);

    assert.match(displayed(), /vérification/i);
    assert.equal(state.closed, 1);
  });

  it('conserve le texte deja recu quand le visiteur interrompt la reponse', async () => {
    let releaseSpace;
    const handler = createHandler(async ({ onUpdate }) => {
      onUpdate('Debut de reponse');
      await new Promise((resolve) => {
        releaseSpace = resolve;
      });
      onUpdate('Debut de reponse et la suite');
      return 'Debut de reponse et la suite';
    });
    const { signals, displayed, state } = createSignalsDouble();

    const handling = handler(bodyWith([{ role: 'user', text: 'Salut' }]), signals);
    await new Promise((resolve) => globalThis.setTimeout(resolve, 5));
    signals.stopClicked.listener();
    releaseSpace();
    await handling;

    assert.equal(displayed(), 'Debut de reponse');
    assert.equal(state.closed, 1);
  });
  it('n\'affiche jamais la signature du modele et la remonte a l\'interface', async () => {
    // Le Space termine chaque reponse par une balise HTML qui nomme le modele.
    // Elle appartient a l'interface, pas a la bulle : deep-chat l'afficherait
    // telle quelle, puisqu'il n'interprete pas le HTML des reponses.
    const models = [];
    const handler = createHandler(
      async ({ onUpdate }) => {
        onUpdate('Salut !\n\n<small sty');
        onUpdate('Salut !\n\n<small style="opacity:0.5">open-mistral-nemo</small>');
        return 'Salut !';
      },
      { onModel: (name) => models.push(name) },
    );
    const { signals, displayed } = createSignalsDouble();

    await handler(bodyWith([{ role: 'user', text: 'Salut' }]), signals);

    assert.equal(displayed(), 'Salut !');
    assert.deepEqual(models, ['open-mistral-nemo']);
  });
});
