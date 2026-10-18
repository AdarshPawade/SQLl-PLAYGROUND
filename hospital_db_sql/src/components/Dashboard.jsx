import React from 'react';
import {
  BookOpen,
  Layers,
  Award,
  ArrowRight,
  Sparkles,
  Database,
  Server,
  Briefcase,
  Terminal,
  CheckCircle2,
  Trophy,
  ArrowRightLeft
} from 'lucide-react';

export default function Dashboard({
  activeDbKey,
  onSwitchDatabase,
  onNavigate,
  solvedStats
}) {
  const isEmployeeDb = activeDbKey === 'employee_db';

  const progressionCards = [
    {
      id: 'beginner',
      title: 'Beginner Level',
      tag: 'LEVEL 1',
      category: 'FOUNDATIONS',
      badgeClass: 'tag-emerald',
      icon: BookOpen,
      description: 'Master core SQL syntax, SELECT filters, ordering, and basic aggregation functions',
      solved: solvedStats?.beginner?.solved || 0,
      total: solvedStats?.beginner?.total || 50,
      actionText: 'Start Beginner Level',
      route: 'beginner'
    },
    {
      id: 'intermediate',
      title: 'Intermediate Level',
      tag: 'LEVEL 2',
      category: 'RELATIONAL',
      badgeClass: 'tag-blue',
      icon: Layers,
      description: 'Multi-table INNER/LEFT joins, correlated subqueries, and advanced GROUP BY aggregations',
      solved: solvedStats?.intermediate?.solved || 0,
      total: solvedStats?.intermediate?.total || 50,
      actionText: 'Start Intermediate Level',
      route: 'intermediate'
    },
    {
      id: 'pro',
      title: 'Pro Level',
      tag: 'LEVEL 3',
      category: 'ADVANCED',
      badgeClass: 'tag-purple',
      icon: Award,
      description: 'Window functions (RANK, ROW_NUMBER, LAG/LEAD), analytical ranking, and complex CTEs',
      solved: solvedStats?.pro?.solved || 0,
      total: solvedStats?.pro?.total || 60,
      actionText: 'Start Pro Level',
      route: 'pro'
    }
  ];

  const interviewCard = {
    id: 'interview',
    title: 'Technical Interview Practice',
    tag: '50 HARD SCENARIOS',
    category: 'ADVANCED INTERVIEW PREPARATION',
    badgeClass: 'tag-amber',
    icon: Briefcase,
    description: 'Master 50 hard production SQL challenges asked in top tech company interviews. Deep dive into recursive CTEs, dense ranking, multi-department analytics, rolling averages, and concurrency-aware logic.',
    solved: solvedStats?.interview?.solved || 0,
    total: solvedStats?.interview?.total || 50,
    actionText: 'Launch Interview Practice',
    route: 'interview'
  };

  const interviewPercent = interviewCard.total > 0
    ? Math.round((interviewCard.solved / interviewCard.total) * 100)
    : 0;

  // Calculate Overall Platform Completion
  const totalSolved = (solvedStats?.beginner?.solved || 0) +
    (solvedStats?.intermediate?.solved || 0) +
    (solvedStats?.pro?.solved || 0) +
    (solvedStats?.interview?.solved || 0);

  const totalQuestions = (solvedStats?.beginner?.total || 50) +
    (solvedStats?.intermediate?.total || 50) +
    (solvedStats?.pro?.total || 60) +
    (solvedStats?.interview?.total || 50);

  const overallPercent = totalQuestions > 0
    ? Math.round((totalSolved / totalQuestions) * 100)
    : 0;

  // Circumference of 42px radius circle: 2 * Math.PI * 42 ≈ 263.89
  const circleRadius = 42;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeOffset = circumference - (circumference * overallPercent) / 100;

  return (
    <div className="enterprise-dashboard">
      {/* Hero Banner with Animated 2-Option Selector & Circular Progress Tracker */}
      <div className="hero-control-panel hero-control-panel-with-tracker">
        <div className="panel-left-content">
          <div className="hero-status-tag font-mono">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span>DUAL RELATIONAL SCHEMAS • ENTERPRISE & CLINICAL IoT</span>
          </div>

          <h1 className="hero-heading">
            Interactive <span className="hero-gradient-text">SQL Practice Studio</span>
          </h1>
          <p className="hero-description">
            Execute real queries against two full-scale production schemas: <strong>Employee HR Management</strong> (payroll, staff hierarchy, cross-department projects) and <strong>Hospital Clinical IoT</strong> (patient admissions, physicians, smart hardware telemetry). Verified across MySQL 8.0 & PostgreSQL with zero setup.
          </p>

          <div className="hero-schema-highlights font-mono">
            <div className="highlight-item">
              <Database className="w-3.5 h-3.5 text-emerald-500" />
              <span>Employee DB: 5 Tables • Corporate Hierarchy</span>
            </div>
            <div className="highlight-item">
              <Server className="w-3.5 h-3.5 text-cyan-500" />
              <span>Hospital DB: 5 Tables • Clinical Telemetry</span>
            </div>
            <div className="highlight-item">
              <Terminal className="w-3.5 h-3.5 text-purple-500" />
              <span>210 Solved Scenarios • MySQL & PostgreSQL Engine</span>
            </div>
          </div>

          <div className="dataset-picker-bar">
            <span className="picker-label">ACTIVE DATABASE:</span>
            <div className="segmented-selector animated-two-option-selector" role="group" aria-label="Select Database">
              {/* Option 1: Employee Database */}
              <button
                type="button"
                className={`two-option-btn ${isEmployeeDb ? 'is-active is-default' : 'is-inactive'}`}
                onClick={() => onSwitchDatabase('employee_db')}
                title={isEmployeeDb ? "Employee Database is active. Hover to reveal Hospital DB." : "Switch to Employee Database"}
              >
                <Database className="w-4 h-4" />
                <span className="btn-label-text">Employee Database</span>
                {isEmployeeDb ? (
                  <>
                    <span className="option-state-pill default-active-pill">
                      <span className="state-pulse-dot" />
                      DEFAULT
                    </span>
                    <span className="hover-expand-hint font-mono">
                      <ArrowRightLeft className="w-3 h-3 inline mr-1" /> Hover to switch
                    </span>
                  </>
                ) : (
                  <span className="hover-out-indicator">
                    Switch to Employee DB &rarr;
                  </span>
                )}
              </button>

              {/* Option 2: Hospital Database */}
              <button
                type="button"
                className={`two-option-btn ${!isEmployeeDb ? 'is-active' : 'is-inactive'}`}
                onClick={() => onSwitchDatabase('hospital_db')}
                title={!isEmployeeDb ? "Hospital Database is active. Hover to reveal Employee DB." : "Switch to Hospital Database"}
              >
                <Server className="w-4 h-4" />
                <span className="btn-label-text">Hospital Database</span>
                {!isEmployeeDb ? (
                  <>
                    <span className="option-state-pill active-pill">
                      <span className="state-pulse-dot" />
                      ACTIVE
                    </span>
                    <span className="hover-expand-hint font-mono">
                      <ArrowRightLeft className="w-3 h-3 inline mr-1" /> Hover to switch
                    </span>
                  </>
                ) : (
                  <span className="hover-out-indicator">
                    Switch to Hospital DB &rarr;
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Hero Right: Modern Circular Progress Tracker */}
        <div className="hero-circular-tracker-panel">
          <div className="circular-tracker-card">
            <div className="circular-ring-container">
              <svg className="circular-progress-svg" width="104" height="104" viewBox="0 0 104 104">
                <defs>
                  <linearGradient id="circleProgressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="60%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
                <circle
                  className="circular-track-bg"
                  cx="52"
                  cy="52"
                  r={circleRadius}
                  strokeWidth="8"
                />
                <circle
                  className="circular-track-progress"
                  cx="52"
                  cy="52"
                  r={circleRadius}
                  strokeWidth="8"
                  stroke="url(#circleProgressGrad)"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeOffset}
                  strokeLinecap="round"
                />
              </svg>
              <div className="circular-center-content">
                <span className="circular-percent-value font-mono">{overallPercent}%</span>
                <span className="circular-percent-label">COMPLETED</span>
              </div>
            </div>

            <div className="circular-tracker-meta">
              <div className="tracker-meta-header">
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                <span className="tracker-meta-title">Overall Progress</span>
              </div>
              <div className="tracker-meta-counts font-mono">
                <span className="count-solved font-bold text-emerald-600">{totalSolved}</span>
                <span className="count-divider">/</span>
                <span className="count-total">{totalQuestions}</span>
                <span className="count-label">Solved</span>
              </div>
              <span className="tracker-meta-status-chip font-mono">
                {overallPercent === 100 
                  ? '🏆 100% Mastered' 
                  : overallPercent >= 50 
                    ? '⚡ Halfway Point' 
                    : overallPercent > 0 
                      ? '🚀 In Progress' 
                      : '🎯 Start Solving'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Modules Cards Grid */}
      <div className="modules-grid-section">
        <div className="section-title-bar">
          <div className="section-title-row">
            <h2 className="grid-section-title">Practice Modules</h2>
            <span className="grid-section-counter font-mono">4 MODULES AVAILABLE</span>
          </div>
          <span className="grid-section-subtitle">Select a module to begin practicing in the interactive SQL workspace.</span>
        </div>

        {/* Core Progression Modules (3-column grid) */}
        <div className="three-cards-grid">
          {progressionCards.map(card => {
            const Icon = card.icon;
            const cardPercent = card.total > 0 ? Math.round((card.solved / card.total) * 100) : 0;

            return (
              <div
                key={card.id}
                className={`module-card module-card-${card.id} group`}
                onClick={() => onNavigate(card.route)}
              >
                <div className="card-header-bar">
                  <div className={`icon-container icon-container-${card.id}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`rect-tag ${card.badgeClass}`}>
                    {card.tag}
                  </span>
                </div>

                <div className="card-content-body">
                  <span className="category-subtitle">{card.category}</span>
                  <h3 className="card-main-title transition-colors">
                    {card.title}
                  </h3>
                  <p className="card-summary">
                    {card.description}
                  </p>
                </div>

                {/* Always-visible Progress Tracker for each module */}
                <div className="progress-track-block">
                  <div className="track-info-line">
                    <span className="track-label">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      PROGRESS
                    </span>
                    <span className="font-mono track-count">
                      <strong>{card.solved}</strong> / {card.total} Solved
                      <span className="track-percent-pill font-mono">{cardPercent}%</span>
                    </span>
                  </div>
                  <div className="track-bar-bg">
                    <div
                      className={`track-bar-fill fill-${card.id}`}
                      style={{ width: `${Math.max(cardPercent, card.solved > 0 ? 4 : 0)}%` }}
                    />
                  </div>
                </div>

                <div className="card-action-footer">
                  <button className={`module-launch-btn launch-btn-${card.id}`}>
                    <span>{card.actionText}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Featured Showcase Card at the End: Interview Practice */}
        <div
          className="featured-interview-card group"
          onClick={() => onNavigate(interviewCard.route)}
        >
          <div className="featured-card-ambient" />
          <div className="featured-card-content">
            <div className="featured-left-col">
              <div className="featured-tag-row">
                <div className="featured-icon-box">
                  <Briefcase className="w-5 h-5 text-amber-500" />
                </div>
                <span className="rect-tag tag-amber font-mono">
                  {interviewCard.tag}
                </span>
                <span className="featured-badge-highlight">
                  HOT TOPIC
                </span>
              </div>

              <div className="featured-text-block">
                <span className="category-subtitle">{interviewCard.category}</span>
                <h3 className="featured-main-title group-hover:text-amber-600 transition-colors">
                  {interviewCard.title}
                </h3>
                <p className="featured-summary">
                  {interviewCard.description}
                </p>
              </div>

              <div className="featured-meta-pills">
                <span className="meta-pill">
                  <Terminal className="w-3 h-3 text-emerald-400" /> MySQL 8.0 & PostgreSQL
                </span>
                <span className="meta-pill">
                  <Database className="w-3 h-3 text-cyan-400" /> 12 Relational Tables
                </span>
                <span className="meta-pill">
                  <CheckCircle2 className="w-3 h-3 text-purple-400" /> Window Functions & CTEs
                </span>
              </div>
            </div>

            <div className="featured-right-col">
              {/* Executive Multi-Segment Milestone Progress Bar for Interview Module */}
              <div className="interview-milestone-progress-card">
                <div className="milestone-top-row">
                  <div className="milestone-title-wrap">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    <span className="milestone-title font-mono">INTERVIEW READINESS</span>
                  </div>
                  <div className="milestone-stats font-mono">
                    <span className="milestone-solved-num">{interviewCard.solved}</span>
                    <span className="milestone-divider">/</span>
                    <span className="milestone-total-num">{interviewCard.total} Solved</span>
                    <span className="milestone-percent-badge font-mono">{interviewPercent}%</span>
                  </div>
                </div>

                <div className="milestone-track-wrapper">
                  <div className="milestone-track-bar">
                    <div
                      className="milestone-track-fill"
                      style={{ width: `${Math.max(interviewPercent, interviewCard.solved > 0 ? 5 : 0)}%` }}
                    >
                      <div className="milestone-fill-shimmer" />
                    </div>
                  </div>
                  <div className="milestone-ticks-row font-mono">
                    <span className="milestone-tick active">Start (Q0)</span>
                    <span className={`milestone-tick ${interviewPercent >= 25 ? 'active' : ''}`}>Core (Q12)</span>
                    <span className={`milestone-tick ${interviewPercent >= 50 ? 'active' : ''}`}>Midway (Q25)</span>
                    <span className={`milestone-tick ${interviewPercent >= 75 ? 'active' : ''}`}>Senior (Q37)</span>
                    <span className={`milestone-tick ${interviewPercent === 100 ? 'active' : ''}`}>Master (Q50)</span>
                  </div>
                </div>
              </div>

              <button className="featured-launch-btn">
                <span>{interviewCard.actionText}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
