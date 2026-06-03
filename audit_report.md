# Audit — Bento Grid Portfolio

État mis à jour après application des corrections simples et à faible risque de régression.

Le projet reste globalement bien structuré : lazy-loading sur plusieurs vues, SEO présent, Turnstile anti-bot, gestion du thème, responsive images et séparation claire des données projets.

---

## ✅ Corrections appliquées

### 1. XSS via `v-html` + `marked` sans sanitisation — corrigé

**Fichier :** `src/components/ChatInterface.vue`

Le rendu Markdown du chatbot utilisait `marked.parse()` puis injectait le résultat avec `v-html`, ce qui pouvait exposer la page à une injection HTML si une réponse externe contenait du contenu malveillant.

**Correction appliquée :**

- Ajout de `dompurify` aux dépendances.
- Sanitisation du HTML généré par `marked` avec `DOMPurify.sanitize()`.
- Sanitisation également dans le fallback du `catch`.

**État :** corrigé.

---

### 2. Cookies du formulaire sans `Secure` ni `SameSite` — corrigé

**Fichier :** `src/components/ContactFormsComponent.vue`

Les données temporaires du formulaire étaient stockées en cookies sans attributs de sécurité.

**Correction appliquée :**

- Ajout de `sameSite: 'Strict'`.
- Ajout de `secure` uniquement quand le site est servi en HTTPS, pour ne pas casser le développement local.

**État :** corrigé.

---

### 3. `.env` pas explicitement ignoré — corrigé

**Fichier :** `.gitignore`

Le pattern `*.env` ne couvre pas forcément le fichier `.env` placé à la racine.

**Correction appliquée :**

- Ajout de `.env`.
- Ajout de `.env.*`.

**État :** corrigé.

---

### 4. Boucle infinie potentielle sur Turnstile — corrigé

**Fichiers :**

- `src/components/ChatInterface.vue`
- `src/components/ContactFormsComponent.vue`

Si Cloudflare Turnstile ne se chargeait jamais, le code relançait `setTimeout(renderWidget, 200)` indéfiniment.

**Correction appliquée :**

- Ajout d’un compteur de tentatives.
- Arrêt après 20 tentatives.
- Ajout d’un message utilisateur si la vérification de sécurité ne peut pas être chargée.
- Ajout d’un `console.warn()` explicite pour le debug.

**État :** corrigé.

---

### 5. `formSubmitted` passé à `true` avant succès EmailJS — corrigé

**Fichier :** `src/components/ContactFormsComponent.vue`

Le formulaire affichait le message de succès avant de savoir si l’envoi EmailJS avait réellement réussi.

**Correction appliquée :**

- `formSubmitted.value = true` est maintenant déclenché uniquement dans le `.then()` d’EmailJS.
- Ajout d’un `errorMessage` visible en cas d’échec d’envoi.

**État :** corrigé.

---

### 6. `vue-eslint-parser` dans les dépendances de production — corrigé

**Fichier :** `package.json`

`vue-eslint-parser` est un outil ESLint, donc une dépendance de développement.

**Correction appliquée :**

- Déplacement de `vue-eslint-parser` de `dependencies` vers `devDependencies`.

**État :** corrigé.

---

### 7. Scroll listener non passif — corrigé

**Fichier :** `src/components/include/Footer.vue`

Le listener de scroll n’était pas déclaré passif.

**Correction appliquée :**

- Passage à `window.addEventListener('scroll', handleScroll, { passive: true })`.

**État :** corrigé.

---

### 8. Commentaire dupliqué dans `App.vue` — corrigé

**Fichier :** `src/App.vue`

Le commentaire `Injection du JSON-LD` était présent deux fois.

**Correction appliquée :**

- Suppression du doublon.

**État :** corrigé.

---

## ⚠️ Points encore présents, mais volontairement non corrigés

Ces points restent valides, mais ils demandent soit une décision produit, soit une modification plus large, soit des tests plus poussés. Ils n’ont donc pas été corrigés dans cette passe pour limiter le risque de régression.

### 9. `HomeView` importée statiquement

**Fichier :** `src/router/index.js`

`HomeView` est importée directement au lieu d’être lazy-loadée comme les autres vues.

**Analyse :**

Ce n’est pas forcément une erreur. La page d’accueil est souvent chargée immédiatement pour éviter un délai ou un flash au premier rendu. Passer cette vue en lazy-loading pourrait améliorer le bundle initial, mais aussi modifier l’expérience de chargement.

**État :** non corrigé volontairement.

---

