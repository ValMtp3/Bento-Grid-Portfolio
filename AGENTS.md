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
| Hébergement | nginx (Docker) sur un VPS, derrière Nginx Proxy Manager et Cloudflare | Config dans `scripts/deploy/nginx.conf`, voir `DEPLOIEMENT_VPS.md`. |

Le dark mode passe par une classe `.dark` sur `<html>`, posée avant le premier
affichage par le script en ligne de `index.html` (choix enregistré dans
`localStorage`, sinon `prefers-color-scheme`). La variante `dark:` de Tailwind
suit cette classe (`tailwind.css`), et la bascule vit dans `src/theme.js`.

## Commandes

```bash
pnpm install
pnpm dev                # serveur de développement
pnpm test               # tests (node --test)
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

`scripts/deploy/nginx.conf` porte la sécurité du site (CSP, en-têtes,
négociation Markdown, 404 JSON, cache). Il n'est **pas** déployé par GitHub
Actions : il se recopie à la main sur le VPS (`DEPLOIEMENT_VPS.md`, étape 7).
Une erreur de syntaxe empêche nginx de recharger : validez toute modification
avant de l'appliquer, voir « Tester la config nginx en local » ci-dessous.

`public/.htaccess` n'est lu que par Apache, que la production n'utilise plus.
Il est gardé comme référence : une règle qui n'y figure que là ne s'applique pas.

`.env` contient des secrets et n'est jamais commité.

## Tester la config nginx en local

Le VPS sert le site avec l'image `nginx:alpine`. La même image tourne en local
avec Docker (OrbStack), sur le `dist/` produit par `pnpm build`.

```bash
# 1. Syntaxe.
docker run --rm \
  -v "$PWD/scripts/deploy/nginx.conf":/etc/nginx/conf.d/default.conf:ro \
  -v "$PWD/dist":/usr/share/nginx/html/current:ro \
  nginx:alpine nginx -t
# Attendu : "syntax is ok" et "test is successful"

# 2. Comportement : serveur sur http://localhost:8099
docker run -d --name nginx-test -p 8099:8099 \
  -v "$PWD/scripts/deploy/nginx.conf":/etc/nginx/conf.d/default.conf:ro \
  -v "$PWD/dist":/usr/share/nginx/html/current:ro \
  nginx:alpine
```

Vérifier ensuite : pages internes en 200 **sans** redirection (`/projets`),
`Accept: text/markdown` et `?mode=agent` renvoyant `text/markdown`, manifestes
en `application/json`, chemin `.well-known` inexistant en 404 JSON, en-têtes de
sécurité présents (y compris sur les 404), et non-régression sur les assets et
le repli SPA. **Arrêter le serveur ensuite** (`docker rm -f nginx-test`).

Piège nginx : un `add_header` placé dans un bloc `location` efface tous ceux du
bloc `server`. Les en-têtes restent au niveau `server` ; ce qui varie selon le
fichier passe par des `map`.

## Conventions de code

- Commentaires en français, sans accents dans les fichiers `scripts/`.
- Un commentaire explique **pourquoi**, pas ce que fait la ligne suivante.
- Composants en PascalCase, utilitaires en camelCase à la racine de `src/`.
- Immutabilité : on retourne une copie, on ne mute pas l'argument reçu.
- Pas de `console.log` laissé en production.

## Limites connues

- ESLint est configuré (`eslint.config.js`) mais ses paquets ne sont pas dans
  les dépendances : `pnpm lint` n'existe pas encore.
- Les tests utilisent le lanceur intégré à Node (`node --test`), via
  `pnpm test` : fichiers `*.test.mjs` sous `src/` et `scripts/`. `vitest`
  n'est pas installé, `vitest.config.js` n'est pas utilisé.
- La CSP (`scripts/deploy/nginx.conf`) est bloquante. Tout nouveau domaine
  appelé par le site (fetch, script, iframe) doit y être ajouté, sinon il est
  bloqué en production sans erreur visible ailleurs que dans la console.

## Contact

Valentin Fiess — `sobre.05.statue@icloud.com` ·
[github.com/ValMtp3](https://github.com/ValMtp3)
