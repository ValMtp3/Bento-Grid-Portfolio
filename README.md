# 🌟 Bento Grid Portfolio

Bienvenue sur le repository de mon portfolio ! Ce projet utilise **Vue.js** pour la structure, **Tailwind CSS** pour le style, et **Bento-Grid** pour la mise en page.

## 🚀 Aperçu

Ce portfolio a été conçu pour mettre en avant mes compétences, mes projets et mon parcours professionnel. L'objectif est de fournir une interface utilisateur agréable et réactive, tout en restant simple et élégante.

## 🎨 Fonctionnalités

- **Vue.js** : Framework JavaScript progressif pour la construction d'interfaces utilisateur.
- **Tailwind CSS** : Framework CSS utilitaire pour un design rapide et réactif.
- **Bento-Grid** : Système de grille flexible pour une disposition cohérente des éléments.
- **Composants réutilisables** : Facilite l'ajout de nouveaux projets et sections.
- **Design réactif** : Optimisé pour tous les appareils, des mobiles aux écrans larges.
- **Animations fluides** : Pour une expérience utilisateur agréable et engageante.

## 🛠️ Recommended IDE Setup

[![WebStorm](https://img.shields.io/badge/WebStorm-000000?style=for-the-badge&logo=webstorm&logoColor=white)](https://www.jetbrains.com/webstorm/)

## 📚 Technologies Utilisées

- [![Vue.js](https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vuedotjs&logoColor=4FC08D)](https://vuejs.org/)
- [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
- [![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=FFD62E)](https://vitejs.dev/)
- [![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
- [![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5)
- [![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)

## ⚙️ Customize Configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## 📦 Project Setup

```sh
npm install
```

### 🔄 Compile and Hot-Reload for Development

```sh
npm run dev
```

### 📦 Compile and Minify for Production

```sh
npm run build
```

## 🛠️ Installation

1. Clone le repository :
   ```bash
   git clone https://github.com/ValMtp3/portfolio-vue-bento-tailwind.git
   cd portfolio-vue-bento-tailwind
   ```

2. Installe les dépendances :
   ```bash
   npm install
   ```

3. Lance l'application :
   ```bash
   npm run serve
   ```

## 🌐 Utilisation

Après avoir démarré le serveur de développement, tu peux accéder à l'application via [http://localhost:8080](http://localhost:8080). Modifie les fichiers dans le dossier `src` pour personnaliser les sections de ton portfolio.

## 🗂️ Structure du Projet

```plaintext
portfolio-vue-bento-tailwind
├── public
│   ├── assets_index
│   ├── Font
│   ├── JS
│   ├── output.css
├── src
│   ├── data
│   ├── components
│   ├── router
│   ├── views
│   ├── App.vue
│   ├── main.js
├── index.html
├── tailwind.config.js
├── tailwind.css
├── package.json
├── package-lock.json
├── vite.config.js
└── README.md
```

- **`public/assets_index`** : Contient les images, icônes et autres ressources statiques.
- **`public/Font`** : Contient les polices utilisées.
- **`public/JS`** : Contient le fichier JS principal.
- **`public/output.css`** : Fichier CSS de Tailwind.
- **`src/components`** : Composants Vue.js réutilisables.
- **`src/views`** : Différentes pages de l'application.
- **`src/router`** : Différentes routes de l'application.
- **`App.vue`** : Composant racine.
- **`main.js`** : Point d'entrée de l'application.

## 🖼️ Traitement des images

Les images du portfolio sont générées automatiquement en plusieurs tailles responsive au format WebP.

Utilisation du processeur en Go :

```sh
go run image_processor.go
```

Options principales :

```sh
go run image_processor.go --force        # Retraiter toutes les images
go run image_processor.go --resize-only  # Redimensionner sans supprimer l'arrière-plan
go run image_processor.go --model u2netp # Utiliser un modèle rembg plus rapide
```

La suppression d'arrière-plan repose sur `rembg`, appelé via le worker Python `image_processor_worker.py`.

## 🎨 Personnalisation

Pour personnaliser les styles, modifie le fichier `tailwind.config.js` et ajoute tes propres classes utilitaires. Tu peux également ajuster les composants et les vues pour répondre à tes besoins spécifiques.

## 🤝 Contribuer

Les contributions sont les bienvenues ! Si tu souhaites ajouter des fonctionnalités ou corriger des bugs, n'hésite pas à créer une pull request.

## ✍️ Auteurs

- **Valentin Fiess** - *Développeur principal* - [ValMtp3](https://github.com/ValMtp3)
- Voici mon portfolio : [Portfolio](https://valentin-fiess.fr)

## 💖 Remerciements

Merci d'avoir jeté un œil à mon portfolio ! J'espère qu'il te plaira autant que j'ai pris plaisir à le créer.
