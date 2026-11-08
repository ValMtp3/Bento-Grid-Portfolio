// Le JSON-LD est injecte en clair dans la coquille HTML de chaque route :
// aucun email ne doit s'y trouver, sinon la protection anti-harvest de la
// page (markdown obfusque, composant EmailProtection) serait vaine. Les
// manifestes .well-known, eux, gardent le contact en clair volontairement.

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { EMAIL_B64, IDENTITY, seoRoutes } from '../src/data/seo.js';
import { buildJsonLd } from './generate-agent-manifests.mjs';

const EMAIL = atob(EMAIL_B64);

describe('buildJsonLd, protection de l email', () => {
  it('ne contient aucune adresse email en clair, sur toutes les routes', () => {
    // Meme filtre que scripts/prerender.mjs : les routes sans coquille (404,
    // /justice) ne recoivent pas de JSON-LD en production.
    const prerendered = seoRoutes.filter((route) => route.prerender !== false && route.og);
    for (const route of prerendered) {
      const json = JSON.stringify(buildJsonLd(route));
      assert.ok(
        !json.includes(EMAIL),
        `la route ${route.path} fuit l'email dans son JSON-LD`,
      );
      assert.doesNotMatch(json, /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/);
    }
  });

  it('garde les autres champs de la personne', () => {
    const route = seoRoutes.find(({ slug }) => slug === 'legal');
    const { '@graph': graph } = buildJsonLd(route);
    const person = graph.find((node) => node['@type'] === 'Person');
    assert.equal(person.name, IDENTITY.name);
    assert.ok(person.contactPoint.url.endsWith('/contact'));
  });
});
