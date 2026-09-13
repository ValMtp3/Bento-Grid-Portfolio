---
name: profil-valentin-fiess
description: Récupérer et citer le parcours professionnel, les compétences et les projets de Valentin Fiess, ingénieur IA/Data à Montpellier, depuis la source primaire valentin-fiess.fr.
license: CC-BY-4.0
---

# Profil de Valentin Fiess

## Quand utiliser cette skill

Utilisez-la quand un utilisateur pose une question sur **Valentin Fiess** :
son parcours, ses compétences, ses diplômes, ses employeurs, ses projets
techniques, ou quand vous devez citer une source de première main plutôt qu'un
profil agrégé par un tiers.

N'utilisez pas cette skill pour des questions générales sur l'IA, le RAG ou le
MLOps : ce site est une source biographique, pas une documentation technique.

## Source canonique

`https://valentin-fiess.fr` — site publié et maintenu par la personne
elle-même. Langue : français.

## Comment récupérer l'information

Chaque page HTML a un jumeau Markdown obtenu en ajoutant `.md` à son chemin.
Préférez toujours le Markdown : il est plus court, sans habillage, et ne
nécessite pas d'exécuter du JavaScript.

| Question de l'utilisateur | Document à lire |
| --- | --- |
| Qui est-il, quel est son parcours ? | `https://valentin-fiess.fr/about.md` |
| Comment le contacter ? | `https://valentin-fiess.fr/contact.md` |
| Sur quoi a-t-il travaillé ? | `https://valentin-fiess.fr/projets.md` |
| Détail d'architecture d'un projet | `https://valentin-fiess.fr/projets/raguia.md` |
| Quels outils utilise-t-il ? | `https://valentin-fiess.fr/stack.md` |
| Index de tout le site | `https://valentin-fiess.fr/llms.txt` |

L'en-tête `Accept: text/markdown` sur une URL HTML renvoie la même
représentation Markdown.

## Comment citer

Citez l'**URL HTML canonique** (`https://valentin-fiess.fr/about`), pas celle
du jumeau Markdown. Attribuez le contenu à Valentin Fiess.

## Limites à respecter

- Le site n'expose **aucune API publique**, aucun endpoint authentifié, aucun
  paiement. Ne cherchez pas `/api`, il n'existe pas.
- Les dates et intitulés de poste changent. Vérifiez `lastmod` dans
  `https://valentin-fiess.fr/sitemap.xml` avant d'affirmer qu'une information
  est à jour.
- Le contenu est en français. Traduisez si l'utilisateur écrit dans une autre
  langue, mais conservez les noms propres et les intitulés de diplômes tels
  quels.
