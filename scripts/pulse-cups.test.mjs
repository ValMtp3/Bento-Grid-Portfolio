// Logique pure de suivi des coupes (Coupe de France + Europe) pour le pulse.
//
// Un "match" normalise, quelle que soit la source (football-data.org ou
// API-Football) :
// {
//   id, date (ISO), status ('FINISHED' | 'SCHEDULED'),
//   competition: { code, name }, round (libelle brut), matchday,
//   home: { id, name, tla }, away: { id, name, tla },
//   winner ('HOME' | 'AWAY' | 'DRAW' | null), score { home, away } | null
// }

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  apiFootballToMatch,
  deriveEuropeRun,
  deriveKnockoutRun,
  describeRun,
  dedupeMatches,
  footballDataToMatch,
  leagueCodeOf,
  normalizeRound,
  roundLabel,
  seasonYear,
} from './pulse-cups.mjs';

const OM_ID = 516;
const PSG = { id: 85, name: 'Paris SG', tla: 'PSG' };
const OM = { id: OM_ID, name: 'Olympique de Marseille', tla: 'OM' };

// OM domicile par defaut ; winner 'HOME' = victoire de l'OM.
const match = (over = {}) => ({
  id: over.id ?? Math.random(),
  date: over.date ?? '2026-11-08T20:00:00Z',
  status: over.status ?? 'FINISHED',
  competition: { code: over.code ?? 'CDF', name: over.name ?? 'Coupe de France' },
  round: over.round ?? 'Round of 32',
  matchday: over.matchday ?? null,
  home: over.home ?? OM,
  away: over.away ?? PSG,
  winner: over.winner === undefined ? 'HOME' : over.winner,
  score: over.score === undefined ? { home: 2, away: 0 } : over.score,
});

const CDF_ROUNDS = [
  '7th Round',
  '8th Round',
  'Round of 32',
  '16th Finals',
  '8th Finals',
  'Quarter-finals',
  'Semi-finals',
  'Final',
];

const standing = (position, of = 36, played = 4, points = 10, matchdays = 8) => ({
  table: Array.from({ length: of }, (_, i) => ({
    teamId: 1000 + i,
    position: i + 1,
    points: 30 - i,
    played,
  })).map((row) => (row.position === position ? { ...row, teamId: OM_ID, points } : row)),
  matchdays,
});

describe('seasonYear', () => {
  it('novembre 2026 appartient a la saison 2026', () => {
    assert.equal(seasonYear(new Date('2026-11-08T10:00:00Z')), 2026);
  });

  it('aout 2026 demarre la saison 2026', () => {
    assert.equal(seasonYear(new Date('2026-08-01T00:00:00Z')), 2026);
  });

  it('janvier 2027 appartient encore a la saison 2026', () => {
    assert.equal(seasonYear(new Date('2027-01-15T12:00:00Z')), 2026);
  });

  it('juillet 2027 est la treve de la saison 2026', () => {
    assert.equal(seasonYear(new Date('2027-07-01T12:00:00Z')), 2026);
  });
});

