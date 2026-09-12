# Déploiement automatique sur le VPS

À chaque push sur `main`, GitHub Actions construit le site et l'installe sur le VPS.
Ce document décrit la mise en place, à faire **une seule fois**.

## Comment ça marche

```
push sur main
  └─ GitHub Actions : pnpm install → pnpm test → pnpm build
       └─ tar.gz de dist/ envoyé par SSH
            └─ VPS : extraction dans releases/<horodatage>/
                 └─ bascule du lien "current" (instantanée)
                      └─ smoke test : le site répond-il en 200 ?
```

Trois idées derrière ce montage :

1. **Le VPS ne construit rien.** Il reçoit un dossier fini. Aucune clé d'API de build
   (EmailJS, Turnstile) n'a besoin d'exister sur le serveur.
2. **La bascule est atomique.** Le site servi est un lien symbolique `current`. Le
   déploiement prépare la nouvelle version à côté, puis fait pointer le lien dessus en
   une seule opération. C'est un aiguillage de train : on prépare la voie, puis on
   bascule l'aiguille. Aucun visiteur ne tombe sur un site à moitié copié.
3. **La clé SSH donnée à GitHub ne peut rien faire d'autre.** Elle est verrouillée sur
   un script unique (`command="..."`). Même volée, elle ne donne pas de shell : elle ne
   sait que recevoir une archive et la publier.
4. **L'archive est inspectée avant d'être extraite.** Un site statique ne contient que
   des dossiers et des fichiers ordinaires. Toute archive contenant un lien symbolique
   ou un fichier spécial est rejetée, et le site en place reste servi.

Place occupée sur le VPS : environ 22 Mo par version, 5 versions conservées, soit
**~110 Mo** au total.

---

## Étape 0 — Identifier où nginx sert le site (à faire en premier)

Tu utilises Nginx Proxy Manager, qui tourne dans Docker. Il faut savoir **quel dossier
de l'hôte** est réellement servi avant de configurer quoi que ce soit.

Sur le VPS :

```bash
# 1. Quels conteneurs tournent ?
docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Ports}}'

# 2. Quels dossiers de l'hôte sont montés dans Nginx Proxy Manager ?
#    (remplace "nginx-proxy-manager" par le vrai nom vu à l'étape 1)
docker inspect nginx-proxy-manager \
  --format '{{range .Mounts}}{{.Source}} -> {{.Destination}} ({{.Mode}}){{println}}{{end}}'

# 3. Où se trouve le site actuellement en ligne ?
sudo find /var /home /opt /srv -name 'index.html' -path '*dist*' -o -name 'index.html' -maxdepth 5 2>/dev/null | head -20
```

Deux cas possibles :

- **NPM proxifie vers un autre conteneur** (nginx, httpd…) : c'est ce conteneur-là qu'il
  faut regarder, avec le même `docker inspect`.
- **NPM sert le dossier directement** : il apparaît dans ses `Mounts`.

Note le chemin **côté hôte** (colonne de gauche) : il servira à l'étape 1.
Note le chemin **côté conteneur** (colonne de droite) : il servira à l'étape 5.

---

## Étape 1 — Créer l'utilisateur et l'arborescence (sur le VPS, en root)

```bash
# Utilisateur dédié, sans mot de passe, uniquement pour le déploiement.
# Son dossier personnel est volontairement SÉPARÉ du dossier servi par nginx.
sudo adduser --system --group --home /home/deploy --shell /usr/sbin/nologin deploy

sudo mkdir -p /var/www/portfolio/releases
sudo chown -R deploy:deploy /var/www/portfolio
sudo chmod 755 /var/www/portfolio /var/www/portfolio/releases
```

**Pourquoi le home n'est pas `/var/www/portfolio` :** c'est là que vit `authorized_keys`,
et `/var/www/portfolio` sera monté en entier dans le conteneur nginx (étape 5). Loger les
deux au même endroit exposerait la liste des clés autorisées au serveur web. On ne range
pas le trousseau de clés dans la vitrine.

> Si l'étape 0 a révélé un autre chemin que `/var/www/portfolio`, deux options :
> soit tu adaptes `SITE_ROOT` en haut du script (étape 2), soit tu reconfigures nginx
> pour viser `/var/www/portfolio/current`. La seconde est préférable : elle garde le
> script identique à celui du dépôt.

`--shell /usr/sbin/nologin` : cet utilisateur ne peut pas ouvrir de session. C'est une
serrure de plus, en complément du verrou sur la clé.

---

