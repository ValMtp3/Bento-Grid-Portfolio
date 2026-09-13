const MATOMO_HOST = 'https://analytics.valentin-fiess.fr';
const MATOMO_SITE_ID = 1;
export const MATOMO_CONSENT_KEY = 'cookiesAccepted';
const ALLOWED_QUERY_PARAMETERS = new Set([
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
]);
const SCROLL_MILESTONES = [50, 90];
const PAGE_TYPES = {
  '/': 'home',
  '/projets': 'projects',
  '/projets/raguia': 'case_study_raguia',
  '/chatbot': 'chatbot',
  '/stack': 'stack',
  '/legal': 'legal',
  '/policy': 'privacy_policy',
  '/justice': 'justice',
};

function getQueue() {
  window._paq = window._paq || [];
  return window._paq;
}

function hasConsent() {
  return localStorage.getItem(MATOMO_CONSENT_KEY) === 'true';
}

function getSafeUrl(path) {
  const url = new URL(path, window.location.origin);
  for (const parameter of [...url.searchParams.keys()]) {
    if (!ALLOWED_QUERY_PARAMETERS.has(parameter)) {
      url.searchParams.delete(parameter);
    }
  }
  return url;
}

function getPageType(path) {
  const { pathname } = new URL(path, window.location.origin);
  return PAGE_TYPES[pathname] || 'not_found';
}

export function trackMatomoEvent(category, action, name) {
  if (!hasConsent()) return false;
  getQueue().push(['trackEvent', category, action, name]);
  return true;
}

export function trackMatomoPageView(path = window.location.pathname + window.location.search) {
  if (!hasConsent()) return false;
  const url = getSafeUrl(path).href;
  const queue = getQueue();

  queue.push(['setCustomUrl', url]);
  queue.push(['setDocumentTitle', document.title]);
  queue.push(['trackPageView']);
  return true;
}

export function rememberMatomoConsent() {
  getQueue().push(['rememberConsentGiven', 8760]);
}

export function forgetMatomoConsent() {
  getQueue().push(['forgetConsentGiven']);
}

export function initMatomo(router) {
  const queue = getQueue();
  const scrollMilestones = new Set();
  let activePageType = getPageType(window.location.pathname);
  let scrollTicking = false;

  queue.push(['setTrackerUrl', `${MATOMO_HOST}/matomo.php`]);
  queue.push(['setSiteId', MATOMO_SITE_ID]);
  queue.push(['requireConsent']);
  queue.push(['enableLinkTracking']);
  queue.push(['enableHeartBeatTimer']);

  if (!document.querySelector('script[data-matomo-tracker]')) {
    const script = document.createElement('script');
    script.async = true;
    script.defer = true;
    script.src = `${MATOMO_HOST}/matomo.js`;
    script.dataset.matomoTracker = 'true';
    document.head.appendChild(script);
  }

  window.addEventListener('scroll', () => {
    if (scrollTicking) return;
    scrollTicking = true;
    window.requestAnimationFrame(() => {
      scrollTicking = false;
      const documentHeight = document.documentElement.scrollHeight;
      if (documentHeight <= window.innerHeight) return;

      const scrollDepth = ((window.scrollY + window.innerHeight) / documentHeight) * 100;
      SCROLL_MILESTONES.forEach((milestone) => {
        if (scrollDepth >= milestone && !scrollMilestones.has(milestone)) {
          scrollMilestones.add(milestone);
          trackMatomoEvent('portfolio_engagement', `scroll_${milestone}`, activePageType);
        }
      });
    });
  }, { passive: true });

  router.afterEach((to, from) => {
    activePageType = getPageType(to.path);
    scrollMilestones.clear();
    if (!from.matched.length || !hasConsent()) {
      return;
    }

    window.setTimeout(() => trackMatomoPageView(to.fullPath), 0);
  });
}
