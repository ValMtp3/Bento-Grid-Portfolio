// Habillage de deep-chat aux couleurs et au rythme du site.
//
// deep-chat s'affiche dans un shadow DOM : c'est une boite fermee, ou ni les
// classes Tailwind ni le CSS du site n'entrent. Tout se passe donc par objets
// JavaScript et par une feuille de style injectee, et la charte est recopiee ici
// a la main depuis tailwind.css. Le theme sombre ne peut pas non plus s'appuyer
// sur la classe `.dark` de <html> : il est pilote par le drapeau `isDark`.
//
// Le vocabulaire visuel est celui du reste du portfolio, pas un style invente
// pour l'occasion :
//   - surfaces arrondies facon `.bento-cell` (rounded-xl, bordure fine, ombre
//     discrete), et non des coins droits ;
//   - metadonnees en `font-code` 10px capitales tres espacees, comme les
//     etiquettes `$ En poste` des cellules du bento ;
//   - une seule courbe d'animation, cubic-bezier(0.22, 1, 0.36, 1), celle que
//     tailwind.css utilise pour reveal-rise, stat-reveal et bar-grow ;
//   - degrades a 135 degres, l'angle du fond du site.

// Charte du site, reprise de tailwind.css. Toute couleur utilisee plus bas doit
// venir de cette table : c'est ce que verifie styles.test.mjs.
const PALETTE = {
  blush50: '#fff1ea',
  blush100: '#fde5da',
  blush200: '#f9cdbd',
  blush300: '#f2a98e',
  coffee100: '#f4d7cb',
  coffee200: '#e6b49f',
  coffee600: '#532015',
  coffee700: '#35130c',
  coffee800: '#210a05',
  coffee900: '#160703',
  coffee950: '#120602',
  navy300: '#7aa7ef',
  navy400: '#4c82df',
  navy500: '#2b5fad',
  navy600: '#1c4d96',
  navy700: '#123b7d',
  navy800: '#0d2c60',
  paprika300: '#f1885b',
  paprika500: '#e65a28',
  paprika600: '#c8461b',
  white: '#ffffff',
};

const HEADING_FONT = "'Space Grotesk', sans-serif";
const CODE_FONT = "'Intel One Mono', monospace";

// La courbe d'animation du site. Une seule pour tout le portfolio : c'est ce qui
// fait qu'une interface parait tenue plutot qu'assemblee.
const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

// Rayon des bulles. La carte qui les contient est en rounded-xl (12px) ; a
// l'interieur d'un padding de 12px, 12px sur la bulle garde les arrondis
// concentriques plutot que de les faire se contrarier.
const BUBBLE_RADIUS = '12px';
// Le coin cote interlocuteur est reduit : c'est ce qui donne a une bulle son
// orientation, sans recourir a une pointe dessinee.
const BUBBLE_TAIL_RADIUS = '4px';

// Le homard du site, en SVG : deep-chat attend une image, pas un caractere.
const LOBSTER_AVATAR = `data:image/svg+xml;utf8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><text x="50%" y="30" font-size="26" text-anchor="middle">🦞</text></svg>',
)}`;

