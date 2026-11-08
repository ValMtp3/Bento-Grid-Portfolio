// Logique pure de suivi des coupes de l'OM (Coupe de France + Europe) pour le
// pulse. Aucune entree/sortie ici : fetch-pulse.mjs normalise les reponses des
// deux API vers le format "match" decrit dans pulse-cups.test.mjs, et ce module
// decide ce qu'on affiche. Tout est testable sans reseau.

// --- Saison ------------------------------------------------------------------
// Une saison de football demarre en aout : d'aout a decembre, l'annee en cours
// est la saison ; de janvier a juillet, c'est la saison de l'annee precedente
// (ex. janvier 2027 -> saison 2026).
export const seasonYear = (now = new Date()) =>
  now.getUTCMonth() >= 7 ? now.getUTCFullYear() : now.getUTCFullYear() - 1;

// --- Tours -------------------------------------------------------------------
// Cle canonique d'un tour, commune aux deux sources :
// - football-data.org : 'LEAGUE_STAGE', 'PLAYOFFS', 'LAST_16', 'QUARTER_FINALS', ...
// - API-Football : 'League Stage - 3', 'Knockout Round Playoffs', '8th Finals',
//   'Round of 32', '16th Finals', 'Quarter-finals', 'Final', '7th Round', ...
// "LAST_64" veut dire "64 equipes restantes", soit un "32e de finale".
// competitionCode (CL/EL/UECL/CDF...) sert de contexte : dans une coupe UEFA,
// un tour qui est juste un numero ("8") est une journee de phase de ligue.
export const normalizeRound = (raw, competitionCode = null) => {
  if (!raw) return null;
  const upper = String(raw).trim().toUpperCase();

  // Deja une cle canonique (football-data.org renvoie 'LAST_16' tel quel).
  if (/^(LEAGUE_STAGE|PLAYOFFS|QUARTER_FINALS|SEMI_FINALS|FINAL|LAST_\d+|ROUND_\d+)$/.test(upper)) {
    return upper;
  }
  if (/^LEAGUE STAGE( - \d+)?$/.test(upper) || /PHASE DE LIGUE/.test(upper)) return 'LEAGUE_STAGE';
  if (upper === 'PLAYOFFS' || /KNOCKOUT ROUND PLAYOFFS/.test(upper) || /BARRAGE/.test(upper)) {
    return 'PLAYOFFS';
  }

  // "8th Finals" / "Round of 32" / "Round 32" / "32e de finale" = 64 equipes
  // restantes, soit un "32e de finale".
  const deFinale = /(\d+)\s*E\s+DE\s+FINALE/.exec(upper);
  if (deFinale) return `LAST_${2 * Number(deFinale[1])}`;
  const finals = /(\d+)(?:ST|ND|RD|TH) FINALS?/.exec(upper);
  if (finals) return `LAST_${2 * Number(finals[1])}`;
  const roundOf = /ROUND (?:OF )?(\d+)/.exec(upper);
  if (roundOf) return `LAST_${2 * Number(roundOf[1])}`;

  if (upper === 'QUARTER_FINALS' || /QUART/.test(upper)) return 'QUARTER_FINALS';
  if (upper === 'SEMI_FINALS' || /SEMI|DEMI/.test(upper)) return 'SEMI_FINALS';
  if (upper === 'FINAL' || upper === 'FINALE' || /FINAL/.test(upper)) return 'FINAL';

  const nth = /(\d+)(?:ST|ND|RD|TH) ROUND/.exec(upper) ?? /(\d+)\s*E\s+TOUR/.exec(upper);
  if (nth) return `ROUND_${Number(nth[1])}`;

  // Dans une coupe UEFA, un numero seul est une journee de phase de ligue.
  if (['CL', 'EL', 'UECL'].includes(competitionCode) && (/^\d+$/.test(upper) || /REGULAR SEASON/.test(upper))) {
    return 'LEAGUE_STAGE';
  }

  return null;
};

// Ordre des tours dans une competition : la phase de ligue d'abord, puis les
// premiers tours de coupe, les barrages UEFA juste avant les 8es.
const ROUND_RANK = {
  LEAGUE_STAGE: 0,
  LAST_128: 100,
  LAST_64: 105,
  LAST_32: 110,
  PLAYOFFS: 115,
  LAST_16: 120,
  QUARTER_FINALS: 130,
  SEMI_FINALS: 140,
  FINAL: 150,
};

const roundRank = (key) => {
  if (key in ROUND_RANK) return ROUND_RANK[key];
  const nth = /^ROUND_(\d+)$/.exec(key);
  if (nth) return 10 + Number(nth[1]);
  const last = /^LAST_(\d+)$/.exec(key);
  if (last) return 90 + Math.max(0, (128 - Number(last[1])) / 4);
  return 50;
};

