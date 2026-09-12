// deep-chat vit dans un shadow DOM : les classes Tailwind du site n'y entrent
// pas, tout son habillage passe par des objets JavaScript. Les construire dans
// une fonction pure permet de verifier ici ce qu'aucun test visuel ne couvre :
// que le theme sombre est reellement traite, et qu'aucune couleur n'est oubliee.

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { buildChatStyles, buildIntroPanelStyles } from './styles.js';

// Les couleurs peuvent porter un canal alpha (#120602 + '33') : on ne compare
// que la teinte, l'opacite est un choix d'habillage, pas de charte.
const allColors = (value) =>
  (JSON.stringify(value).match(/#[0-9a-f]{6,8}/gi) ?? []).map((color) =>
    color.slice(0, 7).toLowerCase(),
  );

describe('buildChatStyles', () => {
  it('habille differemment le theme clair et le theme sombre', () => {
    const light = buildChatStyles({ isDark: false, variant: 'page' });
    const dark = buildChatStyles({ isDark: true, variant: 'page' });

    assert.notDeepEqual(light.messageStyles, dark.messageStyles);
    assert.notEqual(light.style.backgroundColor, dark.style.backgroundColor);
  });

  it('n\'utilise que des couleurs de la charte du site', () => {
    // Garde-fou contre une couleur ecrite au juge dans un objet de style : la
    // charte est dans tailwind.css, pas dans ce module.
    const palette = new Set(
      [
        '#fff1ea', '#fde5da', '#f9cdbd', '#f4d7cb', '#fbd8c8', '#f7b08f',
        '#120602', '#160703', '#210a05', '#35130c', '#532015', '#7a3522',
        '#06142f', '#091f46', '#0d2c60', '#123b7d', '#1c4d96', '#2b5fad',
        '#4c82df', '#7aa7ef', '#abc9f7', '#d8e7ff', '#eef4ff',
        '#e65a28', '#ec703e', '#f1885b', '#c8461b', '#9e3213', '#2a130d',
        '#f2a98e', '#ea805d', '#e6b49f', '#cf8769', '#a95a3d', '#eef4ff',
        '#ffffff', '#000000',
      ].map((color) => color.toLowerCase()),
    );

    const used = [
      buildChatStyles({ isDark: false, variant: 'page' }),
      buildChatStyles({ isDark: true, variant: 'page' }),
      // Le panneau d'accueil vit dans le meme shadow DOM : il est habille par le
      // meme module, donc soumis a la meme charte.
      buildIntroPanelStyles(false),
      buildIntroPanelStyles(true),
    ].flatMap(allColors);

    assert.ok(used.length > 0, 'les styles doivent bien porter des couleurs');
    for (const color of used) {
      assert.ok(palette.has(color), `couleur hors charte : ${color}`);
    }
  });

  it('resserre la typographie dans le widget flottant', () => {
    const page = buildChatStyles({ isDark: false, variant: 'page' });
    const widget = buildChatStyles({ isDark: false, variant: 'widget' });

    assert.notEqual(page.messageStyles.default.shared.bubble.fontSize, undefined);
    assert.notEqual(
      page.messageStyles.default.shared.bubble.fontSize,
      widget.messageStyles.default.shared.bubble.fontSize,
    );
  });

  it('habille le panneau d\'accueil et ses suggestions', () => {
    const light = buildIntroPanelStyles(false);
    const dark = buildIntroPanelStyles(true);

    assert.ok(light['chat-intro-suggestion'], 'les suggestions doivent etre habillees');
    assert.ok(
      light['chat-intro-suggestion'].styles.hover,
      'une suggestion cliquable doit reagir au survol',
    );
    assert.notDeepEqual(light['chat-intro'], dark['chat-intro']);
  });

  it('fournit la feuille de style interne du markdown et du curseur', () => {
    const { auxiliaryStyle } = buildChatStyles({ isDark: false, variant: 'page' });

    assert.match(auxiliaryStyle, /message-bubble/, 'le markdown des reponses doit etre habille');
    assert.match(auxiliaryStyle, /prefers-reduced-motion/, 'le curseur doit pouvoir etre coupe');
  });
});
