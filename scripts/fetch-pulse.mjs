// Collecte les signaux "vivants" du portfolio dans un JSON unique.
//
// Le site est deploye a la main sur Apache : ce fichier n'est donc pas lu
// depuis le build, mais depuis raw.githubusercontent.com au runtime, comme le
// fait deja le graphe de contributions. Un commit de ce JSON suffit a mettre le
// site a jour, sans redeploiement.
//
// Sources : activite GitHub publique + actualite de l'OM (football-data.org).
// La meteo et l'heure restent cote client, elles doivent etre vraies a la
// seconde ou la page se charge.

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const GITHUB_USER = 'ValMtp3';
const OM_TEAM_ID = 516;
const OUTPUT_PATH = resolve('public/data/pulse.json');

// Fenetre d'analyse de l'activite de code.
const ACTIVITY_DAYS = 7;
// Au-dela, on ne gagne plus en precision et on consomme le quota d'API pour rien.
const MAX_COMMITS_INSPECTED = 30;
// Un gros fichier ne doit pas ecraser le reste du mix a lui seul.
const MAX_LINES_PER_FILE = 400;

const EXTENSION_LANGUAGES = {
  py: 'Python',
  ipynb: 'Python',
  go: 'Go',
  js: 'JavaScript',
  mjs: 'JavaScript',
  cjs: 'JavaScript',
  jsx: 'JavaScript',
  ts: 'TypeScript',
  tsx: 'TypeScript',
  vue: 'Vue',
  css: 'CSS',
  scss: 'CSS',
  html: 'HTML',
  sql: 'SQL',
  sh: 'Shell',
  bash: 'Shell',
  zsh: 'Shell',
  rs: 'Rust',
  java: 'Java',
  php: 'PHP',
  rb: 'Ruby',
  yml: 'Config',
  yaml: 'Config',
  toml: 'Config',
  json: 'Config',
  md: 'Docs',
  mdx: 'Docs',
};

// Fichiers generes ou verrouilles : ils gonflent les diffs sans rien dire du
// travail reellement fourni.
const NOISE_PATTERNS = [
  /(^|\/)(node_modules|dist|build|vendor|\.venv)\//,
  /(^|\/)(pnpm-lock\.yaml|package-lock\.json|yarn\.lock|uv\.lock|go\.sum|poetry\.lock|composer\.lock)$/,
  /\.min\.(js|css)$/,
  /\.(png|jpe?g|webp|gif|ico|svg|pdf|woff2?|ttf|mp4)$/i,
];

const isNoise = (filename) => NOISE_PATTERNS.some((pattern) => pattern.test(filename));

const languageOf = (filename) => {
  if (isNoise(filename)) return null;
  const extension = filename.split('.').pop()?.toLowerCase();
  return EXTENSION_LANGUAGES[extension] ?? null;
};

