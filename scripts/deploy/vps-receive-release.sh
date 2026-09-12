#!/usr/bin/env bash
#
# Script de reception des releases, a installer sur le VPS.
#
# Il est la seule commande que la cle SSH de GitHub Actions peut declencher :
# authorized_keys la force via command="...". Le runner n'a donc aucun moyen de
# choisir un chemin, une option ou une autre commande. Tout ce qu'il controle,
# c'est le contenu de l'archive envoyee sur stdin.
#
# Installation (en root sur le VPS) :
#   install -o root -g root -m 755 vps-receive-release.sh /usr/local/bin/deploy-portfolio
#
# Voir DEPLOIEMENT_VPS.md pour la procedure complete.

set -euo pipefail

# ---------------------------------------------------------------------------
# Configuration : seule partie a adapter au VPS.
#
# SITE_ROOT est le dossier monte dans le conteneur "static-site" :
#   /srv/www/valentin-fiess.fr  ->  /usr/share/nginx/html  (lecture seule)
#
# nginx doit viser "$SITE_ROOT/current" et non une release precise, sinon la
# bascule reste invisible. Cote conteneur, cela donne :
#   root /usr/share/nginx/html/current;
# ---------------------------------------------------------------------------
readonly SITE_ROOT="/srv/www/valentin-fiess.fr"
readonly RELEASES_DIR="$SITE_ROOT/releases"
readonly CURRENT_LINK="$SITE_ROOT/current"
readonly RELEASES_TO_KEEP=5

# Droits des fichiers deposes : lisibles par nginx, inscriptibles par le seul
# utilisateur de deploiement.
umask 022

log() {
  printf '[deploy] %s\n' "$1" >&2
}

fail() {
  printf '[deploy] ERREUR : %s\n' "$1" >&2
  exit 1
}

[ -d "$RELEASES_DIR" ] || fail "$RELEASES_DIR n'existe pas. Relire la procedure d'installation."

release_name="$(date -u +%Y%m%dT%H%M%SZ)-$$"
staging_dir="$RELEASES_DIR/.staging-$release_name"

archive_file="$RELEASES_DIR/.incoming-$release_name.tar.gz"

# Si l'extraction echoue ou que la connexion tombe, les fichiers partiels sont
# supprimes : aucune release incomplete ne peut etre servie plus tard.
cleanup_staging() {
  rm -rf -- "$staging_dir"
  rm -f -- "$archive_file"
}
trap cleanup_staging EXIT

mkdir -p -- "$staging_dir"

log "Reception de l'archive..."

# L'archive est d'abord ecrite sur disque : il faut pouvoir l'inspecter avant
# d'en extraire quoi que ce soit, ce qu'un flux sur stdin ne permet pas.
cat > "$archive_file"

# Un site statique ne contient que des dossiers et des fichiers ordinaires.
# Toute autre entree est refusee, en particulier les liens symboliques : une
# entree "index.html -> /etc/passwd" passerait le test [ -f ] plus bas (qui suit
# les liens) et nginx servirait alors le fichier vise. C'est le seul vecteur par
# lequel le contenu de l'archive pourrait atteindre des fichiers hors du site.
# Dans "tar -tvz", le premier caractere donne le type : "-" fichier, "d" dossier,
# "l" lien symbolique, "h" lien physique, "c"/"b"/"p"/"s" fichiers speciaux.
if tar -tvzf "$archive_file" | cut -c1 | grep -qv '^[-d]$'; then
  fail "archive rejetee : elle contient un lien symbolique ou un fichier special."
fi

# --no-same-owner / --no-same-permissions : les metadonnees du runner GitHub ne
# doivent pas dicter les droits sur le VPS.
# Aucune option -P : tar refuse alors les chemins absolus et les "..", donc une
# archive malveillante ne peut pas ecrire hors de $staging_dir.
tar -xzf "$archive_file" -C "$staging_dir" --no-same-owner --no-same-permissions \
  || fail "archive illisible ou transfert interrompu."

rm -f -- "$archive_file"

# Garde-fou final : une archive vide ou tronquee ne doit jamais remplacer un
# site qui fonctionne.
[ -f "$staging_dir/index.html" ] || fail "index.html absent de l'archive, bascule annulee."

release_dir="$RELEASES_DIR/$release_name"
mv -- "$staging_dir" "$release_dir"
trap - EXIT

# Bascule atomique. "ln -sfn" cree le lien a cote, "mv -T" le renomme par-dessus
# l'ancien en une seule operation du systeme de fichiers : aucune requete ne
# peut tomber sur un dossier inexistant, meme une fraction de seconde.
#
# Le lien est RELATIF ("releases/xxx" et non "/var/www/portfolio/releases/xxx").
# C'est indispensable quand nginx tourne dans un conteneur : le dossier y est
# monte sous un autre chemin, et un lien absolu de l'hote y pointerait dans le
# vide. Un lien relatif se resout correctement des deux cotes du montage.
ln -sfn -- "releases/$release_name" "$CURRENT_LINK.new"
mv -T -- "$CURRENT_LINK.new" "$CURRENT_LINK"

log "Release en ligne : $release_name"

# Purge des anciennes releases, en gardant de quoi revenir en arriere.
# La release active est forcement la plus recente, donc jamais dans la purge.
if [ -n "$(ls -A -- "$RELEASES_DIR" 2>/dev/null)" ]; then
  # shellcheck disable=SC2012 # les noms sont generes ici : pas d'espace ni de saut de ligne.
  ls -1dt -- "$RELEASES_DIR"/*/ 2>/dev/null \
    | tail -n "+$((RELEASES_TO_KEEP + 1))" \
    | xargs -r rm -rf --
fi

log "Termine. Releases conservees : $RELEASES_TO_KEEP."
