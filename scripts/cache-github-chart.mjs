import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const sourceUrl = 'https://ghchart.rshah.org/E65A28/ValMtp3';
const outputPath = resolve('public/assets/assets_index/github-contributions.svg');

const response = await fetch(sourceUrl, {
  headers: {
    accept: 'image/svg+xml,*/*;q=0.8',
    'user-agent': 'portfolio-github-chart-cache',
  },
});

if (!response.ok) {
  throw new Error(`GitHub chart download failed: ${response.status} ${response.statusText}`);
}

const svg = await response.text();

if (!svg.includes('<svg') || !svg.includes('</svg>')) {
  throw new Error('GitHub chart download did not return a valid SVG.');
}

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, svg);

console.log(`Cached GitHub chart: ${outputPath}`);
