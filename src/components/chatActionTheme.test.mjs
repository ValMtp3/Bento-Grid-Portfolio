// Les boutons « Copier » et « Nouvelle conversation » du chat sont habilles par
// une classe locale, .chat-action, dans un <style scoped>. Leur variante sombre
// a deja disparu une fois a la compilation, et le symptome etait invisible en
// relisant le source : la regle y figurait bien.
//
// En cause, la construction `:global(.dark) .chat-action`. Le compilateur la
// reduit a `.dark { ... }` : le sélecteur cible est perdu, les declarations
// atterrissent sur <html class="dark"> et les boutons gardent leur couleur
// claire — un brun sombre sur fond noir, mesure a 1.5:1 au lieu des 4.5:1
// exiges par les WCAG.
//
// Ce test garde les deux moities du contrat : la regle doit viser .chat-action,
// et la construction fautive ne doit pas revenir.

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

const SOURCE = readFileSync(
  fileURLToPath(new URL('./ChatInterface.vue', import.meta.url)),
  'utf8',
);

// Le bloc <style scoped> uniquement : le template contient lui aussi le mot
// « dark » dans ses classes Tailwind, qui ne sont pas concernees.
//
// Les commentaires CSS sont retires : ils citent la construction fautive pour
// expliquer pourquoi l'eviter, et le test doit juger les regles, pas les
// explications qui les accompagnent.
const styleBlock = SOURCE.slice(SOURCE.indexOf('<style'), SOURCE.lastIndexOf('</style>')).replace(
  /\/\*[\s\S]*?\*\//g,
  '',
);

describe('theme sombre des boutons du chat', () => {
  it("n'utilise pas :global() avec un descendant", () => {
    // `:global(.dark) .chat-action` compile en `.dark { ... }` : le sélecteur
    // cible disparait. `.dark .chat-action` compile correctement.
    const fautif = styleBlock.match(/:global\([^)]+\)\s+\S/);

    assert.equal(
      fautif,
      null,
      `construction fautive trouvee : ${fautif?.[0]}. Ecrire « .dark .chat-action » sans :global().`,
    );
  });

  it('habille bien .chat-action en theme sombre', () => {
    assert.match(
      styleBlock,
      /\.dark\s+\.chat-action\s*{[^}]*color:/,
      'aucune couleur de texte definie pour .chat-action en theme sombre',
    );
  });

  it('traite aussi le survol en theme sombre', () => {
    assert.match(
      styleBlock,
      /\.dark\s+\.chat-action:hover/,
      'le survol des boutons garderait la couleur du theme clair',
    );
  });
});
