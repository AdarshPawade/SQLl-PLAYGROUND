import React, { useState } from 'react';
import { 
  Sparkles, Database, Award, ArrowRight, CheckCircle2, 
  Terminal, ShieldCheck, UserCheck, X, Zap, ChevronRight
} from 'lucide-react';
import './OnboardingModal.css';

export default function OnboardingModal({ isOpen, onClose, onSelectTrack, onOpenAuth }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTrack, setSelectedTrack] = useState('fullstack');
  const [queryRan, setQueryRan] = useState(false);

  if (!isOpen) return null;

  const handleFinish = (action) => {
    try {
      localStorage.setItem('sql_playground_onboarded_v1', 'true');
    } catch {}

    if (action === 'auth') {
      onClose();
      if (typeof onOpenAuth === 'function') onOpenAuth();
    } else {
      if (typeof onSelectTrack === 'function') onSelectTrack(selectedTrack);
      onClose();
    }
  };

  return (
    <div className="onboarding-overlay" role="dialog" aria-modal="true" aria-labelledby="onboarding-title">
      <div className="onboarding-card">
        {/* Close Button */}
        <button 
          className="onboarding-close-btn" 
          onClick={() => handleFinish('guest')}
          title="Skip tutorial and start practicing"
          aria-label="Close onboarding modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Stepper Header */}
        <div className="onboarding-stepper">
          <div className={`step-dot ${currentStep >= 1 ? 'active' : ''}`}>1</div>
          <div className="step-line" />
          <div className={`step-dot ${currentStep >= 2 ? 'active' : ''}`}>2</div>
          <div className="step-line" />
          <div className={`step-dot ${currentStep >= 3 ? 'active' : ''}`}>3</div>
        </div>

        {/* STEP 1: Select Track */}
        {currentStep === 1 && (
          <div className="onboarding-content animate-fade">
            <div className="onboarding-badge">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Step 1: Choose Your Practice Track</span>
            </div>
            <h2 id="onboarding-title" className="onboarding-heading">
              Welcome to SQL Practice Playground
            </h2>
            <p className="onboarding-subheading">
              A high-performance in-browser SQL learning and assessment engine powered by SQLite WebAssembly.
            </p>

            <div className="track-grid">
              <div 
                className={`track-card ${selectedTrack === 'fullstack' ? 'selected' : ''}`}
                onClick={() => setSelectedTrack('fullstack')}
              >
                <div className="track-icon emerald">
                  <Database className="w-6 h-6" />
                </div>
                <div className="track-info">
                  <h4>Tech & Product SQL</h4>
                  <p>Employee DB: 30 challenges covering DDL, DML, Joins, and aggregations.</p>
                </div>
                {selectedTrack === 'fullstack' && <CheckCircle2 className="w-5 h-5 text-emerald-400 check-icon" />}
              </div>

              <div 
                className={`track-card ${selectedTrack === 'healthcare' ? 'selected' : ''}`}
                onClick={() => setSelectedTrack('healthcare')}
              >
                <div className="track-icon cyan">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="track-info">
                  <h4>Healthcare & Clinical SQL</h4>
                  <p>Hospital DB: Admissions, Smart Equipment telemetry, doctors & rooms.</p>
                </div>
                {selectedTrack === 'healthcare' && <CheckCircle2 className="w-5 h-5 text-cyan-400 check-icon" />}
              </div>

              <div 
                className={`track-card ${selectedTrack === 'interview' ? 'selected' : ''}`}
                onClick={() => setSelectedTrack('interview')}
              >
                <div className="track-icon indigo">
                  <Award className="w-6 h-6" />
                </div>
                <div className="track-info">
                  <h4>FAANG Technical Interview</h4>
                  <p>50 advanced questions: Dense Rank, Gaps & Islands, Rolling Revenue, CTEs.</p>
                </div>
                {selectedTrack === 'interview' && <CheckCircle2 className="w-5 h-5 text-indigo-400 check-icon" />}
              </div>
            </div>

            <div className="onboarding-actions">
              <button 
                type="button"
                className="btn-onboarding-primary"
                onClick={() => setCurrentStep(2)}
              >
                <span>Continue to Live Test</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Instant Sandbox Test */}
        {currentStep === 2 && (
          <div className="onboarding-content animate-fade">
            <div className="onboarding-badge">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>Step 2: Instant In-Browser Execution</span>
            </div>
            <h2 className="onboarding-heading">
              Zero Latency SQL Execution
            </h2>
            <p className="onboarding-subheading">
              Queries run in an isolated client-side WebAssembly SQLite sandbox. Try running this preview query:
            </p>

            <div className="terminal-preview-box">
              <div className="terminal-preview-header">
                <Terminal className="w-4 h-4 text-slate-400" />
                <span>sqlite_wasm_sandbox.sql</span>
                <span className="live-status-pill">WASM 64-bit Engine</span>
              </div>
              <div className="terminal-code">
                <code>
                  <span className="sql-keyword">SELECT</span> department_name, <span className="sql-keyword">COUNT</span>(*) <span className="sql-keyword">AS</span> total_staff<br/>
                  <span className="sql-keyword">FROM</span> employees<br/>
                  <span className="sql-keyword">GROUP BY</span> department_name<br/>
                  <span className="sql-keyword">ORDER BY</span> total_staff <span className="sql-keyword">DESC</span>;
                </code>
              </div>

              <div className="terminal-action-row">
                <button 
                  type="button" 
                  className={`btn-run-preview ${queryRan ? 'ran' : ''}`}
                  onClick={() => setQueryRan(true)}
                >
                  <Zap className="w-4 h-4" />
                  <span>{queryRan ? 'Query Verified (4.2ms)' : 'Run Test Query'}</span>
                </button>
              </div>

              {queryRan && (
                <div className="query-preview-result animate-fade">
                  <div className="result-header">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Query Output: 3 rows returned in 4ms</span>
                  </div>
                  <table className="mini-result-table">
                    <thead>
                      <tr>
                        <th>department_name</th>
                        <th>total_staff</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Engineering</td>
                        <td>4</td>
                      </tr>
                      <tr>
                        <td>Marketing</td>
                        <td>2</td>
                      </tr>
                      <tr>
                        <td>Human Resources</td>
                        <td>2</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="onboarding-actions">
              <button 
                type="button"
                className="btn-onboarding-secondary"
                onClick={() => setCurrentStep(1)}
              >
                Back
              </button>
              <button 
                type="button"
                className="btn-onboarding-primary"
                onClick={() => setCurrentStep(3)}
              >
                <span>Final Step</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Choice of Engagement */}
        {currentStep === 3 && (
          <div className="onboarding-content animate-fade">
            <div className="onboarding-badge">
              <UserCheck className="w-4 h-4 text-indigo-400" />
              <span>Step 3: Ready for 1,000+ Concurrent Students</span>
            </div>
            <h2 className="onboarding-heading">
              How would you like to start?
            </h2>
            <p className="onboarding-subheading">
              You can jump in right now without creating an account, or sign up to preserve progress in the cloud.
            </p>

            <div className="onboarding-options-grid">
              <div className="option-card" onClick={() => handleFinish('guest')}>
                <div className="option-badge">Instant Access</div>
                <h4>Start as Guest</h4>
                <p>No password or signup required. Your session is saved locally in your browser.</p>
                <div className="option-action-link">
                  <span>Enter Playground</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>

              <div className="option-card highlight" onClick={() => handleFinish('auth')}>
                <div className="option-badge featured">Recommended</div>
                <h4>Create Free Account</h4>
                <p>Secure cloud progress sync across all your devices, challenge certificates, and custom query saves.</p>
                <div className="option-action-link">
                  <span>Sign Up or Log In</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>

            <div className="onboarding-actions">
              <button 
                type="button"
                className="btn-onboarding-secondary"
                onClick={() => setCurrentStep(2)}
              >
                Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
