import React from 'react';
import { ShieldCheck, Zap, Flame, CheckCircle, ArrowRight, Database, Layers } from 'lucide-react';

export default function LevelSelector({ activeDbKey, challengesForActiveDb, onSelectLevel, progressMap }) {
  const isEmployeeDb = activeDbKey === 'employee_db';

  const begCount = challengesForActiveDb.Beginner ? challengesForActiveDb.Beginner.length : 10;
  const intCount = challengesForActiveDb.Intermediate ? challengesForActiveDb.Intermediate.length : 20;
  const proCount = challengesForActiveDb.Pro ? challengesForActiveDb.Pro.length : 25;

  const levels = [
    {
      key: 'Beginner',
      title: 'Beginner Level',
      tagline: `${begCount} Foundational Challenges`,
      description: isEmployeeDb
        ? 'Master table creation (DDL), record insertions, updates, deletes, and simple column selections on corporate employee data.'
        : 'Master table creation, patient inserts, doctor record updates, and device status queries on IoMT hospital telemetry data.',
      icon: ShieldCheck,
      color: 'cyan',
      topics: ['CREATE TABLE & INSERT', 'UPDATE & DELETE', 'SELECT Columns'],
      questionCount: begCount
    },
    {
      key: 'Intermediate',
      title: 'Intermediate Level',
      tagline: `${intCount} Relational & Aggregation Challenges`,
      description: isEmployeeDb
        ? 'Query salary averages, project budgets, and employee counts using WHERE filters, ORDER BY, GROUP BY, HAVING, and subqueries.'
        : 'Query admission histories, device calibrations, and doctor workload metrics using WHERE, HAVING, GROUP BY, and aggregates.',
      icon: Zap,
      color: 'emerald',
      topics: ['MIN, MAX, AVG & COUNT', 'GROUP BY & HAVING', 'LIKE, IN & Subqueries'],
      questionCount: intCount
    },
    {
      key: 'Pro',
      title: 'Pro Level',
      tagline: `${proCount} Advanced System Analytics`,
      description: isEmployeeDb
        ? 'Solve enterprise challenges with INNER/LEFT JOINs, Views, Indexes, Transactions, Window Functions, CTEs, and SQL Injection tests.'
        : 'Solve complex medical audits with 3-4 table joins, Views, Composite Indexes, Correlated Subqueries, Window Functions, and CTEs.',
      icon: Flame,
      color: 'purple',
      topics: ['Multi-Table Joins & Views', 'Indexes & Transactions', 'Window Functions & CTEs'],
      questionCount: proCount
    }
  ];

  return (
    <div className="level-select-container fade-in-animation">
      <div className="level-select-hero">
        <div className="hero-badge">
          <Layers size={14} /> Active Database: <strong>{isEmployeeDb ? 'Employee Database' : 'Hospital IoMT Database'}</strong>
        </div>
        <h1 className="hero-title">Select SQL Challenge Level</h1>
        <p className="hero-subtitle">
          SQLite database running in WebAssembly. Choose a difficulty level for the {isEmployeeDb ? 'Employee' : 'Hospital'} schema.
        </p>
      </div>

      <div className="level-cards-grid">
        {levels.map((lvl) => {
          const Icon = lvl.icon;
          const solvedInLevel = progressMap[lvl.key] || 0;
          const isComplete = solvedInLevel >= lvl.questionCount;

          return (
            <div 
              key={lvl.key} 
              className={`level-card level-card-${lvl.color}`}
              onClick={() => onSelectLevel(lvl.key)}
            >
              <div className="level-card-header">
                <div className={`level-card-icon icon-${lvl.color}`}>
                  <Icon size={26} />
                </div>
                {isComplete && (
                  <span className="complete-badge">
                    <CheckCircle size={14} /> Level Mastered
                  </span>
                )}
              </div>

              <h2 className="level-card-title">{lvl.title}</h2>
              <p className="level-card-tagline">{lvl.tagline}</p>
              <p className="level-card-desc">{lvl.description}</p>

              <div className="level-topics">
                {lvl.topics.map((top, idx) => (
                  <span key={idx} className="topic-chip">{top}</span>
                ))}
              </div>

              <div className="level-card-footer">
                <div className="progress-info">
                  <Database size={14} />
                  <span>Progress: {solvedInLevel} / {lvl.questionCount} Solved</span>
                </div>
                <button className="btn-select-level">
                  Start Level <ArrowRight size={15} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
