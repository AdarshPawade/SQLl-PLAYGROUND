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

function getCurrentActorUsername() {
  try {
    if (typeof localStorage === 'undefined') return 'guest';
    const raw = localStorage.getItem('sql_playground_active_session_v1');
    if (!raw) return 'guest';
    const parsed = JSON.parse(raw);
    return parsed?.username ? String(parsed.username).slice(0, 64) : 'guest';
  } catch {
    return 'guest';
  }
}

export const trackEvent = (eventType, target, actorOverride = null) => {
  if (!eventType || !target) return;

  // Never log tracking events from the hidden admin route
  if (typeof window !== 'undefined' && window.location.pathname.replace(/\/+$/, '') === '/admin') {
    return;
  }

  const apiBase = getAnalyticsApiBase();
  const actor = actorOverride || getCurrentActorUsername();

  // Fire-and-forget request so it never blocks the UI
  fetch(`${apiBase}/track`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ eventType, target, actor }),
    keepalive: true
  }).catch(() => {}); // Silently ignore errors if user uses an ad-blocker or offline
};
