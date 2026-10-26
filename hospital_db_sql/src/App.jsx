import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import LevelSelector from './components/LevelSelector';
import QuestionSidebar from './components/QuestionSidebar';
import SqlPlayground from './components/SqlPlayground';
import SchemaSidebar from './components/SchemaSidebar';
import AuthSystem from './components/AuthSystem';
import Footer from './components/Footer';
import LiquidCanvas from './components/LiquidCanvas';
import OnboardingModal from './components/OnboardingModal';
import { Code2, ListOrdered, Database } from 'lucide-react';

import { getActiveSession, getUserProgress, saveUserProgress } from './utils/cryptoAuth.js';

import {
  EMPLOYEE_SCHEMA_INFO,
  HOSPITAL_SCHEMA_INFO,
  INTERVIEW_SCHEMA_INFO
} from './database/schema';
import { ALL_CHALLENGES } from './data/challenges';
import { INTERVIEW_QUESTIONS } from './data/interviewQuestions';
import { createHospitalDatabase, validateUserQuery } from './utils/sqlEngine';

export default function App() {
  // Active View State: 'dashboard' (default), 'interview', 'beginner', 'intermediate', 'pro', 'levels', 'auth'
  const [activeView, setActiveView] = useState('dashboard');

  // SQL Dialect: 'mysql' | 'postgresql'
  const [sqlDialect, setSqlDialect] = useState('mysql');

  // Active Session & User Authentication State
  const [currentUser, setCurrentUser] = useState(() => getActiveSession());

  // Interactive Onboarding Modal (Auto-shown on first visit)
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(() => {
    try {
      return !localStorage.getItem('sql_playground_onboarded_v1');
    } catch {
      return false;
    }
  });

  // Mobile Practice View Sub-Tab ('editor', 'questions', 'schema')
  const [mobilePracticeTab, setMobilePracticeTab] = useState('editor');

  // Active Database state ('employee_db', 'hospital_db', 'interview_db')
  const [activeDbKey, setActiveDbKey] = useState('employee_db');

  // Database Instance & Loaded State
  const [dbInstance, setDbInstance] = useState(null);
  const [loadedDbKey, setLoadedDbKey] = useState(null);
  const dbLoaded = Boolean(dbInstance && loadedDbKey === activeDbKey);

  // Progressive Unlocking State per database & per level
  const [unlockedProgressMap, setUnlockedProgressMap] = useState(() => {
    const session = getActiveSession();
    const userKey = session?.username || 'guest';
    const prog = getUserProgress(userKey);
    return prog?.unlockedProgress || {
      employee_db: { Beginner: 0, Intermediate: 0, Pro: 0 },
      hospital_db: { Beginner: 0, Intermediate: 0, Pro: 0 }
    };
  });

  // Set of solved question IDs across session
  const [solvedQuestionIds, setSolvedQuestionIds] = useState(() => {
    const session = getActiveSession();
    const userKey = session?.username || 'guest';
    const prog = getUserProgress(userKey);
    return new Set(prog?.completedChallenges || []);
  });

  // Active Question & User SQL
  const [selectedLevel, setSelectedLevel] = useState('Beginner');
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [userSql, setUserSql] = useState('');

  // Validation Result State
  const [validationResult, setValidationResult] = useState(null);
  const [userQueryExecuted, setUserQueryExecuted] = useState(false);

  // Load Session-Isolated User Progress
  const loadProgressForSession = (user) => {
    const userKey = user && user.username ? user.username : 'guest';
    const prog = getUserProgress(userKey);
    if (prog) {
      setSolvedQuestionIds(new Set(prog.completedChallenges || []));
      if (prog.unlockedProgress) {
        setUnlockedProgressMap(prog.unlockedProgress);
      } else {
        setUnlockedProgressMap({
          employee_db: { Beginner: 0, Intermediate: 0, Pro: 0 },
          hospital_db: { Beginner: 0, Intermediate: 0, Pro: 0 }
        });
      }
    } else {
      setSolvedQuestionIds(new Set());
      setUnlockedProgressMap({
        employee_db: { Beginner: 0, Intermediate: 0, Pro: 0 },
        hospital_db: { Beginner: 0, Intermediate: 0, Pro: 0 }
      });
    }
  };

  // Handle User Login / Logout / Switch Account
  const handleSessionChange = (newSession) => {
    setCurrentUser(newSession);
    loadProgressForSession(newSession);
    setActiveQuestion(null);
    setValidationResult(null);
    setUserQueryExecuted(false);
  };

  // Re-init DB when activeDbKey changes (with async race condition safeguard and WASM disposal)
  useEffect(() => {
    let isCancelled = false;

    createHospitalDatabase(activeDbKey)
      .then((newDb) => {
        if (isCancelled) {
          try { newDb.close(); } catch {}
          return;
        }
        setDbInstance((prevDb) => {
          if (prevDb && typeof prevDb.close === 'function') {
            try { prevDb.close(); } catch {}
          }
          return newDb;
        });
        setLoadedDbKey(activeDbKey);
      })
      .catch((err) => {
        if (!isCancelled) {
          console.error('Failed to initialize SQLite WASM:', err);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [activeDbKey]);

  // Handle switching database schema
  const handleSwitchDatabase = (newDbKey) => {
    if (newDbKey === activeDbKey) return;
    setActiveDbKey(newDbKey);

    if (activeView === 'interview') {
      setActiveView('beginner');
      const questions = ALL_CHALLENGES[newDbKey]?.['Beginner'] || [];
      if (questions.length > 0) {
        setActiveQuestion(questions[0]);
        setUserSql(questions[0].initialQuery || '');
      }
    } else if (['beginner', 'intermediate', 'pro'].includes(activeView)) {
      const levelCapitalized = activeView.charAt(0).toUpperCase() + activeView.slice(1);
      const questions = ALL_CHALLENGES[newDbKey]?.[levelCapitalized] || [];
      if (questions.length > 0) {
        setActiveQuestion(questions[0]);
        setUserSql(questions[0].initialQuery || '');
      }
    } else {
      setActiveQuestion(null);
    }

    setValidationResult(null);
    setUserQueryExecuted(false);
  };


  // Navigation Router
  const handleNavigate = (viewRoute) => {
    setActiveView(viewRoute);
    if (viewRoute === 'interview') {
      setActiveDbKey('interview_db');
      if (INTERVIEW_QUESTIONS.length > 0) {
        setActiveQuestion(INTERVIEW_QUESTIONS[0]);
        setUserSql(INTERVIEW_QUESTIONS[0].initialQuery || '');
      }
    } else if (['beginner', 'intermediate', 'pro'].includes(viewRoute)) {
      if (activeDbKey === 'interview_db') {
        setActiveDbKey('employee_db');
      }
      const levelCapitalized = viewRoute.charAt(0).toUpperCase() + viewRoute.slice(1);
      setSelectedLevel(levelCapitalized);
      const levelQuestions = ALL_CHALLENGES[activeDbKey === 'interview_db' ? 'employee_db' : activeDbKey]?.[levelCapitalized] || [];
      if (levelQuestions.length > 0) {
        setActiveQuestion(levelQuestions[0]);
        setUserSql(levelQuestions[0].initialQuery || '');
      }
    } else if (viewRoute === 'dashboard') {
      if (activeDbKey === 'interview_db') {
        setActiveDbKey('employee_db');
      }
    }
    setMobilePracticeTab('editor');
    setValidationResult(null);
    setUserQueryExecuted(false);
  };

  // Handle Guided Onboarding Track Selection
  const handleSelectTrack = (trackKey) => {
    if (trackKey === 'healthcare') {
      handleSwitchDatabase('hospital_db');
      handleNavigate('beginner');
    } else if (trackKey === 'interview') {
      handleNavigate('interview');
    } else {
      handleSwitchDatabase('employee_db');
      handleNavigate('beginner');
    }
  };


  const handleSelectLevel = (levelKey) => {
    setSelectedLevel(levelKey);
    setActiveView(levelKey.toLowerCase());
    if (activeDbKey === 'interview_db') {
      setActiveDbKey('employee_db');
    }
    const levelQuestions = ALL_CHALLENGES[activeDbKey === 'interview_db' ? 'employee_db' : activeDbKey]?.[levelKey] || [];
    if (levelQuestions.length > 0) {
      setActiveQuestion(levelQuestions[0]);
      setUserSql(levelQuestions[0].initialQuery || '');
    }
    setMobilePracticeTab('editor');
    setValidationResult(null);
    setUserQueryExecuted(false);
  };

  const handleSelectQuestion = (question) => {
    setActiveQuestion(question);
    setUserSql(question.initialQuery || '');
    setMobilePracticeTab('editor');
    setValidationResult(null);
    setUserQueryExecuted(false);
  };

  // Run Query & Validate Engine
  const handleRunQuery = () => {
    if (!dbInstance || !activeQuestion) return;

    const result = validateUserQuery(
      dbInstance,
      userSql,
      activeQuestion.expectedQuery,
      activeQuestion.verificationQuery,
      activeDbKey
    );

    setValidationResult(result);
    setUserQueryExecuted(true);

    if (result.isMatch) {
      // Mark question as solved
      const newSolved = new Set(solvedQuestionIds).add(activeQuestion.id);
      setSolvedQuestionIds(newSolved);

      // Session State Persistence for DDL/DML
      const isDmlDdl = /^\s*(CREATE|INSERT|UPDATE|DELETE|DROP|ALTER|REPLACE)/i.test(userSql.trim());
      if (isDmlDdl) {
        try {
          const createMatch = userSql.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([a-zA-Z0-9_]+)/i);
          if (createMatch && createMatch[1]) {
            dbInstance.run(`DROP TABLE IF EXISTS ${createMatch[1]};`);
          }

          let sessionSql = userSql;
          if (/^\s*INSERT\s+INTO/i.test(sessionSql)) {
            sessionSql = sessionSql.replace(/^\s*INSERT\s+INTO/i, 'INSERT OR REPLACE INTO');
          }
          dbInstance.run(sessionSql);
        } catch (e) {
          console.warn('Session DB update notice:', e);
        }
      }

      // Unlock next question for level challenges
      if (activeView !== 'interview') {
        const levelQuestions = ALL_CHALLENGES[activeDbKey]?.[selectedLevel] || [];
        const currentIdx = levelQuestions.findIndex(q => q.id === activeQuestion.id);
        const currentUnlocked = unlockedProgressMap[activeDbKey]?.[selectedLevel] || 0;
        let nextUnlocked = currentUnlocked;

        if (currentIdx === currentUnlocked && currentUnlocked < levelQuestions.length - 1) {
          nextUnlocked = currentUnlocked + 1;
        }

        const updatedUnlockedMap = {
          ...unlockedProgressMap,
          [activeDbKey]: {
            ...unlockedProgressMap[activeDbKey],
            [selectedLevel]: nextUnlocked
          }
        };

        setUnlockedProgressMap(updatedUnlockedMap);

        // Persist strictly to active user's isolated profile
        const activeUserKey = currentUser && currentUser.username ? currentUser.username : 'guest';
        saveUserProgress(activeUserKey, {
          completedChallenges: Array.from(newSolved),
          unlockedProgress: updatedUnlockedMap
        });
      } else {
        // Persist solved interview question
        const activeUserKey = currentUser && currentUser.username ? currentUser.username : 'guest';
        saveUserProgress(activeUserKey, {
          completedChallenges: Array.from(newSolved),
          unlockedProgress: unlockedProgressMap
        });
      }
    }
  };

  // Compute Solved Statistics across both databases + interview questions
  const empChallenges = ALL_CHALLENGES.employee_db;
  const hospChallenges = ALL_CHALLENGES.hospital_db;

  const solvedStats = {
    beginner: {
      solved: (empChallenges.Beginner.filter(q => solvedQuestionIds.has(q.id)).length) +
        (hospChallenges.Beginner.filter(q => solvedQuestionIds.has(q.id)).length),
      total: empChallenges.Beginner.length + hospChallenges.Beginner.length
    },
    intermediate: {
      solved: (empChallenges.Intermediate.filter(q => solvedQuestionIds.has(q.id)).length) +
        (hospChallenges.Intermediate.filter(q => solvedQuestionIds.has(q.id)).length),
      total: empChallenges.Intermediate.length + hospChallenges.Intermediate.length
    },
    pro: {
      solved: (empChallenges.Pro.filter(q => solvedQuestionIds.has(q.id)).length) +
        (hospChallenges.Pro.filter(q => solvedQuestionIds.has(q.id)).length),
      total: empChallenges.Pro.length + hospChallenges.Pro.length
    },
    interview: {
      solved: INTERVIEW_QUESTIONS.filter(q => solvedQuestionIds.has(q.id)).length,
      total: INTERVIEW_QUESTIONS.length
    }
  };

  const isInterviewMode = activeView === 'interview';
  const currentDbChallenges = ALL_CHALLENGES[activeDbKey] || { Beginner: [], Intermediate: [], Pro: [] };
  const currentLevelQuestions = currentDbChallenges[selectedLevel] || [];
  const currentUnlockedProgress = unlockedProgressMap[activeDbKey]?.[selectedLevel] || 0;

  let activeSchemaInfo = EMPLOYEE_SCHEMA_INFO;
  if (activeDbKey === 'hospital_db') {
    activeSchemaInfo = HOSPITAL_SCHEMA_INFO;
  } else if (activeDbKey === 'interview_db') {
    activeSchemaInfo = INTERVIEW_SCHEMA_INFO;
  }

  const sidebarQuestions = isInterviewMode ? INTERVIEW_QUESTIONS : currentLevelQuestions;
  const totalSolvedCount = solvedQuestionIds.size;

  return (
    <div className="app-root">
      <LiquidCanvas />
      <Header
        activeDbKey={activeDbKey}
        onSwitchDatabase={handleSwitchDatabase}
        activeView={activeView}
        onNavigate={handleNavigate}
        dbLoaded={dbLoaded}
        totalSolvedCount={totalSolvedCount}
        currentUser={currentUser}
        sqlDialect={sqlDialect}
        onSwitchDialect={setSqlDialect}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
      />

      {/* VIEW ROUTING */}
      {activeView === 'dashboard' && (
        <Dashboard
          activeDbKey={activeDbKey}
          onSwitchDatabase={handleSwitchDatabase}
          onNavigate={handleNavigate}
          solvedStats={solvedStats}
        />
      )}

      {['beginner', 'intermediate', 'pro', 'interview'].includes(activeView) && (
        <div className="practice-layout-wrapper">
          {/* Mobile Practice Sub-Navigation (visible on <= 1024px screens) */}
          <div className="practice-mobile-tab-bar" role="tablist" aria-label="Practice Panel Views">
            <button
              type="button"
              role="tab"
              aria-selected={mobilePracticeTab === 'editor'}
              className={`practice-mobile-tab-btn ${mobilePracticeTab === 'editor' ? 'active' : ''}`}
              onClick={() => setMobilePracticeTab('editor')}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>SQL Editor</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={mobilePracticeTab === 'questions'}
              className={`practice-mobile-tab-btn ${mobilePracticeTab === 'questions' ? 'active' : ''}`}
              onClick={() => setMobilePracticeTab('questions')}
            >
              <ListOrdered className="w-3.5 h-3.5" />
              <span>Questions ({sidebarQuestions.filter(q => solvedQuestionIds.has(q.id)).length}/{sidebarQuestions.length})</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={mobilePracticeTab === 'schema'}
              className={`practice-mobile-tab-btn ${mobilePracticeTab === 'schema' ? 'active' : ''}`}
              onClick={() => setMobilePracticeTab('schema')}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Schema ({activeDbKey === 'interview_db' ? 'Interview' : (activeDbKey === 'employee_db' ? 'Employee' : 'Hospital')})</span>
            </button>
          </div>

          <div className={`dashboard-layout mobile-tab-${mobilePracticeTab}`}>
            <QuestionSidebar
              questions={sidebarQuestions}
              activeQuestionId={activeQuestion ? activeQuestion.id : null}
              unlockedProgress={isInterviewMode ? INTERVIEW_QUESTIONS.length : currentUnlockedProgress}
              solvedQuestionIds={solvedQuestionIds}
              onSelectQuestion={handleSelectQuestion}
              isInterviewMode={isInterviewMode}
            />

            <SqlPlayground
              currentQuestion={activeQuestion}
              userSql={userSql}
              setUserSql={setUserSql}
              onRunQuery={handleRunQuery}
              validationResult={validationResult}
              userQueryExecuted={userQueryExecuted}
              isSolved={activeQuestion ? solvedQuestionIds.has(activeQuestion.id) : false}
              sqlDialect={sqlDialect}
              onSwitchDialect={setSqlDialect}
            />

            <SchemaSidebar
              activeDbKey={activeDbKey}
              activeSchemaInfo={activeSchemaInfo}
              dbInstance={dbInstance}
            />
          </div>
        </div>
      )}

      {activeView === 'auth' && (
        <AuthSystem
          currentUser={currentUser}
          onSessionChange={handleSessionChange}
        />
      )}

      {activeView === 'levels' && (
        <LevelSelector
          activeDbKey={activeDbKey}
          challengesForActiveDb={currentDbChallenges}
          onSelectLevel={handleSelectLevel}
          progressMap={{
            ...Object.keys(currentDbChallenges).reduce((acc, lvlKey) => {
              const qList = currentDbChallenges[lvlKey] || [];
              const solvedInLvl = qList.filter(q => solvedQuestionIds.has(q.id)).length;
              acc[lvlKey] = solvedInLvl;
              return acc;
            }, {})
          }}
        />
      )}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onSelectTrack={handleSelectTrack}
        onOpenAuth={() => handleNavigate('auth')}
      />
      <Footer />
    </div>
  );
}
