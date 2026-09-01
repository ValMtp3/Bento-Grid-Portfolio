# Direction artistique du portfolio

Ce document est la source de verite visuelle et UX du portfolio de Valentin Fiess. Toute evolution, humaine ou realisee par un agent IA, doit conserver cette identite et privilegier la coherence plutot que l'ajout d'effets isoles.

## Intention

Le portfolio doit transmettre quatre qualites :

- chaleureux : une interface accueillante, humaine et accessible ;
- lisible : une information hierarchisee et rapidement comprehensible ;
- technique : une image credible liee au web, a la Data et a l'intelligence artificielle ;
- personnel : une identite reconnaissable, notamment grace au homard utilise comme mascotte.

Le contenu doit rester comprehensible par trois publics :

- un recruteur ou RH qui cherche rapidement un profil, des competences et des resultats ;
- un visiteur non technique qui doit comprendre les projets sans jargon inutile ;
- un profil technique qui doit pouvoir identifier les technologies, methodes et choix d'implementation.

## Palette canonique

Les cinq couleurs suivantes proviennent de la palette de reference fournie. Elles constituent les couleurs de marque ; leurs nuances Tailwind servent uniquement a construire les etats, contrastes et profondeurs necessaires.

| Role | Nom | HEX | RGB | Usage principal |
| --- | --- | --- | --- | --- |
| Accent | Spicy Paprika | `#E65A28` | `230, 90, 40` | Actions principales, accents, etats actifs |
| Texte chaud | Rich Mahogany | `#2A130D` | `42, 19, 13` | Titres, texte fort, profondeur chaude |
| Accent technique | Regal Navy | `#123B7D` | `18, 59, 125` | Data, IA, liens et informations techniques |
| Fond sombre | Coffee Bean | `#120602` | `18, 6, 2` | Mode sombre et contrastes profonds |
| Fond clair | Seashell | `#FFF1EA` | `255, 241, 234` | Fond clair, surfaces et respiration |

### Regles de couleur

- Seashell et Coffee Bean construisent les fonds principaux clair et sombre.
- Rich Mahogany porte les textes principaux et remplace le noir neutre.
- Spicy Paprika est reserve aux actions et points d'attention ; il ne doit pas devenir une couleur de fond omnipresente.
- Regal Navy exprime la dimension tech, Data et IA sans concurrencer l'action principale paprika.
- Le vert est tolere uniquement pour un statut positif ou de disponibilite.
- Dans la section Competences, le vert identifie aussi le domaine Data & IA, aux cotes du paprika pour Web & Automation et du Regal Navy pour MLOps & DevOps.
- Les gris neutres et couleurs exterieures a la palette doivent rester exceptionnels et justifies par la semantique ou l'accessibilite.

Dans l'interface, les roles sont stabilises ainsi :

- les titres de section et metadonnees techniques utilisent Regal Navy ;
- les actions principales et reperes prioritaires utilisent Spicy Paprika ;
- les titres de contenu et textes forts utilisent Rich Mahogany ou Coffee Bean ;
- les tags paprika partagent un fond `spicy-paprika-50/80`, une bordure gauche `spicy-paprika-400` et un texte `spicy-paprika-700` en mode clair.

## Typographie

### Space Grotesk

Police principale et editoriale :

- titres et sous-titres ;
- navigation ;
- paragraphes et contenus longs ;
- libelles qui doivent rester humains et immediatement lisibles.

### Intel One Mono

Police technique et fonctionnelle :

- dates et periodes ;
- technologies et tags ;
- statuts et metadonnees ;
- boutons courts et micro-informations techniques.

Intel One Mono doit apporter une touche geek et Data, sans etre utilisee pour de longs paragraphes.

## Style actuel a preserver

- Composition modulaire fondee sur une grille Bento rectiligne et structuree.
- Fonds en degrade chaud, avec une presence discrete du bleu technique.
- Cartes claires ou translucides avec bordures fines et ombres mesurees.
- Alternance clair/sombre basee sur Seashell et Coffee Bean.
- Iconographie technique simple et majoritairement monochrome.
- Homard comme signature personnelle et mascotte du chatbot.
- Contenu direct : parcours, disponibilite, competences, projets et contact.