### 10. `sanitizeInput()` ne fait qu’un `.trim()`

**Fichier :** `src/components/ContactFormsComponent.vue`

La fonction `sanitizeInput()` ne fait actuellement qu’un nettoyage minimal.

**Analyse :**

Le risque est faible tant que les valeurs ne sont pas réinjectées en HTML dans l’application. Les données sont envoyées via EmailJS. Une vraie sanitisation côté formulaire pourrait être ajoutée plus tard, mais il faut éviter d’altérer inutilement le message de l’utilisateur.

**État :** non corrigé volontairement.

---

### 11. Valeur `system` dans le store de thème

**Fichier :** `src/stores/theme.js`

Le store initialise parfois le thème à `system`, mais `applyTheme()` ne contient pas de logique spécifique pour cette valeur.

**Analyse :**

Le fonctionnement actuel reste acceptable, car `init()` résout ensuite le thème système en `dark` ou `light`. Une vraie option `system` demanderait une petite refonte du store et de l’interface de sélection du thème.

**État :** non corrigé volontairement.

---

### 12. `vue-meta` en version alpha

**Fichier :** `package.json`

`vue-meta` est utilisé en version `3.0.0-alpha.10`.

**Analyse :**

Le point est valide, mais une migration vers `@unhead/vue` ou `@vueuse/head` demanderait de modifier toutes les pages qui utilisent `useMeta`. Ce n’est pas une correction simple.

**État :** non corrigé volontairement.

---

### 13. Modales sans trap focus ni touche Escape

**Fichier :** `src/views/HomeView.vue`

Les modales peuvent être améliorées côté accessibilité : focus trap, fermeture avec `Escape`, meilleure gestion du focus clavier.

**Analyse :**

Le point est valide, mais demande une modification plus large de la logique des modales. À traiter dans une passe dédiée accessibilité.

**État :** non corrigé volontairement.

---

### 14. `manualChunks` partiel

**Fichier :** `vite.config.js`

La configuration `manualChunks` isole seulement certaines dépendances dans `vendor`.

**Analyse :**

Le point est valide, mais changer la stratégie de chunks peut modifier le découpage du build et doit idéalement être mesuré avec un audit de performance avant/après.

**État :** non corrigé volontairement.

---

## Vérifications effectuées

### Commandes validées

- `pnpm lint` : OK
- `pnpm build` : OK
- Diagnostics projet : OK, aucune erreur ni warning détecté

### Tests

- `pnpm test --run` échoue car aucun fichier de test n’existe dans le projet.
- Message Vitest : `No test files found`.

Ce n’est pas une régression liée aux corrections : le projet n’a actuellement pas de fichiers `*.test.*` ou `*.spec.*`.

---

## Récapitulatif

| # | Statut | Sévérité initiale | Fichier | Sujet |
|---|---|---|---|---|
| 1 | ✅ Corrigé | Critique | `ChatInterface.vue` | XSS via `v-html` + `marked` |
| 2 | ✅ Corrigé | Critique | `ContactFormsComponent.vue` | Cookies sans `Secure` / `SameSite` |
| 3 | ✅ Corrigé | Critique | `.gitignore` | `.env` pas explicitement ignoré |
| 4 | ✅ Corrigé | Bug | `ChatInterface.vue`, `ContactFormsComponent.vue` | Boucle infinie Turnstile |
| 5 | ✅ Corrigé | Bug | `ContactFormsComponent.vue` | Succès formulaire affiché trop tôt |
| 6 | ⚠️ Non corrigé volontairement | Info | `router/index.js` | `HomeView` non lazy-loadée |
| 7 | ⚠️ Non corrigé volontairement | Qualité | `ContactFormsComponent.vue` | `sanitizeInput()` minimal |
| 8 | ✅ Corrigé | Qualité | `package.json` | `vue-eslint-parser` dans `dependencies` |
| 9 | ⚠️ Non corrigé volontairement | Qualité | `stores/theme.js` | Valeur `system` partiellement gérée |
| 10 | ⚠️ Non corrigé volontairement | Qualité | `package.json` | `vue-meta` en alpha |
| 11 | ✅ Corrigé | Perf | `Footer.vue` | Scroll listener non passif |
| 12 | ✅ Corrigé | Cosmétique | `App.vue` | Commentaire dupliqué |
| 13 | ⚠️ Non corrigé volontairement | A11y | `HomeView.vue` | Modales sans trap focus |
| 14 | ⚠️ Non corrigé volontairement | Perf | `vite.config.js` | `manualChunks` partiel |
