import React, { useState, useEffect } from 'react';
import {
  Database,
  LayoutDashboard,
  Menu,
  X,
  Sparkles,
  Activity,
  Code2,
  Briefcase
} from 'lucide-react';

export default function Header({
  activeDbKey = 'employee_db',
  onSwitchDatabase,
  activeView,
  onNavigate,
  currentUser,
  sqlDialect = 'mysql',
  onSwitchDialect,
  onOpenOnboarding
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Compute first letter for circular avatar: 'L' for Login if guest, or user's first letter
  const userInitial = currentUser
    ? (currentUser.displayName || currentUser.username || 'U').charAt(0).toUpperCase()
    : 'L';

  const userTooltip = currentUser
    ? (currentUser.displayName || currentUser.username)
    : 'Login';

  // Close mobile drawer when pressing Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen]);

  // Lock background scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const handleMobileNav = (viewKey) => {
    onNavigate(viewKey);
    setIsMobileMenuOpen(false);
  };

  const handleSwitchDb = (key) => {
    if (onSwitchDatabase) onSwitchDatabase(key);
  };

  return (
    <>
      <header className="app-header">
        <div className="header-inner-container">
          {/* Brand Identity */}
          <div className="header-brand-group">
            <div
              onClick={() => onNavigate('dashboard')}
              className="brand-logo-button"
              title="Go to Dashboard"
            >
              <div className="brand-icon-box">
                <Database className="w-5 h-5" />
              </div>
              <div className="brand-text-block">
                <div className="brand-title-line">
                  <span className="brand-name">SQL PLAYGROUND</span>
                  <span className="brand-badge-pro font-mono">STUDIO</span>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Main Navigation Bar */}
          <nav className="header-nav-bar" aria-label="Main Navigation">
            <button
              onClick={() => onNavigate('dashboard')}
              className={`nav-tab-item ${activeView === 'dashboard' ? 'active' : ''}`}
              title="Dashboard"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => onNavigate('beginner')}
              className={`nav-tab-item ${['beginner', 'intermediate', 'pro'].includes(activeView) ? 'active' : ''}`}
              title="Practice"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Practice</span>
            </button>

            <button
              onClick={() => onNavigate('interview')}
              className={`nav-tab-item ${activeView === 'interview' ? 'active' : ''}`}
              title="50 FAANG Interview Scenarios"
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Interview</span>
            </button>
          </nav>

          {/* Database Toggle Switcher (Always visible, direct click to switch) */}
          <div className="nav-db-toggle-group" role="group" aria-label="Active Database">
            <button
              type="button"
              className={`nav-db-btn ${activeDbKey === 'employee_db' ? 'active db-employee' : ''}`}
              onClick={() => handleSwitchDb('employee_db')}
              title="Switch to Employee Database"
            >
              <Database className="w-3.5 h-3.5" />
              <span>Employee DB</span>
              {activeDbKey === 'employee_db' && <span className="active-dot" />}
            </button>

            <button
              type="button"
              className={`nav-db-btn ${activeDbKey === 'hospital_db' ? 'active db-hospital' : ''}`}
              onClick={() => handleSwitchDb('hospital_db')}
              title="Switch to Hospital Database"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Hospital DB</span>
              {activeDbKey === 'hospital_db' && <span className="active-dot" />}
            </button>
          </div>

          {/* Desktop Controls Group: Dialect, Tour & Account */}
          <div className="header-controls-group">
            {/* Clean Segmented Dialect Switcher */}
            <div className="dialect-selector-control" role="group" aria-label="SQL Dialect">
              <button
                type="button"
                onClick={() => onSwitchDialect && onSwitchDialect('mysql')}
                className={`segmented-btn ${sqlDialect === 'mysql' ? 'active is-default' : ''}`}
                title="MySQL Dialect (Default)"
              >
                <span>MySQL</span>
              </button>
              <button
                type="button"
                onClick={() => onSwitchDialect && onSwitchDialect('postgresql')}
                className={`segmented-btn ${sqlDialect === 'postgresql' ? 'active' : ''}`}
                title="PostgreSQL Dialect"
              >
                <span>Postgres</span>
              </button>
            </div>

            {/* Quick Tour Button (Upgraded with Sparkles icon, no more question mark) */}
            {onOpenOnboarding && (
              <button
                type="button"
                className="header-tour-btn"
                onClick={onOpenOnboarding}
                title="Start Guided Platform Tour"
                aria-label="Start Guided Platform Tour"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span className="tour-label">Tour</span>
              </button>
            )}

            {/* Divider */}
            <div className="header-v-divider" />

            {/* Circular User Login / Profile Avatar */}
            <div className="nav-avatar-wrapper">
              <button
                type="button"
                onClick={() => onNavigate('auth')}
                className={`nav-avatar-circle-btn ${activeView === 'auth' ? 'active' : ''} ${currentUser ? 'is-logged-in' : 'is-guest'}`}
                title={currentUser ? `Account: ${currentUser.username}` : "Login to SQL Studio"}
                aria-label={currentUser ? `Account: ${currentUser.username}` : "Login"}
              >
                <span className="avatar-initial font-mono">{userInitial}</span>
                <span className={`avatar-status-dot ${currentUser ? 'online' : 'guest'}`} />
              </button>
              <div className="avatar-hover-tooltip font-mono">
                <div className="tooltip-name">{userTooltip}</div>
                {activeView !== 'dashboard' && (
                  <button
                    type="button"
                    className="tooltip-return-dashboard-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate('dashboard');
                    }}
                  >
                    <LayoutDashboard className="w-3 h-3 inline mr-1" /> Dashboard
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Header Controls: Circular Avatar & Hamburger Toggle */}
          <div className="header-mobile-right">
            <button
              type="button"
              onClick={() => onNavigate('auth')}
              className={`nav-avatar-circle-btn mobile-circle-btn ${activeView === 'auth' ? 'active' : ''} ${currentUser ? 'is-logged-in' : 'is-guest'}`}
              title={currentUser ? `Logged in as ${currentUser.username}` : "Login"}
              aria-label={currentUser ? `Account: ${currentUser.username}` : "Login"}
            >
              <span className="avatar-initial font-mono">{userInitial}</span>
              <span className={`avatar-status-dot ${currentUser ? 'online' : 'guest'}`} />
            </button>

            <button
              className="mobile-menu-toggle-btn"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer & Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="mobile-nav-backdrop"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      <div
        className={`mobile-nav-drawer ${isMobileMenuOpen ? 'open' : ''}`}
        aria-label="Mobile Navigation Menu"
      >
        <div className="mobile-drawer-header">
          <div className="brand-logo-button" onClick={() => handleMobileNav('dashboard')}>
            <div className="brand-icon-box">
              <Database className="w-5 h-5" />
            </div>
            <span className="brand-name">SQL PLAYGROUND</span>
          </div>
          <button
            className="mobile-drawer-close-btn"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mobile-drawer-body">
          {/* User Profile Banner in Drawer */}
          <div
            className="mobile-user-profile-banner"
            onClick={() => handleMobileNav('auth')}
            role="button"
            tabIndex={0}
          >
            <div className={`mobile-avatar-circle ${currentUser ? 'is-logged-in' : 'is-guest'}`}>
              <span className="avatar-initial font-mono">{userInitial}</span>
              <span className={`avatar-status-dot ${currentUser ? 'online' : 'guest'}`} />
            </div>
            <div className="mobile-user-meta">
              <span className="mobile-user-name">
                {currentUser ? (currentUser.displayName || currentUser.username) : 'Login to SQL Studio'}
              </span>
              <span className="mobile-user-sub font-mono">
                {currentUser ? 'Active Profile & Stats' : 'Click to Sign In / Register'}
              </span>
            </div>
          </div>

          {/* Database Switcher in Mobile Drawer */}
          <div className="mobile-section">
            <span className="mobile-section-label">DATABASE</span>
            <div className="mobile-dialect-selector">
              <button
                onClick={() => {
                  handleSwitchDb('employee_db');
                  setIsMobileMenuOpen(false);
                }}
                className={`mobile-dialect-btn ${activeDbKey === 'employee_db' ? 'active' : ''}`}
              >
                <Database className="w-4 h-4 inline mr-1" />
                <span>Employee DB</span>
              </button>
              <button
                onClick={() => {
                  handleSwitchDb('hospital_db');
                  setIsMobileMenuOpen(false);
                }}
                className={`mobile-dialect-btn ${activeDbKey === 'hospital_db' ? 'active' : ''}`}
              >
                <Activity className="w-4 h-4 inline mr-1" />
                <span>Hospital DB</span>
              </button>
            </div>
          </div>

          {/* Main Navigation Links */}
          <div className="mobile-section">
            <span className="mobile-section-label">NAVIGATE</span>
            <div className="mobile-nav-links">
              <button
                onClick={() => handleMobileNav('dashboard')}
                className={`mobile-nav-item ${activeView === 'dashboard' ? 'active' : ''}`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => handleMobileNav('beginner')}
                className={`mobile-nav-item ${['beginner', 'intermediate', 'pro'].includes(activeView) ? 'active' : ''}`}
              >
                <Code2 className="w-4 h-4" />
                <span>Practice</span>
              </button>

              <button
                onClick={() => handleMobileNav('interview')}
                className={`mobile-nav-item ${activeView === 'interview' ? 'active' : ''}`}
              >
                <Briefcase className="w-4 h-4" />
                <span>Interview Prep</span>
              </button>

              {onOpenOnboarding && (
                <button
                  onClick={() => {
                    onOpenOnboarding();
                    setIsMobileMenuOpen(false);
                  }}
                  className="mobile-nav-item tour-item"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Guided Tour</span>
                </button>
              )}
            </div>
          </div>

          {/* SQL Dialect Selector Section */}
          <div className="mobile-section">
            <span className="mobile-section-label">DIALECT</span>
            <div className="mobile-dialect-selector">
              <button
                onClick={() => {
                  if (onSwitchDialect) onSwitchDialect('mysql');
                  setIsMobileMenuOpen(false);
                }}
                className={`mobile-dialect-btn ${sqlDialect === 'mysql' ? 'active' : ''}`}
              >
                <span>MySQL</span>
              </button>
              <button
                onClick={() => {
                  if (onSwitchDialect) onSwitchDialect('postgresql');
                  setIsMobileMenuOpen(false);
                }}
                className={`mobile-dialect-btn ${sqlDialect === 'postgresql' ? 'active' : ''}`}
              >
                <span>PostgreSQL</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
