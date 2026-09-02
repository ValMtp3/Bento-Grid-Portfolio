// Commandes du terminal. Separees du composant pour rester testables et pour que
// l'ajout d'une commande ne touche pas au rendu.
//
// Une commande renvoie une liste de lignes. Une ligne est soit une chaine, soit
// { text, tone }, soit { parts: [{ text, tone }] } pour colorer plusieurs
// segments, soit { effect } pour demander une action au composant.
import { projetsFeatured } from '@/data/projets.js';
import { LOBSTER, lobsterWithIdentity } from './lobster.js';

const PAGES = {
  '/': { label: 'accueil', type: 'dir' },
  '/projets': { label: 'projets', type: 'dir' },
  '/projets/raguia': { label: 'raguia', type: 'dir' },
  '/stack': { label: 'stack', type: 'dir' },
  '/chatbot': { label: 'chatbot', type: 'dir' },
  '/legal': { label: 'legal', type: 'dir' },
  '/policy': { label: 'policy', type: 'dir' },
};

const ALIASES = {
  '~': '/',
  accueil: '/',
  home: '/',
  projets: '/projets',
  raguia: '/projets/raguia',
  stack: '/stack',
  chatbot: '/chatbot',
  legal: '/legal',
  policy: '/policy',
};

const LINKS = {
  github: 'https://github.com/ValMtp3',
  linkedin: 'https://www.linkedin.com/in/valentin-fiess/',
};

const CV = '/assets/assets_index/CV_Valentin_Fiess.pdf';

const err = (text) => ({ text, tone: 'error' });
const dim = (text) => ({ text, tone: 'dim' });

// Resout un argument de `cd` en chemin de route : alias, chemin absolu, ou `..`.
const resolvePath = (target, current) => {
  if (!target || target === '~' || target === '/') return '/';
  if (target === '..') {
    const parent = current.slice(0, current.lastIndexOf('/'));
    return parent || '/';
  }
  if (ALIASES[target]) return ALIASES[target];
  const absolute = target.startsWith('/') ? target : `${current === '/' ? '' : current}/${target}`;
  return PAGES[absolute] ? absolute : null;
};

