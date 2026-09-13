const TURNSTILE_SCRIPT_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
// Cle de test publique Cloudflare : evite un widget casse en developpement local.
const TURNSTILE_TEST_SITE_KEY = '1x00000000000000000000AA';

const isLocalHost = () =>
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.startsWith('192.168.'));

const TURNSTILE_SITE_KEY = isLocalHost()
  ? TURNSTILE_TEST_SITE_KEY
  : import.meta.env.VITE_TURNSTILE_SITE_KEY || 'YOUR_SITE_KEY';

let turnstilePromise;

const loadTurnstile = () => {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (turnstilePromise) return turnstilePromise;

  turnstilePromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector('script[data-turnstile-script]');
    const script = existingScript || document.createElement('script');

    const handleLoad = () => {
      if (window.turnstile) {
        resolve(window.turnstile);
      } else {
        turnstilePromise = undefined;
        reject(new Error('Turnstile chargé sans API disponible'));
      }
    };
    const handleError = () => {
      turnstilePromise = undefined;
      reject(new Error('Impossible de charger Turnstile'));
    };

    script.addEventListener('load', handleLoad, { once: true });
    script.addEventListener('error', handleError, { once: true });

    if (!existingScript) {
      script.src = TURNSTILE_SCRIPT_URL;
      script.async = true;
      script.defer = true;
      script.dataset.turnstileScript = 'true';
      document.head.appendChild(script);
    }
  });

  return turnstilePromise;
};

/**
 * Monte le widget Turnstile dans un conteneur et pousse le token dans une ref.
 * Le token repasse a null a l'expiration ou en cas d'erreur, ce qui redesactive
 * le formulaire appelant.
 *
 * `appearance` vaut 'always' par defaut : le cadre reste visible, comme sur le
 * formulaire de contact. Le chatbot demande 'interaction-only', qui ne montre
 * le cadre que si Cloudflare reclame vraiment une action au visiteur.
 *
 * @param {import('vue').Ref<HTMLElement | null>} container
 * @param {import('vue').Ref<string | null>} tokenRef
 * @param {{ appearance?: 'always' | 'execute' | 'interaction-only' }} [options]
 */
export const renderTurnstile = async (container, tokenRef, { appearance = 'always' } = {}) => {
  try {
    const turnstile = await loadTurnstile();
    if (!container.value) return null;

    return turnstile.render(container.value, {
      sitekey: TURNSTILE_SITE_KEY,
      theme: 'auto',
      appearance,
      callback: (token) => {
        tokenRef.value = token;
      },
      'expired-callback': () => {
        tokenRef.value = null;
      },
      'error-callback': () => {
        tokenRef.value = null;
      },
    });
  } catch (error) {
    console.warn('Turnstile:', error.message);
    return null;
  }
};

/**
 * Libere un widget Turnstile. A appeler au demontage du composant qui l'a monte :
 * sans cela, chaque ouverture du chatbot laisse derriere elle une instance
 * enregistree cote Cloudflare, qui n'est jamais reclamee.
 *
 * @param {string | null | undefined} widgetId - l'identifiant rendu par renderTurnstile.
 */
export const removeTurnstile = (widgetId) => {
  if (!widgetId || !window.turnstile) return;

  try {
    window.turnstile.remove(widgetId);
  } catch (error) {
    // Widget deja retire, ou script decharge : rien a reparer, mais la trace
    // reste utile si le comportement devenait suspect.
    console.warn('Turnstile:', error.message);
  }
};
