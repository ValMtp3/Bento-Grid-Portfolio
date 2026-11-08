// Cablage du collecteur apifootball.com (apiv3.apifootball.com), teste avec des
// reponses simulees : la fonction reseau (get(action, params)) est injectee.

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { apifootballEventToMatch, collectApifootballOm } from './pulse-apifootball.mjs';

const OM = { id: 81, name: 'Marseille' };
const STURM = { id: 3001, name: 'SK Sturm Graz' };
const PSG = { id: 85, name: 'Paris SG' };

const UECL_NAME = 'UEFA Europa Conference League';
const CDF_NAME = 'Coupe de France';

const ev = ({ id, date, time = '20:00', status = 'Finished', leagueId = '848', leagueName = UECL_NAME, round = '1', home = OM, away = STURM, hs = '', as = '' }) => ({
  match_id: String(id),
  match_date: date,
  match_time: time,
  match_status: status,
  league_id: leagueId,
  league_name: leagueName,
  match_round: round,
  match_hometeam_id: String(home.id),
  match_hometeam_name: home.name,
  match_hometeam_score: hs,
  match_awayteam_id: String(away.id),
  match_awayteam_name: away.name,
  match_awayteam_score: as,
  team_home_badge: `https://x/${home.id}.jpg`,
  team_away_badge: `https://x/${away.id}.jpg`,
});

const makeGet = (routes, calls) => async (action, params = {}) => {
  calls.push({ action, params });
  const key = `${action}${params.league_id ? ':league=' + params.league_id : ''}${params.team_id ? ':team=' + params.team_id : ''}${params.country_id ? ':country=' + params.country_id : ''}`;
  if (key in routes) {
    const value = routes[key];
    if (value instanceof Error) throw value;
    return value;
  }
  throw new Error(`route inconnue: ${key}`);
};

const baseRoutes = () => ({
  get_countries: [{ country_id: '75', country_name: 'France' }],
  'get_leagues': [
    { league_id: '848', league_name: UECL_NAME, league_season: '2026/2027' },
    { league_id: '2', league_name: 'UEFA Champions League', league_season: '2026/2027' },
  ],
  'get_leagues:country=75': [
    { league_id: '61', league_name: 'Ligue 1', league_season: '2026/2027' },
    { league_id: '66', league_name: CDF_NAME, league_season: '2026/2027' },
  ],
  'get_teams:league=61': [
    { team_key: '9260', team_name: 'Olympique Marseille II' },
    { team_key: '81', team_name: 'Marseille' },
  ],
  'get_events:team=81': [
    // Phase de ligue UECL : 4 journees joues, la 5e programmee.
    ev({ id: 1, date: '2026-09-10', round: '1', hs: '2', as: '1' }),
    ev({ id: 2, date: '2026-09-24', round: '2', home: STURM, away: OM, hs: '0', as: '1' }),
    ev({ id: 3, date: '2026-10-08', round: '3', home: OM, away: PSG, hs: '3', as: '0' }),
    ev({ id: 4, date: '2026-10-22', round: '4', home: PSG, away: OM, hs: '1', as: '1' }),
    ev({ id: 5, date: '2026-11-05', round: '5', status: '', hs: '', as: '' }),
    // Coupe de France : 32e perdu a domicile.
    ev({ id: 6, date: '2026-01-03', leagueId: '66', leagueName: CDF_NAME, round: 'Round of 32', home: OM, away: PSG, hs: '0', as: '1' }),
    // Amical : exclu.
    ev({ id: 7, date: '2026-07-25', leagueId: '667', leagueName: 'Club Friendlies', round: 'Friendlies' }),
  ],
  'get_events:league=66': [
    ev({ id: 100, date: '2025-11-15', leagueId: '66', leagueName: CDF_NAME, round: '7th Round', home: PSG, away: STURM, hs: '1', as: '0' }),
    ev({ id: 101, date: '2026-01-03', leagueId: '66', leagueName: CDF_NAME, round: 'Round of 32', home: OM, away: PSG, hs: '0', as: '1' }),
    ev({ id: 102, date: '2026-01-24', leagueId: '66', leagueName: CDF_NAME, round: '16th Finals', home: PSG, away: STURM, hs: '2', as: '2' }),
  ],
  'get_standings:league=848': Array.from({ length: 36 }, (_, i) => ({
    team_id: String(i + 1 === 12 ? 81 : 5000 + i),
    team_name: i + 1 === 12 ? 'Marseille' : `Club ${i}`,
    overall_league_position: String(i + 1),
    overall_league_payed: '4',
    overall_league_PTS: String(i + 1 === 12 ? 10 : 30 - i),
  })),
});