const themeOf = (isDark) =>
  isDark
    ? {
        surface: PALETTE.coffee950,
        // Surface en verre, comme `.bento-cell` en theme sombre : un voile clair
        // tres peu opaque plutot qu'un gris pose par-dessus le fond.
        aiBubble: `${PALETTE.blush50}12`,
        aiBorder: `${PALETTE.blush50}1f`,
        aiText: PALETTE.blush100,
        userBubble: `linear-gradient(135deg, ${PALETTE.navy700} 0%, ${PALETTE.navy800} 100%)`,
        userBorder: `${PALETTE.navy400}4d`,
        userText: PALETTE.blush50,
        inputSurface: `${PALETTE.coffee900}99`,
        inputBorder: PALETTE.coffee700,
        inputFocusBorder: PALETTE.navy400,
        submitSurface: PALETTE.navy700,
        inputText: PALETTE.blush100,
        meta: PALETTE.navy300,
        muted: PALETTE.blush200,
        link: PALETTE.navy300,
        accent: PALETTE.paprika300,
        accentStrong: PALETTE.paprika300,
        codeSurface: `${PALETTE.coffee950}b3`,
        shadow: `0 1px 2px ${PALETTE.coffee950}59`,
        shadowRaised: `0 6px 16px ${PALETTE.coffee950}80`,
        hoverBorder: PALETTE.navy600,
        avatarSurface: `${PALETTE.paprika300}1f`,
        avatarBorder: `${PALETTE.paprika300}4d`,
        scrollThumb: `${PALETTE.blush50}26`,
      }
    : {
        surface: PALETTE.blush50,
        aiBubble: PALETTE.white,
        aiBorder: PALETTE.coffee100,
        aiText: PALETTE.coffee700,
        userBubble: `linear-gradient(135deg, ${PALETTE.navy500} 0%, ${PALETTE.navy600} 100%)`,
        userBorder: `${PALETTE.navy700}33`,
        userText: PALETTE.white,
        inputSurface: PALETTE.white,
        inputBorder: PALETTE.coffee200,
        inputFocusBorder: PALETTE.navy700,
        submitSurface: PALETTE.navy500,
        inputText: PALETTE.coffee700,
        meta: PALETTE.navy600,
        muted: PALETTE.coffee600,
        link: PALETTE.navy700,
        accent: PALETTE.paprika500,
        accentStrong: PALETTE.paprika600,
        codeSurface: PALETTE.blush50,
        shadow: `0 1px 2px ${PALETTE.coffee950}14`,
        shadowRaised: `0 6px 16px ${PALETTE.coffee950}1f`,
        hoverBorder: PALETTE.navy300,
        avatarSurface: `${PALETTE.paprika500}14`,
        avatarBorder: `${PALETTE.paprika500}40`,
        scrollThumb: `${PALETTE.coffee200}cc`,
      };

// Bulle en cours d'ecriture : la derniere du fil, et surtout pas la bulle
// d'attente aux trois points, qui partage la meme classe.
const STREAMING_BUBBLE =
  ':host(.streaming) .outer-message-container:last-child .ai-message-text:not(.deep-chat-loading-message-bubble)';

// Dernier bloc de texte d'une reponse, aux deux profondeurs possibles : enfant
// direct de la bulle, ou enfant de la derniere enveloppe posee par partialRender.
const cursorTargets = ['', ' > .partial-render-message:last-child'].flatMap((wrapper) => [
  `${wrapper} > p:last-child`,
  `${wrapper} > h1:last-child`,
  `${wrapper} > h2:last-child`,
  `${wrapper} > h3:last-child`,
  `${wrapper} > h4:last-child`,
  `${wrapper} > ul:last-child > li:last-child`,
  `${wrapper} > ol:last-child > li:last-child`,
  `${wrapper} > blockquote:last-child > p:last-child`,
]);

