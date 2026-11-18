# Audit — Bento Grid Portfolio

Dernière mise à jour : analyse de sécurité complète du dépôt (code client, CI GitHub
Actions, config nginx du VPS, scripts de déploiement, historique git) suivie des
corrections. Les anciennes entrées dont la cible a disparu du code (`marked`/`dompurify`,
`vue-meta`, `src/stores/theme.js`) sont reprises en section « Historique ».

---

## Correction la plus récente

### 15. Divulgation d'infrastructure dans `DEPLOIEMENT_VPS.md` — corrigé

**Fichiers :** `DEPLOIEMENT_VPS.md`, `scripts/deploy/nginx.conf`, historique git complet.

La procédure de déploiement publique révélait le **port SSH du VPS** (dans le corps du
document et dans un message de commit) et le **compte administrateur** (login et chemin
`/home/...` du compte). Les valeurs réelles ne sont volontairement pas reproduites ici.

**Corrections appliquées :**
- Valeurs remplacées par des placeholders (`<port-ssh>`, `<user-vps>@`,
  `/home/<user-vps>/`) dans le document et dans le commentaire de
  `scripts/deploy/nginx.conf`.
- **Historique réécrit sur toutes les branches** avec `git filter-repo`
  (`--replace-text` + `--replace-message`), puis force-push. Vérification :
  `git log --all -p` ne contient plus aucune des valeurs purgées (port, login,
  chemin home). Aucune adresse IP du VPS n'a jamais été committée (les seules
  chaînes ressemblant à des IP dans l'historique sont un User-Agent Chrome et un
  path SVG), et aucune clé SSH réelle n'y figure.
- Note de confidentialité ajoutée en tête de `DEPLOIEMENT_VPS.md` : les vraies valeurs
  ne vivent que dans les secrets GitHub et les notes locales.

**Caveat :** GitHub conserve côté serveur les anciens commits via les refs
`refs/pull/*` (ex. PR #79) même après un force-push ; une purge complète côté serveur
passe par le support GitHub. Par précaution : faire tourner `VPS_SSH_KEY` et envisager
de changer le port SSH, puisqu'il a été rendu public.

**État :** corrigé.

---

## Posture de sécurité vérifiée lors de l'analyse

| Domaine | Résultat |
|---|---|
| Dépendances | `pnpm audit` (prod + dev) : aucune vulnérabilité connue ; Dependabot actif ; `pnpm install --frozen-lockfile` en CI |
| Secrets | `.env` gitignoré et jamais commité (scan de tout l'historique) ; secrets CI via l'environnement `production` ; clé SSH de déploiement écrite en `chmod 600` puis supprimée, `StrictHostKeyChecking=yes` avec `known_hosts` épinglé, actions tierces épinglées par SHA |
| XSS | un seul `v-html` (`src/components/include/DocArticle.vue`), alimenté par le convertisseur maison `src/markdown.js` qui échappe le HTML avant de générer la moindre balise, avec allowlist de schémas d'URL (`isSafeHref`) et `rel="noopener noreferrer"` ; chatbot : HTML échappé par deep-chat, liens neutralisés (`src/chatbot/safeLinks.js`, entités décodées avant test), `textContent` pour toute donnée venant du serveur ; aucun `eval`/`innerHTML`/`document.write` dans `src/` |
| En-têtes HTTP | CSP bloquante (`scripts/deploy/nginx.conf`) : le seul script inline autorisé par hash sha256, `object-src 'none'`, `frame-ancestors 'none'`, plus `nosniff`, `X-Frame-Options`, COOP, `Referrer-Policy`, `Permissions-Policy`, `server_tokens off` ; HSTS ajouté par Cloudflare |
| Cookies | brouillon du formulaire en `SameSite=Strict` + `Secure` si HTTPS (`src/components/ContactFormsComponent.vue`) |
| Chaîne de déploiement | clé SSH verrouillée sur une seule commande (`command="..."`) ; archive tar inspectée avant extraction (liens symboliques, fichiers spéciaux et chemins absolus/`..` rejetés), bascule atomique du lien `current`, 5 releases conservées ; tests + smoke test HTTP 200 en CI avant/après déploiement |
| Fichiers sensibles servis | nginx renvoie 404 sur `.git`, `.env`, `.htaccess`, `.htpasswd`, `.log`, `.sh`, `.conf`, `.sql`, `.bak`, `.DS_Store` |
| Données publiées | `public/data/*.json` : pourcentages uniquement — aucune adresse de wallet, aucune clé ; `public/.well-known/security.txt` présent |
| Divers | email obfusqué (base64 dans le bundle, `[at]`/`[point]` dans le HTML), Matomo auto-hébergé avec consentement requis et paramètres d'URL filtrés, `window.open` toujours avec `noopener,noreferrer`, aucun listener `postMessage` |

## Recommandations ouvertes

1. **EmailJS** : la clé publique (`VITE_EMAILJS_API`) est embarquée dans le bundle par
   design. Restreindre le service/template aux origines autorisées et activer le rate
   limiting dans le dashboard EmailJS ; à terme, passer par un endpoint serveur.
2. **Rotation** : `VPS_SSH_KEY` et port SSH (voir caveat de l'item 15) ; vérifier sur le
   VPS que le port 8099 du conteneur nginx n'est publié que sur localhost.
3. **DNS** : vérifier SPF/DKIM/DMARC pour `valentin-fiess.fr` (le domaine envoie des mails).
4. **CSP** : `style-src 'unsafe-inline'` reste nécessaire (Vue/Tailwind) — acceptable tant
   qu'aucune injection HTML n'existe dans le code.
5. **CORS `*`** sur les manifestes `.well-known` : acceptable, ce sont des données
   publiques sans credentials.
6. **Accessibilité** : modales sans focus trap ni touche Escape (hérité de l'ancien item 13).
7. **Purge serveur** : faire nettoyer les refs `refs/pull/*` par le support GitHub si l'on
   vise une suppression totale de l'historique ancien.

---

## Historique des corrections (items 1–14 de la version précédente, revérifiés)

- **1, 10 (XSS / sanitizeInput)** : refondu — le rendu Markdown est le convertisseur maison
  `src/markdown.js` ; `marked`/`dompurify` ne sont plus des dépendances.
- **2 (cookies)** : en place — `SameSite=Strict` + `Secure` conditionnel (`ContactFormsComponent.vue`).
- **3 (.env)** : en place — `.env`, `.env.*`, `.env.local` gitignorés ; aucun secret dans l'historique.
- **4 (boucle Turnstile)** : refondu — chargement par promesse mise en cache dans `src/turnstile.js`, plus de boucle infinie.
- **5 (succès formulaire)** : en place — `formSubmitted` posé après `await emailjs.send(...)`.
- **6 (vue-eslint-parser)** : sans objet — plus dans les dépendances.
- **7 (scroll listener)** : en place — `Footer.vue` utilise `window.scrollTo()` sans listener.
- **8 (commentaire dupliqué)** : cosmétique, sans objet.
- **9 (HomeView lazy)** : en place — `src/router/index.js` importe toutes les vues en lazy.
- **11 (thème `system`)** : en place — `src/theme.js` (`SYSTEM = 'system'` résolu via `prefers-color-scheme`).
- **12 (vue-meta alpha)** : sans objet — `vue-meta` n'est plus une dépendance.
- **13 (modales)** : toujours ouvert — voir recommandation 6.
- **14 (manualChunks)** : sans objet — retiré de `vite.config.js`.
