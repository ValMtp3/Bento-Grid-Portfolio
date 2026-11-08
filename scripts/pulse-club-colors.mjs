// Couleurs de reference des clubs : l'extraction depuis l'ecusson reste
// approximative (un cercle blanc, un reflet dore, un fond mal detoure), alors
// qu'un club a des couleurs que tout le monde connait. Cette table porte les
// clubs courants ; un club absent retombe sur l'extraction (fetch-pulse.mjs).
//
// Chaque entree : [couleur principale, couleur secondaire] et les noms sous
// lesquels les APIs (football-data.org, apifootball.com) peuvent l'appeler.
// Ajouter un club = ajouter une ligne ici.

// L'OM est le sujet de la cellule : il est toujours bleu ciel et blanc, quelle
// que soit la source ou l'ecusson fourni.
export const OM_COLORS = ['#2faee0', '#ffffff'];

const CLUBS = [
  // Ligue 1
  [OM_COLORS, ['marseille', 'olympique de marseille', 'olympique marseille', 'om']],
  [['#004170', '#da291c'], ['paris saint germain', 'paris sg', 'psg']],
  [['#1b3f94', '#e30613'], ['lyon', 'olympique lyonnais', 'ol']],
  [['#e30613', '#ffffff'], ['monaco', 'as monaco']],
  [['#e01e13', '#1c2a56'], ['lille', 'losc lille', 'losc']],
  [['#e30613', '#000000'], ['nice', 'ogc nice']],
  [['#ed1c24', '#fff300'], ['lens', 'rc lens']],
  [['#e30613', '#000000'], ['rennes', 'stade rennais', 'stade rennais fc']],
  [['#0a5cb8', '#ffffff'], ['strasbourg', 'rc strasbourg', 'rc strasbourg alsace']],
  [['#fcd116', '#00a651'], ['nantes', 'fc nantes']],
  [['#5b2d8e', '#ffffff'], ['toulouse', 'toulouse fc']],
  [['#e30613', '#ffffff'], ['reims', 'stade de reims']],
  [['#f47920', '#003f87'], ['montpellier', 'montpellier hsc']],
  [['#e30613', '#ffffff'], ['brest', 'stade brestois', 'stade brestois 29']],
  [['#1b75bb', '#a0c4ea'], ['le havre', 'le havre ac', 'havre ac']],
  [['#0b4ea2', '#ffffff'], ['auxerre', 'aj auxerre']],
  [['#000000', '#ffffff'], ['angers', 'angers sco']],
  [['#00a651', '#ffffff'], ['saint etienne', 'as saint etienne', 'st etienne']],
  [['#8c1d40', '#ffffff'], ['metz', 'fc metz']],
  [['#f58220', '#000000'], ['lorient', 'fc lorient']],
  [['#1b3f94', '#ffffff'], ['paris fc']],
  // Europe
  [['#e32221', '#000000'], ['bayer leverkusen', 'bayer 04 leverkusen', 'leverkusen']],
  [['#dc052d', '#0066b2'], ['bayern munich', 'bayern munchen', 'bayern', 'fc bayern munchen']],
  [['#fde100', '#000000'], ['borussia dortmund', 'dortmund']],
  [['#ffffff', '#febe10'], ['real madrid', 'real madrid cf']],
  [['#a50044', '#004d98'], ['barcelona', 'fc barcelona', 'barca']],
  [['#cb3524', '#272e61'], ['atletico madrid', 'club atletico de madrid', 'atletico']],
  [['#6cabdd', '#ffffff'], ['manchester city', 'man city']],
  [['#da291c', '#fbe122'], ['manchester united', 'man united']],
  [['#c8102e', '#ffffff'], ['liverpool', 'liverpool fc']],
  [['#ef0107', '#ffffff'], ['arsenal', 'arsenal fc']],
  [['#034694', '#ffffff'], ['chelsea', 'chelsea fc']],
  [['#132257', '#ffffff'], ['tottenham', 'tottenham hotspur', 'spurs']],
  [['#000000', '#ffffff'], ['newcastle', 'newcastle united']],
  [['#670e36', '#95bfe5'], ['aston villa']],
  [['#000000', '#ffffff'], ['juventus', 'juventus turin']],
  [['#0068a8', '#000000'], ['inter', 'inter milan', 'internazionale', 'fc internazionale milano']],
  [['#fb090b', '#000000'], ['milan', 'ac milan']],
  [['#12a0d7', '#ffffff'], ['napoli', 'ssc napoli']],
  [['#8e1f2f', '#f0bc42'], ['roma', 'as roma']],
  [['#1e71b8', '#000000'], ['atalanta', 'atalanta bc']],
  [['#d2122e', '#ffffff'], ['ajax', 'ajax amsterdam', 'afc ajax']],
  [['#ed1c24', '#ffffff'], ['psv', 'psv eindhoven']],
  [['#e30613', '#ffffff'], ['feyenoord', 'feyenoord rotterdam']],
  [['#e30613', '#ffffff'], ['benfica', 'sl benfica']],
  [['#003893', '#ffffff'], ['porto', 'fc porto']],
  [['#00875a', '#ffffff'], ['sporting', 'sporting cp', 'sporting lisbon']],
  [['#00a651', '#ffffff'], ['celtic', 'celtic fc']],
  [['#a90432', '#fdb912'], ['galatasaray']],
  [['#fedd00', '#00205b'], ['fenerbahce']],
  [['#fbe10f', '#005187'], ['villarreal', 'villarreal cf']],
];

// Retire accents, ponctuation et casse : "Paris Saint-Germain" et
// "paris saint germain" doivent tomber sur la meme entree.
export const normalizeClubName = (name) =>
  String(name ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const BY_NAME = new Map(
  CLUBS.flatMap(([colors, aliases]) => aliases.map((alias) => [normalizeClubName(alias), colors])),
);

/**
 * Couleurs connues d'un club, ou null s'il n'est pas dans la table.
 * Egalite stricte sur le nom normalise : "Inter" ne doit pas attraper
 * "Internacional", ni "Milan" l'Inter Milan.
 *
 * @param {{ om?: boolean, name?: string, full?: string }} team
 * @returns {string[] | null} copie : l'appelant ne peut pas muter la table.
 */
export const knownClubColors = (team) => {
  if (team?.om) return [...OM_COLORS];
  for (const candidate of [team?.name, team?.full]) {
    const colors = BY_NAME.get(normalizeClubName(candidate));
    if (colors) return [...colors];
  }
  return null;
};
