// Collecte cote apifootball.com (apiv3.apifootball.com) : Coupe de France +
// Europe quand l'OM n'est pas en Ligue des champions, la ou le tier gratuit de
// football-data.org ne voit rien. Authentification par parametre APIkey.
// La fonction reseau est injectee (get(action, params)) pour tester tout le
// cablage sans compte ni reseau.

import {
  OM_CANONICAL_ID,
  canonicalTeam,
  deriveEuropeRun,
  deriveKnockoutRun,
  describeRun,
  leagueCodeOf,
  normalizeRound,
  seasonYear,
  tlaFromName,
} from './pulse-cups.mjs';

// Noms courts des coupes d'Europe, usage media francais : C1, C3, C4.
export const UEFA_SHORT = { CL: 'C1', EL: 'C3', UECL: 'C4' };

// Nombre de journees de la phase de ligue depuis le format 2024.
const UEFA_LEAGUE_MATCHDAYS = { CL: 8, EL: 8, UECL: 6 };

// --- Evenement apifootball.com -> match canonique ------------------------------
// Champs lus : match_date + match_time (avec timezone=UTC), match_status
// ("Finished", "", "Cancelled"...), scores, match_round, league_name,
// team_home/away_badge. Le vainqueur se calcule depuis le score.
export const apifootballEventToMatch = (event, omTeamId) => {
  const code = leagueCodeOf(event.league_name, Number(event.league_id));
  const finished = event.match_status === 'Finished' || event.match_status === 'FT';
  const canceled = /cancel/i.test(event.match_status ?? '');
  const time = String(event.match_time ?? '00:00').padEnd(5, '0');

  const num = (value) => (value === '' || value == null ? null : Number(value));
  const homeScore = num(event.match_hometeam_score);
  const awayScore = num(event.match_awayteam_score);

  let winner = null;
  if (finished && homeScore !== null && awayScore !== null && homeScore !== awayScore) {
    winner = homeScore > awayScore ? 'HOME' : 'AWAY';
  }

  const homeId = Number(event.match_hometeam_id);
  const awayId = Number(event.match_awayteam_id);
  const mapTeam = (id, name, badge, isOm) =>
    canonicalTeam(
      { id, name, full: name, tla: isOm ? 'OM' : tlaFromName(name), crest: badge },
      isOm,
    );

  // Journee de phase de ligue UEFA : "5" ou "League Stage - 5".
  const md = /^(\d+)$/.exec(String(event.match_round ?? '')) ?? /LEAGUE STAGE - (\d+)/i.exec(String(event.match_round ?? ''));

  return {
    id: `apf-${event.match_id}`,
    date: `${event.match_date}T${time}:00Z`,
    status: canceled ? 'CANCELED' : finished ? 'FINISHED' : 'SCHEDULED',
    competition: { code, name: event.league_name ?? null },
    round: event.match_round ?? null,
    matchday: md ? Number(md[1]) : null,
    home: mapTeam(homeId, event.match_hometeam_name, event.team_home_badge, homeId === omTeamId),
    away: mapTeam(awayId, event.match_awayteam_name, event.team_away_badge, awayId === omTeamId),
    winner,
    score: homeScore !== null && awayScore !== null ? { home: homeScore, away: awayScore } : null,
  };
};

