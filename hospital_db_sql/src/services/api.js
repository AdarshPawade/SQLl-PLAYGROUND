// API Client Service connecting React frontend to Express backend
const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL)
  ? import.meta.env.VITE_API_BASE_URL
  : (typeof window !== 'undefined' && window.location && window.location.origin ? `${window.location.origin}/api` : '/api');

function getAuthHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  try {
    if (typeof localStorage !== 'undefined') {
      const token = localStorage.getItem('sql_playground_jwt_token_v1');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      let guestId = localStorage.getItem('sql_playground_guest_id_v1');
      if (!guestId) {
        const randBytes = new Uint8Array(8);
        const cryptoObj = (typeof window !== 'undefined' && window.crypto) ? window.crypto : globalThis.crypto;
        if (cryptoObj && cryptoObj.getRandomValues) {
          cryptoObj.getRandomValues(randBytes);
          guestId = 'guest_' + Array.from(randBytes, b => b.toString(16).padStart(2, '0')).join('');
        } else {
          guestId = `guest_${Date.now()}`;
        }
        localStorage.setItem('sql_playground_guest_id_v1', guestId);
      }
      headers['X-Guest-ID'] = guestId;
    }
  } catch {
    // ignore
  }
  return headers;
}

export function setStoredAuthToken(token) {
  try {
    if (typeof localStorage !== 'undefined') {
      if (token) {
        localStorage.setItem('sql_playground_jwt_token_v1', token);
      } else {
        localStorage.removeItem('sql_playground_jwt_token_v1');
      }
    }
  } catch {}
}

export function getStoredAuthToken() {
  try {
    return typeof localStorage !== 'undefined' ? localStorage.getItem('sql_playground_jwt_token_v1') : null;
  } catch {
    return null;
  }
}

export async function fetchHealthStatus() {
  try {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('Backend health check failed');
    return await res.json();
  } catch (err) {
    return { status: 'OFFLINE', error: err.message };
  }
}

export async function registerApi(userData) {
  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData)
    });
    const data = await res.json();
    if (data.token) {
      setStoredAuthToken(data.token);
    }
    return data;
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function loginApi(credentials) {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(credentials)
    });
    const data = await res.json();
    if (data.token) {
      setStoredAuthToken(data.token);
    }
    return data;
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function fetchMeApi() {
  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function logoutApi() {
  setStoredAuthToken(null);
  try {
    await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
  } catch {}
}

export async function fetchDatasets() {
  try {
    const res = await fetch(`${API_BASE}/datasets`);
    if (!res.ok) throw new Error('Failed to fetch datasets');
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchInterviewPrep() {
  try {
    const res = await fetch(`${API_BASE}/interview`);
    if (!res.ok) throw new Error('Failed to fetch interview questions');
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchMcqQuestions() {
  try {
    const res = await fetch(`${API_BASE}/mcq`);
    if (!res.ok) throw new Error('Failed to fetch MCQ questions');
    return await res.json();
  } catch {
    return null;
  }
}

export async function evaluateSandboxedQuery(userSql, expectedQuery, verificationQuery, dbKey) {
  try {
    const res = await fetch(`${API_BASE}/execute`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ userSql, expectedQuery, verificationQuery, dbKey })
    });
    if (!res.ok) throw new Error('Server query execution failed');
    return await res.json();
  } catch {
    return null; // Fallback to client-side WASM engine
  }
}

export async function saveUserProgress(progressData) {
  try {
    const res = await fetch(`${API_BASE}/progress`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(progressData)
    });
    return await res.json();
  } catch {
    return null;
  }
}

export async function syncProgressApi(progressPayload) {
  try {
    const res = await fetch(`${API_BASE}/progress/sync`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(progressPayload)
    });
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchUserProgress(userId = 'default_guest') {
  try {
    const res = await fetch(`${API_BASE}/progress?userId=${encodeURIComponent(userId)}`, {
      headers: getAuthHeaders()
    });
    return await res.json();
  } catch {
    return null;
  }
}

export async function savePlaygroundQuery(title, sql, dbKey, tags = []) {
  try {
    const res = await fetch(`${API_BASE}/playground/save`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ title, sql, dbKey, tags })
    });
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchSavedQueries(userId = 'default_guest') {
  try {
    const res = await fetch(`${API_BASE}/playground/saved?userId=${encodeURIComponent(userId)}`, {
      headers: getAuthHeaders()
    });
    return await res.json();
  } catch {
    return null;
  }
}