// Le shadow DOM impose de redecrire ici tout ce que le CSS du site apporte
// ailleurs : la typographie des reponses Markdown, l'anneau de focus, les
// transitions, et les animations d'entree.
const auxiliaryStyleFor = (theme, isWidget) => `
  .message-bubble {
    font-family: ${HEADING_FONT};
    line-height: 1.62;
    overflow-wrap: anywhere;
    /* Evite les lignes orphelines d'un seul mot en fin de paragraphe. */
    text-wrap: pretty;
    box-shadow: ${theme.shadow};
  }

  /* Entree d'un message : montee courte et fondu, la meme que reveal-rise
     dans tailwind.css. Elle porte sur le conteneur, cree une seule fois par
     message, et non sur le texte qui se remplit caractere par caractere. */
  @keyframes chat-message-in {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .outer-message-container {
    animation: chat-message-in 0.42s ${EASE} backwards;
  }

  .inner-message-container { width: calc(100% - ${isWidget ? '18px' : '28px'}); }

  /* Entree du panneau d'accueil. Les trois suggestions sont les trois derniers
     enfants du panneau : les compter par la fin donne la cascade sans avoir a
     numeroter les classes. */
  @keyframes chat-intro-in {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .chat-intro-suggestion:nth-last-child(3) { animation-delay: 120ms; }
  .chat-intro-suggestion:nth-last-child(2) { animation-delay: 190ms; }
  .chat-intro-suggestion:nth-last-child(1) { animation-delay: 260ms; }
  .chat-intro-suggestion:hover .chat-intro-arrow { transform: translateX(3px); }

  @media (prefers-reduced-motion: reduce) {
    .chat-intro,
    .chat-intro-lobster,
    .chat-intro-label,
    .chat-intro-text,
    .chat-intro-suggestion { animation: none; }
    .chat-intro-suggestion:hover .chat-intro-arrow { transform: none; }
  }

  .message-bubble p { margin: 0 0 0.8rem; }
  .message-bubble p:last-child { margin-bottom: 0; }
  .message-bubble h1,
  .message-bubble h2,
  .message-bubble h3,
  .message-bubble h4 {
    margin: 1.1rem 0 0.5rem;
    font-family: ${HEADING_FONT};
    font-weight: 700;
    line-height: 1.25;
    text-wrap: balance;
  }
  .message-bubble h1:first-child,
  .message-bubble h2:first-child,
  .message-bubble h3:first-child,
  .message-bubble h4:first-child { margin-top: 0; }
  .message-bubble h1 { font-size: 1.15em; }
  .message-bubble h2 { font-size: 1.08em; }
  .message-bubble h3,
  .message-bubble h4 { font-size: 1.02em; }
  .message-bubble ul,
  .message-bubble ol { margin: 0.3rem 0 0.85rem; padding-left: 1.3rem; }
  .message-bubble li { margin: 0.26rem 0; padding-left: 0.1rem; }
  .message-bubble li::marker { color: ${theme.accent}; font-weight: 700; }
  .message-bubble a {
    color: ${theme.link};
    font-weight: 600;
    text-decoration: underline;
    text-decoration-thickness: 0.08em;
    text-underline-offset: 0.18em;
    transition: color 0.2s ease;
  }
  .message-bubble a:hover { color: ${theme.accentStrong}; }
  .message-bubble code {
    padding: 0.1rem 0.32rem;
    border-radius: 4px;
    background-color: ${theme.codeSurface};
    border: 1px solid ${theme.aiBorder};
    font-family: ${CODE_FONT};
    font-size: 0.86em;
  }
  .message-bubble pre {
    margin: 0.8rem 0;
    padding: 0.8rem;
    border-radius: 8px;
    background-color: ${theme.codeSurface};
    border: 1px solid ${theme.aiBorder};
    overflow-x: auto;
  }
  .message-bubble pre code { padding: 0; border: none; background: transparent; }
  .message-bubble blockquote {
    /* Filet a gauche, comme les etiquettes .tag du site. */
    margin: 0.8rem 0;
    padding: 0.5rem 0.8rem;
    border-left: 2px solid ${theme.accent};
    color: ${theme.muted};
  }
  .message-bubble table {
    display: block;
    width: 100%;
    overflow-x: auto;
    border-collapse: collapse;
    font-size: 0.9em;
  }
  .message-bubble th,
  .message-bubble td {
    padding: 0.42rem 0.6rem;
    border: 1px solid ${theme.aiBorder};
    text-align: left;
  }

  .avatar {
    border-radius: 6px;
    background-color: ${theme.avatarSurface};
    border: 1px solid ${theme.avatarBorder};
    padding: 2px;
    transition: transform 0.3s ${EASE};
  }
  .outer-message-container:last-child .avatar { transform: rotate(-6deg); }

  /* Curseur de frappe. Deux pieges evites ici :
     - la bulle d'attente porte elle aussi la classe .ai-message-text : sans
       l'exclure, le curseur s'affichait tout seul sous les trois points ;
     - pose sur la bulle, un ::after tombe APRES le <p> du Markdown, donc a la
       ligne. Il doit s'accrocher au dernier bloc de texte pour rester colle au
       dernier caractere. partialRender ajoutant un niveau d'enveloppe, les
       deux profondeurs sont visees. */
${cursorTargets
  .map((target) => `  ${STREAMING_BUBBLE} ${target}::after`)
  .join(',\n')} {
    content: '';
    display: inline-block;
    width: 0.1em;
    min-width: 2px;
    height: 1.05em;
    margin-left: 0.12em;
    vertical-align: -0.16em;
    background: ${theme.accent};
    animation: chat-cursor 0.9s steps(2, start) infinite;
  }
  @keyframes chat-cursor { 50% { opacity: 0; } }

  /* Champ de saisie : meme comportement que .form-field du site, ou la
     bordure seule signale le focus. */
  #text-input-container {
    transition-property: border-color, box-shadow;
    transition-duration: 0.25s;
    transition-timing-function: ease-out;
  }
  #text-input-container:focus-within {
    border-color: ${theme.inputFocusBorder} !important;
    box-shadow: ${theme.shadow};
  }

  /* Anneau de focus du site, pour que la navigation au clavier reste lisible a
     l'interieur du composant. */
  :focus-visible {
    outline: 3px solid ${theme.accent};
    outline-offset: 2px;
  }

  .input-button {
    transition-property: transform, background-color, opacity;
    transition-duration: 0.18s;
    transition-timing-function: ease-out;
  }
  .input-button:active { transform: scale(0.94); }

  /* Attente d'une reponse. deep-chat fait rebondir trois pastilles rondes ; on
     reprend a la place la respiration des indicateurs du site, et leur forme
     carree. Seule l'opacite est animee : les deux points lateraux sont des
     pseudo-elements positionnes par rapport au premier, une mise a l'echelle
     du parent les emporterait avec elle.

     !important est necessaire ici, et seulement ici : ces regles reprennent une
     animation que la librairie declare pour elle-meme. */
  .loading-message-dots,
  .loading-message-dots:before,
  .loading-message-dots:after {
    border-radius: 0 !important;
    animation-name: chat-breathe !important;
    animation-duration: 1.5s !important;
    animation-timing-function: ${EASE} !important;
    animation-direction: normal !important;
  }
  .loading-message-dots { animation-delay: 0.18s !important; }
  .loading-message-dots:before { animation-delay: 0s !important; }
  .loading-message-dots:after { animation-delay: 0.36s !important; }

  @keyframes chat-breathe {
    0%, 100% { opacity: 0.22; }
    50% { opacity: 1; }
  }

  /* Telephones : la place manque, on rend au texte tout ce qui peut l'etre. */
  @media (max-width: 640px) {
    .message-bubble {
      max-width: 94% !important;
      padding: 0.55rem 0.72rem !important;
      font-size: 0.86rem !important;
    }
    .inner-message-container { width: calc(100% - 10px); }
    .avatar { width: 1.25em; height: 1.25em; }
    .avatar-container { margin-top: 7px; }
    .message-bubble pre { padding: 0.6rem; }
  }

  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb {
    background-color: ${theme.scrollThumb};
    border-radius: 3px;
  }

  /* Le site coupe toutes les animations quand le systeme le demande ; le shadow
     DOM ne recoit pas cette regle, elle est donc rejouee ici. */
  @media (prefers-reduced-motion: reduce) {
    .outer-message-container { animation: none; }
    .loading-message-dots,
    .loading-message-dots:before,
    .loading-message-dots:after {
      animation: none !important;
      opacity: 0.7;
    }
${cursorTargets
  .map((target) => `    ${STREAMING_BUBBLE} ${target}::after`)
  .join(',\n')} {
      animation: none;
    }
    .avatar,
    .input-button,
    #text-input-container,
    .message-bubble a { transition: none; }
    .outer-message-container:last-child .avatar { transform: none; }
  }
`;

