import React from 'react';

export default function Footer() {
  return (
    <footer className="app-designer-footer">
      <div className="footer-glow-line" />
      <div className="footer-inner-content">
        <div className="footer-context-summary font-mono">
          <span>SQL PRACTICE STUDIO</span>
          <span className="dot-sep">•</span>
          <span>EMPLOYEE HR & HOSPITAL IoT SCHEMAS</span>
          <span className="dot-sep">•</span>
          <span>MYSQL 8.0 & POSTGRESQL ENGINE</span>
        </div>
        <div className="footer-gain-badge">
          <span className="footer-gain-text">Practice Means Gain!</span>
          <span className="rocket-emoji" aria-hidden="true">🚀</span>
        </div>
      </div>
    </footer>
  );
}