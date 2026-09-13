# Déploiement automatique sur le VPS

À chaque push sur `main`, GitHub Actions construit le site et l'installe sur le VPS.
Ce document est la référence ; la mise en place se fait **une seule fois**.

## L'infrastructure en place

```
Internet → conteneur npm (Nginx Proxy Manager, HTTPS)
             → conteneur static-site (nginx:alpine, port 8099)
                  monte /srv/www/valentin-fiess.fr en lecture seule
                  sous /usr/share/nginx/html
```

| Élément | Chemin |
|---|---|
| Dossier du site (hôte) | `/srv/www/valentin-fiess.fr` |
| Même dossier vu du conteneur | `/usr/share/nginx/html` |
| Config nginx du site | `/home/debian/static-site/nginx.conf` |
| Fichier compose | `/home/debian/static-site/docker-compose.yml` |

## Comment le déploiement fonctionne

```
push sur main
  └─ GitHub Actions : pnpm install → pnpm test → pnpm build
       └─ tar.gz de dist/ envoyé par SSH
            └─ VPS : extraction dans releases/<horodatage>/
                 └─ bascule du lien "current" (instantanée)
                      └─ smoke test : le site répond-il en 200 ?
```

Structure cible sur le VPS :

```
/srv/www/valentin-fiess.fr/
├── releases/
│   ├── 0000-initial/          ← le site tel qu'il était avant la bascule
│   └── 20260912T140718Z-13891/
└── current -> releases/20260912T140718Z-13891
```

Quatre idées derrière ce montage :

1. **Le VPS ne construit rien.** Il reçoit un dossier fini. Aucune clé d'API de build
   (EmailJS, Turnstile) n'a besoin d'exister sur le serveur.
2. **La bascule est atomique.** Le site servi est le lien `current`. Le déploiement
   prépare la nouvelle version à côté, puis fait pointer le lien dessus en une seule
   opération. C'est un aiguillage de train : on prépare la voie, puis on bascule
   l'aiguille. Aucun visiteur ne tombe sur un site à moitié copié.
3. **La clé SSH donnée à GitHub ne peut rien faire d'autre.** Elle est verrouillée sur
   un script unique (`command="..."`). Même volée, elle ne donne pas de shell.
4. **L'archive est inspectée avant extraction.** Toute archive sans `index.html`, ou
   contenant un lien symbolique ou un fichier spécial, est rejetée — et le site en
   place continue d'être servi.

Place occupée : environ 22 Mo par version, 5 versions conservées, soit **~110 Mo**.

---

## Étape 1 — Utilisateur dédié et arborescence (sur le VPS)

```bash
# Utilisateur de déploiement. Son dossier personnel est volontairement SÉPARÉ
# du dossier servi : c'est là que vivra authorized_keys, et /srv/www est monté
# en entier dans le conteneur nginx.
#
# Le shell est /bin/sh et non nologin : SSH exécute la commande forcée
# (command="...") À TRAVERS le shell de l'utilisateur. Avec nologin, toute
# connexion échouerait. Ce n'est pas le shell qui verrouille ce compte, ce sont
# command=, no-pty et l'absence de mot de passe (étape 3).
sudo adduser --system --group --home /home/deploy --shell /bin/sh deploy

# La release initiale reçoit une copie du site actuellement en ligne : elle sert
# de filet si la bascule se passe mal.
sudo mkdir -p /srv/www/valentin-fiess.fr/releases/0000-initial
cd /srv/www/valentin-fiess.fr
sudo find . -mindepth 1 -maxdepth 1 ! -name releases ! -name current \
  -exec cp -a {} releases/0000-initial/ \;

sudo ln -sfn releases/0000-initial current

sudo chown -R deploy:deploy /srv/www/valentin-fiess.fr
sudo find /srv/www/valentin-fiess.fr -type d -exec chmod 755 {} \;
sudo find /srv/www/valentin-fiess.fr -type f -exec chmod 644 {} \;
```

À ce stade le site en ligne n'a pas bougé : nginx sert toujours l'ancien chemin, qui
existe encore. `current` attend à côté.

---

## Étape 2 — Installer le script de réception

Copier `scripts/deploy/vps-receive-release.sh` (présent dans ce dépôt) sur le VPS, puis :

```bash
sudo install -o root -g root -m 755 vps-receive-release.sh /usr/local/bin/deploy-portfolio
```

