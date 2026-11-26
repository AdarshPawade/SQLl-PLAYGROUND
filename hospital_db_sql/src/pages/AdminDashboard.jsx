import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Users,
  Eye,
  TrendingUp,
  RefreshCw,
  LogOut,
  ArrowLeft
} from 'lucide-react';
import { getAnalyticsApiBase } from '../utils/tracker';

export default function AdminDashboard() {
  const [secretKey, setSecretKey] = useState('');
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchStats = async (keyToUse) => {
    setLoading(true);
    setError('');

    try {
      const apiBase = getAnalyticsApiBase();
      const res = await fetch(`${apiBase}/stats`, {
        headers: { 'x-admin-key': keyToUse }
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || 'Invalid Admin Key');
      }

      const data = await res.json();
      setStats(data);

      try {
        sessionStorage.setItem('visited', 'true');
      } catch {
        // Ignore storage errors
      }
    } catch (err) {
      setError(err.message || 'Failed to verify admin access');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    await fetchStats(secretKey);
  };

  const handleLock = () => {
    setStats(null);
    setSecretKey('');
    setError('');
  };

  if (!stats) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        background: 'var(--bg-page, #ffffff)',
        color: 'var(--text-main, #0f172a)'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '420px',
          padding: '32px',
          borderRadius: '16px',
          background: '#ffffff',
          border: '1px solid rgba(15, 23, 42, 0.1)',
          boxShadow: '0 16px 40px -12px rgba(15, 23, 42, 0.12)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'rgba(16, 185, 129, 0.12)',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Lock size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Admin Analytics Access</h2>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '2px 0 0' }}>
                Visitor &amp; Registration Counts
              </p>
            </div>
          </div>

          <form onSubmit={handleLogin}>
            <input
              type="password"
              placeholder="Enter Admin Secret Key"
              autoComplete="current-password"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              style={{
                padding: '12px 14px',
                width: '100%',
                marginBottom: '14px',
                borderRadius: '8px',
                border: '1px solid rgba(15, 23, 42, 0.18)',
                fontSize: '0.95rem',
                outline: 'none'
              }}
              required
              autoFocus
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px 20px',
                borderRadius: '8px',
                border: 'none',
                background: '#10b981',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '0.95rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Verifying...' : 'Unlock Dashboard'}
            </button>
          </form>

          {error && (
            <p style={{
              color: '#dc2626',
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              padding: '10px 12px',
              borderRadius: '8px',
              fontSize: '0.875rem',
              marginTop: '14px'
            }}>
              {error}
            </p>
          )}
        </div>
      </div>
    );
  }

  const dailyStats = Array.isArray(stats.dailyStats) ? stats.dailyStats : [];

  return (
    <div style={{
      maxWidth: '920px',
      margin: '0 auto',
      padding: '36px 20px 60px',
      color: 'var(--text-main, #0f172a)'
    }}>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '28px',
        paddingBottom: '20px',
        borderBottom: '1px solid rgba(15, 23, 42, 0.08)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#059669', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
            <ShieldCheck size={16} />
            <span>VISITOR &amp; REGISTRATION ANALYTICS ({stats.storageMode === 'mongodb' ? 'MONGODB' : 'MEMORY'})</span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>
            SQL Playground — Analytics
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <a
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1px solid rgba(15, 23, 42, 0.14)',
              background: '#ffffff',
              color: '#0f172a',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: 500
            }}
          >
            <ArrowLeft size={15} />
            Playground
          </a>

          <button
            type="button"
            onClick={() => fetchStats(secretKey)}
            disabled={loading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              background: 'rgba(16, 185, 129, 0.1)',
              color: '#065f46',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 600
            }}
          >
            <RefreshCw size={15} />
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>

          <button
            type="button"
            onClick={handleLock}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              background: 'rgba(239, 68, 68, 0.08)',
              color: '#b91c1c',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 600
            }}
          >
            <LogOut size={15} />
            Lock
          </button>
        </div>
      </div>

      {/* Core Counters */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '18px', marginBottom: '28px' }}>
        <div style={{
          padding: '22px',
          border: '1px solid rgba(15, 23, 42, 0.1)',
          borderRadius: '12px',
          background: '#ffffff'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontSize: '0.9rem', fontWeight: 600 }}>
            <Eye size={16} color="#0284c7" />
            <span>Total Visitors</span>
          </div>
          <p style={{ fontSize: '2.25rem', fontWeight: 800, margin: '10px 0 6px', color: '#0284c7' }}>
            {stats.totalVisits ?? 0}
          </p>
          <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
            Today: {stats.visitsToday ?? 0} • 7d: {stats.visitsLast7Days ?? 0}
          </p>
        </div>

        <div style={{
          padding: '22px',
          border: '1px solid rgba(15, 23, 42, 0.1)',
          borderRadius: '12px',
          background: '#ffffff'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontSize: '0.9rem', fontWeight: 600 }}>
            <Users size={16} color="#10b981" />
            <span>Registered Users</span>
          </div>
          <p style={{ fontSize: '2.25rem', fontWeight: 800, margin: '10px 0 6px', color: '#059669' }}>
            {stats.totalUsers ?? 0}
          </p>
          <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
            Today: {stats.usersToday ?? 0} • 7d: {stats.usersLast7Days ?? 0}
          </p>
        </div>

        <div style={{
          padding: '22px',
          border: '1px solid rgba(15, 23, 42, 0.1)',
          borderRadius: '12px',
          background: '#ffffff'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontSize: '0.9rem', fontWeight: 600 }}>
            <TrendingUp size={16} color="#d97706" />
            <span>Signup Conversion Rate</span>
          </div>
          <p style={{ fontSize: '2.25rem', fontWeight: 800, margin: '10px 0 6px', color: '#d97706' }}>
            {stats.conversionRate ?? 0}%
          </p>
          <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
            Registered users per visitor
          </p>
        </div>
      </div>

      {/* Last 7 Days Daily Breakdown */}
      <div style={{
        padding: '22px',
        borderRadius: '12px',
        border: '1px solid rgba(15, 23, 42, 0.1)',
        background: '#ffffff'
      }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '14px' }}>
          Last 7 Days Breakdown
        </h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(15, 23, 42, 0.12)', textAlign: 'left' }}>
              <th style={{ padding: '10px 12px', fontSize: '0.85rem', color: '#475569' }}>Date (UTC)</th>
              <th style={{ padding: '10px 12px', fontSize: '0.85rem', color: '#475569', textAlign: 'right' }}>Visitors</th>
              <th style={{ padding: '10px 12px', fontSize: '0.85rem', color: '#475569', textAlign: 'right' }}>New Registered Users</th>
            </tr>
          </thead>
          <tbody>
            {dailyStats.slice().reverse().map((row) => (
              <tr key={row.date} style={{ borderBottom: '1px solid rgba(15, 23, 42, 0.06)' }}>
                <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono, monospace)' }}>{row.date}</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>{row.visits}</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>{row.newUsers}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