describe('normalizeRound', () => {
  it('reconnait la phase de ligue des deux sources', () => {
    assert.equal(normalizeRound('League Stage - 3'), 'LEAGUE_STAGE');
    assert.equal(normalizeRound('LEAGUE_STAGE'), 'LEAGUE_STAGE');
  });

  it('reconnait les barrages europeens', () => {
    assert.equal(normalizeRound('Knockout Round Playoffs'), 'PLAYOFFS');
    assert.equal(normalizeRound('PLAYOFFS'), 'PLAYOFFS');
  });

  it('convertit les tours de coupe en nombre d equipes restantes', () => {
    assert.equal(normalizeRound('Round of 32'), 'LAST_64');
    assert.equal(normalizeRound('16th Finals'), 'LAST_32');
    assert.equal(normalizeRound('8th Finals'), 'LAST_16');
    assert.equal(normalizeRound('LAST_16'), 'LAST_16');
  });

  it('reconnait quarts, demies et finale', () => {
    assert.equal(normalizeRound('Quarter-finals'), 'QUARTER_FINALS');
    assert.equal(normalizeRound('QUARTER_FINALS'), 'QUARTER_FINALS');
    assert.equal(normalizeRound('Semi-finals'), 'SEMI_FINALS');
    assert.equal(normalizeRound('Final'), 'FINAL');
    assert.equal(normalizeRound('FINAL'), 'FINAL');
  });

  it('reconnait les premiers tours de la Coupe de France', () => {
    assert.equal(normalizeRound('7th Round'), 'ROUND_7');
    assert.equal(normalizeRound('8th Round'), 'ROUND_8');
  });

  it('renvoie null pour un libelle inconnu', () => {
    assert.equal(normalizeRound('Regular Season'), null);
  });

  it('reconnait les libelles francais (apifootball.com)', () => {
    assert.equal(normalizeRound('32e de finale'), 'LAST_64');
    assert.equal(normalizeRound('16e de finale'), 'LAST_32');
    assert.equal(normalizeRound('8e de finale'), 'LAST_16');
    assert.equal(normalizeRound('Quart de finale'), 'QUARTER_FINALS');
    assert.equal(normalizeRound('Demi-finale'), 'SEMI_FINALS');
    assert.equal(normalizeRound('Finale'), 'FINAL');
    assert.equal(normalizeRound('Barrages'), 'PLAYOFFS');
    assert.equal(normalizeRound('Phase de ligue'), 'LEAGUE_STAGE');
    assert.equal(normalizeRound('7e tour'), 'ROUND_7');
    assert.equal(normalizeRound('Round 32'), 'LAST_64');
  });

  it('un numero seul est une journee de phase de ligue dans une coupe UEFA', () => {
    assert.equal(normalizeRound('8', 'UECL'), 'LEAGUE_STAGE');
    assert.equal(normalizeRound('Regular Season', 'CL'), 'LEAGUE_STAGE');
    // Sans contexte UEFA, un numero seul ne veut rien dire.
    assert.equal(normalizeRound('8'), null);
  });
});

describe('roundLabel', () => {
  it('libelle les tours en francais', () => {
    assert.equal(roundLabel('LAST_64'), '32e de finale');
    assert.equal(roundLabel('LAST_32'), '16e de finale');
    assert.equal(roundLabel('LAST_16'), '8e de finale');
    assert.equal(roundLabel('QUARTER_FINALS'), 'Quart de finale');
    assert.equal(roundLabel('SEMI_FINALS'), 'Demi-finale');
    assert.equal(roundLabel('FINAL'), 'Finale');
    assert.equal(roundLabel('PLAYOFFS'), 'Barrages');
    assert.equal(roundLabel('LEAGUE_STAGE'), 'Phase de ligue');
    assert.equal(roundLabel('ROUND_7'), '7e tour');
  });
});

