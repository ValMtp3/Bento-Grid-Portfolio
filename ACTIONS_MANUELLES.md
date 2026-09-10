# Actions manuelles — lisibilité du site par les agents IA

Ce document liste ce que **toi seul** peux faire : les actions qui passent par
un tableau de bord, un compte externe ou une décision éditoriale. Tout le reste
est déjà fait dans le code.

Contexte : l'audit [orank](https://ora.ai/score/valentin-fiess.fr) a noté le
site **27/100 (F)**. Le code a été corrigé, mais une partie du score dépend
d'actions hors dépôt.

Tous les barèmes cités ici (« vaut 13 points », « 6ᵉ position »…) proviennent de
ce rapport orank, pas d'une mesure faite dans le dépôt. Ils servent à
hiérarchiser l'effort, pas à être recoupés. La page de score ci-dessus reste la
source.

---

## 🔴 Action 1 — Débloquer les agents IA dans Cloudflare

**C'est de loin la plus importante.** Elle vaut environ **13 points** à elle
seule, et sans elle une bonne partie du travail fait dans le code reste
invisible.

### Le problème

L'audit a relevé la même chose treize fois : *« Homepage blocked by WAF »*,
*« Bot management challenged GPTBot, ClaudeBot, ChatGPT-User, PerplexityBot,
Google-Extended, Applebot-Extended »*.

Cloudflare présente un test anti-robot à ces agents. Un test anti-robot, c'est
un videur à l'entrée : les crawlers officiellement vérifiés par Cloudflare le
passent, mais tous les autres agents restent dehors. Le scanner orank en fait
partie — d'où les *« cannot check »* sur presque tout le rapport.

### Ce qu'il faut faire

