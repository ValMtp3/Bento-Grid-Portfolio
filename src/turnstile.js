const TURNSTILE_SCRIPT_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js';

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