describe('deriveKnockoutRun', () => {
  it('renvoie null quand l OM n a aucun match dans la competition', () => {
    assert.equal(deriveKnockoutRun([], OM_ID, CDF_ROUNDS), null);
  });

  it('un seul match programme : en lice au tour de ce match', () => {
    const run = deriveKnockoutRun([match({ status: 'SCHEDULED', round: 'Round of 32' })], OM_ID, CDF_ROUNDS);
    assert.equal(run.state, 'in');
    assert.equal(run.round, 'LAST_64');
    assert.equal(run.label, '32e de finale');
  });

  it('match gagne puis tour suivant programme : on affiche le tour a venir', () => {
    const run = deriveKnockoutRun(
      [
        match({ date: '2026-01-03T20:00:00Z', round: 'Round of 32', winner: 'HOME' }),
        match({ date: '2026-01-24T20:00:00Z', round: '16th Finals', status: 'SCHEDULED', winner: null, score: null }),
      ],
      OM_ID,
      CDF_ROUNDS,
    );
    assert.equal(run.state, 'in');
    assert.equal(run.round, 'LAST_32');
    assert.equal(run.label, '16e de finale');
  });

  it('dernier match perdu et rien de programme : elimine au tour joue', () => {
    const run = deriveKnockoutRun(
      [match({ round: 'Round of 32', home: PSG, away: OM, winner: 'HOME' })],
      OM_ID,
      CDF_ROUNDS,
    );
    assert.equal(run.state, 'eliminated');
    assert.equal(run.round, 'LAST_64');
    assert.equal(run.label, '32e de finale');
  });

  it('match nul non decide : on ne declare pas l elimination sur une donnee manquante', () => {
    const run = deriveKnockoutRun([match({ winner: null, score: null })], OM_ID, CDF_ROUNDS);
    assert.notEqual(run.state, 'eliminated');
  });

  it('aller perdu mais retour programme : toujours en lice', () => {
    const run = deriveKnockoutRun(
      [
        match({ id: 1, date: '2026-02-17T20:00:00Z', round: '8th Finals', home: PSG, away: OM, winner: 'HOME', score: { home: 3, away: 0 } }),
        match({ id: 2, date: '2026-02-24T20:00:00Z', round: '8th Finals', status: 'SCHEDULED', winner: null, score: null }),
      ],
      OM_ID,
      CDF_ROUNDS,
    );
    assert.equal(run.state, 'in');
    assert.equal(run.round, 'LAST_16');
  });

  it('aller gagne, retour perdu mais victoire au score cumule : pas elimine', () => {
    // Aller 2-0 pour l'OM, retour 0-1 : l'OM passe (2-1 cumule), le tour
    // suivant n'est juste pas encore tire. Le critere "dernier match perdu"
    // seul serait faux ici : il faut le score cumule du tour.
    const run = deriveKnockoutRun(
      [
        match({ id: 1, date: '2026-02-17T20:00:00Z', round: '8th Finals', winner: 'HOME', score: { home: 2, away: 0 } }),
        match({ id: 2, date: '2026-02-24T20:00:00Z', round: '8th Finals', home: PSG, away: OM, winner: 'HOME', score: { home: 1, away: 0 } }),
      ],
      OM_ID,
      CDF_ROUNDS,
    );
    assert.equal(run.state, 'in');
    assert.equal(run.round, 'QUARTER_FINALS');
    assert.equal(run.label, 'Quart de finale');
  });

  it('deux matchs perdus au score cumule : elimine au tour', () => {
    const run = deriveKnockoutRun(
      [
        match({ id: 1, date: '2026-02-17T20:00:00Z', round: '8th Finals', winner: 'HOME', score: { home: 1, away: 0 } }),
        match({ id: 2, date: '2026-02-24T20:00:00Z', round: '8th Finals', home: PSG, away: OM, winner: 'HOME', score: { home: 2, away: 0 } }),
      ],
      OM_ID,
      CDF_ROUNDS,
    );
    assert.equal(run.state, 'eliminated');
    assert.equal(run.round, 'LAST_16');
  });

  it('tour gagne sans prochain match programme : en lice au tour suivant connu', () => {
    const run = deriveKnockoutRun([match({ round: 'Round of 32', winner: 'HOME' })], OM_ID, CDF_ROUNDS);
    assert.equal(run.state, 'in');
    assert.equal(run.round, 'LAST_32');
    assert.equal(run.label, '16e de finale');
  });

  it('finale gagnee : vainqueur', () => {
    const run = deriveKnockoutRun([match({ round: 'Final', winner: 'HOME' })], OM_ID, CDF_ROUNDS);
    assert.equal(run.state, 'winner');
    assert.equal(run.round, 'FINAL');
  });

  it('finale perdue : elimine en finale', () => {
    const run = deriveKnockoutRun(
      [match({ round: 'Final', home: PSG, away: OM, winner: 'HOME' })],
      OM_ID,
      CDF_ROUNDS,
    );
    assert.equal(run.state, 'eliminated');
    assert.equal(run.round, 'FINAL');
  });
});