**Propriétaire root, pas deploy** : l'utilisateur de déploiement ne doit pas pouvoir
modifier le script qui le contraint, sinon le verrou se déverrouillerait lui-même.

---

## Étape 3 — Clé SSH verrouillée

Sur ton Mac :

```bash
ssh-keygen -t ed25519 -C 'github-actions-deploy' -f ~/.ssh/portfolio_deploy -N ''
```

- `~/.ssh/portfolio_deploy` → **clé privée**, ira dans les secrets GitHub.
- `~/.ssh/portfolio_deploy.pub` → **clé publique**, ira sur le VPS.

La clé privée ne doit jamais être déposée sur le VPS ni commitée.

Sur le VPS :

```bash
sudo mkdir -p /home/deploy/.ssh
sudo chmod 700 /home/deploy/.ssh

# Remplacer "ssh-ed25519 AAAA..." par le contenu de portfolio_deploy.pub
sudo tee /home/deploy/.ssh/authorized_keys > /dev/null <<'EOF'
command="/usr/local/bin/deploy-portfolio",no-agent-forwarding,no-port-forwarding,no-pty,no-user-rc,no-X11-forwarding ssh-ed25519 AAAA...REMPLACE_MOI... github-actions-deploy
EOF

sudo chown -R deploy:deploy /home/deploy/.ssh
sudo chmod 600 /home/deploy/.ssh/authorized_keys
sudo chown deploy:deploy /home/deploy
sudo chmod 750 /home/deploy
```

| Option | Ce qu'elle bloque |
|---|---|
| `command="..."` | Toute commande autre que le script de déploiement |
| `no-pty` | L'ouverture d'un terminal interactif |
| `no-port-forwarding` | L'usage du VPS comme tunnel vers ton réseau interne |
| `no-agent-forwarding` | La réutilisation de la clé pour rebondir ailleurs |

Le shell `/bin/sh` de l'utilisateur ne rouvre aucune porte : `command="..."` remplace
toute commande demandée par le client, y compris une demande de session interactive.
Le shell ne sert qu'à lancer le script de déploiement.

---

## Étape 4 — Secrets GitHub

`Settings → Secrets and variables → Actions → New repository secret` :

| Secret | Valeur |
|---|---|
| `VPS_HOST` | IP ou nom d'hôte du VPS |
| `VPS_USER` | `deploy` |
| `VPS_SSH_PORT` | `61457` — le SSH de ce VPS n'ecoute pas sur le port 22 |
| `VPS_SSH_KEY` | Contenu complet de `~/.ssh/portfolio_deploy` (`pbcopy < ~/.ssh/portfolio_deploy`) |
| `VPS_KNOWN_HOSTS` | Empreinte du VPS, voir ci-dessous |
| `VITE_EMAILJS_SERVICE_ID` | Depuis ton `.env` local |
| `VITE_EMAILJS_TEMPLATE_ID` | Depuis ton `.env` local |
| `VITE_EMAILJS_API` | Depuis ton `.env` local |
| `VITE_TURNSTILE_SITE_KEY` | Depuis ton `.env` local |

L'empreinte du serveur (`VPS_KNOWN_HOSTS`) est sa carte d'identité : sans elle, GitHub
se connecterait à n'importe quel serveur répondant à cette adresse. **Sur le VPS** :

```bash
# -4 est indispensable : sans lui, ifconfig.me renvoie l'adresse IPv6, que les
# runners GitHub ne savent pas joindre.
echo "[$(curl -s -4 ifconfig.me)]:61457 $(cut -d' ' -f1,2 /etc/ssh/ssh_host_ed25519_key.pub)"
```

Le format `[adresse]:port` est obligatoire dès que SSH n'écoute pas sur le port 22 :
sans les crochets, OpenSSH ne retrouve pas l'entrée et refuse la connexion.

L'utilisateur `deploy` doit aussi figurer dans `AllowUsers`
(`/etc/ssh/sshd_config.d/00-hardening.conf`), sans quoi la clé est rejetée quoi qu'il
arrive.

> Ne pas utiliser `ssh-keyscan` depuis ton Mac : cette commande fait confiance à ce
> qu'elle reçoit, ce qui annule l'intérêt de la vérification.

---

## Étape 5 — Pointer nginx sur `current`

Une seule ligne change dans `/home/debian/static-site/nginx.conf` :

```diff
 server {
     listen 8099;
-    root /usr/share/nginx/html;
+    root /usr/share/nginx/html/current;
     index index.html;
```

