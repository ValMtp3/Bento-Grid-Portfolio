// Homard ASCII derive de l'emoji 🦞 : l'emoji est rendu par Pillow, symetrise,
// puis reduit sur une grille de 36 colonnes avec une rampe de densite.
// scripts/ascii-lobster.py regenere le dessin ; le resultat est fige ici pour ne
// pas embarquer Python dans le build.
//
// IMPORTANT : le dessin est calcule pour une cellule de 0,6 em de large sur
// 1,2 em de haut (char_aspect 0.5). Tout affichage doit donc etre en
// `line-height: 1.2` et en police monospace, sinon le homard s'etire.
export const LOBSTER = [
  '   #**#                      #**#',
  '  #****###                ###****#',
  '  #*****##                ##*****#',
  ' ##*****##                ##*****##',
  '  #*****##     ######     ##*****#',
  '  ##***###    ########    ###***##',
  '   ##**###    ##****##    ###**##',
  '    ##**##    #******#    ##**##',
  '     ###**####********####**###',
  '      ########********########',
  '     ########**********########',
  '    #########**********#########',
  '     #########********#########',
  '             #********#',
  '             #********#',
  '              #******#',
  '              #******#',
  '              ##****##',
  '            ############',
  '           ##**######**##',
  '             ##########',
];

const IDENTITY = [
  'valentin@valentin-fiess.fr',
  '--------------------------',
  'poste     ingenieur ia / data',
  'boite     shaarp — montpellier',
  'lieu      montpellier, fr',
  'stack     python · rag · llm · mlops',
  'front     vue 3 · vite · tailwind',
  'infra     docker · ovh · cloudflare',
  'shell     /bin/homard',
  'repo      github.com/ValMtp3',
  'social    linkedin.com/in/valentin-fiess',
];

const GUTTER = 4;

// Colle le homard et la fiche d'identite cote a cote, facon neofetch.
export const lobsterWithIdentity = () => {
  const width = Math.max(...LOBSTER.map((line) => line.length)) + GUTTER;
  const rows = Math.max(LOBSTER.length, IDENTITY.length);
  return Array.from(
    { length: rows },
    (_, index) => `${(LOBSTER[index] ?? '').padEnd(width)}${IDENTITY[index] ?? ''}`.trimEnd(),
  );
};
