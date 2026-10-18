// API Client Service connecting React frontend to Express backend
const API_BASE = 'http://localhost:5000/api';

export async function fetchHealthStatus() {
  try {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('Backend health check failed');
    return await res.json();
  } catch (err) {
    return { status: 'OFFLINE', error: err.message };
  }
}

export async function fetchDatasets() {
  try {
    const res = await fetch(`${API_BASE}/datasets`);
    if (!res.ok) throw new Error('Failed to fetch datasets');
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function fetchInterviewPrep() {
  try {
    const res = await fetch(`${API_BASE}/interview`);
    if (!res.ok) throw new Error('Failed to fetch interview questions');
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function fetchMcqQuestions() {
  try {
    const res = await fetch(`${API_BASE}/mcq`);
    if (!res.ok) throw new Error('Failed to fetch MCQ questions');
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function evaluateSandboxedQuery(userSql, expectedQuery, verificationQuery, dbKey) {
  try {
    const res = await fetch(`${API_BASE}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userSql, expectedQuery, verificationQuery, dbKey })
    });
    if (!res.ok) throw new Error('Server query execution failed');
    return await res.json();
  } catch (err) {
    return null; // Fallback to client-side WASM engine
  }
}

export async function saveUserProgress(progressData) {
  try {
    const res = await fetch(`${API_BASE}/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(progressData)
    });
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function fetchUserProgress(userId = 'default_guest') {
  try {
    const res = await fetch(`${API_BASE}/progress?userId=${userId}`);
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function savePlaygroundQuery(title, sql, dbKey, tags = []) {
  try {
    const res = await fetch(`${API_BASE}/playground/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, sql, dbKey, tags })
    });
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function fetchSavedQueries(userId = 'default_guest') {
  try {
    const res = await fetch(`${API_BASE}/playground/saved?userId=${userId}`);
    return await res.json();
  } catch (err) {
    return null;
  }
}