## Étape 2 — Installer le script de réception (sur le VPS, en root)

Copie `scripts/deploy/vps-receive-release.sh` (présent dans ce dépôt) sur le VPS, puis :

```bash
sudo install -o root -g root -m 755 vps-receive-release.sh /usr/local/bin/deploy-portfolio
```

**Propriétaire root, pas deploy** : ainsi l'utilisateur de déploiement ne peut pas
modifier le script qui le contraint. Sinon le verrou se déverrouillerait lui-même.

---

## Étape 3 — Créer la clé SSH de déploiement (sur TON Mac)

```bash
ssh-keygen -t ed25519 -C 'github-actions-deploy' -f ~/.ssh/portfolio_deploy -N ''
```

Deux fichiers apparaissent :
- `~/.ssh/portfolio_deploy` → la **clé privée**, elle ira dans les secrets GitHub.
- `~/.ssh/portfolio_deploy.pub` → la **clé publique**, elle ira sur le VPS.

La clé privée ne doit jamais être posée sur le VPS ni commitée.

Sur le VPS, en root, autorise la clé publique **en la verrouillant sur le script** :

```bash
sudo mkdir -p /home/deploy/.ssh
sudo chmod 700 /home/deploy/.ssh

# Colle ci-dessous le contenu de portfolio_deploy.pub à la place de "ssh-ed25519 AAAA... "
sudo tee /home/deploy/.ssh/authorized_keys > /dev/null <<'EOF'
command="/usr/local/bin/deploy-portfolio",no-agent-forwarding,no-port-forwarding,no-pty,no-user-rc,no-X11-forwarding ssh-ed25519 AAAA...REMPLACE_MOI... github-actions-deploy
EOF

sudo chown -R deploy:deploy /home/deploy/.ssh
sudo chmod 600 /home/deploy/.ssh/authorized_keys
sudo chown deploy:deploy /home/deploy
sudo chmod 750 /home/deploy
```

Ce que chaque option interdit :

| Option | Ce qu'elle bloque |
|---|---|
| `command="..."` | Toute commande autre que le script de déploiement |
| `no-pty` | L'ouverture d'un terminal interactif |
| `no-port-forwarding` | L'usage du VPS comme tunnel vers ton réseau interne |
| `no-agent-forwarding` | La réutilisation de la clé pour rebondir ailleurs |

---

## Étape 4 — Renseigner les secrets GitHub

Dans `Settings → Secrets and variables → Actions → New repository secret` :

| Secret | Valeur | Où la trouver |
|---|---|---|
| `VPS_HOST` | IP ou nom d'hôte du VPS | Ton hébergeur |
| `VPS_USER` | `deploy` | Étape 1 |
| `VPS_SSH_PORT` | Uniquement si ton SSH n'est pas sur le port 22 | — |
| `VPS_SSH_KEY` | Contenu **complet** de `~/.ssh/portfolio_deploy` | Étape 3 |
| `VPS_KNOWN_HOSTS` | Empreinte du VPS (voir ci-dessous) | Étape 4 bis |
| `VITE_EMAILJS_SERVICE_ID` | — | Ton `.env` local |
| `VITE_EMAILJS_TEMPLATE_ID` | — | Ton `.env` local |
| `VITE_EMAILJS_API` | — | Ton `.env` local |
| `VITE_TURNSTILE_SITE_KEY` | — | Ton `.env` local |

Pour copier la clé privée sans erreur : `pbcopy < ~/.ssh/portfolio_deploy`
(lignes `BEGIN` et `END` incluses).

### Étape 4 bis — L'empreinte du serveur (`VPS_KNOWN_HOSTS`)

C'est la carte d'identité du VPS. Sans elle, GitHub se connecterait à n'importe quel
serveur se présentant à cette adresse — comme donner ses clés à quelqu'un au téléphone
sans vérifier sa voix.

**Sur le VPS**, récupère la ligne exacte :

```bash
echo "$(curl -s ifconfig.me) $(cut -d' ' -f1,2 /etc/ssh/ssh_host_ed25519_key.pub)"
```

Colle le résultat dans `VPS_KNOWN_HOSTS`. Si ton SSH écoute sur un port non standard,
le format devient `[mon.ip]:2222 ssh-ed25519 AAAA...`.

> Ne récupère pas cette empreinte avec `ssh-keyscan` depuis ton Mac : cette commande
> fait confiance à ce qu'elle reçoit, ce qui annule l'intérêt de la vérification.

---

## Étape 5 — Pointer nginx sur `current`

