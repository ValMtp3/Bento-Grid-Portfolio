// Le typewriter est la machine a ecrire du chatbot : le Space renvoie la
// reponse par blocs, lui la restitue caractere par caractere. C'est de la
// logique de temps, pas de DOM : on injecte de faux minuteurs et on deroule le
// temps a la main, ce qui rend le test instantane et deterministe.

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { computeStep, createTypewriter } from './typewriter.js';

// Faux minuteur : les rappels sont empiles, `flush` les deroule un par un.
// La limite de tours evite qu'un bug de boucle infinie bloque la suite de tests.
const createFakeClock = () => {
  const pending = new Map();
  let nextId = 1;

  return {
    setTimer: (callback) => {
      const id = nextId++;
      pending.set(id, callback);
      return id;
    },
    clearTimer: (id) => pending.delete(id),
    flush: (maxTicks = 5000) => {
      let ticks = 0;
      while (pending.size > 0) {
        if (ticks++ > maxTicks) throw new Error('Le typewriter ne s\'arrete jamais');
        const [id, callback] = pending.entries().next().value;
        pending.delete(id);
        callback();
      }
    },
  };
};

const createRecorder = () => {
  const frames = [];
  return { frames, onDisplay: (text) => frames.push(text) };
};

describe('computeStep', () => {
  it('avance d\'un seul caractere quand le retard est faible', () => {
    assert.equal(computeStep(1), 1);
    assert.equal(computeStep(20), 1);
  });

  it('accelere a mesure que le retard grandit', () => {
    const small = computeStep(50);
    const medium = computeStep(300);
    const large = computeStep(2000);

    assert.ok(small < medium, 'un retard moyen doit etre plus rapide qu\'un petit');
    assert.ok(medium < large, 'un gros retard doit etre plus rapide qu\'un moyen');
  });

  it('ne recule jamais et reste borne', () => {
    assert.ok(computeStep(0) >= 1);
    assert.ok(computeStep(100000) <= 12, 'au-dela, l\'effet machine a ecrire disparait');
  });
});

describe('createTypewriter', () => {
  it('attend d\'avoir de la matiere avant d\'afficher le premier caractere', () => {
    const clock = createFakeClock();
    const recorder = createRecorder();
    const typewriter = createTypewriter({ onDisplay: recorder.onDisplay, ...clock });

    typewriter.push('Salut');
    clock.flush();

    assert.deepEqual(recorder.frames, [], 'cinq caracteres ne suffisent pas a demarrer');
  });

  it('affiche le texte progressivement, chaque image etant un prefixe de la reponse', () => {
    const clock = createFakeClock();
    const recorder = createRecorder();
    const typewriter = createTypewriter({ onDisplay: recorder.onDisplay, ...clock });
    const response = 'a'.repeat(400);

    typewriter.push(response);
    clock.flush();

    assert.ok(recorder.frames.length > 1, 'le texte doit arriver en plusieurs fois');
    for (const frame of recorder.frames) {
      assert.ok(response.startsWith(frame), 'chaque image est un prefixe de la reponse');
    }
  });

  it('garde un coussin de texte tant que le flux n\'est pas termine', () => {
    const clock = createFakeClock();
    const recorder = createRecorder();
    const typewriter = createTypewriter({ onDisplay: recorder.onDisplay, ...clock });
    const response = 'b'.repeat(400);

    typewriter.push(response);
    clock.flush();

    const lastFrame = recorder.frames.at(-1);
    assert.ok(
      lastFrame.length < response.length,
      'sans coussin, la machine rattrape le flux et l\'effet s\'arrete net',
    );
  });

  it('affiche la totalite du texte une fois le flux termine', async () => {
    const clock = createFakeClock();
    const recorder = createRecorder();
    const typewriter = createTypewriter({ onDisplay: recorder.onDisplay, ...clock });
    const response = 'Bonjour, je suis le chatbot de Valentin. '.repeat(5);

    typewriter.push(response);
    const finished = typewriter.finish();
    clock.flush();
    await finished;

    assert.equal(recorder.frames.at(-1), response);
  });

  it('ne coupe jamais un emoji en deux', async () => {
    const clock = createFakeClock();
    const recorder = createRecorder();
    const typewriter = createTypewriter({ onDisplay: recorder.onDisplay, ...clock });
    const response = `${'🦞'.repeat(120)}fin`;

    typewriter.push(response);
    const finished = typewriter.finish();
    clock.flush();
    await finished;

    for (const frame of recorder.frames) {
      const lastCodeUnit = frame.charCodeAt(frame.length - 1);
      assert.ok(
        Number.isNaN(lastCodeUnit) || lastCodeUnit < 0xd800 || lastCodeUnit > 0xdbff,
        'une image ne doit pas se terminer sur une demi-paire de substitution',
      );
    }
  });

  it('n\'affiche plus rien apres une annulation', () => {
    const clock = createFakeClock();
    const recorder = createRecorder();
    const typewriter = createTypewriter({ onDisplay: recorder.onDisplay, ...clock });

    typewriter.push('c'.repeat(400));
    typewriter.cancel();
    clock.flush();

    assert.deepEqual(recorder.frames, []);
  });

  it('libere l\'attente de finish meme si le texte est annule en cours de route', async () => {
    const clock = createFakeClock();
    const recorder = createRecorder();
    const typewriter = createTypewriter({ onDisplay: recorder.onDisplay, ...clock });

    typewriter.push('d'.repeat(400));
    const finished = typewriter.finish();
    typewriter.cancel();
    clock.flush();

    await finished;
  });
});