1. Va sur [dash.cloudflare.com](https://dash.cloudflare.com) et sélectionne le
   domaine **valentin-fiess.fr**.
2. Ouvre **Security → Bots**.
   - Passe **Bot Fight Mode** sur **Off**. C'est lui le principal coupable : il
     challenge sans distinguer un agent légitime d'un scrapeur.
   - Si tu vois une option **Block AI Scrapers and Crawlers** (ou « AI
     Labyrinth »), désactive-la aussi. Elle bloque exactement les agents que tu
     veux laisser entrer.
3. Ouvre **Security → WAF → Custom rules** et clique **Create rule**.
   - **Nom :** `Autoriser les agents IA`
   - **Expression** — bascule en mode « Edit expression » et colle ceci :

   ```
   (http.user_agent contains "GPTBot") or
   (http.user_agent contains "OAI-SearchBot") or
   (http.user_agent contains "ChatGPT-User") or
   (http.user_agent contains "ClaudeBot") or
   (http.user_agent contains "Claude-User") or
   (http.user_agent contains "anthropic-ai") or
   (http.user_agent contains "PerplexityBot") or
   (http.user_agent contains "Perplexity-User") or
   (http.user_agent contains "Google-Extended") or
   (http.user_agent contains "Applebot-Extended") or
   (http.user_agent contains "DeepSeekBot") or
   (http.user_agent contains "MistralAI-User") or
   (http.user_agent contains "ora-agent") or
   (cf.verified_bot_category eq "AI Crawler")
   ```

   - **Action :** choisis **Skip**, puis coche toutes les cases proposées
     (Managed rules, Rate limiting, Security Level…).
   - Enregistre et déploie.

   ⚠️ En plan gratuit, une règle *Skip* **ne peut pas** contourner Bot Fight
   Mode — seul Super Bot Fight Mode, payant, est contournable. Si la case
   n'apparaît pas, c'est normal : c'est l'étape 2 (passer Bot Fight Mode sur
   **Off**) qui fait réellement le travail. Ne conclus pas que ta règle est
   cassée.
4. Vérifie que la règle est bien **au-dessus** des autres dans la liste : les
   règles Cloudflare s'appliquent de haut en bas, la première qui correspond
   gagne.

### Comment savoir que ça marche

Depuis ton terminal, après déploiement :

```bash
curl -sI -A "GPTBot/1.0" https://valentin-fiess.fr/ | head -1
curl -sI -A "ClaudeBot/1.0" https://valentin-fiess.fr/ | head -1
```

Tu dois lire `HTTP/2 200`. Si tu vois `403`, `503` ou une page qui parle de
« Checking your browser », la règle n'est pas encore active.

⚠️ **Ne active pas une Cache Rule « Cache Everything » sur ce domaine.** Le
plan gratuit de Cloudflare ignore l'en-tête `Vary` (sauf `Accept-Encoding`). Or
le site sert deux versions de chaque page à la même URL : HTML pour les humains,
Markdown pour les agents. Sans respect du `Vary`, la première version mise en
cache serait resservie à tout le monde — un agent recevrait du HTML, ou pire, un
visiteur recevrait du Markdown brut. Aujourd'hui il n'y a rien à faire :
Cloudflare ne met pas le HTML en cache par défaut. C'est une règle à ne pas
ajouter plus tard sans y repenser.

⚠️ **Le compromis à connaître.** Baisser la garde anti-robots laisse aussi
passer des scrapeurs moins sympathiques, et ta bande passante peut augmenter.
C'est le prix à payer pour être lisible par les IA. Si tu constates des abus,
la bonne réponse est une règle de *rate limiting* (limite du nombre de requêtes
par minute), pas un retour au challenge général.

---

## 🟠 Action 2 — Déployer le site

Rien de ce qui a été codé n'est visible tant que le nouveau `dist/` n'est pas en
ligne.

```bash
pnpm build
```

Puis envoie le contenu de `dist/` sur l'hébergement, **`.htaccess` et dossiers
cachés compris**. C'est le piège classique : la plupart des clients FTP
ignorent les fichiers commençant par un point, et `.htaccess` comme
`.well-known/` en font partie. Active « afficher les fichiers cachés » dans ton
client FTP avant de transférer.

### Vérifications après déploiement

Copie-colle ce bloc dans ton terminal. Tout doit répondre.

```bash
# 1. Les manifestes sont du JSON valide
for f in ard.json ai-catalog.json agent-card.json api-catalog agent-skills/index.json; do
  printf "%-30s " "$f"
  curl -s "https://valentin-fiess.fr/.well-known/$f" | head -c 1
  echo
done
# Chaque ligne doit se terminer par { — si tu vois <, c'est du HTML : .htaccess n'est pas en ligne.

# 2. La négociation Markdown fonctionne
curl -sI -H "Accept: text/markdown" https://valentin-fiess.fr/ | grep -i "content-type\|vary"
# Attendu : content-type: text/markdown  ET  vary: Accept

# 3. Les jumeaux Markdown répondent
curl -s https://valentin-fiess.fr/about.md | head -1
# Attendu : # À propos de Valentin Fiess

# 4. Les en-têtes Link sont là
curl -sI https://valentin-fiess.fr/ | grep -i "^link"

# 5. Un chemin machine inexistant renvoie du JSON, pas du HTML
curl -s https://valentin-fiess.fr/.well-known/inexistant.json | head -c 60
# Attendu : {"error": ...
```

🟢 **Déjà vérifié en local.** Le `.htaccess` a été chargé dans un vrai Apache
2.4 servant `dist/` : syntaxe validée par `httpd -t`, puis une trentaine de
requêtes de contrôle (pages en 200 sans redirection, négociation Markdown sur
toutes les pages, manifestes en `application/json`, 404 machine en JSON,
en-têtes `Link` et `Vary`, plus les assets, images, PDF et le repli SPA pour
vérifier l'absence d'effet de bord). Les commandes ci-dessus servent donc
surtout à confirmer que le transfert FTP est complet.

Pour rejouer ce test toi-même, la procédure est dans `AGENTS.md`, section
« Tester le .htaccess en local ».

❓ **Si la vérification 1 ou 5 échoue quand même**, ton hébergeur n'autorise
probablement pas les directives `<If>` (Apache 2.4.10 minimum) ou
`DirectorySlash`. Dis-le moi, je réécrirai ces blocs autrement.

💡 **Un gain de vitesse au passage.** Avant cette correction, chaque page
interne (`/about`, `/projets`, `/stack`…) provoquait une redirection 301 vers
la même URL avec une barre finale, pour tous les visiteurs. C'est corrigé :
une requête de moins par page, et l'URL servie correspond enfin à la balise
`canonical`.

---

## 🔴 Action 3 — Commiter et pousser sur GitHub

**À faire avant l'action 4, sinon trois liens du site pointent dans le vide.**

`llms.txt` déclare maintenant trois fichiers du dépôt :

```
https://github.com/ValMtp3/Bento-Grid-Portfolio/blob/main/AGENTS.md
https://github.com/ValMtp3/Bento-Grid-Portfolio/blob/main/SKILL.md
https://github.com/ValMtp3/Bento-Grid-Portfolio/blob/main/plugin.json
```

Tant que ces fichiers ne sont pas poussés, ces trois URL répondent 404 — le
reproche exact que l'audit faisait déjà à ton `llms.txt`. Le vérificateur
automatique du build ne l'attrape pas : il ne contrôle que les liens du domaine
`valentin-fiess.fr`, sans accès réseau.

Je n'ai fait aucune opération git : c'est ta décision. Quand tu es prêt, relis
le diff puis commite et pousse sur `main`.

---

## 🟠 Action 4 — Publier la skill sur skills.sh

Vaut 3 points (« Listed on skills.sh » et « Skills.sh skill quality »).

Le fichier `SKILL.md` est prêt à la racine du dépôt, et c'est bien l'emplacement
que skills.sh reconnaît pour la découverte.

⚠️ **Attention, le rapport orank recommande `npx skills add` — c'est une erreur
de sa part.** Cette commande *installe* une skill depuis un dépôt vers ton
projet ; elle ne publie rien. La lancer n'inscrira rien sur skills.sh.

❓ **Je n'ai pas pu vérifier la procédure de publication exacte** (elle demande
un compte et un accès réseau que je n'ai pas). Consulte
[skills.sh/docs](https://skills.sh/docs) pour la marche à suivre à jour. Le
prérequis, lui, est certain : le dépôt doit être public et contenir `SKILL.md`
à sa racine — c'est fait après l'action 3.

⚠️ C'est une **publication publique**. La skill décrit ton parcours et ton
email — les mêmes informations que celles déjà sur ton site, mais elles
deviendront visibles depuis un annuaire externe. Relis `SKILL.md` avant.

---

## 🟢 Action 5 — Soumettre au répertoire d'apps ChatGPT

Vaut 2 points.

Va sur le programme *apps in ChatGPT* d'OpenAI et soumets le site. À l'heure où
ce document est écrit, le répertoire vise surtout les applications avec un
connecteur ou un serveur MCP — un portfolio statique a peu de chances d'être
accepté.

💡 **Mon avis :** garde cette action pour la fin, c'est 2 points pour un
dossier à monter et une acceptation incertaine.

---

## ⚪ Action 6 — Wikipédia et Wikidata

Vaut 4 points, mais lis ceci avant de t'y lancer.

Le rapport suggère de créer une page Wikipédia. **Je te le déconseille en
l'état.** Wikipédia exige la *notoriété* : plusieurs sources de presse
indépendantes et significatives qui parlent de toi. Une page auto-créée sans ces
sources est supprimée en quelques jours, et une création promotionnelle laisse
une trace défavorable sur le compte qui l'a créée.

Ce qui est atteignable, dans l'ordre :

1. **Rien tout de suite.** Ces 4 points ne sont pas accessibles honnêtement
   aujourd'hui.
2. **Plus tard, si tu obtiens de la couverture presse** (interview, article
   technique repris, conférence), une entrée **Wikidata** est envisageable :
   les critères y sont plus souples que sur Wikipédia. Il faudra y renseigner la
   propriété `P856` (site officiel) avec `https://valentin-fiess.fr`.

Le code publie déjà les liens `sameAs` vers GitHub, LinkedIn et X dans le
JSON-LD. Le jour où une entrée Wikidata existe, il suffira de l'ajouter au
tableau `IDENTITY.sameAs` dans `src/data/seo.js` et de relancer `pnpm build`.

---

## ⚪ Action 7 — Améliorer ta visibilité sur ton propre nom

Le rapport note que ton site ressort en **6ᵉ position** sur une recherche
« valentin-fiess ».

Ce qui aide, par ordre d'efficacité :

1. Mettre `https://valentin-fiess.fr` en lien sur **tous** tes profils : GitHub
   (champ « Website »), LinkedIn, X. Ces liens comptent, et c'est gratuit.
2. Utiliser toujours la **même graphie** du nom et la même URL partout : le
   domaine sans `www`, comme dans le code.
3. Obtenir des mentions depuis des sites tiers (articles, dépôts, conférences)
   qui pointent vers l'apex.

---

## Relancer l'audit

Une fois les actions 1, 2 et 3 faites, attends une heure que Cloudflare
propage, puis :

```bash
curl -X POST https://ora.ai/api/scan \
  -H "Content-Type: application/json" \
  -d '{"url": "valentin-fiess.fr"}'
```

Ou consulte simplement
[ora.ai/score/valentin-fiess.fr](https://ora.ai/score/valentin-fiess.fr).

---

## Ce qui restera perdu, et pourquoi c'est normal

Environ **25 points** du barème portent sur une API publique : spécification
OpenAPI, OAuth, GraphQL, clés d'idempotence, en-têtes de limitation de débit,
environnement de test, serveur MCP, paiements.

Ton site est un portfolio statique. Il n'a pas d'API, et il n'a aucune raison
d'en avoir une. Publier des manifestes décrivant des endpoints inexistants
ferait *baisser* la confiance des agents : ils suivent les liens, tombent dans
le vide, et retiennent que la source est peu fiable. C'est précisément ce que le
rapport reprochait déjà à ton `llms.txt` (« 5 of 5 probed links do not
resolve »).

Le site déclare donc explicitement, dans `llms.txt` et dans les manifestes
`.well-known/`, qu'il n'expose pas d'API. Pour un agent, c'est une information
utile — bien plus qu'une promesse creuse.

**Plafond réaliste : entre 55 et 65 sur 100**, ce qui est un bon score pour un
site de cette nature.
