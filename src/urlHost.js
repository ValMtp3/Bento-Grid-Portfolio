// Compare l'hote reel d'une URL a un domaine. Un test de sous-chaine sur l'URL
// entiere ("contient github.com") accepte aussi github.com.evil.com ou
// evil.com/github.com : l'analyseur d'URL isole l'hote, seul fiable.

/**
 * @param {string} url - adresse absolue a examiner.
 * @param {string} domain - domaine attendu, sans protocole (ex. "github.com").
 * @returns {boolean} vrai si l'hote est ce domaine ou l'un de ses sous-domaines.
 */
export const isHostOf = (url, domain) => {
  let hostname;
  try {
    hostname = new URL(url).hostname;
  } catch {
    // Adresse relative ou illisible : elle n'appartient a aucun hebergeur.
    return false;
  }
  return hostname === domain || hostname.endsWith(`.${domain}`);
};
