# Portfolio — Valentin Fiess

Site personnel de Valentin Fiess, développeur Data & IA.
En ligne : [valentin-fiess.fr](https://valentin-fiess.fr)

Vue 3 (Composition API) + Vite + Tailwind CSS v4, avec une mise en page en grille Bento.
La direction artistique est décrite dans [`docs/direction-artistique.md`](docs/direction-artistique.md) : la lire avant toute
modification visuelle.

## Démarrer

Prérequis : Node 22 (version utilisée en CI) et [pnpm](https://pnpm.io).

```sh
pnpm install
pnpm dev        # serveur de développement (http://localhost:5173)
pnpm build      # build de production dans dist/
pnpm preview    # sert le build de production
```

### Variables d'environnement

À placer dans un `.env` à la racine (non versionné) :

| Variable | Usage |
| --- | --- |
| `VITE_EMAILJS_SERVICE_ID` | Formulaire de contact (EmailJS) |
| `VITE_EMAILJS_TEMPLATE_ID` | Formulaire de contact (EmailJS) |
| `VITE_EMAILJS_API` | Clé publique EmailJS |
| `VITE_TURNSTILE_SITE_KEY` | Anti-spam Cloudflare Turnstile |

Sans ces variables le site fonctionne, mais le formulaire de contact et le chatbot ne peuvent pas
envoyer de message.

## Structure

```
docs/                     Direction artistique
public/
  assets/assets_index/    Images sources + variantes responsive (360, 400, 1200, 1400)
  robots.txt sitemap.xml llms.txt
src/
  components/             Cartes Bento et blocs réutilisables
  components/include/     Navbar, Footer, bannière cookies, sections de documentation
  views/                  Pages routées (accueil, projets, stack, chatbot, légal)
  data/projets.js         Source unique des projets affichés
  router/index.js         Routes + métadonnées SEO par page
  matomo.js scroll.js turnstile.js
tailwind.css              Thème Tailwind v4 : couleurs, polices, composants
image_processor.go        Génération des variantes WebP
```

Il n'y a pas de `tailwind.config.js` : Tailwind v4 est configuré directement dans `tailwind.css`
via `@theme`.

## Images

Les images sont converties en WebP et déclinées en plusieurs largeurs par un utilitaire Go, qui
délègue la suppression d'arrière-plan à `rembg` via `image_processor_worker.py` (Python 3.13).

```sh
pnpm process-images          # traite les nouvelles images
pnpm process-images:force    # retraite tout
go run image_processor.go --resize-only   # sans suppression d'arrière-plan
```

Les fichiers listés dans `exclude_bg_removal.txt` conservent leur arrière-plan.

## Automatisations

- `cache-github-chart.yml` : la carte « Historique GitHub » de l'accueil affiche un SVG mis en
  cache dans le dépôt, régénéré chaque lundi. En local : `pnpm cache-github-chart`.
- `keep-alive.yml` : ping le Space Hugging Face du chatbot toutes les 30 minutes pour éviter sa
  mise en veille.

## À propos

Les contenus (textes, photos, projets, CV) sont la propriété de Valentin Fiess. Le code est
consultable librement ; aucune licence de réutilisation n'est accordée pour l'instant.