## Langage visuel Bento

La grille Bento est le socle de la direction artistique, pas seulement une methode de mise en page. Elle doit evoquer a la fois un tableau de bord personnel, un espace de travail technique et une fiche de profil facile a parcourir.

### Geometrie

- Les compositions sont construites avec des rectangles et des carres clairement alignes sur une grille.
- Les cartes gardent une silhouette presque carree : les angles sont adoucis, mais jamais organiques ou excessivement arrondis.
- Les grands blocs servent a la narration et aux contenus prioritaires ; les petits blocs portent les statuts, chiffres, liens et metadonnees.
- Les espacements entre cartes sont reguliers afin de donner l'impression d'un systeme modulaire coherent.
- Les elements internes respectent les axes et alignements de leur carte plutot que de flotter librement.

Le rayon `rounded-xl` des cartes reste volontairement modere : il adoucit la grille sans supprimer son caractere rectiligne, carre et technique.

### Lecture de la grille

- Chaque carte doit pouvoir etre comprise comme un module autonome.
- Une carte repond a une seule question principale : qui, quoi, quand, avec quelle technologie ou avec quel resultat.
- Les variations de taille expriment une priorite reelle et non une simple decoration.
- La grille doit rester lisible comme un tableau de bord sur desktop et devenir une suite logique de modules sur mobile.

## Marqueurs tech, geek, Data et IA

L'identite technique repose sur des details sobres inspires du terminal, du code et des interfaces de monitoring. Ces marqueurs doivent rester comprehensibles pour un visiteur non technique.

### Intel One Mono comme voix du systeme

Intel One Mono represente la voix technique de l'interface. Elle est utilisee pour des libelles comme :

- `~ dev activity` ;
- `> projets recents` ;
- `$ disponible` ;
- `01 / EXPERIENCE` ;
- `2024 - 2026` ;
- `PYTHON`, `RAG`, `MLOPS` ;
- des valeurs, compteurs, statuts et metadonnees.

Les signes `~`, `>`, `$`, `/`, crochets et numerotations peuvent servir de ponctuation visuelle. Ils suggerent le terminal sans transformer le portfolio en imitation de console difficile a lire.

### Motifs et informations techniques

- Les graphiques d'activite, grilles de donnees, compteurs et lignes de statut renforcent l'image Data/IA lorsqu'ils transmettent une information reelle.
- Les technologies sont presentees comme des metadonnees courtes, jamais comme une accumulation de badges decoratifs.
- Regal Navy identifie les informations techniques ; Spicy Paprika signale l'action ou le point important.
- Les bordures fines, separateurs, index de section et petits labels monospace donnent l'impression d'un systeme construit et mesurable.
- Les icones restent simples, monochromes et alignees ; les illustrations generiques de robot ou de cerveau IA sont a eviter.

### Equilibre humain et technique

- Space Grotesk raconte : elle porte les phrases, explications et benefices concrets.
- Intel One Mono structure : elle porte les donnees, statuts, dates et reperes techniques.
- Le homard humanise l'ensemble et evite une interface froide ou interchangeable.
- Les references geek restent un second niveau de lecture : elles enrichissent l'experience d'un profil technique sans empecher un RH de comprendre le contenu principal.

## Formes

Le systeme utilise trois niveaux uniquement :

1. Cartes et surfaces principales : `rounded-xl` (`0.75rem`).
2. Boutons et actions : angles droits (`rounded-none`) pour une silhouette franche, carree et technique. Les champs et cadres internes utilisent `rounded-md` (`0.375rem`).
3. Cercles et pills : `rounded-full`, uniquement pour avatars, indicateurs de statut et tags courts.

Une forme doit exprimer sa fonction. Les grands rayons decoratifs (`rounded-2xl` et plus) ne sont pas utilises sans justification particuliere, car ils affaiblissent le caractere carre et modulaire du Bento.

Les tags ne doivent pas ressembler a des boutons : ils sont plus petits, en Intel One Mono, sans ombre, avec une bordure fine et un fond discret. Les pills sont reservees aux statuts ou valeurs dont la forme compacte porte un sens ; les technologies utilisent par defaut des etiquettes rectangulaires.

