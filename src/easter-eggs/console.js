// Signature affichee dans la console du navigateur. Les developpeurs et une
// partie des recruteurs techniques ouvrent les devtools sur un portfolio : autant
// y laisser quelque chose plutot qu'une console vide.
import { lobsterWithIdentity } from './lobster.js';

export const printConsoleSignature = () => {
  // line-height 1.2 : le dessin est calcule pour ce rapport (voir lobster.js).
  const paprika = 'color:#e65a28;font-weight:bold;line-height:1.2;font-family:ui-monospace,SFMono-Regular,Menlo,monospace';
  const muted = 'color:#a95a3d';
  const accent = 'color:#e65a28;font-weight:bold';

  console.log(`%c${lobsterWithIdentity().join('\n')}`, paprika);
  console.log(
    '%cTu regardes la console. On devrait se parler : %chttps://valentin-fiess.fr/#contact',
    muted,
    accent,
  );
  console.log('%cCtrl+K (ou ~) ouvre un vrai terminal sur ce site.', muted);
};