🔴 **Modifier ce fichier en place, jamais avec `sed -i`.** Docker ne monte pas un
chemin mais le fichier lui-même. `sed -i` écrit un nouveau fichier et remplace
l'ancien : le conteneur reste attaché à l'exemplaire d'origine et ne voit aucun
changement — nginx continue alors de servir l'ancienne racine sans la moindre erreur.
Utiliser un éditeur, ou `tee` qui réécrit le fichier existant :

```bash
sudo cp /home/debian/static-site/nginx.conf /tmp/ng.conf
sed 's#root /usr/share/nginx/html;#root /usr/share/nginx/html/current;#' /tmp/ng.conf \
  | sudo tee /home/debian/static-site/nginx.conf > /dev/null
```

Puis :

```bash
docker exec static-site nginx -t          # valider AVANT d'appliquer
docker exec static-site nginx -s reload   # rechargement sans coupure

# Verification indispensable : ce que voit le CONTENEUR, pas l'hote
docker exec static-site grep -n 'root ' /etc/nginx/conf.d/default.conf
curl -s http://localhost:8099/ | head -1
```

Si le conteneur affiche encore l'ancienne racine, c'est que le fichier a été remplacé
et non modifié : `docker restart static-site` rétablit le lien.

Le lien `current` est **relatif** (`releases/xxx`), ce qui lui permet de se résoudre
aussi bien sur l'hôte que dans le conteneur, où le dossier porte un autre chemin.

Une fois le site vérifié en ligne, supprimer les anciens fichiers restés à la racine :

```bash
cd /srv/www/valentin-fiess.fr
sudo find . -mindepth 1 -maxdepth 1 ! -name releases ! -name current -exec rm -rf {} +
```

> ⚠️ **Ne pas ajouter `disable_symlinks on;`.** `current` **est** un lien symbolique :
> nginx renverrait 403 sur tout le site. La seule forme correcte serait
> `disable_symlinks on from=/usr/share/nginx/html/current;`, et ce n'est pas
> nécessaire : le script rejette déjà toute archive contenant un lien symbolique.

---

## Étape 6 — Premier déploiement

Onglet **Actions → Deploy to VPS → Run workflow** (sans rien pousser).

À vérifier dans les logs :
1. `Run tests` au vert.
2. `Verify build output` annonce un nombre de fichiers cohérent.
3. `Deploy to VPS` affiche `[deploy] Release en ligne : ...`.
4. `Smoke test` affiche `Site en ligne (HTTP 200)`.

---

## Revenir en arrière (rollback)

```bash
ls -1t /srv/www/valentin-fiess.fr/releases      # la plus récente en premier
cd /srv/www/valentin-fiess.fr
sudo -u deploy ln -sfn releases/<VERSION_PRECEDENTE> current.new
sudo -u deploy mv -T current.new current
```

Effet immédiat, aucun redémarrage nginx. `0000-initial` reste le filet de secours vers
la version d'avant l'automatisation. Le prochain push sur `main` remettra en ligne la
version du dépôt : corriger la cause avant de repousser.

---

## En cas de problème

| Symptôme | Cause probable | Correctif |
|---|---|---|
| `Host key verification failed` | `VPS_KNOWN_HOSTS` absent ou mal formé | Refaire l'étape 4 |
| `Permission denied (publickey)` | Mauvaise clé ou `authorized_keys` mal placé | Vérifier l'étape 3 |
| `This account is currently not available` | Le shell de `deploy` est `nologin` | `sudo chsh -s /bin/sh deploy` |
| `[deploy] ERREUR : index.html absent` | Le build a produit un `dist/` vide | Voir l'étape `Build site` dans les logs |
| `[deploy] ERREUR : archive rejetée` | Un lien symbolique dans `dist/` | `find dist ! -type f ! -type d` en local |
| 403 sur tout le site | `root` ne pointe pas sur `current`, ou droits | `docker exec static-site ls -l /usr/share/nginx/html/` |
| Le site ne change pas | nginx sert encore l'ancien chemin | Étape 5, puis `nginx -s reload` |
| Le fichier est bon sur le disque mais pas servi | Le conteneur est resté sur l'ancien exemplaire du fichier de config | `docker restart static-site` |
| `not listed in AllowUsers` | `deploy` absent de la liste blanche SSH | L'ajouter dans `sshd_config.d/00-hardening.conf` |