const githubHeaders = () => {
  const headers = {
    accept: 'application/vnd.github+json',
    'x-github-api-version': '2022-11-28',
    'user-agent': 'portfolio-pulse',
  };
  if (process.env.GITHUB_TOKEN) {
    headers.authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return headers;
};

const githubGet = async (path) => {
  const response = await fetch(`https://api.github.com${path}`, { headers: githubHeaders() });
  if (!response.ok) {
    throw new Error(`GitHub ${path} -> ${response.status} ${response.statusText}`);
  }
  return response.json();
};

// On ne garde que les commits ecrits par Valentin. Le parametre "author" de
// l'API GitHub est inutilisable ici : il ne resout pas les adresses
// "@users.noreply.github.com" et renvoie une liste vide. Le champ author.login
// de la reponse, lui, est correct.
const isMine = (commit) =>
  commit.author?.login?.toLowerCase() === GITHUB_USER.toLowerCase() &&
  // Les merges recomptent du travail deja present sur la branche d'origine, et
  // "merge: integre dev dans main" ne raconte rien a un visiteur.
  (commit.parents?.length ?? 1) < 2;

const collectGithub = async () => {
  const events = await githubGet(`/users/${GITHUB_USER}/events/public?per_page=100`);
  const sinceMs = Date.now() - ACTIVITY_DAYS * 24 * 60 * 60 * 1000;
  const sinceIso = new Date(sinceMs).toISOString();

  // Depuis 2024, GitHub ne renseigne plus payload.commits dans les events
  // publics : il ne reste que la branche poussee. On s'en sert uniquement pour
  // savoir OU regarder, puis l'API Commits fournit le detail. C'est aussi ce
  // qui permet de suivre les branches de travail comme "dev", que l'endpoint
  // par defaut ignorerait.
  const targets = new Map();
  for (const event of events) {
    if (event.type !== 'PushEvent') continue;
    if (new Date(event.created_at).getTime() < sinceMs) continue;
    const branch = event.payload?.ref?.replace('refs/heads/', '');
    if (!branch) continue;
    targets.set(`${event.repo.name}@${branch}`, { repo: event.repo.name, branch });
  }

  const commits = [];
  for (const { repo, branch } of [...targets.values()].slice(0, 12)) {
    try {
      const page = await githubGet(
        `/repos/${repo}/commits?sha=${encodeURIComponent(branch)}` +
          `&since=${sinceIso}&per_page=100`,
      );
      for (const commit of page) {
        if (!isMine(commit)) continue;
        commits.push({
          repo,
          sha: commit.sha,
          date: commit.commit.author.date,
          message: commit.commit.message.split('\n')[0],
        });
      }
    } catch {
      continue; // Branche supprimee depuis le push, par exemple.
    }
  }

  // Un merge entre branches fait apparaitre le meme commit deux fois.
  const unique = [...new Map(commits.map((commit) => [commit.sha, commit])).values()].sort(
    (a, b) => new Date(b.date) - new Date(a.date),
  );

  const lastCommit = unique[0]
    ? {
        repo: unique[0].repo,
        sha: unique[0].sha,
        date: unique[0].date,
        message: unique[0].message,
        url: `https://github.com/${unique[0].repo}/commit/${unique[0].sha}`,
      }
    : null;

  const inspected = unique.slice(0, MAX_COMMITS_INSPECTED);

  // Mix de langages, pondere par les lignes reellement touchees.
  const lines = new Map();
  for (const { repo, sha } of inspected) {
    let detail;
    try {
      detail = await githubGet(`/repos/${repo}/commits/${sha}`);
    } catch {
      continue; // Depot devenu prive ou commit reecrit : on ignore.
    }
    for (const file of detail.files ?? []) {
      const language = languageOf(file.filename);
      if (!language) continue;
      const changed = Math.min((file.additions ?? 0) + (file.deletions ?? 0), MAX_LINES_PER_FILE);
      lines.set(language, (lines.get(language) ?? 0) + changed);
    }
  }

  const total = [...lines.values()].reduce((sum, value) => sum + value, 0);
  const languages = [...lines.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([name, value]) => ({ name, share: Math.round((value / total) * 100) }))
    .filter((language) => language.share > 0);

  return {
    lastCommit,
    week: {
      days: ACTIVITY_DAYS,
      // On compte tous les commits de la fenetre, meme ceux qu'on n'inspecte
      // pas pour le mix de langages.
      commits: unique.length,
      repos: new Set(unique.map((entry) => entry.repo)).size,
      languages: total > 0 ? languages : [],
    },
  };
};

const footballGet = async (path) => {
  const response = await fetch(`https://api.football-data.org/v4${path}`, {
    headers: { 'X-Auth-Token': process.env.FOOTBALL_DATA_API_KEY ?? '' },
  });
  if (!response.ok) {
    throw new Error(`football-data ${path} -> ${response.status} ${response.statusText}`);
  }
  return response.json();
};

// --- Couleurs de club -------------------------------------------------------
//
// Les deux couleurs d'un club sont extraites de son ecusson, pas d'une liste
// codee en dur : l'OM peut affronter n'importe quelle equipe d'Europe en coupe,
// et personne ne veut maintenir un annuaire mondial. Seules les 4 equipes des
// deux matchs affiches sont analysees, soit ~40 Ko par execution.

const FALLBACK_COLORS = ['#123b7d', '#e65a28'];

// Distance euclidienne ponderee : l'oeil est plus sensible au vert.
const colorDistance = (a, b) =>
  Math.sqrt(2 * (a[0] - b[0]) ** 2 + 4 * (a[1] - b[1]) ** 2 + 3 * (a[2] - b[2]) ** 2);

const MIN_SEPARATION = 90;

const toHex = ([r, g, b]) =>
  `#${[r, g, b].map((value) => Math.round(value).toString(16).padStart(2, '0')).join('')}`;

const fromHex = (hex) => {
  const value = hex.replace('#', '');
  const full =
    value.length === 3
      ? value
          .split('')
          .map((c) => c + c)
          .join('')
      : value;
  return [0, 2, 4].map((offset) => parseInt(full.slice(offset, offset + 2), 16));
};

// Regroupe les pixels par paquets de 32 niveaux puis rend la moyenne reelle de
// chaque paquet, pour ne pas afficher une couleur arrondie qui n'existe pas
// dans l'ecusson.
const dominantColors = (pixels) => {
  const buckets = new Map();

  for (const [r, g, b] of pixels) {
    const key = `${r >> 5}-${g >> 5}-${b >> 5}`;
    const bucket = buckets.get(key) ?? { count: 0, r: 0, g: 0, b: 0 };
    bucket.count += 1;
    bucket.r += r;
    bucket.g += g;
    bucket.b += b;
    buckets.set(key, bucket);
  }

  const ranked = [...buckets.values()]
    .sort((a, b) => b.count - a.count)
    .map(({ count, r, g, b }) => [r / count, g / count, b / count]);

  if (!ranked.length) return null;

  const primary = ranked[0];
  // La seconde couleur doit etre franchement differente, sinon on afficherait
  // deux nuances du meme bleu.
  const secondary = ranked.find((color) => colorDistance(color, primary) > MIN_SEPARATION);

  return [primary, secondary ?? ranked[1] ?? primary];
};

const colorsFromPng = async (buffer) => {
  const { PNG } = await import('pngjs');
  const { data, width, height } = PNG.sync.read(buffer);

  const pixels = [];
  for (let index = 0; index < width * height; index += 1) {
    const offset = index * 4;
    // Le halo d'antialiasing autour du logo fausse les moyennes.
    if (data[offset + 3] < 200) continue;
    pixels.push([data[offset], data[offset + 1], data[offset + 2]]);
  }

  return dominantColors(pixels);
};

const colorsFromSvg = (source) => {
  const found = [...source.matchAll(/(?:fill|stop-color)\s*[:=]\s*"?(#[0-9a-f]{3,6})/gi)].map(
    (match) => fromHex(match[1]),
  );
  return dominantColors(found);
};

const crestColors = async (crestUrl) => {
  if (!crestUrl) return FALLBACK_COLORS;

  try {
    const response = await fetch(crestUrl);
    if (!response.ok) return FALLBACK_COLORS;

    const buffer = Buffer.from(await response.arrayBuffer());
    const colors = crestUrl.endsWith('.svg')
      ? colorsFromSvg(buffer.toString('utf8'))
      : await colorsFromPng(buffer);

    return colors ? colors.map(toHex) : FALLBACK_COLORS;
  } catch {
    return FALLBACK_COLORS;
  }
};

// Deux clubs face a face ne doivent jamais tomber sur la meme pastille. On
// tente la couleur secondaire du visiteur, puis on la fonce en dernier recours.
const separate = (home, away) => {
  if (colorDistance(fromHex(home[0]), fromHex(away[0])) > MIN_SEPARATION) return away;

  if (colorDistance(fromHex(home[0]), fromHex(away[1])) > MIN_SEPARATION) {
    return [away[1], away[0]];
  }

  const darkened = fromHex(away[0]).map((channel) => Math.round(channel * 0.55));
  return [toHex(darkened), away[1]];
};

// L'ecusson lui-meme n'est pas publie : la direction artistique impose une
// iconographie monochrome, et on evite au passage 4 images externes par page.
const teamOf = (team) => ({ name: team.shortName || team.name, tla: team.tla });

// "outcome" est calcule du point de vue de l'OM : la cellule doit assumer les
// defaites autant que les victoires.
const outcomeFor = (match) => {
  const winner = match.score?.winner;
  if (!winner) return 'unknown';
  if (winner === 'DRAW') return 'draw';
  const omIsHome = match.homeTeam.id === OM_TEAM_ID;
  const omWon = (winner === 'HOME_TEAM' && omIsHome) || (winner === 'AWAY_TEAM' && !omIsHome);
  return omWon ? 'win' : 'loss';
};

const shapeMatch = async (match) => {
  const [homeColors, awayColors] = await Promise.all([
    crestColors(match.homeTeam.crest),
    crestColors(match.awayTeam.crest),
  ]);

  return {
    date: match.utcDate,
    competition: match.competition?.name ?? null,
    matchday: match.matchday ?? null,
    home: { ...teamOf(match.homeTeam), colors: homeColors },
    away: { ...teamOf(match.awayTeam), colors: separate(homeColors, awayColors) },
  };
};

const collectOm = async () => {
  const day = 24 * 60 * 60 * 1000;
  const iso = (offset) => new Date(Date.now() + offset).toISOString().slice(0, 10);

  // Une seule requete couvre passe et futur : le filtre "status" de l'API n'est
  // pas fiable, on tranche nous-memes sur les dates.
  const { matches = [] } = await footballGet(
    `/teams/${OM_TEAM_ID}/matches?dateFrom=${iso(-45 * day)}&dateTo=${iso(45 * day)}`,
  );

  const byDate = (a, b) => new Date(a.utcDate) - new Date(b.utcDate);
  const finished = matches.filter((match) => match.status === 'FINISHED').sort(byDate);
  const upcoming = matches.filter((match) => match.status !== 'FINISHED').sort(byDate);

  const last = finished.at(-1);
  const next = upcoming[0];

  let standing = null;
  try {
    const { standings = [] } = await footballGet('/competitions/FL1/standings');
    const table = standings.find((entry) => entry.type === 'TOTAL')?.table ?? [];
    const row = table.find((entry) => entry.team.id === OM_TEAM_ID);
    if (row) {
      standing = {
        position: row.position,
        points: row.points,
        played: row.playedGames,
        won: row.won,
        draw: row.draw,
        lost: row.lost,
      };
    }
  } catch {
    standing = null; // Hors saison, le classement peut disparaitre.
  }

  return {
    last: last
      ? {
          ...(await shapeMatch(last)),
          outcome: outcomeFor(last),
          score: { home: last.score.fullTime.home, away: last.score.fullTime.away },
        }
      : null,
    next: next ? await shapeMatch(next) : null,
    standing,
  };
};

// --- Series et films preferes ------------------------------------------------
//
// Le classement lui-meme vit dans src/data/favoris.js et ne bouge qu'une ou
// deux fois par an. Ce qu'on automatise ici, ce sont les metadonnees : titre,
// annee et affiche, qui evoluent chez TMDB sans prevenir.

const tmdbGet = async (path) => {
  const key = process.env.TMDB_API_KEY;
  if (!key) throw new Error('TMDB_API_KEY manquante');

  const response = await fetch(
    `https://api.themoviedb.org/3${path}?api_key=${key}&language=fr-FR`,
  );
  if (!response.ok) throw new Error(`tmdb ${path} -> ${response.status}`);
  return response.json();
};

const collectFavoris = async () => {
  const { favoris } = await import('../src/data/favoris.js');

  const shape = async (type, id) => {
    const entry = await tmdbGet(`/${type}/${id}`);
    return {
      id,
      title: entry.name ?? entry.title,
      year: (entry.first_air_date ?? entry.release_date ?? '').slice(0, 4) || null,
      poster: entry.poster_path, // Le prefixe de taille est choisi cote client.
    };
  };

  const [series, films] = await Promise.all([
    Promise.all(favoris.series.map((id) => shape('tv', id))),
    Promise.all(favoris.films.map((id) => shape('movie', id))),
  ]);

  return { series, films };
};

// Une source en panne ne doit jamais vider les autres cellules.
const settle = async (label, task) => {
  try {
    return await task();
  } catch (error) {
    console.error(`[pulse] ${label} indisponible : ${error.message}`);
    return null;
  }
};

const [github, om, favoris] = await Promise.all([
  settle('github', collectGithub),
  settle('om', collectOm),
  settle('favoris', collectFavoris),
]);

if (!github && !om && !favoris) {
  throw new Error('Aucune source disponible, on garde le pulse.json precedent.');
}

const payload = { github, om, favoris };

// Le workflow tourne toutes les 6 h alors que les donnees changent quelques
// fois par semaine. Sans cette comparaison, l'horodatage seul suffirait a
// produire un commit a chaque execution et noierait l'historique du depot.
const previous = await readFile(OUTPUT_PATH, 'utf8').catch(() => null);
if (previous) {
  const { generatedAt: _ignored, ...previousPayload } = JSON.parse(previous);
  if (JSON.stringify(previousPayload) === JSON.stringify(payload)) {
    console.log('Pulse inchange, aucune ecriture.');
    process.exit(0);
  }
}

const pulse = { generatedAt: new Date().toISOString(), ...payload };

await mkdir(dirname(OUTPUT_PATH), { recursive: true });
await writeFile(OUTPUT_PATH, `${JSON.stringify(pulse, null, 2)}\n`);

console.log(`Pulse ecrit : ${OUTPUT_PATH}`);
console.log(`  github : ${github ? `${github.week.commits} commits / ${github.week.repos} repos` : 'indisponible'}`);
console.log(`  om     : ${om?.last ? `dernier ${om.last.score.home}-${om.last.score.away} (${om.last.outcome})` : 'indisponible'}`);
console.log(`  favoris: ${favoris ? `${favoris.series.length} series / ${favoris.films.length} films` : 'indisponible'}`);