// --- Collecte saison OM ---------------------------------------------------------
// get(action, params) -> tableau JSON. Resolution des id a chaque run :
// get_countries (France) -> get_leagues (Ligue 1, Coupe de France, UEFA) ->
// get_teams (OM) -> get_events (toute la saison) -> get_standings si UEFA.
// ~5-6 requetes par execution.
export const collectApifootballOm = async (get, now = new Date()) => {
  const season = seasonYear(now);
  const from = `${season}-08-01`;
  const to = `${season + 1}-07-31`;

  const countries = await get('get_countries');
  const france = countries.find((c) => c.country_name === 'France');
  if (!france) throw new Error('pays France introuvable sur apifootball');

  const franceLeagues = await get('get_leagues', { country_id: france.country_id });
  // Les coupes UEFA ne sont pas sous "France" : on recupere aussi la liste
  // complete pour trouver Champions/Europa/Conference League.
  const allLeagues = await get('get_leagues');
  const leagues = [...franceLeagues, ...allLeagues];
  const findLeague = (re) => leagues.find((l) => re.test(l.league_name ?? ''));

  const ligue1 = findLeague(/ligue 1/i);
  const cdf = findLeague(/coupe de france/i);
  if (!ligue1) throw new Error('Ligue 1 introuvable sur apifootball');

  const teams = await get('get_teams', { league_id: ligue1.league_id });
  const om =
    teams.find((t) => /^marseille$/i.test(t.team_name ?? '')) ??
    teams.find((t) => /marseille/i.test(t.team_name ?? ''));
  if (!om) throw new Error('equipe OM introuvable sur apifootball');
  const omId = Number(om.team_key);

  // Toute la saison de l'OM en une requete (fenetre de dates, timezone UTC).
  const events = await get('get_events', { team_id: om.team_key, from, to, timezone: 'UTC' });
  const matches = events
    .filter((e) => leagueCodeOf(e.league_name, Number(e.league_id)) !== 'FRIENDLY')
    .map((e) => apifootballEventToMatch(e, omId));

  const cups = { france: null, europe: null };

  // Coupe de France : matchs de l'OM + tours ordonnes (depuis tous les matchs
  // de la coupe, pour connaitre le tour suivant apres une victoire).
  const cdfMatches = matches.filter((m) => m.competition.code === 'CDF');
  if (cdfMatches.length && cdf) {
    const cdfEvents = await get('get_events', { league_id: cdf.league_id, from, to, timezone: 'UTC' });
    const firstSeen = new Map();
    for (const e of cdfEvents) {
      if (e.match_round && !firstSeen.has(e.match_round)) firstSeen.set(e.match_round, e.match_date);
    }
    const rounds = [...firstSeen.entries()].sort((a, b) => String(a[1]).localeCompare(String(b[1]))).map(([r]) => r);
    const run = deriveKnockoutRun(cdfMatches, OM_CANONICAL_ID, rounds);
    cups.france = run ? { ...run, text: describeRun(run) } : null;
  }

  // Europe : une seule competition UEFA par club et par saison.
  const uefaMatches = matches.filter((m) => UEFA_SHORT[m.competition.code]);
  if (uefaMatches.length) {
    const countByCode = new Map();
    for (const m of uefaMatches) countByCode.set(m.competition.code, (countByCode.get(m.competition.code) ?? 0) + 1);
    const code = [...countByCode.entries()].sort((a, b) => b[1] - a[1])[0][0];
    const league =
      code === 'UECL' ? findLeague(/conference/i) : code === 'EL' ? leagues.find((l) => /europa league/i.test(l.league_name ?? '') && !/conference/i.test(l.league_name)) : findLeague(/champions league/i);
    const matchdays = UEFA_LEAGUE_MATCHDAYS[code] ?? 8;

    let standings = null;
    try {
      const table = await get('get_standings', { league_id: league?.league_id });
      standings = {
        table: (table ?? []).map((row) => ({
          teamId: Number(row.team_id) === omId ? OM_CANONICAL_ID : Number(row.team_id),
          position: Number(row.overall_league_position),
          points: Number(row.overall_league_PTS),
          played: Number(row.overall_league_payed),
        })),
        matchdays,
      };
    } catch {
      standings = null; // Classement indisponible hors phase de ligue.
    }

    const run = deriveEuropeRun({
      matches: uefaMatches.filter((m) => m.competition.code === code),
      standings,
      omId: OM_CANONICAL_ID,
      roundsRaw: [],
      leagueMatchdays: matchdays,
    });
    cups.europe = run ? { competition: UEFA_SHORT[code], name: league?.league_name ?? null, ...run, text: describeRun(run) } : null;
  }

  return { matches, cups };
};
