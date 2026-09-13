// Mes series et films preferes, classes.
//
// Seuls les identifiants TMDB sont stockes ici : titre, annee et affiche sont
// recuperes par scripts/fetch-pulse.mjs, donc une jaquette qui change chez TMDB
// se met a jour toute seule. Pour modifier le classement, il suffit de
// reordonner ces tableaux — l'ordre affiche est l'ordre du tableau.
//
// Trouver un identifiant : chercher le titre sur themoviedb.org, il apparait
// dans l'URL (themoviedb.org/tv/62476-le-bureau-des-legendes).

export const favoris = {
  series: [
    62476, // Le Bureau des légendes
    2288, // Prison Break
    65430, // Baron Noir
    1425, // House of Cards
    202772, // Le Flambeau, les aventuriers de Chupacabra
  ],
  films: [
    77338, // Intouchables
    12405, // Slumdog Millionaire
    5528, // Les Choristes
  ],
};
