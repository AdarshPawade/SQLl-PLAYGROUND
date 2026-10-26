/**
 * Client-Side Security & Web Crypto API Authentication Utility
 * 
 * Provides salted SHA-256 password hashing via Web Crypto API,
 * XSS input sanitization, and session-isolated Web Storage persistence.
 */

// Safe storage helper supporting browser localStorage and Node test environments
function getStorage() {
  if (typeof localStorage !== 'undefined') {
    return localStorage;
  }
  if (!globalThis._mockStorage) {
    const mem = {};
    globalThis._mockStorage = {
      getItem: (k) => (k in mem ? mem[k] : null),
      setItem: (k, v) => { mem[k] = String(v); },
      removeItem: (k) => { delete mem[k]; },
      clear: () => {
        for (const k in mem) delete mem[k];
      }
    };
  }
  return globalThis._mockStorage;
}

// Safe crypto helper
function getCrypto() {
  if (typeof window !== 'undefined' && window.crypto) {
    return window.crypto;
  }
  if (typeof globalThis !== 'undefined' && globalThis.crypto) {
    return globalThis.crypto;
  }
  throw new Error('Web Crypto API not available');
}

// Generate cryptographically secure random salt
export function generateSalt(length = 16) {
  const array = new Uint8Array(length);
  const cryptoObj = getCrypto();
  cryptoObj.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Compute salted SHA-256 hash using Web Crypto API
export async function hashPassword(password, salt) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt);
  const cryptoObj = getCrypto();
  const hashBuffer = await cryptoObj.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Sanitize inputs against XSS attack vectors
export function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// Local Storage User Registry Key
const USERS_STORAGE_KEY = 'sql_playground_users_v1';
const SESSION_STORAGE_KEY = 'sql_playground_active_session_v1';

