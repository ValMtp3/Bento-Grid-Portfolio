// Les liens sont classes par hebergeur. Un test de sous-chaine sur l'URL
// entiere se laisse tromper par une adresse qui contient le nom ailleurs que
// dans l'hote (https://valentin-fiess.fr.evil.com, https://evil.com/github.com) :
// on compare donc l'hote reel, extrait par l'analyseur d'URL.

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { renderMarkdown } from './markdown.js';
import { getProjectAnalyticsAction, getProjectLinkLabel } from './data/projets.js';
import { isHostOf } from './urlHost.js';

describe('isHostOf', () => {
  it('reconnait le domaine exact et ses sous-domaines', () => {
    assert.equal(isHostOf('https://github.com/ValMtp3', 'github.com'), true);
    assert.equal(isHostOf('https://gist.github.com/x', 'github.com'), true);
  });

  it('refuse un domaine qui ne fait que contenir le nom', () => {
    assert.equal(isHostOf('https://github.com.evil.com/x', 'github.com'), false);
    assert.equal(isHostOf('https://evil.com/github.com', 'github.com'), false);
    assert.equal(isHostOf('https://notgithub.com', 'github.com'), false);
  });

  it('renvoie false pour une adresse illisible', () => {
    assert.equal(isHostOf('pas une url', 'github.com'), false);
    assert.equal(isHostOf('', 'github.com'), false);
  });
});

describe('renderMarkdown, liens externes', () => {
  it('ouvre un lien du site dans le meme onglet', () => {
    const html = renderMarkdown('[Accueil](https://valentin-fiess.fr/about)');
    assert.doesNotMatch(html, /target="_blank"/);
  });

  it('traite un domaine imitant le site comme externe', () => {
    const html = renderMarkdown('[Piege](https://valentin-fiess.fr.evil.com/)');
    assert.match(html, /target="_blank" rel="noopener noreferrer"/);
  });
});

describe('projets, classement par hebergeur', () => {
  it('garde les libelles des vrais hebergeurs', () => {
    assert.equal(getProjectLinkLabel({ src: 'https://github.com/ValMtp3/Damso' }), 'Voir le dépôt');
    assert.equal(getProjectLinkLabel({ src: 'https://gitlab.com/x/y' }), 'Voir le dépôt');
    assert.equal(getProjectLinkLabel({ src: 'https://huggingface.co/spaces/x' }), 'Tester la démo');
    assert.equal(getProjectAnalyticsAction({ src: 'https://github.com/x' }), 'open_repository');
    assert.equal(getProjectAnalyticsAction({ src: 'https://huggingface.co/x' }), 'open_demo');
  });

  it('ne se laisse pas tromper par le chemin de l adresse', () => {
    const project = { src: 'https://exemple.fr/github.com' };
    assert.equal(getProjectLinkLabel(project), 'Découvrir le projet');
    assert.equal(getProjectAnalyticsAction(project), 'open_project');
  });
});
