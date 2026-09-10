# AGENTS.md

Instructions pour les agents de code qui travaillent sur ce dépôt.

Ce dépôt contient le code source de **https://valentin-fiess.fr**, le portfolio
de Valentin Fiess, ingénieur IA/Data. C'est un site statique : pas de backend,
pas de base de données, pas d'API.

## Stack

| Élément | Choix | Note |
| --- | --- | --- |
| Framework | Vue 3 (Composition API, `<script setup>`) | Pas de Nuxt, pas de SSR. |
| Build | Vite 8 | |
| Style | Tailwind CSS 4 via `@tailwindcss/vite` | Thème dans `tailwind.css`. |
| Routage | vue-router 5, mode history | Routes dans `src/router/index.js`. |
| Paquets | **pnpm** | N'utilisez ni npm ni yarn : le lockfile est `pnpm-lock.yaml`. |
| Hébergement | Apache mutualisé, derrière Cloudflare | Config dans `public/.htaccess`. |

Le dark mode vient de `prefers-color-scheme`. Il n'y a **pas** de classe `.dark`
sur `<html>` : un sélecteur CSS `.dark ...` ne s'appliquera jamais.

## Commandes

```bash
pnpm install
pnpm dev                # serveur de développement
pnpm build              # chaîne complète, voir ci-dessous
pnpm verify:agents      # vérifie dist/ pour les agents (sans réseau)
pnpm agent-manifests    # régénère les manifestes seuls
```

`pnpm build` enchaîne cinq étapes, dans cet ordre, et l'ordre compte :

1. `generate-og.mjs` — images Open Graph dans `public/assets/og/`.
2. `generate-agent-manifests.mjs` — sitemap, `llms.txt`, jumeaux Markdown et
   manifestes `.well-known/`. **Avant** Vite, parce que Vite copie `public/`.
3. `vite build`.
4. `prerender.mjs` — une coquille HTML par route, avec ses meta, son JSON-LD et
   son contenu lisible sans JavaScript.
5. `verify-agent-manifests.mjs` — échoue le build si un lien déclaré ne résout
   pas, si un manifeste n'est pas du JSON valide ou si un digest est périmé.

## Règles propres à ce dépôt

### Le contenu a une seule source

`src/data/seo.js` porte les métadonnées de chaque route, `src/data/agent-content.js`
porte son texte. Tout le reste en découle : le sitemap, `llms.txt`, les jumeaux
Markdown, le JSON-LD, et les pages Vue `/about`, `/contact`, `/privacy` via
`DocArticle.vue`.

**Pour ajouter une page :** ajoutez son entrée dans `seo.js`, son contenu dans
`agent-content.js`, sa route dans `src/router/index.js`, puis lancez
`pnpm build`. Le générateur lève une erreur explicite si l'entrée de contenu
manque.

N'éditez jamais à la main les fichiers portant l'en-tête « Genere par
scripts/... » : `public/sitemap.xml`, `public/llms.txt`, `public/*.md`,
`public/schemamap.xml`, `public/feeds/`, `public/.well-known/*.json`. Ils sont
commités mais dérivés.

### Ne promettez rien que le site ne tienne

Ce site est lu par des agents. Les manifestes déclarent explicitement l'absence
d'API, de serveur MCP et de paiement. N'ajoutez pas de manifeste décrivant un
endpoint qui n'existe pas : un agent qui suit un lien mort fait pire qu'un agent
qui n'a rien trouvé.

### Fichiers sensibles

`public/.htaccess` porte la sécurité du site (CSP, en-têtes, réécritures). Une
erreur de syntaxe y provoque un 500 sur l'ensemble du site : validez toute
modification avant de déployer, voir « Tester le .htaccess en local » ci-dessous.
`.env` contient des secrets et n'est jamais commité.

## Tester le .htaccess en local

`public/.htaccess` porte le routage, les en-têtes et la sécurité. Une erreur de
syntaxe y provoque un 500 sur tout le site, et rien dans `pnpm build` ne la
détecte. macOS embarque Apache 2.4, ce qui permet de valider avant de déployer.

```bash
# 1. Syntaxe seule : charge le .htaccess dans un contexte Apache reel.
cat > /tmp/dir.conf <<EOF
LoadModule rewrite_module libexec/apache2/mod_rewrite.so
LoadModule deflate_module libexec/apache2/mod_deflate.so
LoadModule expires_module libexec/apache2/mod_expires.so
<Directory "$PWD/dist">
    AllowOverride All
    Require all granted
    Include "$PWD/public/.htaccess"
</Directory>
EOF
/usr/sbin/httpd -t -f /etc/apache2/httpd.conf -c "Include /tmp/dir.conf"
# Attendu : "Syntax OK"
```

Pour un test de comportement complet, copier `/etc/apache2/httpd.conf`, y
pointer `DocumentRoot` sur `dist/`, décommenter `mod_rewrite`, `mod_deflate` et
`mod_expires`, neutraliser les `CustomLog` et `ErrorLog` qui écrivent dans
`/private/var/log/apache2/` (non accessibles sans root), puis démarrer avec
`httpd -f <config> -k start`. Vérifier ensuite : pages internes en 200 **sans**
redirection, `Accept: text/markdown` renvoyant `text/markdown`, manifestes en
`application/json`, chemin `.well-known` inexistant renvoyant du JSON, et
non-régression sur les assets et le repli SPA. **Arrêter le serveur ensuite**
(`httpd -f <config> -k stop`).

## Conventions de code

- Commentaires en français, sans accents dans les fichiers `scripts/`.
- Un commentaire explique **pourquoi**, pas ce que fait la ligne suivante.
- Composants en PascalCase, utilitaires en camelCase à la racine de `src/`.
- Immutabilité : on retourne une copie, on ne mute pas l'argument reçu.
- Pas de `console.log` laissé en production.

## Limites connues

- ESLint est configuré (`eslint.config.js`) mais ses paquets ne sont pas dans
  les dépendances : `pnpm lint` n'existe pas encore.
- `vitest.config.js` existe mais `vitest` n'est pas installé et aucun test
  n'est écrit. La vérification automatisée actuelle est
  `scripts/verify-agent-manifests.mjs`.

## Contact

Valentin Fiess — `sobre.05.statue@icloud.com` ·
[github.com/ValMtp3](https://github.com/ValMtp3)