// Retrieve all local user accounts
export function getRegisteredUsers() {
  try {
    const storage = getStorage();
    const data = storage.getItem(USERS_STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    console.error('Failed to read registered users from local storage:', e);
    return {};
  }
}

// Register a new client-side account
export async function registerUser({ username, email, password, securityQuestion, securityAnswer }) {
  const users = getRegisteredUsers();
  const cleanUsername = sanitizeInput(username.trim().toLowerCase());
  const cleanEmail = sanitizeInput(email.trim().toLowerCase());

  // Duplicate account check
  if (users[cleanUsername]) {
    return { success: false, error: 'An account with this username already exists.' };
  }

  // Check duplicate email
  const emailExists = Object.values(users).some(u => u.email === cleanEmail);
  if (emailExists) {
    return { success: false, error: 'An account with this email address already exists.' };
  }

  // Client-Side Salted Password Hashing
  const salt = generateSalt();
  const passwordHash = await hashPassword(password, salt);

  // Hash security answer as well for client-side recovery security
  const answerSalt = generateSalt();
  const answerHash = await hashPassword(securityAnswer.trim().toLowerCase(), answerSalt);

  const newUser = {
    username: cleanUsername,
    displayName: username.trim(),
    email: cleanEmail,
    salt,
    passwordHash,
    securityQuestion,
    answerSalt,
    answerHash,
    createdAt: new Date().toISOString()
  };

  users[cleanUsername] = newUser;
  const storage = getStorage();
  storage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

  // Initialize strictly isolated user progress container for new account
  saveUserProgress(cleanUsername, {
    completedChallenges: [],
    unlockedProgress: {
      employee_db: { Beginner: 0, Intermediate: 0, Pro: 0 },
      hospital_db: { Beginner: 0, Intermediate: 0, Pro: 0 }
    },
    savedNotes: 'Welcome to SQL Playground! Track your queries and notes here.',
    goals: [
      { id: 1, text: 'Complete Employee DB Basic Queries', done: false },
      { id: 2, text: 'Master Hospital DB Relational JOINs', done: false },
      { id: 3, text: 'Solve 5 CTE & Window Function Challenges', done: false }
    ],
    totalQueriesExecuted: 0,
    lastActive: new Date().toISOString()
  });

  return { success: true, user: newUser };
}

// Authenticate user against stored client-side hash
export async function authenticateUser(usernameOrEmail, password) {
  const users = getRegisteredUsers();
  const identifier = sanitizeInput(usernameOrEmail.trim().toLowerCase());

  // Match username or email
  const user = Object.values(users).find(
    u => u.username === identifier || u.email === identifier
  );

  if (!user) {
    return { success: false, error: 'Invalid username/email or password.' };
  }

  const computedHash = await hashPassword(password, user.salt);
  if (computedHash !== user.passwordHash) {
    return { success: false, error: 'Invalid username/email or password.' };
  }

  // Set isolated active session
  setActiveSession({
    username: user.username,
    displayName: user.displayName,
    email: user.email,
    securityQuestion: user.securityQuestion
  });

  return { success: true, user };
}

// Client-Side Password Reset via Security Question Verification
export async function resetPassword({ usernameOrEmail, securityAnswer, newPassword }) {
  const users = getRegisteredUsers();
  const identifier = sanitizeInput(usernameOrEmail.trim().toLowerCase());

  const userKey = Object.keys(users).find(
    key => users[key].username === identifier || users[key].email === identifier
  );

  if (!userKey) {
    return { success: false, error: 'Account not found. Please verify your username or email.' };
  }

  const user = users[userKey];

  // Verify security answer hash
  const computedAnswerHash = await hashPassword(securityAnswer.trim().toLowerCase(), user.answerSalt);
  if (computedAnswerHash !== user.answerHash) {
    return { success: false, error: 'Incorrect security question answer.' };
  }

  // Update password with new salt and hash
  const newSalt = generateSalt();
  const newPasswordHash = await hashPassword(newPassword, newSalt);

  user.salt = newSalt;
  user.passwordHash = newPasswordHash;
  user.updatedAt = new Date().toISOString();

  users[userKey] = user;
  const storage = getStorage();
  storage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

  return { success: true, message: 'Password reset successfully! You can now log in.' };
}

// Active Session Storage Helpers
export function getActiveSession() {
  try {
    const storage = getStorage();
    const data = storage.getItem(SESSION_STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function setActiveSession(sessionData) {
  const storage = getStorage();
  storage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
}

export function clearActiveSession() {
  const storage = getStorage();
  storage.removeItem(SESSION_STORAGE_KEY);
}

// Session-Isolated User Progress Management
export function getUserProgressKey(username) {
  return `sql_progress_user_${sanitizeInput(username.toLowerCase())}`;
}

export function getUserProgress(username) {
  if (!username) return null;
  try {
    const storage = getStorage();
    const key = getUserProgressKey(username);
    const data = storage.getItem(key);
    if (!data) {
      return {
        completedChallenges: [],
        unlockedProgress: {
          employee_db: { Beginner: 0, Intermediate: 0, Pro: 0 },
          hospital_db: { Beginner: 0, Intermediate: 0, Pro: 0 }
        },
        savedNotes: '',
        goals: [],
        totalQueriesExecuted: 0,
        lastActive: new Date().toISOString()
      };
    }
    const parsed = JSON.parse(data);
    if (!parsed.unlockedProgress) {
      parsed.unlockedProgress = {
        employee_db: { Beginner: 0, Intermediate: 0, Pro: 0 },
        hospital_db: { Beginner: 0, Intermediate: 0, Pro: 0 }
      };
    }
    if (!Array.isArray(parsed.completedChallenges)) {
      parsed.completedChallenges = [];
    }
    return parsed;
  } catch (e) {
    console.error('Failed to load user progress:', e);
    return null;
  }
}

export function saveUserProgress(username, progressData) {
  if (!username) return;
  try {
    const storage = getStorage();
    const key = getUserProgressKey(username);
    const existing = getUserProgress(username) || {};
    const updated = {
      ...existing,
      ...progressData,
      completedChallenges: Array.isArray(progressData.completedChallenges)
        ? progressData.completedChallenges
        : (existing.completedChallenges || []),
      unlockedProgress: progressData.unlockedProgress || existing.unlockedProgress || {
        employee_db: { Beginner: 0, Intermediate: 0, Pro: 0 },
        hospital_db: { Beginner: 0, Intermediate: 0, Pro: 0 }
      },
      lastActive: new Date().toISOString()
    };
    storage.setItem(key, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to save user progress:', e);
  }
}
