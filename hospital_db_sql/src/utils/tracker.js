export function getAnalyticsApiBase() {
  const viteApiUrl = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_API_URL : '';
  if (viteApiUrl) {
    return `${viteApiUrl.replace(/\/+$/, '')}/api/analytics`;
  }

  const viteBaseUrl = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_API_BASE_URL : '';
  if (viteBaseUrl) {
    return `${viteBaseUrl.replace(/\/+$/, '')}/analytics`;
  }

  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    return `${window.location.origin}/api/analytics`;
  }

  return '/api/analytics';
}

export const trackVisit = () => {
  // Never count visits from the hidden admin route
  if (typeof window !== 'undefined' && window.location.pathname.replace(/\/+$/, '') === '/admin') {
    return;
  }

  const apiBase = getAnalyticsApiBase();

  fetch(`${apiBase}/track`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ eventType: 'visit' }),
    keepalive: true
  }).catch(() => {});
};