export const roundLabel = (key) => {
  switch (key) {
    case 'LEAGUE_STAGE':
      return 'Phase de ligue';
    case 'PLAYOFFS':
      return 'Barrages';
    case 'QUARTER_FINALS':
      return 'Quart de finale';
    case 'SEMI_FINALS':
      return 'Demi-finale';
    case 'FINAL':
      return 'Finale';
    default:
      break;
  }
  const last = /^LAST_(\d+)$/.exec(key);
  if (last) return `${Number(last[1]) / 2}e de finale`;
  const nth = /^ROUND_(\d+)$/.exec(key);
  if (nth) return `${nth[1]}e tour`;
  return key;
};

// --- Identifiant canonique de l'OM -------------------------------------------
// Les deux API ont leurs propres id d'equipe. Toutes les fonctions de ce module
// ramenent l'OM a l'id football-data.org (516) : les id des adversaires ne sont
// jamais compares a l'id de l'OM, donc aucun risque de collision cote calcul.
// Le champ booleen "om" sur chaque equipe sert de filet quand un id adversaire
// vaut justement 516 chez API-Football.
export const OM_CANONICAL_ID = 516;

const teamIsOm = (team, omId) => team?.om === true || team?.id === omId;

// --- Resultat d'un tour a deux matchs -----------------------------------------
// Sur deux matchs (aller-retour europeen), un match perdu ne veut pas dire
// elimination : il faut le score cumule du tour, puis les buts a l'exterieur,
// puis le resultat du match retour (qui porte les tirs au but).
const roundResult = (legs, omId) => {
  let omGoals = 0;
  let oppGoals = 0;
  let omAwayGoals = 0;
  let oppAwayGoals = 0;

  for (const leg of legs) {
    if (!leg.score) continue;
    const omIsHome = teamIsOm(leg.home, omId);
    const scored = omIsHome ? leg.score.home : leg.score.away;
    const conceded = omIsHome ? leg.score.away : leg.score.home;
    omGoals += scored ?? 0;
    oppGoals += conceded ?? 0;
    if (omIsHome) oppAwayGoals += conceded ?? 0;
    else omAwayGoals += scored ?? 0;
  }

  if (omGoals !== oppGoals) return omGoals > oppGoals ? 'won' : 'lost';
  if (omAwayGoals !== oppAwayGoals) return omAwayGoals > oppAwayGoals ? 'won' : 'lost';

  const last = legs[legs.length - 1];
  if (last?.winner === 'HOME' || last?.winner === 'AWAY') {
    const omWonLeg =
      (last.winner === 'HOME' && teamIsOm(last.home, omId)) ||
      (last.winner === 'AWAY' && teamIsOm(last.away, omId));
    return omWonLeg ? 'won' : 'lost';
  }
  return 'unknown';
};

// --- Coupe a elimination directe (Coupe de France, phase finale europeenne) --
// matches : matchs de l'OM dans la competition (tous statuts).
// roundsRaw : libelles bruts des tours, dans l'ordre (API fixtures/rounds).
// Renvoie null si l'OM n'a aucun match : la competition n'a pas commence pour
// lui (ex. Coupe de France avant les 32es de janvier).
export const deriveKnockoutRun = (matches, omId, roundsRaw = []) => {
  const played = matches.filter((m) => m.status === 'FINISHED' || m.status === 'SCHEDULED');
  if (!played.length) return null;

  const order = roundsRaw.map((r) => normalizeRound(r)).filter(Boolean);
  const keyed = played
    .map((m) => ({ ...m, key: normalizeRound(m.round, m.competition?.code) ?? String(m.round) }))
    .sort((a, b) => roundRank(a.key) - roundRank(b.key) || new Date(a.date) - new Date(b.date));

  const byRound = new Map();
  for (const m of keyed) byRound.set(m.key, [...(byRound.get(m.key) ?? []), m]);
  const keys = [...byRound.keys()];

  // Tour en cours : le premier tour qui a encore un match a jouer.
  const currentKey = keys.find((key) => byRound.get(key).some((m) => m.status !== 'FINISHED'));
  if (currentKey) return { state: 'in', round: currentKey, label: roundLabel(currentKey) };

  // Tout est joue : c'est le dernier tour qui decide.
  const lastKey = keys[keys.length - 1];
  const result = roundResult(byRound.get(lastKey).filter((m) => m.status === 'FINISHED'), omId);

  if (lastKey === 'FINAL') {
    return result === 'won'
      ? { state: 'winner', round: 'FINAL', label: roundLabel('FINAL') }
      : { state: 'eliminated', round: 'FINAL', label: roundLabel('FINAL') };
  }
  if (result === 'lost') {
    return { state: 'eliminated', round: lastKey, label: roundLabel(lastKey) };
  }

  // Tour gagne mais suivant pas encore programme (tirage pas fait) : on
  // affiche le tour suivant connu, sinon le tour qui vient d'etre gagne.
  const index = order.indexOf(lastKey);
  const nextKey = index >= 0 && index < order.length - 1 ? order[index + 1] : lastKey;
  return { state: 'in', round: nextKey, label: roundLabel(nextKey) };
};