describe('deriveEuropeRun', () => {
  const leagueMatch = (md, over = {}) =>
    match({
      code: 'UECL',
      name: 'UEFA Conference League',
      round: `League Stage - ${md}`,
      matchday: md,
      ...over,
    });

  it('renvoie null sans match europeen', () => {
    assert.equal(deriveEuropeRun({ matches: [], standings: null, omId: OM_ID, leagueMatchdays: 6 }), null);
  });

  it('phase de ligue en cours : classement affiche', () => {
    const matches = [1, 2, 3, 4].map((md) => leagueMatch(md));
    const run = deriveEuropeRun({ matches, standings: standing(12, 36, 4, 10, 6), omId: OM_ID, leagueMatchdays: 6 });
    assert.equal(run.state, 'league');
    assert.deepEqual(run.standing, { position: 12, of: 36, played: 4, points: 10, matchdays: 6 });
  });

  it('phase de ligue terminee, rang 25-36 : elimine en phase de ligue', () => {
    const matches = [1, 2, 3, 4, 5, 6].map((md) => leagueMatch(md));
    const run = deriveEuropeRun({ matches, standings: standing(28, 36, 6, 4, 6), omId: OM_ID, leagueMatchdays: 6 });
    assert.equal(run.state, 'eliminated');
    assert.equal(run.round, 'LEAGUE_STAGE');
  });

  it('phase de ligue terminee, rang 1-8 : qualifié direct pour les 8es', () => {
    const matches = [1, 2, 3, 4, 5, 6, 7, 8].map((md) => leagueMatch(md));
    const run = deriveEuropeRun({ matches, standings: standing(5, 36, 8, 17, 8), omId: OM_ID, leagueMatchdays: 8 });
    assert.equal(run.state, 'in');
    assert.equal(run.round, 'LAST_16');
    assert.equal(run.standing.position, 5);
  });

  it('phase de ligue terminee, rang 9-24 : barrages', () => {
    const matches = [1, 2, 3, 4, 5, 6, 7, 8].map((md) => leagueMatch(md));
    const run = deriveEuropeRun({ matches, standings: standing(15, 36, 8, 13, 8), omId: OM_ID, leagueMatchdays: 8 });
    assert.equal(run.state, 'in');
    assert.equal(run.round, 'PLAYOFFS');
  });

  it('barrages programmes : en lice aux barrages', () => {
    const matches = [
      ...[1, 2, 3, 4, 5, 6, 7, 8].map((md) => leagueMatch(md)),
      match({ code: 'UECL', round: 'Knockout Round Playoffs', status: 'SCHEDULED', winner: null, score: null }),
    ];
    const run = deriveEuropeRun({ matches, standings: standing(15, 36, 8, 13, 8), omId: OM_ID, leagueMatchdays: 8 });
    assert.equal(run.state, 'in');
    assert.equal(run.round, 'PLAYOFFS');
  });

  it('8e de finale perdue au score cumule : elimine en 8e', () => {
    const matches = [
      ...[1, 2, 3, 4, 5, 6, 7, 8].map((md) => leagueMatch(md)),
      match({ code: 'UECL', round: '8th Finals', home: PSG, away: OM, winner: 'HOME', score: { home: 2, away: 0 } }),
      match({ code: 'UECL', round: '8th Finals', home: OM, away: PSG, winner: 'AWAY', score: { home: 0, away: 1 } }),
    ];
    const run = deriveEuropeRun({ matches, standings: standing(15, 36, 8, 13, 8), omId: OM_ID, leagueMatchdays: 8 });
    assert.equal(run.state, 'eliminated');
    assert.equal(run.round, 'LAST_16');
  });

  it('classement indisponible pendant la phase : etat degrade sans classement', () => {
    const matches = [1, 2].map((md) => leagueMatch(md));
    const run = deriveEuropeRun({ matches, standings: null, omId: OM_ID, leagueMatchdays: 6 });
    assert.equal(run.state, 'league');
    assert.equal(run.standing, null);
  });
});