## Mouvement et interaction

- Les animations doivent aider a comprendre une interaction, jamais distraire du contenu.
- Les cartes Bento partagent un hover de `300 ms` associant une bordure Regal Navy et une elevation legere.
- Les interactions supplementaires restent possibles lorsqu'elles signalent une fonction particuliere, par exemple une carte projet cliquable.
- Les transformations fortes et animations permanentes sont a eviter.
- `prefers-reduced-motion` doit etre respecte pour tout mouvement non essentiel.

## Principes UX

- Le message principal et les actions essentielles doivent etre compris en quelques secondes.
- Chaque section doit posseder un objectif clair et un ordre de lecture evident.
- Le jargon technique doit etre accompagne d'un resultat ou d'une explication concrete.
- Les interactions clavier, les contrastes et les tailles tactiles font partie de la direction artistique.
- La version mobile n'est pas une reduction du desktop : la hierarchie doit rester claire sur petit ecran.

## Feuille de route validee et sequentielle

Chaque etape est implementee puis soumise a validation avant de commencer la suivante.

1. Unifier les formes.
2. Creer une vraie hierarchie Bento.
3. Simplifier les couleurs.
4. Repenser les titres de section.
5. Renforcer la premiere impression.
6. Uniformiser les interactions.
7. Alleger les competences.
8. Mieux presenter les experiences.
9. Ameliorer les projets.
10. Corriger les derniers points UX.

### Garanties UX finales

- Tous les liens, boutons et champs possedent un focus clavier visible en Spicy Paprika.
- Les ancres compensent la hauteur de la navigation fixe et le defilement fluide respecte `prefers-reduced-motion`.
- Les animations non essentielles sont neutralisees lorsque l'utilisateur demande moins de mouvement.
- Les zones tactiles prioritaires mesurent au moins `44 px`, notamment le menu mobile, les fermetures et le consentement.
- Les erreurs de formulaire sont reliees a leur champ, annoncees aux technologies d'assistance et le premier champ invalide recoit le focus.
- Les chargements et actions indisponibles exposent un etat explicite, visible et semantique.
- Les dialogues gerent le focus, proposent une fermeture au clavier avec `Echap` et annoncent leur role.
- Les carrousels interactifs restent utilisables au clavier ; les defilements automatiques sont coupes en mouvement reduit.

### Systeme de titres de section

Les sections editoriales utilisent toutes une structure a deux niveaux :

- un index et une categorie en Intel One Mono, par exemple `02 / PARCOURS` ;
- un titre principal francais en Space Grotesk, par exemple `Experience professionnelle`.

Les index suivent l'ordre de lecture de la page, de `01` a `06`. Le repere est en Spicy Paprika et le titre en Regal Navy afin de conserver les roles de couleur etablis a l'etape 3.

### Premiere impression

Le premier ecran doit communiquer en quelques secondes :

- le positionnement `Developpeur Data & IA` ;
- la valeur apportee : transformer des besoins metier en solutions d'intelligence artificielle, RAG et Data concretes ;
- la disponibilite professionnelle immediate ;
- une action principale pour telecharger le CV et une action secondaire pour le consulter ; le contact principal reste accessible dans la navigation.

Les informations biographiques et le detail du diplome restent dans les sections dediees afin de ne pas diluer ce message initial.

### Presentation des experiences

Les experiences conservent quatre cartes de dimensions uniformes. Chaque carte se lit dans le meme ordre : periode, poste, entreprise, contribution concrete puis technologies ou domaines mobilises. Les descriptions restent factuelles et les metadonnees techniques distinguent visuellement le parcours professionnel de la formation.

### Presentation des projets

Le carrousel d'accueil et la page complete partagent la meme hierarchie : image cadree, nom, probleme traite, technologies, date et destination explicite. Le projet principal garde la meme taille que les autres et se distingue uniquement par un libelle monospace. Les liens indiquent leur nature : depot, demonstration ou produit accessible.

## Regle de contribution

Avant toute modification visuelle, verifier la palette, la typographie, le niveau de forme et la lisibilite pour les trois publics cibles. Ne pas anticiper une etape de la feuille de route qui n'a pas encore ete validee.
