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

export const trackEvent = (eventType, target) => {
  if (!eventType || !target) return;

  // Never log tracking events from the hidden admin route
  if (typeof window !== 'undefined' && window.location.pathname.replace(/\/+$/, '') === '/admin') {
    return;
  }

  const apiBase = getAnalyticsApiBase();

  // Fire-and-forget request so it never blocks the UI
  fetch(`${apiBase}/track`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ eventType, target }),
    keepalive: true
  }).catch(() => {}); // Silently ignore errors if user uses an ad-blocker or offline
};