describe('apifootballEventToMatch', () => {
  it('convertit un evenement apifootball au format canonique', () => {
    const m = apifootballEventToMatch(ev({ id: 42, date: '2026-11-05', time: '18:45', round: '5', status: '' }), 81);
    assert.equal(m.id, 'apf-42');
    assert.equal(m.date, '2026-11-05T18:45:00Z');
    assert.equal(m.status, 'SCHEDULED');
    assert.equal(m.competition.code, 'UECL');
    assert.equal(m.round, '5');
    assert.equal(m.home.om, true);
    assert.equal(m.home.id, 516);
    assert.equal(m.home.tla, 'OM');
    assert.equal(m.winner, null);
    assert.equal(m.score, null);
  });

  it('un match termine a un vainqueur calcule depuis le score', () => {
    const m = apifootballEventToMatch(ev({ id: 1, home: OM, away: PSG, hs: '0', as: '2' }), 81);
    assert.equal(m.status, 'FINISHED');
    assert.equal(m.winner, 'AWAY');
    assert.deepEqual(m.score, { home: 0, away: 2 });
  });

  it('un match annule est CANCELED, un match nul n a pas de vainqueur', () => {
    assert.equal(apifootballEventToMatch(ev({ id: 2, status: 'Cancelled' }), 81).status, 'CANCELED');
    assert.equal(apifootballEventToMatch(ev({ id: 3, hs: '1', as: '1' }), 81).winner, null);
  });
});

describe('collectApifootballOm', () => {
  it('derive la Coupe de France et l Europe (phase de ligue) depuis la saison', async () => {
    const calls = [];
    const get = makeGet(baseRoutes(), calls);

    const { matches, cups } = await collectApifootballOm(get, new Date('2026-11-08T10:00:00Z'));

    // L'amical est filtre ; l'OM exact est choisi (pas l'equipe reserve).
    assert.equal(matches.length, 6);
    assert.ok(matches.every((m) => m.id.startsWith('apf-')));
    assert.equal(matches[0].home.om, true);
    assert.ok(calls.some((c) => c.action === 'get_teams' && c.params.league_id === '61'));

    // CDF : 32e joue et perdu -> elimine en 32e.
    assert.equal(cups.france.state, 'eliminated');
    assert.equal(cups.france.round, 'LAST_64');
    assert.equal(cups.france.text, 'Éliminé en 32e de finale');

    // Europe : phase de ligue en cours (4/6), classement 12e/36 affiche.
    assert.equal(cups.europe.competition, 'C4');
    assert.equal(cups.europe.state, 'league');
    assert.deepEqual(cups.europe.standing, { position: 12, of: 36, played: 4, points: 10, matchdays: 6 });
    assert.equal(cups.europe.text, 'Phase de ligue · 12e/36 · J4/6');
  });

  it('sans coupe dans les matchs de l OM : les deux coupes valent null', async () => {
    const routes = baseRoutes();
    routes['get_events:team=81'] = [
      ev({ id: 1, date: '2026-11-07', leagueId: '61', leagueName: 'Ligue 1', round: 'Round 10', home: OM, away: PSG, hs: '2', as: '0' }),
    ];
    const get = makeGet(routes, []);
    const { cups } = await collectApifootballOm(get, new Date('2026-11-08T10:00:00Z'));
    assert.deepEqual(cups, { france: null, europe: null });
  });

  it('classement indisponible : l Europe degrade sans tout perdre', async () => {
    const routes = baseRoutes();
    routes['get_standings:league=848'] = new Error('plan insuffisant');
    const get = makeGet(routes, []);
    const { cups } = await collectApifootballOm(get, new Date('2026-11-08T10:00:00Z'));
    assert.equal(cups.europe.state, 'league');
    assert.equal(cups.europe.standing, null);
    assert.equal(cups.europe.text, 'Phase de ligue');
  });

  it('echoue proprement sans la Ligue 1 dans la liste', async () => {
    const routes = baseRoutes();
    routes['get_leagues:country=75'] = [{ league_id: '66', league_name: CDF_NAME }];
    const get = makeGet(routes, []);
    await assert.rejects(() => collectApifootballOm(get, new Date('2026-11-08T10:00:00Z')), /Ligue 1 introuvable/);
  });
});