export const COMMANDS = {
  help: {
    summary: 'liste les commandes',
    run: () => [
      dim('Commandes disponibles :'),
      '',
      ...Object.entries(COMMANDS).map(([name, cmd]) => ({
        parts: [
          { text: `  ${name.padEnd(11)}`, tone: 'cmd' },
          { text: cmd.summary, tone: 'dim' },
        ],
      })),
      '',
      dim('tab complete · ↑↓ historique · ctrl+l efface · ctrl+c annule · echap ferme'),
    ],
  },
  whoami: {
    summary: 'qui je suis',
    run: () => [
      'valentin fiess',
      'ingenieur ia / data — shaarp, montpellier',
      'rag · llm · mlops · python',
      '',
      dim("`projets` liste ce que je construis, `neofetch` donne la fiche complete."),
    ],
  },
  neofetch: {
    summary: 'la fiche systeme',
    run: () => lobsterWithIdentity(),
  },
  ls: {
    summary: 'liste les pages',
    run: (args, ctx) => {
      const here = ctx.path;
      const children = Object.keys(PAGES).filter(
        (path) => path !== here && path.startsWith(here === '/' ? '/' : `${here}/`),
      );
      const entries = here === '/' ? Object.keys(PAGES).filter((p) => p !== '/') : children;
      if (!entries.length) return [dim('(rien ici)')];
      return [
        {
          parts: entries.map((path) => ({
            text: `${PAGES[path].label}/  `,
            tone: 'path',
          })),
        },
      ];
    },
  },
  cd: {
    summary: 'cd <page> — change de page',
    run: (args, ctx) => {
      const path = resolvePath(args[0], ctx.path);
      if (!path) return [err(`cd: ${args[0]} : dossier introuvable`)];
      if (path === ctx.path) return [];
      return [{ effect: 'navigate', path, keepOpen: true }];
    },
  },
  cat: {
    summary: 'cat cv — telecharge le CV',
    run: (args) => {
      if (args[0] === 'cv') return [{ effect: 'download', href: CV }, dim('cv_valentin_fiess.pdf')];
      if (!args[0]) return [err('cat: operande manquante')];
      return [err(`cat: ${args[0]} : aucun fichier de ce type`)];
    },
  },
  projets: {
    summary: 'les projets mis en avant',
    run: () => [
      ...projetsFeatured.map((project) => ({
        parts: [
          { text: `  ${project.date.padEnd(16)}`, tone: 'dim' },
          { text: project.name.padEnd(20), tone: 'cmd' },
          { text: project.technos.slice(0, 3).join(' · '), tone: 'path' },
        ],
      })),
      '',
      dim('`cd projets` pour la page, `cd raguia` pour l’etude de cas.'),
    ],
  },
  open: {
    summary: 'open <github|linkedin>',
    run: (args) => {
      const href = LINKS[args[0]];
      if (!href) return [err(`open: ${args[0] ?? ''} : cible inconnue (github, linkedin)`)];
      return [{ effect: 'external', href }, dim(href)];
    },
  },
  contact: {
    summary: 'ouvre le formulaire de contact',
    run: () => [{ effect: 'navigate', path: '/', hash: '#contact' }],
  },
  hire: {
    summary: 'la vraie raison de ce terminal',
    run: () => [
      'poste recherche : ingenieur ia / data.',
      'en poste chez shaarp, ouvert aux conversations.',
      '',
      { effect: 'navigate', path: '/', hash: '#contact' },
    ],
  },
  pwd: {
    summary: 'affiche la page courante',
    run: (args, ctx) => [ctx.path],
  },
  echo: {
    summary: 'echo <texte>',
    run: (args) => [args.join(' ')],
  },
  history: {
    summary: 'les commandes deja tapees',
    run: (args, ctx) =>
      ctx.history.length
        ? ctx.history.map((entry, index) => `  ${String(index + 1).padStart(3)}  ${entry}`)
        : [dim('(historique vide)')],
  },
  sudo: {
    summary: 'non',
    run: () => [err('valentin is not in the sudoers file. this incident will be reported.')],
  },
  homard: {
    summary: 'le homard',
    run: () => [
      ...LOBSTER,
      '',
      dim("mascotte du site — clique-le cinq fois sur l'accueil."),
    ],
  },
  clear: {
    summary: "efface l'ecran",
    run: () => [{ effect: 'clear' }],
  },
  exit: {
    summary: 'ferme le terminal',
    run: () => [{ effect: 'close' }],
  },
};

export const runCommand = (raw, ctx) => {
  const [name, ...args] = raw.trim().split(/\s+/);
  const command = COMMANDS[name.toLowerCase()];
  if (!command) {
    return { lines: [err(`homard: command not found: ${name}`)], status: 127 };
  }
  return { lines: command.run(args, ctx), status: 0 };
};

// Completion : le premier mot sur les commandes, le second sur les cibles connues
// de la commande tapee.
export const completeCommand = (raw) => {
  const trimmed = raw.replace(/^\s+/, '');
  const [name, ...rest] = trimmed.split(/\s+/);

  if (!trimmed.includes(' ')) {
    const candidates = Object.keys(COMMANDS).filter((key) => key.startsWith(name.toLowerCase()));
    if (candidates.length === 1) return { value: `${candidates[0]} `, candidates: [] };
    return { value: raw, candidates };
  }

  const pool = name === 'open' ? Object.keys(LINKS) : name === 'cat' ? ['cv'] : Object.keys(ALIASES);
  const partial = rest.join(' ');
  const candidates = pool.filter((entry) => entry.startsWith(partial.toLowerCase()));
  if (candidates.length === 1) return { value: `${name} ${candidates[0]}`, candidates: [] };
  return { value: raw, candidates };
};
