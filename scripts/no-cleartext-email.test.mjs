// Filet global : l'adresse email ne doit exister EN CLAIR dans aucun fichier
// servi ou aucune source du depot. Elle n'est embarquee que sous forme base64
// (EMAIL_B64 dans src/data/seo.js), decodee au clic par EmailProtection.
// Si ce test echoue, un harvester qui scanne le HTML, les bundles JS, les
// manifestes ou les jumeaux Markdown retrouve l'adresse telle quelle.

import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

import { EMAIL_B64 } from '../src/data/seo.js';

const EMAIL = atob(EMAIL_B64);
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const SKIP_DIRS = new Set(['node_modules', '.git']);
const TEXT_EXTENSIONS = new Set([
  '.js', '.mjs', '.cjs', '.ts', '.vue', '.json', '.md', '.html', '.txt',
  '.css', '.yml', '.yaml', '.xml', '.conf', '.sh', '.ini',
]);

// Les fichiers portant cet en-tete sont regeneres par pnpm build a partir des
// sources : les scanner ici dependrait de l'ordre build/test. Ils sont couverts
// indirectement (leurs sources le sont) et, apres build, via dist/.
const GENERATED_MARKER = 'Genere par scripts';

const collectFiles = (dir, includeGenerated) => {
  const files = [];
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      files.push(...collectFiles(full, includeGenerated));
      continue;
    }
    const ext = extname(entry);
    // Extension connue, ou fichier sans extension (.well-known/api-catalog).
    if (ext && !TEXT_EXTENSIONS.has(ext)) continue;
    if (!includeGenerated && readFileSync(full, 'utf8').slice(0, 400).includes(GENERATED_MARKER)) {
      continue;
    }
    files.push(full);
  }
  return files;
};

describe('aucune adresse email en clair', () => {
  it('dans les sources du depot (hors fichiers generes)', () => {
    const offenders = collectFiles(ROOT, false)
      .filter((file) => readFileSync(file, 'utf8').includes(EMAIL))
      .map((file) => relative(ROOT, file));
    assert.deepEqual(offenders, [], `email en clair dans : ${offenders.join(', ')}`);
  });

  it('dans dist/ apres build, si present', () => {
    const distDir = join(ROOT, 'dist');
    if (!existsSync(distDir)) return; // CI : le test tourne avant le build.
    const offenders = collectFiles(distDir, true)
      .filter((file) => readFileSync(file, 'utf8').includes(EMAIL))
      .map((file) => relative(ROOT, file));
    assert.deepEqual(offenders, [], `email en clair dans dist/ : ${offenders.join(', ')}`);
  });
});
