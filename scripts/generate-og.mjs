// Genere une image Open Graph 1200x630 par route, dans public/assets/og/.
// satori compose le SVG (texte converti en paths, donc aucune police requise a
// la rasterisation), resvg produit le PNG attendu par les crawlers sociaux.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import wawoff2 from 'wawoff2';

import { seoRoutes } from '../src/data/seo.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = resolve(root, 'public/assets/og');

const COLORS = {
  bg: '#120602', // coffee-bean-950
  accent: '#e65a28', // spicy-paprika-500
  kicker: '#f1885b', // spicy-paprika-300
  title: '#fff1ea', // soft-blush-50
  sub: '#f9cdbd', // soft-blush-200
  rule: '#35130c', // coffee-bean-700
};

// Fontsource ne livre que du woff/woff2 ; satori n'accepte ni l'un ni l'autre en
// woff2, on decompresse donc vers du TTF a la volee.
const loadFont = async (relativePath) => {
  const woff2 = await readFile(resolve(root, relativePath));
  return Buffer.from(await wawoff2.decompress(woff2));
};

const layout = ({ kicker, heading, sub }) => ({
  type: 'div',
  props: {
    style: {
      width: '1200px',
      height: '630px',
      display: 'flex',
      backgroundColor: COLORS.bg,
    },
    children: [
      { type: 'div', props: { style: { width: '16px', height: '630px', backgroundColor: COLORS.accent } } },
      {
        type: 'div',
        props: {
          style: {
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '72px 80px',
            flexGrow: 1,
          },
          children: [
            {
              type: 'div',
              props: {
                style: {
                  display: 'flex',
                  fontFamily: 'Intel One Mono',
                  fontSize: '24px',
                  letterSpacing: '4px',
                  textTransform: 'uppercase',
                  color: COLORS.kicker,
                },
                children: `$ ${kicker}`,
              },
            },
            {
              type: 'div',
              props: {
                style: { display: 'flex', flexDirection: 'column' },
                children: [
                  {
                    type: 'div',
                    props: {
                      style: {
                        fontFamily: 'Space Grotesk',
                        fontWeight: 700,
                        fontSize: heading.length > 22 ? '76px' : '96px',
                        lineHeight: 1.05,
                        color: COLORS.title,
                      },
                      children: heading,
                    },
                  },
                  {
                    type: 'div',
                    props: {
                      style: {
                        marginTop: '24px',
                        fontFamily: 'Space Grotesk',
                        fontSize: '36px',
                        color: COLORS.sub,
                      },
                      children: sub,
                    },
                  },
                ],
              },
            },
            {
              type: 'div',
              props: {
                style: {
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderTop: `2px solid ${COLORS.rule}`,
                  paddingTop: '28px',
                  fontFamily: 'Intel One Mono',
                  fontSize: '26px',
                  color: COLORS.sub,
                },
                children: [
                  { type: 'div', props: { style: { display: 'flex' }, children: 'Valentin Fiess' } },
                  {
                    type: 'div',
                    props: { style: { display: 'flex', color: COLORS.kicker }, children: 'valentin-fiess.fr' },
                  },
                ],
              },
            },
          ],
        },
      },
    ],
  },
});

const main = async () => {
  const [grotesk400, grotesk700, mono400] = await Promise.all([
    loadFont('node_modules/@fontsource/space-grotesk/files/space-grotesk-latin-400-normal.woff2'),
    loadFont('node_modules/@fontsource/space-grotesk/files/space-grotesk-latin-700-normal.woff2'),
    loadFont('node_modules/@fontsource/intel-one-mono/files/intel-one-mono-latin-400-normal.woff2'),
  ]);

  const fonts = [
    { name: 'Space Grotesk', data: grotesk400, weight: 400, style: 'normal' },
    { name: 'Space Grotesk', data: grotesk700, weight: 700, style: 'normal' },
    { name: 'Intel One Mono', data: mono400, weight: 400, style: 'normal' },
  ];

  await mkdir(outDir, { recursive: true });

  const targets = seoRoutes.filter((route) => route.og);
  for (const route of targets) {
    const svg = await satori(layout(route.og), { width: 1200, height: 630, fonts });
    const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();
    const file = resolve(outDir, `${route.slug}.png`);
    await writeFile(file, png);
    console.log(`og: ${route.slug}.png (${(png.length / 1024).toFixed(0)} Ko)`);
  }
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
