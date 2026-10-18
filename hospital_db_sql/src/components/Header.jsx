import React, { useState, useEffect } from 'react';
import {
  Database,
  LayoutDashboard,
  Menu,
  X,
  User,
  ShieldCheck
} from 'lucide-react';

export default function Header({
  activeView,
  onNavigate,
  currentUser,
  sqlDialect = 'mysql',
  onSwitchDialect
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

  // Scroll tracker: detects when user has scrolled down
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 35);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // When scrolling down OR navigating to other sections (not on top of dashboard),
  // collapse the nav bar so ONLY the circular user profile circle is visible
  const isNavCollapsed = isScrolled || activeView !== 'dashboard';

  const handleMobileNav = (viewKey) => {
    onNavigate(viewKey);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className={`app-header ${isNavCollapsed ? 'nav-collapsed-floating' : ''}`}>
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
                  <span className="brand-badge-pro font-mono">
                    <span className="brand-badge-dot" />
                    STUDIO
                  </span>
                </div>
                <span className="brand-subtext">Interactive SQL Workspace</span>
              </div>
            </div>
          </div>

          {/* Desktop Main Navigation Bar */}
          <nav className="header-nav-bar" aria-label="Main Navigation">
            <button
              onClick={() => onNavigate('dashboard')}
              className={`nav-tab-item ${activeView === 'dashboard' ? 'active' : ''}`}
              title="Return to Main Dashboard"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>
          </nav>

          {/* Desktop Controls Group: Dialect Switcher & Circular Account Avatar */}
          <div className="header-controls-group">
            {/* Dialect Switcher: MySQL vs PostgreSQL with Default Indicator */}
            <div className="dataset-segmented-control dialect-selector-control animated-header-two-options" role="group" aria-label="SQL Dialect">
              <button
                type="button"
                onClick={() => {
                  if (onSwitchDialect) onSwitchDialect('mysql');
                }}
                className={`segmented-btn ${sqlDialect === 'mysql' ? 'active is-default' : 'is-inactive'}`}
                title="Practice in MySQL Dialect (Default)"
              >
                <span>MySQL</span>
                {sqlDialect === 'mysql' && (
                  <span className="header-mini-badge">
                    <span className="mini-pulse-dot" />
                    DEFAULT
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onSwitchDialect) onSwitchDialect('postgresql');
                }}
                className={`segmented-btn ${sqlDialect === 'postgresql' ? 'active' : 'is-inactive'}`}
                title="Practice in PostgreSQL Dialect"
              >
                <span>PostgreSQL</span>
                {sqlDialect === 'postgresql' && (
                  <span className="header-mini-badge">ACTIVE</span>
                )}
              </button>
            </div>

            {/* Subtle Divider */}
            <div className="header-v-divider" />

            {/* Circular User Login / Profile Avatar Button */}
            <div className={`nav-avatar-wrapper ${isNavCollapsed ? 'floating-circle-dock' : ''}`}>
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
                    <LayoutDashboard className="w-3 h-3 inline mr-1" /> Return to Dashboard
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
              className={`mobile-menu-toggle-btn ${isNavCollapsed ? 'collapsed-hide' : ''}`}
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

          {/* Main Navigation Links */}
          <div className="mobile-section">
            <span className="mobile-section-label">NAVIGATION</span>
            <div className="mobile-nav-links">
              <button
                onClick={() => handleMobileNav('dashboard')}
                className={`mobile-nav-item ${activeView === 'dashboard' ? 'active' : ''}`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </button>
            </div>
          </div>

          {/* SQL Dialect Selector Section */}
          <div className="mobile-section">
            <span className="mobile-section-label">SQL DIALECT</span>
            <div className="mobile-dialect-selector">
              <button
                onClick={() => {
                  if (onSwitchDialect) onSwitchDialect('mysql');
                  setIsMobileMenuOpen(false);
                }}
                className={`mobile-dialect-btn ${sqlDialect === 'mysql' ? 'active' : ''}`}
              >
                <span>MySQL (Default)</span>
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