describe('describeRun', () => {
  it('phase de ligue avec classement', () => {
    const run = { state: 'league', round: 'LEAGUE_STAGE', label: 'Phase de ligue', standing: { position: 12, of: 36, played: 4, points: 10, matchdays: 8 } };
    assert.equal(describeRun(run), 'Phase de ligue · 12e/36 · J4/8');
  });

  it('phase de ligue sans classement', () => {
    assert.equal(describeRun({ state: 'league', round: 'LEAGUE_STAGE', label: 'Phase de ligue', standing: null }), 'Phase de ligue');
  });

  it('en lice', () => {
    assert.equal(describeRun({ state: 'in', round: 'LAST_64', label: '32e de finale' }), '32e de finale');
  });

  it('elimine', () => {
    assert.equal(describeRun({ state: 'eliminated', round: 'LAST_32', label: '16e de finale' }), 'Éliminé en 16e de finale');
    assert.equal(describeRun({ state: 'eliminated', round: 'LEAGUE_STAGE', label: 'Phase de ligue' }), 'Éliminé en phase de ligue');
  });

  it('vainqueur', () => {
    assert.equal(describeRun({ state: 'winner', round: 'FINAL', label: 'Finale' }), 'Vainqueur');
  });
});

describe('dedupeMatches', () => {
  it('deux sources renvoient le meme match : on garde une seule fois', () => {
    const a = match({ id: 'fd-1', date: '2026-11-07T20:45:00Z' });
    const b = match({ id: 'af-1', date: '2026-11-07T20:45:00Z' });
    const merged = dedupeMatches([a, b, match({ id: 'other', date: '2026-11-01T15:00:00Z' })]);
    assert.equal(merged.length, 2);
    assert.equal(merged[0].id, 'fd-1');
  });

  it('deux matchs distincts le meme soir ne fusionnent pas', () => {
    const merged = dedupeMatches([
      match({ id: '1', date: '2026-11-07T20:45:00Z', away: PSG }),
      match({ id: '2', date: '2026-11-07T20:45:00Z', home: { id: 777, name: 'LOSC', tla: 'LOSC' } }),
    ]);
    assert.equal(merged.length, 2);
  });

  it('fusionne sur les noms complets meme quand les noms d affichage different', () => {
    // football-data affiche "Paris SG", API-Football "Paris Saint-Germain" :
    // la cle de dedup s'appuie sur le nom complet normalise.
    const a = match({
      id: 'fd-1',
      date: '2026-11-07T20:45:00Z',
      home: { id: 516, name: 'OM', tla: 'OM', full: 'Olympique de Marseille' },
      away: { id: 85, name: 'Paris SG', tla: 'PSG', full: 'Paris Saint-Germain FC' },
    });
    const b = match({
      id: 'af-1',
      date: '2026-11-07T21:45:00+01:00',
      home: { id: 516, name: 'Olympique de Marseille', tla: 'OM', full: 'Olympique de Marseille' },
      away: { id: 85, name: 'Paris Saint-Germain', tla: 'PAR', full: 'Paris Saint-Germain' },
    });
    assert.equal(dedupeMatches([a, b]).length, 1);
  });
});

describe('leagueCodeOf', () => {
  it('identifie les competitions qui nous interessent', () => {
    assert.equal(leagueCodeOf('Coupe de France', 137), 'CDF');
    assert.equal(leagueCodeOf('UEFA Champions League', 2), 'CL');
    assert.equal(leagueCodeOf('UEFA Europa League', 3), 'EL');
    assert.equal(leagueCodeOf('UEFA Europa Conference League', 848), 'UECL');
    assert.equal(leagueCodeOf('Ligue 1', 61), 'FL1');
    assert.equal(leagueCodeOf('Club Friendlies', 667), 'FRIENDLY');
    assert.equal(leagueCodeOf('Ligue 2', 62), 'OTHER');
  });
});

