// Moteur de l'effet terminal de la cellule OM : le curseur clignote seul,
// puis les lignes s'ecrivent caractere par caractere, pause, puis tout
// s'efface en remontant, et la boucle recommence. Logique de temps pure :
// les minuteurs sont injectes, le test deroule le temps a la main.

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createTerminalPlayer } from './terminal.js';

// Faux minuteur : les rappels sont empiles, flush(n) en deroule exactement n.
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
      while (pending.size > 0 && ticks < maxTicks) {
        ticks += 1;
        const [id, callback] = pending.entries().next().value;
        pending.delete(id);
        callback();
      }
      return ticks;
    },
    pendingCount: () => pending.size,
  };
};

const createRecorder = () => {
  const frames = [];
  return { frames, onUpdate: (lines) => frames.push(lines) };
};

const TIMINGS = { blinkMs: 100, charMs: 10, holdMs: 50, eraseMs: 5, pauseMs: 20 };

describe('createTerminalPlayer', () => {
  it('affiche le curseur seul pendant la phase de clignotement', () => {
    const clock = createFakeClock();
    const recorder = createRecorder();
    const player = createTerminalPlayer({ lines: ['AB'], onUpdate: recorder.onUpdate, ...clock, ...TIMINGS });

    player.play();
    assert.deepEqual(recorder.frames, [['']]);
    player.stop();
  });

  it('ecrit caractere par caractere, ligne apres ligne', () => {
    const clock = createFakeClock();
    const recorder = createRecorder();
    const player = createTerminalPlayer({ lines: ['AB', 'C'], onUpdate: recorder.onUpdate, ...clock, ...TIMINGS });

    player.play();
    clock.flush(100);

    const typed = recorder.frames.slice(0, 6);
    assert.deepEqual(typed, [[''], ['A'], ['AB'], ['AB', ''], ['AB', 'C'], ['AB', 'C']]);
    player.stop();
  });

  it('efface en remontant apres la pause, jusqu au curseur seul', () => {
    const clock = createFakeClock();
    const recorder = createRecorder();
    const player = createTerminalPlayer({ lines: ['AB', 'C'], onUpdate: recorder.onUpdate, ...clock, ...TIMINGS });

    player.play();
    // Assez de tours pour passer blink + ecriture + hold + effacement complet.
    clock.flush(11);

    // L'effacement remonte ligne par ligne jusqu'au curseur seul.
    assert.deepEqual(recorder.frames.slice(-3), [['AB', ''], ['A'], ['']]);
    player.stop();
  });

  it('boucle : apres effacement et pause, ca re-ecrit depuis le debut', () => {
    const clock = createFakeClock();
    const recorder = createRecorder();
    const player = createTerminalPlayer({ lines: ['A'], onUpdate: recorder.onUpdate, ...clock, ...TIMINGS });

    player.play();
    clock.flush(20);

    // La sequence [''], ['A'] apparait au moins deux fois (deux boucles).
    const firstBlink = recorder.frames.findIndex((frame) => frame.length === 1 && frame[0] === '');
    const secondBlink = recorder.frames.findIndex((frame, index) => index > firstBlink && frame.length === 1 && frame[0] === '');
    assert.ok(secondBlink > firstBlink, 'la boucle doit revenir au curseur seul');
    const retyped = recorder.frames.findIndex((frame, index) => index > secondBlink && frame[0] === 'A');
    assert.ok(retyped > secondBlink, 'le texte doit etre re-ecrit apres la boucle');
    player.stop();
  });

  it('ne coupe jamais un emoji en deux', () => {
    const clock = createFakeClock();
    const recorder = createRecorder();
    const player = createTerminalPlayer({ lines: ['a🎉b'], onUpdate: recorder.onUpdate, ...clock, ...TIMINGS });

    player.play();
    clock.flush(10);

    const typed = recorder.frames.filter((frame) => frame[0].length > 0).map((frame) => frame[0]);
    assert.deepEqual(typed.slice(0, 3), ['a', 'a🎉', 'a🎉b']);
    player.stop();
  });

  it('stop() fige tout : plus aucune emission apres', () => {
    const clock = createFakeClock();
    const recorder = createRecorder();
    const player = createTerminalPlayer({ lines: ['ABC'], onUpdate: recorder.onUpdate, ...clock, ...TIMINGS });

    player.play();
    clock.flush(3);
    player.stop();
    const count = recorder.frames.length;
    clock.flush(50);
    assert.equal(recorder.frames.length, count);
    assert.equal(clock.pendingCount(), 0);
  });

  it('loop:false ecrit le texte complet puis s arrete, sans effacer', () => {
    const clock = createFakeClock();
    const recorder = createRecorder();
    const player = createTerminalPlayer({ lines: ['AB'], onUpdate: recorder.onUpdate, ...clock, ...TIMINGS, loop: false });

    player.play();
    clock.flush(20);

    // Texte complet atteint, plus aucun minuteur en attente : le curseur
    // reste affiche (clignotement CSS) mais rien ne se passe plus.
    assert.deepEqual(recorder.frames.at(-1), ['AB']);
    assert.equal(clock.pendingCount(), 0);
    const count = recorder.frames.length;
    clock.flush(20);
    assert.equal(recorder.frames.length, count);
    player.stop();
  });

  it('sans lignes, play() ne fait rien', () => {
    const clock = createFakeClock();
    const recorder = createRecorder();
    const player = createTerminalPlayer({ lines: [], onUpdate: recorder.onUpdate, ...clock, ...TIMINGS });

    player.play();
    clock.flush(10);
    assert.deepEqual(recorder.frames, []);
  });
});
