const loginView = document.getElementById('login-view');
const dashboardView = document.getElementById('dashboard-view');
const loginForm = document.getElementById('login-form');
const backendUrlInput = document.getElementById('backend-url');
const adminKeyInput = document.getElementById('admin-key');
const unlockBtn = document.getElementById('unlock-btn');
const loginError = document.getElementById('login-error');
const connectedTarget = document.getElementById('connected-target');
const storagePill = document.getElementById('storage-pill');
const refreshBtn = document.getElementById('refresh-btn');
const lockBtn = document.getElementById('lock-btn');
const autoRefreshCheckbox = document.getElementById('auto-refresh');

const kpiVisits = document.getElementById('kpi-visits');
const kpiVisitsToday = document.getElementById('kpi-visits-today');
const kpiVisits7d = document.getElementById('kpi-visits-7d');
const kpiUsers = document.getElementById('kpi-users');
const kpiUsersToday = document.getElementById('kpi-users-today');
const kpiUsers7d = document.getElementById('kpi-users-7d');
const kpiConversion = document.getElementById('kpi-conversion');
const conversionFill = document.getElementById('conversion-fill');
const chartBars = document.getElementById('chart-bars');
const dailyTbody = document.getElementById('daily-tbody');

let activeBackendUrl = '';
let activeAdminKey = '';
let pollTimer = null;

try {
  const savedUrl = localStorage.getItem('sql_admin_target_url');
  if (savedUrl) backendUrlInput.value = savedUrl;
} catch {
  // ignore
}

function escapeHtml(value) {
  const div = document.createElement('div');
  div.textContent = value === null || value === undefined ? '' : String(value);
  return div.innerHTML;
}

async function loadStats() {
  if (!activeBackendUrl || !activeAdminKey) return;

  const res = await fetch('/api/proxy-stats', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      targetUrl: activeBackendUrl,
      adminKey: activeAdminKey
    })
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Request failed (${res.status})`);
  }

  renderDashboard(data);
}

function renderDashboard(data) {
  connectedTarget.textContent = `Connected to: ${activeBackendUrl}`;

  if (data.storageMode === 'mongodb') {
    storagePill.textContent = 'MongoDB Atlas Connected';
    storagePill.className = 'pill ok';
  } else {
    storagePill.textContent = 'In-Memory Fallback (Check MONGODB_URI)';
    storagePill.className = 'pill warn';
  }

  const totalVisits = Number(data.totalVisits || 0);
  const totalUsers = Number(data.totalUsers || 0);
  const conversionRate = Number(data.conversionRate || 0);

  kpiVisits.textContent = totalVisits;
  kpiVisitsToday.textContent = data.visitsToday ?? 0;
  kpiVisits7d.textContent = data.visitsLast7Days ?? 0;

  kpiUsers.textContent = totalUsers;
  kpiUsersToday.textContent = data.usersToday ?? 0;
  kpiUsers7d.textContent = data.usersLast7Days ?? 0;

  kpiConversion.textContent = `${conversionRate}%`;
  conversionFill.style.width = `${Math.min(100, Math.max(0, conversionRate))}%`;

  const daily = Array.isArray(data.dailyStats) ? data.dailyStats : [];
  const maxVal = Math.max(
    1,
    ...daily.map(d => Math.max(Number(d.visits || 0), Number(d.newUsers || 0)))
  );

  chartBars.innerHTML = daily.map(d => {
    const visitPct = Math.round((Number(d.visits || 0) / maxVal) * 100);
    const userPct = Math.round((Number(d.newUsers || 0) / maxVal) * 100);
    const shortDate = String(d.date || '').slice(5);
    return `
      <div class="day-col" title="${escapeHtml(d.date)}: ${escapeHtml(d.visits)} visits, ${escapeHtml(d.newUsers)} new users">
        <div class="bar-pair">
          <div class="bar bar-visit" style="height: ${Math.max(3, visitPct)}%;"></div>
          <div class="bar bar-user" style="height: ${Math.max(3, userPct)}%;"></div>
        </div>
        <span class="day-label mono">${escapeHtml(shortDate)}</span>
      </div>
    `;
  }).join('');

  dailyTbody.innerHTML = daily
    .slice()
    .reverse()
    .map(d => `
      <tr>
        <td class="mono">${escapeHtml(d.date)}</td>
        <td class="right mono">${escapeHtml(d.visits ?? 0)}</td>
        <td class="right mono">${escapeHtml(d.newUsers ?? 0)}</td>
      </tr>
    `).join('');
}

function startPolling() {
  stopPolling();
  if (autoRefreshCheckbox.checked && activeAdminKey) {
    pollTimer = setInterval(() => {
      loadStats().catch(() => {});
    }, 10000);
  }
}

function stopPolling() {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginError.classList.add('hidden');
  unlockBtn.disabled = true;
  unlockBtn.textContent = 'Connecting...';

  activeBackendUrl = backendUrlInput.value.trim().replace(/\/+$/, '');
  activeAdminKey = adminKeyInput.value;

  try {
    await loadStats();
    try {
      localStorage.setItem('sql_admin_target_url', activeBackendUrl);
    } catch {
      // ignore
    }
    loginView.classList.add('hidden');
    dashboardView.classList.remove('hidden');
    startPolling();
  } catch (err) {
    activeAdminKey = '';
    loginError.textContent = err.message || 'Authentication failed';
    loginError.classList.remove('hidden');
  } finally {
    unlockBtn.disabled = false;
    unlockBtn.textContent = 'Unlock Dashboard';
  }
});

refreshBtn.addEventListener('click', () => {
  loadStats().catch((err) => alert(err.message));
});

autoRefreshCheckbox.addEventListener('change', () => {
  if (autoRefreshCheckbox.checked) {
    startPolling();
  } else {
    stopPolling();
  }
});

lockBtn.addEventListener('click', () => {
  stopPolling();
  activeAdminKey = '';
  adminKeyInput.value = '';
  dashboardView.classList.add('hidden');
  loginView.classList.remove('hidden');
});