// --- Competition europeenne (C1 / EL / UECL, format 2024+) --------------------
// Phase de ligue (8 matchs en C1/EL, 6 en UECL, classement unique de 36) :
// 1-8 qualifies direct pour les 8es, 9-24 en barrages, 25-36 elimines.
// Puis elimination directe a deux matchs (sauf la finale).
export const deriveEuropeRun = ({ matches, standings, omId, roundsRaw = [], leagueMatchdays = 8 }) => {
  if (!matches.length) return null;

  const league = matches.filter((m) => normalizeRound(m.round, m.competition?.code) === 'LEAGUE_STAGE');
  const knockout = matches.filter((m) => normalizeRound(m.round, m.competition?.code) !== 'LEAGUE_STAGE');

  const row = standings?.table?.find((entry) => entry.om === true || entry.teamId === omId) ?? null;
  const standing = row
    ? {
        position: row.position,
        of: standings.table.length,
        played: row.played,
        points: row.points,
        matchdays: standings.matchdays ?? leagueMatchdays,
      }
    : null;

  // La phase de ligue est terminee quand l'OM a joue tous ses matchs de phase.
  // Les matchs des autres equipes se terminent le meme soir (meme journee) :
  // le classement est alors fige, la petite fenetre d'incertitude se corrige
  // a la prochaine execution du pulse.
  const phaseOver = league.length >= leagueMatchdays && league.every((m) => m.status === 'FINISHED');

  if (!phaseOver) {
    return { state: 'league', round: 'LEAGUE_STAGE', label: roundLabel('LEAGUE_STAGE'), standing };
  }

  // Des matchs d'elimination directe existent : ils prennent le relais.
  if (knockout.length) {
    const run = deriveKnockoutRun(knockout, omId, roundsRaw);
    return run ? { ...run, standing } : null;
  }

  const position = row?.position ?? null;
  if (position !== null && position > 24) {
    return { state: 'eliminated', round: 'LEAGUE_STAGE', label: roundLabel('LEAGUE_STAGE'), standing };
  }
  if (position !== null && position <= 8) {
    return { state: 'in', round: 'LAST_16', label: roundLabel('LAST_16'), standing };
  }
  if (position !== null) {
    return { state: 'in', round: 'PLAYOFFS', label: roundLabel('PLAYOFFS'), standing };
  }

  // Phase terminee mais classement indisponible : on ne tranche pas.
  return { state: 'league', round: 'LEAGUE_STAGE', label: roundLabel('LEAGUE_STAGE'), standing: null };
};

// --- Texte affiche -------------------------------------------------------------
export const describeRun = (run) => {
  if (!run) return null;
  switch (run.state) {
    case 'league': {
      const s = run.standing;
      return s ? `${run.label} · ${s.position}e/${s.of} · J${s.played}/${s.matchdays}` : run.label;
    }
    case 'eliminated':
      return `Éliminé en ${run.label.toLowerCase()}`;
    case 'winner':
      return 'Vainqueur';
    default:
      return run.label;
  }
};

// --- Fusion des matchs des deux sources ---------------------------------------
// football-data.org et API-Football renvoient les memes matchs avec des id et
// des abreviations differents ("Paris SG" vs "Paris Saint-Germain"). La cle de
// dedup est donc l'instant du match + les noms complets normalises, débarrasses
// des suffixes usuels (FC, Saint, Stade...) et des accents.
const NAME_NOISE = new Set(['fc', 'cf', 'sc', 'ac', 'as', 'rc', 'aj', 'us', 'de', 'du', 'la', 'le', 'les', 'saint', 'stade', 'club', 'athletic', 'sporting', 'racing']);