/**
 * Construit les proprietes d'habillage de deep-chat.
 *
 * @param {object} options
 * @param {boolean} options.isDark - theme sombre reellement affiche.
 * @param {'page' | 'widget'} [options.variant] - le widget dispose de moins de place.
 */
export const buildChatStyles = ({ isDark, variant = 'page' }) => {
  const theme = themeOf(isDark);
  const isWidget = variant === 'widget';

  return {
    style: {
      // deep-chat naît en `display: table-cell` de 350x320 px : on le ramene a
      // un bloc qui remplit la boite que le parent lui reserve.
      display: 'block',
      width: '100%',
      height: '100%',
      border: 'none',
      borderRadius: '0px',
      backgroundColor: theme.surface,
      fontFamily: HEADING_FONT,
    },
    messageStyles: {
      default: {
        shared: {
          bubble: {
            maxWidth: isWidget ? '92%' : '82%',
            padding: isWidget ? '0.6rem 0.8rem' : '0.7rem 0.95rem',
            fontSize: isWidget ? '0.85rem' : '0.94rem',
            marginTop: isWidget ? '8px' : '12px',
            borderRadius: BUBBLE_RADIUS,
          },
        },
        ai: {
          bubble: {
            background: theme.aiBubble,
            color: theme.aiText,
            border: `1px solid ${theme.aiBorder}`,
            borderBottomLeftRadius: BUBBLE_TAIL_RADIUS,
          },
        },
        user: {
          bubble: {
            background: theme.userBubble,
            color: theme.userText,
            border: `1px solid ${theme.userBorder}`,
            borderBottomRightRadius: BUBBLE_TAIL_RADIUS,
          },
        },
      },
      loading: {
        bubble: {
          background: theme.aiBubble,
          // deep-chat derive la couleur des trois points de celle-ci.
          color: theme.meta,
          border: `1px solid ${theme.aiBorder}`,
          borderBottomLeftRadius: BUBBLE_TAIL_RADIUS,
        },
      },
    },
    avatars: {
      default: { styles: { position: 'start' } },
      ai: { src: LOBSTER_AVATAR },
      user: { styles: { container: { display: 'none' } } },
    },
    // Pas de noms dans le fil. deep-chat les place EN LIGNE, a cote de la bulle
    // (.inner-message-container est en flex) : "$ VALENTIN CHATBOT" en capitales
    // espacees passait sur deux lignes et prenait pres de la moitie de la
    // largeur utile, au detriment du texte. L'identite est deja portee par
    // l'en-tete et par le homard. La librairie teste cette propriete pour sa
    // seule valeur de verite, donc `false` la desactive.
    names: false,
    textInput: {
      placeholder: { text: 'Posez votre question…', style: { color: theme.muted } },
      styles: {
        container: {
          backgroundColor: theme.inputSurface,
          border: `1px solid ${theme.inputBorder}`,
          borderRadius: '8px',
          color: theme.inputText,
          fontFamily: HEADING_FONT,
          // deep-chat pose par defaut une ombre portee large et une largeur de
          // 80% : ni l'une ni l'autre ne vont avec la sobriete du site.
          boxShadow: 'none',
          width: isWidget ? '94%' : '93%',
          marginTop: '0.55em',
          marginBottom: '0.55em',
        },
        text: {
          color: theme.inputText,
          fontSize: isWidget ? '0.85rem' : '0.92rem',
          padding: '0.5em 0.6em',
        },
      },
    },
    inputAreaStyle: {
      backgroundColor: theme.surface,
      borderTop: `1px solid ${theme.aiBorder}`,
      padding: isWidget ? '0.2rem 0.4rem' : '0.35rem 0.6rem',
    },
    submitButtonStyles: {
      submit: {
        container: {
          default: {
            backgroundColor: theme.submitSurface,
            borderRadius: '7px',
            boxShadow: theme.shadow,
          },
          hover: { backgroundColor: theme.accent },
          click: { backgroundColor: theme.accentStrong },
        },
        svg: { styles: { default: { filter: 'brightness(0) invert(1)' } } },
      },
      loading: {
        container: { default: { backgroundColor: 'transparent', boxShadow: 'none' } },
      },
      stop: {
        container: {
          default: { backgroundColor: theme.accent, borderRadius: '7px' },
          hover: { backgroundColor: theme.accentStrong },
        },
        svg: { styles: { default: { filter: 'brightness(0) invert(1)' } } },
      },
    },
    auxiliaryStyle: auxiliaryStyleFor(theme, isWidget),
  };
};