describe('footballDataToMatch', () => {
  it('convertit un match football-data.org au format canonique', () => {
    const raw = {
      id: 1001,
      utcDate: '2026-11-07T19:45:00Z',
      status: 'FINISHED',
      stage: 'REGULAR_SEASON',
      matchday: 12,
      competition: { code: 'FL1', name: 'Ligue 1' },
      homeTeam: { id: 516, name: 'Olympique de Marseille', shortName: 'Olympique Marseille', tla: 'OM', crest: 'https://x/om.png' },
      awayTeam: { id: 85, name: 'Paris Saint-Germain FC', shortName: 'Paris SG', tla: 'PSG', crest: 'https://x/psg.png' },
      score: { winner: 'HOME_TEAM', fullTime: { home: 2, away: 1 } },
    };
    const m = footballDataToMatch(raw);
    assert.equal(m.id, 'fd-1001');
    assert.equal(m.status, 'FINISHED');
    assert.equal(m.competition.code, 'FL1');
    assert.equal(m.winner, 'HOME');
    assert.deepEqual(m.score, { home: 2, away: 1 });
    assert.equal(m.home.om, true);
    assert.equal(m.away.om, false);
    assert.equal(m.home.tla, 'OM');
    assert.equal(m.home.name, 'Olympique Marseille');
  });
});

describe('apiFootballToMatch', () => {
  const item = (over = {}) => ({
    fixture: { id: 555, date: '2026-11-05T18:00:00+01:00', status: { short: 'FT' }, ...over.fixture },
    league: { id: 848, name: 'UEFA Europa Conference League', round: 'League Stage - 4', ...over.league },
    teams: {
      home: { id: 516, name: 'Olympique de Marseille', logo: 'https://x/om.png', winner: true, ...over.home },
      away: { id: 1234, name: 'Sturm Graz', logo: 'https://x/sturm.png', winner: null, ...over.away },
    },
    goals: { home: 1, away: 0 },
    score: { fulltime: { home: 1, away: 0 }, ...over.score },
  });

  it('convertit un match termine API-Football au format canonique', () => {
    const m = apiFootballToMatch(item(), 516);
    assert.equal(m.id, 'af-555');
    assert.equal(m.status, 'FINISHED');
    assert.equal(m.competition.code, 'UECL');
    assert.equal(m.round, 'League Stage - 4');
    assert.equal(m.matchday, 4);
    assert.equal(m.winner, 'HOME');
    assert.deepEqual(m.score, { home: 1, away: 0 });
    assert.equal(m.home.om, true);
    assert.equal(m.home.id, 516);
    assert.equal(m.home.tla, 'OM');
    assert.equal(m.away.om, false);
    assert.ok(m.away.tla.length <= 3);
  });

  it('un match non joue est SCHEDULED sans vainqueur', () => {
    const m = apiFootballToMatch(item({ fixture: { status: { short: 'NS' } }, home: { winner: null }, away: { winner: null } }), 516);
    assert.equal(m.status, 'SCHEDULED');
    assert.equal(m.winner, null);
  });

  it('un match annule est CANCELED', () => {
    const m = apiFootballToMatch(item({ fixture: { status: { short: 'CANC' } } }), 516);
    assert.equal(m.status, 'CANCELED');
  });

  it('un adversaire dont l id API-Football vaut 516 ne devient pas l OM', () => {
    const m = apiFootballToMatch(item({ home: { id: 999, winner: null }, away: { id: 516, winner: true } }), 516);
    // l'OM est a l'exterieur ici : c'est bien l'OM (id 516 cote API-Football)
    assert.equal(m.away.om, true);
    const m2 = apiFootballToMatch(
      item({ home: { id: 516, name: 'FC Autres', winner: false }, away: { id: 42, name: 'OM?', winner: true } }),
      42,
    );
    // id 516 adversaire : neutralise pour ne pas confondre avec l'OM canonique
    assert.equal(m2.home.id, -516);
    assert.equal(m2.home.om, false);
    assert.equal(m2.away.om, true);
  });
});