const nameKey = (team) =>
  (team?.full ?? team?.name ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .split(/[^a-z0-9]+/)
    .filter((token) => token && !NAME_NOISE.has(token))
    .join('');

export const dedupeMatches = (matches) => {
  const seen = new Set();
  const out = [];
  for (const m of matches) {
    const instant = new Date(m.date).getTime();
    if (Number.isNaN(instant)) continue;
    const key = `${instant}|${[nameKey(m.home), nameKey(m.away)].sort().join('-')}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(m);
  }
  return out;
};

// --- Codes de competition ------------------------------------------------------
// L'API-Football nomme ses competitions en anglais ; on retombe sur nos codes
// par le nom (fiable) avec l'id en renfort.
export const leagueCodeOf = (name, id) => {
  const n = (name ?? '').toLowerCase();
  if (/coupe de france/.test(n) || id === 137) return 'CDF';
  if (/champions league/.test(n) || id === 2) return 'CL';
  // "Conference" avant "Europa" : le nom de la C4 contient les deux.
  if (/conference/.test(n) || id === 848) return 'UECL';
  if (/europa league/.test(n) || id === 3) return 'EL';
  if (/ligue 1/.test(n) || id === 61) return 'FL1';
  if (/friendl/.test(n)) return 'FRIENDLY';
  return 'OTHER';
};

// API-Football / apifootball.com ne fournissent pas d'abreviation (TLA) : on
// en genere une courte a partir du nom, suffisante pour la ligne de match.
// L'OM garde "OM".
export const tlaFromName = (name) => {
  const words = String(name ?? '')
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, ' ')
    .split(' ')
    .filter((word) => word && !NAME_NOISE.has(word.toLowerCase()));
  return (words[0] ?? String(name ?? '?').slice(0, 3)).slice(0, 3);
};

// --- Normalisation des deux sources vers le format canonique -------------------

export const canonicalTeam = (team, isOm) => ({
  id: isOm ? OM_CANONICAL_ID : team.id === OM_CANONICAL_ID ? -team.id : team.id,
  name: team.name,
  full: team.full ?? team.name,
  tla: isOm ? 'OM' : team.tla ?? tlaFromName(team.name),
  crest: team.crest ?? team.logo ?? null,
  om: isOm,
});

// football-data.org : score.winner vaut 'HOME_TEAM' / 'AWAY_TEAM' / 'DRAW'.
export const footballDataToMatch = (raw) => ({
  id: `fd-${raw.id}`,
  date: raw.utcDate,
  status: raw.status === 'FINISHED' ? 'FINISHED' : raw.status === 'CANCELED' ? 'CANCELED' : 'SCHEDULED',
  competition: { code: raw.competition?.code ?? 'OTHER', name: raw.competition?.name ?? null },
  round: raw.stage ?? null,
  matchday: raw.matchday ?? null,
  home: canonicalTeam(
    { id: raw.homeTeam.id, name: raw.homeTeam.shortName || raw.homeTeam.name, full: raw.homeTeam.name, tla: raw.homeTeam.tla, crest: raw.homeTeam.crest },
    raw.homeTeam.id === OM_CANONICAL_ID,
  ),
  away: canonicalTeam(
    { id: raw.awayTeam.id, name: raw.awayTeam.shortName || raw.awayTeam.name, full: raw.awayTeam.name, tla: raw.awayTeam.tla, crest: raw.awayTeam.crest },
    raw.awayTeam.id === OM_CANONICAL_ID,
  ),
  winner:
    raw.score?.winner === 'HOME_TEAM' ? 'HOME' : raw.score?.winner === 'AWAY_TEAM' ? 'AWAY' : raw.score?.winner === 'DRAW' ? 'DRAW' : null,
  score:
    raw.score?.fullTime?.home !== null && raw.score?.fullTime?.home !== undefined
      ? { home: raw.score.fullTime.home, away: raw.score.fullTime.away }
      : null,
});

// API-Football : le vainqueur est un booleen sur chaque equipe, le statut est
// un code court ('FT', 'AET', 'PEN' = termine ; 'NS', 'PST'... = a venir).
export const apiFootballToMatch = (item, omApiId) => {
  const short = item.fixture?.status?.short ?? '';
  const finished = ['FT', 'AET', 'PEN'].includes(short);
  const canceled = ['CANC', 'ABD'].includes(short);
  const round = item.league?.round ?? null;

  return {
    id: `af-${item.fixture?.id}`,
    date: item.fixture?.date,
    status: canceled ? 'CANCELED' : finished ? 'FINISHED' : 'SCHEDULED',
    competition: { code: leagueCodeOf(item.league?.name, item.league?.id), name: item.league?.name ?? null },
    round,
    matchday: Number(/^League Stage - (\d+)/.exec(round ?? '')?.[1] ?? 0) || null,
    home: canonicalTeam(item.teams?.home ?? {}, item.teams?.home?.id === omApiId),
    away: canonicalTeam(item.teams?.away ?? {}, item.teams?.away?.id === omApiId),
    winner:
      item.teams?.home?.winner === true ? 'HOME' : item.teams?.away?.winner === true ? 'AWAY' : finished ? 'DRAW' : null,
    score: item.score?.penalty ?? item.score?.extratime ?? item.score?.fulltime ?? null,
  };
};
