import React, { useState } from 'react';
import { 
  Play, HelpCircle, RotateCcw, CheckCircle, Code2, 
  Terminal, Database, Sparkles, Eye, Copy, Check 
} from 'lucide-react';
import ValidationResults from './ValidationResults';

export default function SqlPlayground({
  currentQuestion,
  userSql,
  setUserSql,
  onRunQuery,
  validationResult,
  userQueryExecuted,
  isSolved,
  sqlDialect = 'mysql',
  onSwitchDialect
}) {
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [copiedSolution, setCopiedSolution] = useState(false);

  if (!currentQuestion) {
    return (
      <main className="playground-container">
        <div className="practice-container">
          <div className="no-question-selected">
            <Code2 size={48} className="text-slate-400" />
            <h3>No Question Selected</h3>
            <p>Select a question from the sidebar to begin practicing.</p>
          </div>
        </div>
      </main>
    );
  }

  const handleKeyDown = (e) => {
    // Cmd+Enter or Ctrl+Enter to run query
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      onRunQuery();
    }
  };

  const handleResetQuery = () => {
    setUserSql(currentQuestion.initialQuery || '');
  };

  const activeReferenceSql = sqlDialect === 'mysql'
    ? (currentQuestion.mysqlSql || currentQuestion.expectedQuery || '')
    : (currentQuestion.postgresSql || currentQuestion.expectedQuery || '');

  const handleCopySolution = () => {
    if (activeReferenceSql) {
      navigator.clipboard.writeText(activeReferenceSql);
      setCopiedSolution(true);
      setTimeout(() => setCopiedSolution(false), 2000);
    }
  };

  const handleInsertSolution = () => {
    if (activeReferenceSql) {
      setUserSql(activeReferenceSql);
    }
  };

  return (
    <main className="playground-container">
      <div className="practice-container">
        {/* Question Header & Description */}
        <div className="question-box">
          <div className="question-header-flex">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                {currentQuestion.difficulty && (
                  <span className="badge-difficulty-hard" style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: 'rgba(239, 68, 68, 0.15)',
                    color: '#f87171',
                    border: '1px solid rgba(239, 68, 68, 0.3)'
                  }}>
                    {currentQuestion.difficulty.toUpperCase()}
                  </span>
                )}
                {currentQuestion.category && (
                  <span style={{
                    fontSize: '11px',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: 'rgba(14, 165, 233, 0.15)',
                    color: '#38bdf8',
                    border: '1px solid rgba(14, 165, 233, 0.3)'
                  }}>
                    {currentQuestion.category}
                  </span>
                )}
                {currentQuestion.id && (
                  <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace' }}>
                    {currentQuestion.id}
                  </span>
                )}
              </div>
              <h3>{currentQuestion.title}</h3>
            </div>

            {isSolved && (
              <span className="solved-badge">
                <CheckCircle size={14} /> Solved
              </span>
            )}
          </div>

          <p className="question-text-content">{currentQuestion.description}</p>

          {/* Schema Requirements & Expected Columns Meta Tags */}
          {(currentQuestion.schemaRequirements?.length > 0 || currentQuestion.expectedColumns?.length > 0) && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              {currentQuestion.schemaRequirements?.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#94a3b8' }}>
                  <Database size={13} className="text-emerald-400" />
                  <span>Tables:</span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {currentQuestion.schemaRequirements.map(t => (
                      <span key={t} style={{ fontFamily: 'monospace', background: 'rgba(255,255,255,0.05)', padding: '1px 6px', borderRadius: '3px', color: '#e2e8f0', fontSize: '11px' }}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {currentQuestion.expectedColumns?.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#94a3b8' }}>
                  <Terminal size={13} className="text-cyan-400" />
                  <span>Columns:</span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {currentQuestion.expectedColumns.map(c => (
                      <span key={c} style={{ fontFamily: 'monospace', background: 'rgba(255,255,255,0.05)', padding: '1px 6px', borderRadius: '3px', color: '#38bdf8', fontSize: '11px' }}>
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Hint & Solution Actions */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '14px', flexWrap: 'wrap' }}>
            {(currentQuestion.hint || (currentQuestion.hints && currentQuestion.hints.length > 0)) && (
              <button
                type="button"
                className="btn-hint-link"
                onClick={() => setShowHint(!showHint)}
              >
                <HelpCircle size={14} />
                {showHint ? 'Hide Hint' : 'Show Hint'}
              </button>
            )}

            {(currentQuestion.mysqlSql || currentQuestion.postgresSql || currentQuestion.expectedQuery) && (
              <button
                type="button"
                className="btn-hint-link"
                style={{ borderColor: 'rgba(99, 102, 241, 0.4)', color: '#818cf8' }}
                onClick={() => setShowSolution(!showSolution)}
              >
                <Eye size={14} />
                {showSolution ? 'Hide Solution' : `Show ${sqlDialect === 'mysql' ? 'MySQL' : 'PostgreSQL'} Solution`}
              </button>
            )}
          </div>

          {/* Hint Body */}
          {showHint && (
            <div className="hint-body-text" style={{ marginTop: '10px' }}>
              <strong>💡 Hint:</strong> {currentQuestion.hint || (currentQuestion.hints && currentQuestion.hints.join(' '))}
            </div>
          )}

          {/* Solution Body */}
          {showSolution && (
            <div style={{
              marginTop: '10px',
              padding: '12px',
              background: '#090d16',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              borderRadius: '8px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#a5b4fc' }}>
                  {sqlDialect === 'mysql' ? 'MySQL' : 'PostgreSQL'} Reference Solution:
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={handleCopySolution}
                    style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.08)', color: '#e2e8f0', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    {copiedSolution ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    {copiedSolution ? 'Copied' : 'Copy'}
                  </button>
                  <button
                    type="button"
                    onClick={handleInsertSolution}
                    style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '4px', background: '#4f46e5', color: '#fff', border: 'none', cursor: 'pointer' }}
                  >
                    Insert to Editor
                  </button>
                </div>
              </div>
              <pre style={{
                fontFamily: 'monospace',
                fontSize: '12px',
                color: '#34d399',
                margin: 0,
                overflowX: 'auto',
                whiteSpace: 'pre-wrap',
                lineHeight: 1.5
              }}>
                {activeReferenceSql}
              </pre>
            </div>
          )}
        </div>

        {/* Editor Area */}
        <div className="editor-wrapper">
          <div className="editor-header-bar">
            <div className="editor-header-left">
              <div className="terminal-dots">
                <span className="dot dot-red" />
                <span className="dot dot-yellow" />
                <span className="dot dot-green" />
              </div>
              <span className="editor-label">SQL Query Editor</span>
              
              {/* In-Editor Dialect Toggle */}
              <div className="editor-dialect-group" role="group" aria-label="Editor Dialect">
                <button
                  type="button"
                  onClick={() => onSwitchDialect && onSwitchDialect('mysql')}
                  className={`editor-dialect-btn ${sqlDialect === 'mysql' ? 'active-mysql' : ''}`}
                >
                  MySQL
                </button>
                <button
                  type="button"
                  onClick={() => onSwitchDialect && onSwitchDialect('postgresql')}
                  className={`editor-dialect-btn ${sqlDialect === 'postgresql' ? 'active-postgres' : ''}`}
                >
                  PostgreSQL
                </button>
              </div>
            </div>

            <div className="editor-header-right">
              <span className="shortcut-hint-pill font-mono">Ctrl + Enter</span>
              <button
                type="button"
                className="btn-clear-reset"
                onClick={handleResetQuery}
                title="Reset query to initial template"
              >
                <RotateCcw size={13} />
                <span>Reset Code</span>
              </button>
            </div>
          </div>

          <textarea
            className="sql-input-area"
            value={userSql}
            onChange={(e) => setUserSql(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Type your ${sqlDialect === 'mysql' ? 'MySQL' : 'PostgreSQL'} query here...`}
            rows={6}
            spellCheck={false}
          />

          <button
            type="button"
            className="btn-run-query-primary"
            onClick={onRunQuery}
          >
            <Play size={16} fill="currentColor" /> Run Query (Ctrl+Enter)
          </button>
        </div>

        {/* Output & Validation Results */}
        <ValidationResults
          validationResult={validationResult}
          userQueryExecuted={userQueryExecuted}
        />
      </div>
    </main>
  );
}
