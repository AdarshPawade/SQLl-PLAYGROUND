import React, { useState, useMemo } from 'react';
import { Lock, CheckCircle2, PlayCircle, ListOrdered, Award, Filter, Trophy } from 'lucide-react';

export default function QuestionSidebar({
  questions = [],
  activeQuestionId,
  unlockedProgress,
  solvedQuestionIds,
  onSelectQuestion,
  isInterviewMode = false
}) {
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Extract distinct categories if in interview mode
  const categories = useMemo(() => {
    if (!isInterviewMode) return [];
    const set = new Set(questions.map(q => q.category).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [questions, isInterviewMode]);

  const filteredQuestions = useMemo(() => {
    if (!isInterviewMode || selectedCategory === 'All') return questions;
    return questions.filter(q => q.category === selectedCategory);
  }, [questions, selectedCategory, isInterviewMode]);

  const total = questions.length;
  const solvedCount = questions.filter(q => solvedQuestionIds.has(q.id)).length;
  const progressPercent = total > 0 ? Math.min(100, Math.round((solvedCount / total) * 100)) : 0;

  return (
    <aside className="question-sidebar">
      <div className="sidebar-header">
        <div className="sidebar-title-group">
          <ListOrdered size={16} />
          <h2>{isInterviewMode ? 'Interview Challenges' : 'Questions'}</h2>
        </div>
        <div className="level-counter">
          {solvedCount}/{total} Solved
        </div>
      </div>

      {isInterviewMode ? (
        <div className="interview-sidebar-milestone-card">
          <div className="interview-sidebar-milestone-header font-mono">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Trophy size={13} className="text-amber-500" />
              <span style={{ fontWeight: 800, color: '#92400e' }}>INTERVIEW MILESTONE</span>
            </div>
            <span className="interview-percent-pill font-mono">{progressPercent}%</span>
          </div>

          <div className="interview-sidebar-track-bg">
            <div
              className="interview-sidebar-track-fill"
              style={{ width: `${Math.max(progressPercent, solvedCount > 0 ? 5 : 0)}%` }}
            >
              <div className="milestone-fill-shimmer" />
            </div>
          </div>

          <div className="interview-sidebar-milestones font-mono">
            <span className={`sidebar-tick ${progressPercent >= 0 ? 'active' : ''}`}>Q0</span>
            <span className={`sidebar-tick ${progressPercent >= 20 ? 'active' : ''}`}>Q10</span>
            <span className={`sidebar-tick ${progressPercent >= 50 ? 'active' : ''}`}>Q25</span>
            <span className={`sidebar-tick ${progressPercent >= 70 ? 'active' : ''}`}>Q35</span>
            <span className={`sidebar-tick ${progressPercent === 100 ? 'active' : ''}`}>Q50</span>
          </div>
        </div>
      ) : (
        <div className="level-progress-container">
          <div className="progress-bar-bg">
            <div
              className="progress-bar-fill"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Category filter pills in Interview Mode */}
      {isInterviewMode && categories.length > 1 && (
        <div className="sidebar-category-filter">
          {categories.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`filter-chip-btn ${selectedCategory === cat ? 'active' : ''}`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      <div className="questions-list">
        {filteredQuestions.map((q, index) => {
          const originalIndex = questions.findIndex(orig => orig.id === q.id);
          const isUnlocked = isInterviewMode ? true : originalIndex <= unlockedProgress;
          const isSolved = solvedQuestionIds.has(q.id);
          const isActive = q.id === activeQuestionId;

          let statusClass = 'question-item';
          if (isActive) statusClass += ' active';
          if (isSolved) statusClass += ' solved';
          if (!isUnlocked) statusClass += ' locked';

          return (
            <div
              key={q.id}
              className={statusClass}
              onClick={() => {
                if (isUnlocked) {
                  onSelectQuestion(q);
                }
              }}
              title={!isUnlocked ? 'Complete previous question to unlock' : q.title}
            >
              <div className="question-item-left">
                <span className="question-number">Q{q.number || originalIndex + 1}</span>
                <div className="question-meta">
                  <div className="question-title-text">{q.title}</div>
                  <div className="question-badge-chip">{q.category || q.badge}</div>
                </div>
              </div>

              <div className="question-item-right">
                {isSolved ? (
                  <CheckCircle2 size={16} className="icon-solved" />
                ) : isUnlocked ? (
                  <PlayCircle size={16} className="icon-unlocked" />
                ) : (
                  <Lock size={14} className="icon-locked" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="sidebar-footer">
        <div className="unlock-tip">
          {isInterviewMode ? (
            <>
              <Award size={13} /> 50 Hard Interview Questions
            </>
          ) : (
            <>
              <Award size={13} /> Solve Question {Math.min(total, unlockedProgress + 1)} to unlock next!
            </>
          )}
        </div>
      </div>
    </aside>
  );
}