/**
 * Habillage du panneau d'accueil affiche avant le premier message : le homard,
 * l'etiquette, la phrase d'accueil et les trois suggestions cliquables.
 *
 * Separe de buildChatStyles parce que deep-chat le consomme par une autre
 * propriete (`htmlClassUtilities`), mais soumis a la meme charte.
 *
 * Les suggestions reprennent le comportement de `.bento-cell` : bordure qui
 * passe au bleu et carte qui monte d'un pixel et demi au survol.
 *
 * @param {boolean} isDark
 */
export const buildIntroPanelStyles = (isDark) => {
  const theme = themeOf(isDark);
  const entrance = `chat-intro-in 0.5s ${EASE} backwards`;

  return {
    'chat-intro': {
      styles: {
        default: {
          padding: '1.4rem 1.1rem',
          maxWidth: '22rem',
          textAlign: 'center',
          color: theme.aiText,
          animation: entrance,
        },
      },
    },
    'chat-intro-lobster': {
      styles: { default: { fontSize: '2.1rem', lineHeight: '1', marginBottom: '0.6rem' } },
    },
    'chat-intro-label': {
      // L'etiquette des titres de section du site : capitales tres espacees,
      // en petite fonte a chasse fixe.
      styles: {
        default: {
          marginBottom: '0.5rem',
          fontFamily: CODE_FONT,
          fontSize: '10px',
          fontWeight: '600',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: theme.accent,
        },
      },
    },
    'chat-intro-text': {
      styles: {
        default: {
          marginBottom: '1.1rem',
          fontSize: '0.82rem',
          lineHeight: '1.6',
          textWrap: 'pretty',
          color: theme.muted,
        },
      },
    },
    'chat-intro-suggestion': {
      styles: {
        default: {
          display: 'flex',
          alignItems: 'center',
          gap: '0.55rem',
          marginTop: '0.5rem',
          padding: '0.58rem 0.8rem',
          borderRadius: '10px',
          border: `1px solid ${theme.aiBorder}`,
          background: theme.aiBubble,
          boxShadow: theme.shadow,
          color: theme.aiText,
          fontSize: '0.82rem',
          textAlign: 'left',
          cursor: 'pointer',
          transitionProperty: 'transform, border-color, box-shadow',
          transitionDuration: '300ms',
          transitionTimingFunction: EASE,
          animation: entrance,
        },
        hover: {
          borderColor: theme.hoverBorder,
          boxShadow: theme.shadowRaised,
          transform: 'translateY(-1.5px)',
        },
        click: { transform: 'translateY(0)' },
      },
    },
    'chat-intro-arrow': {
      styles: {
        default: {
          color: theme.accent,
          fontFamily: CODE_FONT,
          pointerEvents: 'none',
          transition: `transform 0.3s ${EASE}`,
        },
      },
    },
    'chat-intro-suggestion-text': { styles: { default: { pointerEvents: 'none' } } },
  };
};
