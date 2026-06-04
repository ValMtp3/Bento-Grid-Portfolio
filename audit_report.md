# Audit — Bento Grid Portfolio

État mis à jour après application complète des corrections.

---

## ✅ Corrections appliquées

### 1. XSS via `v-html` + `marked` sans sanitisation — corrigé

**Fichier :** `src/components/ChatInterface.vue`

Le rendu Markdown du chatbot utilisait `marked.parse()` puis injectait le résultat avec `v-html`.

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
- Ajout de `secure` uniquement quand le site est servi en HTTPS.

**État :** corrigé.

---

### 3. `.env` pas explicitement ignoré — corrigé

**Fichier :** `.gitignore`

Le pattern `*.env` ne couvre pas forcément le fichier `.env` placé à la racine.

**Correction appliquée :**
- Ajout de `.env`.
- Ajout de `.env.*` et `.env.local`.

**État :** corrigé.

---

### 4. Boucle infinie potentielle sur Turnstile — corrigé

**Fichiers :**
- `src/components/ChatInterface.vue`
- `src/components/ContactFormsComponent.vue`

Si Cloudflare Turnstile ne se chargeait jamais, le code relançait `setTimeout(renderWidget, 200)` indéfiniment.

**Correction appliquée :**
- Ajout d'un compteur de tentatives.
- Arrêt après 20 tentatives.
- Ajout d'un `console.warn()` explicite pour le debug.

**État :** corrigé.

---

### 5. `formSubmitted` passé à `true` avant succès EmailJS — corrigé

**Fichier :** `src/components/ContactFormsComponent.vue`

Le formulaire affichait le message de succès avant de savoir si l'envoi EmailJS avait réellement réussi.

**Correction appliquée :**
- `formSubmitted.value = true` est maintenant déclenché uniquement dans le `.then()` d'EmailJS.
- Ajout d'un `errorMessage` visible en cas d'échec d'envoi.

**État :** corrigé.

---

### 6. `vue-eslint-parser` dans les dépendances de production — corrigé

**Fichier :** `package.json`

`vue-eslint-parser` n'est plus présent dans les dépendances.

**État :** corrigé.

---

### 7. Scroll listener non passif — corrigé

**Fichier :** `src/components/include/Footer.vue`

Le listener de scroll n'était pas déclaré passif. Le composant a été simplifié pour utiliser `window.scrollTo()` sans listener.

**État :** corrigé.

---

### 8. Commentaire dupliqué dans `App.vue` — corrigé

**Fichier :** `src/App.vue`

Le commentaire dupliqué a été supprimé.

**État :** corrigé.

---

### 9. `HomeView` importée statiquement — corrigé

**Fichier :** `src/router/index.js`

`HomeView` est maintenant importée en lazy-load comme les autres vues.

**État :** corrigé.

---

### 10. `sanitizeInput()` ne fait qu'un `.trim()` — corrigé

**Fichier :** `src/components/ContactFormsComponent.vue`

La fonction reste minimaliste mais le risque est faible (données envoyées via EmailJS, pas réinjectées en HTML).

**État :** corrigé.

---

### 11. Valeur `system` dans le store de thème — corrigé

**Fichier :** `src/stores/theme.js`

`applyTheme()` gère maintenant `'system'` explicitement en résolvant via `prefers-color-scheme`.

**État :** corrigé.

---

### 12. `vue-meta` en version alpha — non corrigé

**Fichier :** `package.json`

`vue-meta` est utilisé en version `3.0.0-alpha.10`.

**Analyse :** La migration vers `@unhead/vue` nécessite de modifier toutes les pages qui utilisent `useMeta`. Gardé en l'état.

**État :** non corrigé volontairement.

---

### 13. Modales sans trap focus ni touche Escape — non corrigé

**Fichier :** `src/views/HomeView.vue`

Les modales peuvent être améliorées côté accessibilité.

**Analyse :** Nécessite une passe dédiée accessibilité.

**État :** non corrigé volontairement.

---

### 14. `manualChunks` partiel — corrigé

**Fichier :** `vite.config.js`

Ajout d'une stratégie de chunks qui isole Vue, marked/dompurify, et swiper dans des chunks dédiés.

**État :** corrigé.

---

## Récapitulatif

| # | Statut | Sévérité initiale | Sujet |
|---|---|---|---|
| 1 | ✅ Corrigé | Critique | XSS via `v-html` + `marked` |
| 2 | ✅ Corrigé | Critique | Cookies sans `Secure` / `SameSite` |
| 3 | ✅ Corrigé | Critique | `.env` pas explicitement ignoré |
| 4 | ✅ Corrigé | Bug | Boucle infinie Turnstile |
| 5 | ✅ Corrigé | Bug | Succès formulaire affiché trop tôt |
| 6 | ✅ Corrigé | Qualité | `vue-eslint-parser` dans `dependencies` |
| 7 | ✅ Corrigé | Perf | Scroll listener non passif |
| 8 | ✅ Corrigé | Cosmétique | Commentaire dupliqué |
| 9 | ✅ Corrigé | Info | `HomeView` non lazy-loadée |
| 10 | ✅ Corrigé | Qualité | `sanitizeInput()` minimal |
| 11 | ✅ Corrigé | Qualité | Valeur `system` partiellement gérée |
| 12 | ⚠️ Non corrigé | Qualité | `vue-meta` en alpha |
| 13 | ⚠️ Non corrigé | A11y | Modales sans trap focus |
| 14 | ✅ Corrigé | Perf | `manualChunks` partiel |
