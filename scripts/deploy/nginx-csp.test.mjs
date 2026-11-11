// Garde-fou de la politique de securite servie par nginx.
//
// La CSP autorise le seul script inline du site (le theme pose dans
// index.html avant le premier affichage) par son empreinte sha256, et non par
// 'unsafe-inline'. Si quelqu'un modifie ce script sans mettre a jour
// nginx.conf, ce test echoue en CI : en production, le navigateur bloquerait
// le script sans erreur visible ailleurs que dans la console.

import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../..', import.meta.url));
const nginxConf = readFileSync(`${root}scripts/deploy/nginx.conf`, 'utf8');
const indexHtml = readFileSync(`${root}index.html`, 'utf8');

// Le premier <script> sans attribut d'index.html est le theme : c'est le
// seul script inline du site. L'empreinte porte sur le contenu exact entre
// les balises, espaces et sauts de ligne compris.
const inlineScript = indexHtml.match(/<script>([\s\S]*?)<\/script>/)[1];
const scriptHash = `'sha256-${createHash('sha256').update(inlineScript).digest('base64')}'`;

const csp = nginxConf.match(/add_header Content-Security-Policy "([^"]+)"/)[1];

const directive = (name) => csp.match(new RegExp(`${name} ([^;]+)`))?.[1] ?? '';

describe('CSP servie par nginx', () => {
  it("autorise le script inline du theme par son empreinte, pas par 'unsafe-inline'", () => {
    assert.ok(
      directive('script-src').includes(scriptHash),
      `script-src doit contenir ${scriptHash}`,
    );
    assert.ok(!directive('script-src').includes("'unsafe-inline'"));
  });

  it('garde les regles durcies intactes', () => {
    assert.ok(directive('default-src').includes("'self'"));
    assert.ok(directive('object-src').includes("'none'"));
    assert.ok(directive('frame-ancestors').includes("'none'"));
    assert.ok(directive('base-uri').includes("'self'"));
  });

  it('restreint img-src aux domaines reellement utilises', () => {
    const imgSrc = directive('img-src');
    assert.ok(!/(^|\s)https:(\s|$)/.test(imgSrc), 'img-src ne doit plus autoriser tout https:');
    for (const domain of [
      'https://raw.githubusercontent.com',
      'https://image.tmdb.org',
      'https://upload.wikimedia.org',
    ]) {
      assert.ok(imgSrc.includes(domain), `img-src doit contenir ${domain}`);
    }
    assert.ok(imgSrc.includes('data:'), 'img-src garde data: (avatar SVG du chatbot)');
  });

  it('ne declare plus Google Analytics, remplace par Matomo auto-heberge', () => {
    assert.ok(!csp.includes('google-analytics.com'));
    assert.ok(!csp.includes('googletagmanager.com'));
    assert.ok(csp.includes('analytics.valentin-fiess.fr'));
  });

  it("desactive l'ancien filtre X-XSS-Protection (recommande a 0 aujourd'hui)", () => {
    assert.ok(nginxConf.includes('add_header X-XSS-Protection "0" always;'));
  });

  it('pose Cross-Origin-Opener-Policy pour isoler la page des fenetres ouvertes', () => {
    assert.ok(nginxConf.includes('add_header Cross-Origin-Opener-Policy "same-origin" always;'));
  });
});