nginx doit servir **le lien `current`**, jamais une release précise — sinon la bascule
n'a aucun effet visible.

Le lien `current` est volontairement **relatif** (`releases/xxx` et non
`/var/www/portfolio/releases/xxx`) : dans un conteneur, le dossier est monté sous un
autre chemin, et un lien absolu de l'hôte y pointerait dans le vide.

### Si Nginx Proxy Manager sert le dossier directement

Ajoute le montage dans le `docker-compose.yml` de NPM :

```yaml
    volumes:
      - /var/www/portfolio:/data/www/portfolio:ro
```

`:ro` = lecture seule. Le serveur web n'a aucune raison de pouvoir écrire dans le site.

Puis `docker compose up -d`, et dans l'interface NPM, sur le Proxy Host du domaine,
onglet **Advanced** :

```nginx
location / {
    root /data/www/portfolio/current;
    try_files $uri $uri/ /index.html;

    location ~* \.(?:js|css|woff2|png|jpg|jpeg|svg|webp|avif|ico)$ {
        root /data/www/portfolio/current;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

location = /index.html {
    root /data/www/portfolio/current;
    add_header Cache-Control "no-cache";
}
```

Deux règles de cache opposées, et c'est voulu : les fichiers JS/CSS portent un hash dans
leur nom (`index-a3f9.js`), donc un nouveau build produit un nouveau nom — ils peuvent
être gardés un an sans risque. `index.html`, lui, garde toujours le même nom : s'il était
mis en cache, les visiteurs continueraient à charger les anciens fichiers après un
déploiement.

`try_files ... /index.html` sert au routeur Vue : une URL comme `/projets` n'existe pas
en tant que fichier, c'est le JavaScript qui l'affiche.

> ⚠️ **Ne pas ajouter `disable_symlinks on;` tel quel.** La directive paraît utile ici,
> mais `current` **est** un lien symbolique : nginx refuserait alors de servir le site
> (403 sur toutes les pages). Si tu veux cette protection supplémentaire, la seule forme
> correcte exclut le lien de la vérification :
> `disable_symlinks on from=/data/www/portfolio/current;`
> Ce n'est pas indispensable : le script de déploiement rejette déjà toute archive
> contenant un lien symbolique, ce qui traite le problème à la source.

### Si NPM proxifie vers un autre conteneur nginx

Même principe, mais le volume et la config vont dans **ce conteneur-là**, avec la config
`server` classique. Le Proxy Host de NPM reste inchangé.

---

## Étape 6 — Premier déploiement

Le workflow se déclenche sur un push vers `main`, mais tu peux le lancer à la main pour
tester sans rien pousser : onglet **Actions → Deploy to VPS → Run workflow**.

À vérifier dans les logs :
1. `Run tests` passe au vert.
2. `Verify build output` annonce un nombre de fichiers cohérent.
3. `Deploy to VPS` affiche `[deploy] Release en ligne : ...`.
4. `Smoke test` affiche `Site en ligne (HTTP 200)`.

---

## Revenir en arrière (rollback)

Les 5 dernières versions restent sur le VPS. En cas de problème, sur le VPS :

```bash
ls -1t /var/www/portfolio/releases          # la plus récente en premier
cd /var/www/portfolio
sudo -u deploy ln -sfn releases/<VERSION_PRECEDENTE> current.new
sudo -u deploy mv -T current.new current
```

Effet immédiat, aucun redémarrage de nginx nécessaire. Le prochain push sur `main`
remettra en ligne la version du dépôt : corrige la cause avant de repousser.

---

## En cas de problème

| Symptôme | Cause probable | Correctif |
|---|---|---|
| `Host key verification failed` | `VPS_KNOWN_HOSTS` absent ou mal formé | Refaire l'étape 4 bis |
| `Permission denied (publickey)` | Mauvaise clé, ou `authorized_keys` mal placé | Vérifier les droits de l'étape 3 |
| `[deploy] ERREUR : index.html absent` | Le build a produit un `dist/` vide | Regarder l'étape `Build site` dans les logs |
| `[deploy] ERREUR : archive rejetée` | Un lien symbolique s'est glissé dans `dist/` | `find dist ! -type f ! -type d` en local pour l'identifier |
| Le site ne change pas | nginx sert une release, pas `current` | Étape 5 |
| 403 / 404 après déploiement | nginx ne peut pas lire le dossier | `ls -ld /var/www/portfolio/current/` |
| `Smoke test` en erreur mais site OK | Cache ou temps de propagation | Relancer le workflow |
