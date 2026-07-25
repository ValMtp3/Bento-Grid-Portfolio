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

export const loadTurnstile = () => {
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
 */
export const renderTurnstile = async (container, tokenRef) => {
  try {
    const turnstile = await loadTurnstile();
    if (!container.value) return;

    turnstile.render(container.value, {
      sitekey: TURNSTILE_SITE_KEY,
      theme: 'auto',
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
  }
};
