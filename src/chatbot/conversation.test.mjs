// Les identifiants qui relient les messages d'une meme discussion dans
// Langfuse. Tout est injectable : ni stockage reel, ni hasard reel, sinon ces
// tests seraient differents a chaque execution.

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  CONVERSATION_STORAGE_KEY,
  VISITOR_STORAGE_KEY,
  buildSessionHash,
  createReadableId,
  getSessionHash,
  readOrCreateId,
} from './conversation.js';

// Faux stockage : la meme interface que localStorage, sans navigateur.
const createStorageDouble = (initial = {}) => {
  const values = { ...initial };
  return {
    values,
    getItem: (key) => (key in values ? values[key] : null),
    setItem: (key, value) => {
      values[key] = String(value);
    },
  };
};

// Stockage indisponible : navigation privee, cookies bloques, quota plein.
const brokenStorage = {
  getItem: () => {
    throw new Error('stockage indisponible');
  },
  setItem: () => {
    throw new Error('stockage indisponible');
  },
};

// Hasard previsible : rend toujours le premier element de chaque liste.
const alwaysFirst = () => 0;

describe('createReadableId', () => {
  it('assemble un adjectif, un nom et un suffixe', () => {
    const id = createReadableId({ randomInt: alwaysFirst });

    assert.match(id, /^[a-z]+-[a-z]+-[a-z0-9]{6}$/);
  });

  it('ne rend pas deux fois le meme identifiant', () => {
    const ids = new Set(Array.from({ length: 200 }, () => createReadableId()));

    assert.equal(ids.size, 200);
  });

  // Un accent ou une majuscule dans la liste de mots passerait inapercu ici et
  // ressortirait cote Space, dans l'identifiant de session.
  it('n\'utilise que des lettres simples, quel que soit le tirage', () => {
    for (const id of Array.from({ length: 200 }, () => createReadableId())) {
      assert.match(id, /^[a-z]+-[a-z]+-[a-z0-9]{6}$/, `identifiant invalide : ${id}`);
    }
  });

  it('reste sous la limite de 200 caracteres de Langfuse', () => {
    assert.ok(createReadableId().length <= 200);
  });
});

describe('readOrCreateId', () => {
  it('reutilise l\'identifiant deja stocke', () => {
    const storage = createStorageDouble({ 'cle': 'renard-curieux-k3f9x2' });

    assert.equal(readOrCreateId(storage, 'cle'), 'renard-curieux-k3f9x2');
  });

  it('en cree un et l\'enregistre quand il n\'y en a pas', () => {
    const storage = createStorageDouble();

    const id = readOrCreateId(storage, 'cle');

    assert.ok(id);
    assert.equal(storage.values.cle, id);
  });

  it('ignore une valeur stockee vide', () => {
    const storage = createStorageDouble({ cle: '   ' });

    const id = readOrCreateId(storage, 'cle');

    assert.notEqual(id.trim(), '');
  });

  // Un stockage casse ne doit jamais empecher le visiteur de discuter : on
  // perd le lien entre deux visites, pas le chatbot.
  it('rend quand meme un identifiant si le stockage leve une erreur', () => {
    const id = readOrCreateId(brokenStorage, 'cle');

    assert.match(id, /^[a-z]+-[a-z]+-[a-z0-9]{6}$/);
  });

  it('rend un identifiant sans stockage du tout', () => {
    assert.ok(readOrCreateId(null, 'cle'));
  });
});

describe('buildSessionHash', () => {
  it('colle le visiteur et la discussion avec un separateur', () => {
    assert.equal(buildSessionHash('renard-curieux-aaa111', 'causerie-vive-bbb222'), 'renard-curieux-aaa111~causerie-vive-bbb222');
  });

  // Le Space sait lire un identifiant seul : il le prend pour la discussion.
  it('rend la seule valeur connue quand l\'autre manque', () => {
    assert.equal(buildSessionHash('', 'causerie-vive-bbb222'), 'causerie-vive-bbb222');
    assert.equal(buildSessionHash('renard-curieux-aaa111', ''), 'renard-curieux-aaa111');
  });

  it('rend une chaine vide quand les deux manquent', () => {
    assert.equal(buildSessionHash('', ''), '');
    assert.equal(buildSessionHash(null, undefined), '');
  });
});

describe('cles de stockage', () => {
  it('distingue le visiteur de la discussion', () => {
    assert.notEqual(VISITOR_STORAGE_KEY, CONVERSATION_STORAGE_KEY);
  });
});

describe('getSessionHash', () => {
  it('prend le visiteur dans localStorage et la discussion dans sessionStorage', () => {
    const local = createStorageDouble({ [VISITOR_STORAGE_KEY]: 'renard-curieux-aaa111' });
    const session = createStorageDouble({ [CONVERSATION_STORAGE_KEY]: 'causerie-vive-bbb222' });

    assert.equal(
      getSessionHash({ localStorage: local, sessionStorage: session }),
      'renard-curieux-aaa111~causerie-vive-bbb222',
    );
  });

  // Le visiteur survit a la fermeture de l'onglet, la discussion non : les deux
  // stockages ne sont pas interchangeables.
  it('ne confond pas les deux stockages', () => {
    const local = createStorageDouble();
    const session = createStorageDouble();

    getSessionHash({ localStorage: local, sessionStorage: session });

    assert.ok(local.values[VISITOR_STORAGE_KEY], 'le visiteur va dans localStorage');
    assert.equal(local.values[CONVERSATION_STORAGE_KEY], undefined);
    assert.ok(session.values[CONVERSATION_STORAGE_KEY], 'la discussion va dans sessionStorage');
    assert.equal(session.values[VISITOR_STORAGE_KEY], undefined);
  });

  it('garde le meme identifiant d\'un message a l\'autre', () => {
    const local = createStorageDouble();
    const session = createStorageDouble();
    const storages = { localStorage: local, sessionStorage: session };

    assert.equal(getSessionHash(storages), getSessionHash(storages));
  });

  // Certains navigateurs ne refusent pas `getItem` : ils refusent la lecture
  // meme de `globalThis.localStorage` (iframe isolee, stockage bloque). Le
  // chatbot doit repondre quand meme, sans identifiant.
  it('survit a un stockage dont la simple lecture leve une erreur', (t) => {
    const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      get() {
        throw new Error('SecurityError');
      },
    });
    t.after(() => {
      if (original) Object.defineProperty(globalThis, 'localStorage', original);
      else delete globalThis.localStorage;
    });

    assert.doesNotThrow(() => getSessionHash());
    assert.ok(getSessionHash());
  });
});
