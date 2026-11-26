import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Lock, User, Mail, Key, ShieldCheck, CheckCircle2, AlertCircle, 
  LogOut, RefreshCw, Trophy, UserCheck, HelpCircle,
  Sparkles, Layers, Eye, EyeOff, ArrowRight
} from 'lucide-react';
import { 
  registerUser, authenticateUser, resetPassword, getActiveSession, 
  clearActiveSession, getUserProgress, validateClientPasswordPolicy,
  syncCloudUserToLocalSession, mergeCloudProgressIntoLocal
} from '../utils/cryptoAuth.js';
import {
  registerApi,
  loginApi,
  resetPasswordApi,
  fetchUserProgress,
  syncProgressApi,
  logoutApi
} from '../services/api.js';
import './AuthSystem.css';


/**
 * LiquidGL Background Canvas
 * Renders interactive ambient fluid metaballs & chromatic light refractions
 */
function LiquidGLCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = canvas.offsetWidth || 800);
    let height = (canvas.height = canvas.offsetHeight || 700);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    // Liquid Blobs Configuration
    const blobs = [
      { x: width * 0.25, y: height * 0.35, r: 160, vx: 0.35, vy: 0.25, color: 'rgba(16, 185, 129, 0.22)' }, // Emerald
      { x: width * 0.75, y: height * 0.45, r: 200, vx: -0.28, vy: 0.35, color: 'rgba(6, 182, 212, 0.24)' },  // Cyan
      { x: width * 0.5, y: height * 0.65, r: 180, vx: 0.3, vy: -0.3, color: 'rgba(99, 102, 241, 0.20)' },   // Indigo
      { x: width * 0.35, y: height * 0.8, r: 140, vx: -0.25, vy: -0.2, color: 'rgba(236, 72, 153, 0.16)' }   // Pink/Magenta
    ];

    let time = 0;
    const render = () => {
      time += 0.015;
      ctx.clearRect(0, 0, width, height);

      blobs.forEach((b, i) => {
        b.x += b.vx + Math.sin(time + i * 1.5) * 0.5;
        b.y += b.vy + Math.cos(time + i * 2) * 0.5;

        if (b.x < -40) b.vx = Math.abs(b.vx);
        if (b.x > width + 40) b.vx = -Math.abs(b.vx);
        if (b.y < -40) b.vy = Math.abs(b.vy);
        if (b.y > height + 40) b.vy = -Math.abs(b.vy);

        const gradient = ctx.createRadialGradient(b.x, b.y, b.r * 0.1, b.x, b.y, b.r);
        gradient.addColorStop(0, b.color);
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="liquid-gl-canvas" />;
}

export default function AuthSystem({ currentUser: propUser, onSessionChange, onNavigatePlayground }) {
  const [currentUser, setCurrentUser] = useState(() => propUser || getActiveSession());
  const [activeTab, setActiveTab] = useState(() => (propUser || getActiveSession()) ? 'dashboard' : 'login');
  const [userProgress, setUserProgress] = useState(() => {
    const session = propUser || getActiveSession();
    const userKey = session?.username || 'guest';
    return getUserProgress(userKey) || {
      completedChallenges: [],
      unlockedProgress: {
        employee_db: { Beginner: 0, Intermediate: 0, Pro: 0 },
        hospital_db: { Beginner: 0, Intermediate: 0, Pro: 0 }
      }
    };
  });

  // Form States
  const [loginForm, setLoginForm] = useState({ usernameOrEmail: '', password: '' });
  const [signupForm, setSignupForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    securityQuestion: 'What was your first pet\'s name?',
    securityAnswer: ''
  });
  const [forgotForm, setForgotForm] = useState({
    usernameOrEmail: '',
    securityAnswer: '',
    newPassword: '',
    confirmPassword: ''
  });

  // UI Feedback & Visibility States
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    login: false,
    signup: false,
    forgot: false
  });
  const alertTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (alertTimerRef.current) clearTimeout(alertTimerRef.current);
    };
  }, []);

  // Load Session-Isolated User Progress
  const loadUserProgress = useCallback((username) => {
    const userKey = username || 'guest';
    const prog = getUserProgress(userKey) || {
      completedChallenges: [],
      unlockedProgress: {
        employee_db: { Beginner: 0, Intermediate: 0, Pro: 0 },
        hospital_db: { Beginner: 0, Intermediate: 0, Pro: 0 }
      }
    };
    setUserProgress(prog);
  }, []);

  const handleAlert = (type, text) => {
    if (alertTimerRef.current) clearTimeout(alertTimerRef.current);
    setMessage({ type, text });
    alertTimerRef.current = setTimeout(() => setMessage({ type: '', text: '' }), 6000);
  };

  const switchTab = (tab) => {
    setMessage({ type: '', text: '' });
    setActiveTab(tab);
  };

  // Sign-Up Handler (Cloud-first with clean offline local fallback)
  const handleSignUp = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    const cleanUsername = signupForm.username.trim().toLowerCase();
    const cleanEmail = signupForm.email.trim().toLowerCase();

    if (!cleanUsername || !cleanEmail || !signupForm.password || !signupForm.securityAnswer.trim()) {
      return handleAlert('error', 'Please complete all required fields.');
    }

    if (!/^[a-zA-Z0-9_.-]{3,32}$/.test(cleanUsername)) {
      return handleAlert('error', 'Username must be 3-32 characters (letters, numbers, dots, dashes, or underscores).');
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return handleAlert('error', 'Please enter a valid email address.');
    }

    const passCheck = validateClientPasswordPolicy(signupForm.password);
    if (!passCheck.valid) {
      return handleAlert('error', passCheck.reason);
    }

    if (signupForm.password !== signupForm.confirmPassword) {
      return handleAlert('error', 'Passwords do not match.');
    }

    setIsSubmitting(true);
    try {
      const cloudRes = await registerApi({
        username: cleanUsername,
        email: cleanEmail,
        password: signupForm.password,
        fullName: signupForm.username.trim(),
        securityQuestion: signupForm.securityQuestion,
        securityAnswer: signupForm.securityAnswer.trim()
      });

      if (cloudRes.success && cloudRes.user) {
        // Mirror local offline credentials best-effort and initialize active session immediately
        await registerUser({
          username: signupForm.username.trim(),
          email: cleanEmail,
          password: signupForm.password,
          securityQuestion: signupForm.securityQuestion,
          securityAnswer: signupForm.securityAnswer.trim()
        }).catch(() => {});

        const sessionUser = syncCloudUserToLocalSession(cloudRes.user);
        setCurrentUser(sessionUser);

        // Sync any prior guest progress into the newly created account
        try {
          const guestProg = getUserProgress('guest');
          if (guestProg && (guestProg.completedChallenges?.length > 0)) {
            const syncRes = await syncProgressApi(guestProg);
            if (syncRes?.success && syncRes.progress) {
              mergeCloudProgressIntoLocal(sessionUser.username, syncRes.progress);
            }
          }
        } catch {}

        loadUserProgress(sessionUser.username);
        setSignupForm({
          username: '', email: '', password: '', confirmPassword: '',
          securityQuestion: 'What was your first pet\'s name?', securityAnswer: ''
        });
        setActiveTab('dashboard');
        handleAlert('success', `Account created! Welcome to SQL Playground, ${sessionUser.displayName}.`);
        if (onSessionChange) onSessionChange(sessionUser);
        return;
      }

      // Surface server validation / duplicate-account errors directly instead of masking them
      if (!cloudRes.networkError) {
        return handleAlert('error', cloudRes.error || 'Could not create account. Please check your details.');
      }

      // Offline fallback when backend server is unreachable
      const localRes = await registerUser({
        username: signupForm.username.trim(),
        email: cleanEmail,
        password: signupForm.password,
        securityQuestion: signupForm.securityQuestion,
        securityAnswer: signupForm.securityAnswer.trim()
      });

      if (localRes.success) {
        const authRes = await authenticateUser(cleanUsername, signupForm.password);
        if (authRes.success) {
          setCurrentUser(authRes.user);
          loadUserProgress(authRes.user.username);
          setActiveTab('dashboard');
          if (onSessionChange) onSessionChange(authRes.user);
        } else {
          setActiveTab('login');
        }
        setSignupForm({
          username: '', email: '', password: '', confirmPassword: '',
          securityQuestion: 'What was your first pet\'s name?', securityAnswer: ''
        });
        handleAlert('success', 'Account created in local offline mode!');
      } else {
        handleAlert('error', localRes.error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Login Handler (Cloud-first with cross-device progress sync & offline fallback)
  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    const identifier = loginForm.usernameOrEmail.trim();
    if (!identifier || !loginForm.password) {
      return handleAlert('error', 'Please enter your username/email and password.');
    }

    setIsSubmitting(true);
    try {
      const cloudRes = await loginApi({
        usernameOrEmail: identifier,
        password: loginForm.password
      });

      if (cloudRes.success && cloudRes.user) {
        const sessionUser = syncCloudUserToLocalSession(cloudRes.user);

        // Fetch and merge this user's cloud progress
        try {
          const cloudProgRes = await fetchUserProgress(cloudRes.user.id);
          if (cloudProgRes?.success && cloudProgRes.progress) {
            mergeCloudProgressIntoLocal(sessionUser.username, cloudProgRes.progress);
          }
        } catch {}

        setCurrentUser(sessionUser);
        loadUserProgress(sessionUser.username);
        setLoginForm({ usernameOrEmail: '', password: '' });
        setActiveTab('dashboard');
        handleAlert('success', `Welcome back, ${sessionUser.displayName || sessionUser.username}!`);
        if (onSessionChange) onSessionChange(sessionUser);
        return;
      }

      if (!cloudRes.networkError) {
        return handleAlert('error', cloudRes.error || 'Invalid username/email or password.');
      }

      // Offline fallback when backend server is unreachable
      const localRes = await authenticateUser(identifier, loginForm.password);
      if (localRes.success) {
        setCurrentUser(localRes.user);
        loadUserProgress(localRes.user.username);
        setLoginForm({ usernameOrEmail: '', password: '' });
        setActiveTab('dashboard');
        handleAlert('success', `Welcome back, ${localRes.user.displayName || localRes.user.username}! (Local Mode)`);
        if (onSessionChange) onSessionChange(localRes.user);
      } else {
        handleAlert('error', localRes.error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Password Reset Handler (Cloud + local)
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!forgotForm.usernameOrEmail.trim() || !forgotForm.securityAnswer.trim() || !forgotForm.newPassword) {
      return handleAlert('error', 'Please complete all fields.');
    }

    const passCheck = validateClientPasswordPolicy(forgotForm.newPassword);
    if (!passCheck.valid) {
      return handleAlert('error', passCheck.reason);
    }

    if (forgotForm.newPassword !== forgotForm.confirmPassword) {
      return handleAlert('error', 'Passwords do not match.');
    }

    setIsSubmitting(true);
    try {
      const cloudRes = await resetPasswordApi({
        usernameOrEmail: forgotForm.usernameOrEmail.trim(),
        securityAnswer: forgotForm.securityAnswer.trim(),
        newPassword: forgotForm.newPassword
      });

      if (cloudRes.success) {
        // Mirror reset locally if a local cache record exists
        await resetPassword({
          usernameOrEmail: forgotForm.usernameOrEmail.trim(),
          securityAnswer: forgotForm.securityAnswer.trim(),
          newPassword: forgotForm.newPassword
        }).catch(() => {});

        handleAlert('success', cloudRes.message || 'Password reset successfully! You can now log in.');
        setForgotForm({ usernameOrEmail: '', securityAnswer: '', newPassword: '', confirmPassword: '' });
        setActiveTab('login');
        return;
      }

      if (!cloudRes.networkError) {
        return handleAlert('error', cloudRes.error || 'Could not reset password.');
      }

      const localRes = await resetPassword({
        usernameOrEmail: forgotForm.usernameOrEmail.trim(),
        securityAnswer: forgotForm.securityAnswer.trim(),
        newPassword: forgotForm.newPassword
      });

      if (localRes.success) {
        handleAlert('success', localRes.message);
        setForgotForm({ usernameOrEmail: '', securityAnswer: '', newPassword: '', confirmPassword: '' });
        setActiveTab('login');
      } else {
        handleAlert('error', localRes.error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Logout Handler
  const handleLogout = () => {
    logoutApi().catch(() => {});
    clearActiveSession();
    setCurrentUser(null);
    setUserProgress(null);
    setActiveTab('login');
    handleAlert('success', 'Logged out safely. Session cleared.');
    if (onSessionChange) onSessionChange(null);
  };

  const signupChecks = validateClientPasswordPolicy(signupForm.password).checks;
  const forgotChecks = validateClientPasswordPolicy(forgotForm.newPassword).checks;


  return (
    <div className="auth-system-container">
      {/* Ambient LiquidGL Shader Canvas */}
      <LiquidGLCanvas />

      {/* Liquid Header Navigation Tabs */}
      <div className="auth-nav-tabs">
        {!currentUser ? (
          <>
            <button 
              type="button"
              className={`auth-tab-btn ${activeTab === 'login' ? 'active' : ''}`}
              onClick={() => switchTab('login')}
            >
              <Lock className="w-4 h-4 mr-2" /> Sign In
            </button>
            <button 
              type="button"
              className={`auth-tab-btn ${activeTab === 'signup' ? 'active' : ''}`}
              onClick={() => switchTab('signup')}
            >
              <User className="w-4 h-4 mr-2" /> Create Account
            </button>
            <button 
              type="button"
              className={`auth-tab-btn ${activeTab === 'forgot' ? 'active' : ''}`}
              onClick={() => switchTab('forgot')}
            >
              <Key className="w-4 h-4 mr-2" /> Recover Account
            </button>
          </>
        ) : (
          <>
            <button 
              className={`auth-tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <Trophy className="w-4 h-4 mr-2" /> {currentUser.displayName || currentUser.username}'s Profile
            </button>
          </>
        )}
      </div>

      {/* Alert Notifications */}
      {message.text && (
        <div className={`auth-alert ${message.type}`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 mr-2 text-emerald-400" /> : <AlertCircle className="w-5 h-5 mr-2 text-rose-400" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* SIGN IN FORM (LiquidGL UI) */}
      {activeTab === 'login' && !currentUser && (
        <form className="auth-form-card liquid-card" onSubmit={handleLogin}>
          <div className="liquid-card-glow-overlay" />
          
          <div className="auth-card-header">
            <div className="liquid-badge-pill">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>USER AUTHENTICATION</span>
            </div>
            <h3>Sign In to Your Account</h3>
            <p>Access your personal SQL workspace and track your progress</p>
          </div>

          <div className="form-group">
            <label><User className="w-4 h-4 inline mr-1 text-emerald-400" /> Username or Email</label>
            <input 
              type="text" 
              placeholder="Enter your username or email"
              value={loginForm.usernameOrEmail}
              onChange={e => setLoginForm({ ...loginForm, usernameOrEmail: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label><Lock className="w-4 h-4 inline mr-1 text-cyan-400" /> Password</label>
            <div className="password-input-wrap">
              <input 
                type={showPasswords.login ? 'text' : 'password'}
                placeholder="Enter your password"
                autoComplete="current-password"
                value={loginForm.password}
                onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPasswords(p => ({ ...p, login: !p.login }))}
                aria-label={showPasswords.login ? 'Hide password' : 'Show password'}
              >
                {showPasswords.login ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={isSubmitting} className="auth-submit-btn primary liquid-btn">
            <ShieldCheck className="w-4 h-4 mr-2" /> {isSubmitting ? 'Signing In...' : 'Sign In'}
          </button>

          <div className="auth-footer-links">
            <span onClick={() => switchTab('forgot')}>Forgot Password?</span>
            <span onClick={() => switchTab('signup')}>Need an account? Sign Up</span>
          </div>
        </form>
      )}

      {/* SIGN UP FORM */}
      {activeTab === 'signup' && !currentUser && (
        <form className="auth-form-card liquid-card" onSubmit={handleSignUp}>
          <div className="liquid-card-glow-overlay" />

          <div className="auth-card-header">
            <div className="liquid-badge-pill">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>CREATE ACCOUNT</span>
            </div>
            <h3>Register New Account</h3>
            <p>Create your personal profile to save solutions and track progress</p>
          </div>

          <div className="form-group">
            <label><User className="w-4 h-4 inline mr-1 text-emerald-400" /> Username</label>
            <input 
              type="text" 
              placeholder="Choose a unique username"
              value={signupForm.username}
              onChange={e => setSignupForm({ ...signupForm, username: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label><Mail className="w-4 h-4 inline mr-1 text-cyan-400" /> Email Address</label>
            <input 
              type="email" 
              placeholder="name@example.com"
              value={signupForm.email}
              onChange={e => setSignupForm({ ...signupForm, email: e.target.value })}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label><Lock className="w-4 h-4 inline mr-1 text-indigo-400" /> Password</label>
              <div className="password-input-wrap">
                <input 
                  type={showPasswords.signup ? 'text' : 'password'}
                  placeholder="At least 12 characters"
                  autoComplete="new-password"
                  value={signupForm.password}
                  onChange={e => setSignupForm({ ...signupForm, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPasswords(p => ({ ...p, signup: !p.signup }))}
                  aria-label={showPasswords.signup ? 'Hide password' : 'Show password'}
                >
                  {showPasswords.signup ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="form-group flex-1">
              <label><Lock className="w-4 h-4 inline mr-1 text-indigo-400" /> Confirm Password</label>
              <input 
                type={showPasswords.signup ? 'text' : 'password'}
                placeholder="Re-enter password"
                autoComplete="new-password"
                value={signupForm.confirmPassword}
                onChange={e => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="password-rules-grid">
            <span className={`rule-pill ${signupChecks.minLength ? 'met' : ''}`}>12+ chars</span>
            <span className={`rule-pill ${signupChecks.hasUpper ? 'met' : ''}`}>Uppercase</span>
            <span className={`rule-pill ${signupChecks.hasLower ? 'met' : ''}`}>Lowercase</span>
            <span className={`rule-pill ${signupChecks.hasDigit ? 'met' : ''}`}>Number</span>
            <span className={`rule-pill ${signupChecks.hasSpecial ? 'met' : ''}`}>Special char</span>
          </div>

          <div className="form-group">
            <label><HelpCircle className="w-4 h-4 inline mr-1 text-amber-400" /> Recovery Security Question</label>
            <select 
              value={signupForm.securityQuestion}
              onChange={e => setSignupForm({ ...signupForm, securityQuestion: e.target.value })}
            >
              <option>What was your first pet's name?</option>
              <option>What city were you born in?</option>
              <option>What is your favorite SQL database?</option>
              <option>What was the name of your first school?</option>
            </select>
          </div>

          <div className="form-group">
            <label><Key className="w-4 h-4 inline mr-1 text-emerald-400" /> Security Answer</label>
            <input 
              type="text" 
              placeholder="Answer used for password recovery"
              value={signupForm.securityAnswer}
              onChange={e => setSignupForm({ ...signupForm, securityAnswer: e.target.value })}
              required
            />
          </div>

          <button type="submit" disabled={isSubmitting} className="auth-submit-btn success liquid-btn">
            <UserCheck className="w-4 h-4 mr-2" /> {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </button>

          <div className="auth-footer-links">
            <span onClick={() => switchTab('login')}>Already have an account? Log In</span>
          </div>
        </form>
      )}

      {/* FORGOT PASSWORD FORM */}
      {activeTab === 'forgot' && !currentUser && (
        <form className="auth-form-card liquid-card" onSubmit={handleForgotPassword}>
          <div className="liquid-card-glow-overlay" />

          <div className="auth-card-header">
            <div className="liquid-badge-pill">
              <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
              <span>PASSWORD RECOVERY</span>
            </div>
            <h3>Reset Your Password</h3>
            <p>Verify your security answer to safely choose a new password</p>
          </div>

          <div className="form-group">
            <label><User className="w-4 h-4 inline mr-1 text-emerald-400" /> Username or Email</label>
            <input 
              type="text" 
              placeholder="Enter your registered username or email"
              value={forgotForm.usernameOrEmail}
              onChange={e => setForgotForm({ ...forgotForm, usernameOrEmail: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label><HelpCircle className="w-4 h-4 inline mr-1 text-amber-400" /> Security Answer</label>
            <input 
              type="text" 
              placeholder="Enter your security question answer"
              value={forgotForm.securityAnswer}
              onChange={e => setForgotForm({ ...forgotForm, securityAnswer: e.target.value })}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label><Lock className="w-4 h-4 inline mr-1 text-indigo-400" /> New Password</label>
              <div className="password-input-wrap">
                <input 
                  type={showPasswords.forgot ? 'text' : 'password'}
                  placeholder="At least 12 characters"
                  autoComplete="new-password"
                  value={forgotForm.newPassword}
                  onChange={e => setForgotForm({ ...forgotForm, newPassword: e.target.value })}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPasswords(p => ({ ...p, forgot: !p.forgot }))}
                  aria-label={showPasswords.forgot ? 'Hide password' : 'Show password'}
                >
                  {showPasswords.forgot ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="form-group flex-1">
              <label><Lock className="w-4 h-4 inline mr-1 text-indigo-400" /> Confirm New Password</label>
              <input 
                type={showPasswords.forgot ? 'text' : 'password'}
                placeholder="Re-enter new password"
                autoComplete="new-password"
                value={forgotForm.confirmPassword}
                onChange={e => setForgotForm({ ...forgotForm, confirmPassword: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="password-rules-grid">
            <span className={`rule-pill ${forgotChecks.minLength ? 'met' : ''}`}>12+ chars</span>
            <span className={`rule-pill ${forgotChecks.hasUpper ? 'met' : ''}`}>Uppercase</span>
            <span className={`rule-pill ${forgotChecks.hasLower ? 'met' : ''}`}>Lowercase</span>
            <span className={`rule-pill ${forgotChecks.hasDigit ? 'met' : ''}`}>Number</span>
            <span className={`rule-pill ${forgotChecks.hasSpecial ? 'met' : ''}`}>Special char</span>
          </div>

          <button type="submit" disabled={isSubmitting} className="auth-submit-btn warning liquid-btn">
            <RefreshCw className="w-4 h-4 mr-2" /> {isSubmitting ? 'Resetting...' : 'Reset Password'}
          </button>

          <div className="auth-footer-links">
            <span onClick={() => switchTab('login')}>Back to Log In</span>
          </div>
        </form>
      )}

      {/* DASHBOARD & PROGRESS TRACKER */}
      {activeTab === 'dashboard' && currentUser && (
        <div className="auth-dashboard-grid">
          {/* User Profile Summary Header */}
          <div className="profile-banner-card liquid-card">
            <div className="profile-info">
              <div className="avatar-circle">
                {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <h2>{currentUser.displayName || currentUser.username}</h2>
                <p className="profile-email"><Mail className="w-3 h-3 inline mr-1" /> {currentUser.email}</p>
                <span className="session-badge"><ShieldCheck className="w-3 h-3 inline mr-1" /> Active Profile ({currentUser.username})</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {onNavigatePlayground && (
                <button type="button" className="auth-go-playground-btn" onClick={onNavigatePlayground}>
                  <span>Start Practicing</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              )}
              <button type="button" className="logout-btn" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" /> Sign Out
              </button>
            </div>
          </div>

          {/* Metrics Stats Row */}
          <div className="stats-row">
            <div className="stat-card liquid-card">
              <Trophy className="w-6 h-6 text-amber-400 mb-2" />
              <div className="stat-value">{userProgress?.completedChallenges?.length || 0}</div>
              <div className="stat-label">Challenges Completed</div>
            </div>

            <div className="stat-card liquid-card">
              <Sparkles className="w-6 h-6 text-cyan-400 mb-2" />
              <div className="stat-value">
                {userProgress?.completedChallenges?.length 
                  ? `${Math.min(100, Math.round((userProgress.completedChallenges.length / 210) * 100))}%` 
                  : '0%'}
              </div>
              <div className="stat-label">Platform Mastery</div>
            </div>

            <div className="stat-card liquid-card">
              <Layers className="w-6 h-6 text-emerald-400 mb-2" />
              <div className="stat-value">
                {(userProgress?.unlockedProgress?.employee_db?.Beginner || 0) + (userProgress?.unlockedProgress?.hospital_db?.Beginner || 0)}
              </div>
              <div className="stat-label">Unlocked Level Progress</div>
            </div>
          </div>

          {/* Account Profile & Studio Configuration Card */}
          <div className="profile-overview-card liquid-card">
            <div className="overview-header">
              <div className="liquid-badge-pill">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>SECURE USER SESSION</span>
              </div>
              <h3>Account Profile & Studio Configuration</h3>
              <p>Your session and challenge progress are cryptographically stored in local isolation.</p>
            </div>

            <div className="overview-grid">
              <div className="overview-item">
                <span className="overview-label">Username</span>
                <span className="overview-val font-mono">@{currentUser.username}</span>
              </div>
              <div className="overview-item">
                <span className="overview-label">Display Name</span>
                <span className="overview-val">{currentUser.displayName || currentUser.username}</span>
              </div>
              <div className="overview-item">
                <span className="overview-label">Registered Email</span>
                <span className="overview-val">{currentUser.email}</span>
              </div>
              <div className="overview-item">
                <span className="overview-label">Execution Dialects</span>
                <span className="overview-val font-mono text-emerald-600">MySQL 8.0 & PostgreSQL</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
