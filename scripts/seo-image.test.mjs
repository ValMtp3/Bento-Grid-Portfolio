// SEO image : la photo de profil doit etre declaree de trois facons, toutes
// lisibles sans JavaScript (JSON-LD, sitemap, coquille HTML prerendue).

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { IDENTITY, PROFILE_IMAGE, SITE_URL, seoRoutes } from '../src/data/seo.js';
import { buildJsonLd, buildSitemap } from './generate-agent-manifests.mjs';
import { buildProfileImageHtml } from './prerender.mjs';

const routeBySlug = (slug) => seoRoutes.find((route) => route.slug === slug);
const personOf = (slug) =>
  buildJsonLd(routeBySlug(slug))['@graph'].find((node) => node['@type'] === 'Person');

describe('JSON-LD, image de la personne', () => {
  it('declare Person.image comme un ImageObject avec legende', () => {
    const { image } = personOf('home');
    assert.equal(image['@type'], 'ImageObject');
    assert.equal(image.contentUrl, `${SITE_URL}${PROFILE_IMAGE.path}`);
    assert.equal(image.caption, PROFILE_IMAGE.alt);
  });

  it('marque /about comme ProfilePage dont la personne est le sujet', () => {
    const graph = buildJsonLd(routeBySlug('about'))['@graph'];
    const page = graph.find((node) => node['@id']?.endsWith('/about#webpage'));
    assert.deepEqual(page['@type'], ['WebPage', 'ProfilePage']);
    assert.equal(page.mainEntity['@id'], `${SITE_URL}/#person`);
  });

  it('garde les autres pages en WebPage simple', () => {
    const graph = buildJsonLd(routeBySlug('projets'))['@graph'];
    const page = graph.find((node) => node['@id']?.endsWith('/projets#webpage'));
    assert.equal(page['@type'], 'WebPage');
  });

  it('ecrit le metier avec son accent', () => {
    assert.equal(IDENTITY.jobTitle, 'Ingénieur IA / Data');
  });
});

describe('sitemap, image de profil', () => {
  it('declare l image sur les pages de PROFILE_IMAGE.slugs et nulle part ailleurs', () => {
    const xml = buildSitemap();
    const blocks = xml.split('<url>').slice(1);
    for (const block of blocks) {
      const loc = block.match(/<loc>(.*?)<\/loc>/)[1];
      const hasImage = block.includes('<image:loc>');
      const route = seoRoutes.find(({ path }) => `${SITE_URL}${path}` === loc);
      const expected = Boolean(route && PROFILE_IMAGE.slugs.includes(route.slug));
      assert.equal(hasImage, expected, `image dans le sitemap pour ${loc}`);
    }
    assert.match(xml, /xmlns:image="http:\/\/www\.google\.com\/schemas\/sitemap-image\/1\.1"/);
    assert.ok(xml.includes(`<image:loc>${SITE_URL}${PROFILE_IMAGE.path}</image:loc>`));
  });
});

describe('coquille prerendue, image de profil', () => {
  it('pose un <img> avec alt et dimensions pour home et about', () => {
    for (const slug of PROFILE_IMAGE.slugs) {
      const html = buildProfileImageHtml(routeBySlug(slug));
      assert.match(html, /<img /);
      assert.ok(html.includes(`src="${SITE_URL}${PROFILE_IMAGE.path}"`));
      assert.ok(html.includes(`alt="${PROFILE_IMAGE.alt}"`));
      assert.match(html, /width="\d+"/);
      assert.match(html, /height="\d+"/);
    }
  });

  it('ne pose rien sur les autres pages', () => {
    assert.equal(buildProfileImageHtml(routeBySlug('projets')), '');
  });
});
