import assert from 'assert';
import {
  registerUser,
  authenticateUser,
  getActiveSession,
  clearActiveSession,
  getUserProgress,
  saveUserProgress,
  getUserProgressKey
} from '../src/utils/cryptoAuth.js';

console.log(`\n====================================================`);
console.log(`👥 MULTI-USER DEVICE ISOLATION TEST SUITE`);
console.log(`Verifying Two Accounts on Same Device Never Override Progress`);
console.log(`====================================================\n`);

async function runMultiUserTests() {
  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`  ✓ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✕ FAIL: ${name} -> ${err.message}`);
      failed++;
    }
  }

  // TEST 1: Register Account 1 on Device
  await test('Device: Register Alice account on local device', async () => {
    const regRes = await registerUser({
      username: 'alice_developer',
      email: 'alice@sqlplayground.com',
      password: 'StrongP@ssw0rd123!',
      securityQuestion: 'What was your first pet\'s name?',
      securityAnswer: 'Fluffy'
    });
    assert.strictEqual(regRes.success, true);
    assert.strictEqual(regRes.user.username, 'alice_developer');

    // Verify initial clean progress
    const initProg = getUserProgress('alice_developer');
    assert.deepStrictEqual(initProg.completedChallenges, []);
    assert.strictEqual(initProg.unlockedProgress.employee_db.Beginner, 0);
  });

  // TEST 2: Alice solves Employee DB queries
  await test('Device: Alice solves 3 challenges & unlocks Level 1', async () => {
    const loginRes = await authenticateUser('alice_developer', 'StrongP@ssw0rd123!');
    assert.strictEqual(loginRes.success, true);

    const aliceSolved = ['emp_beg_1', 'emp_beg_2', 'emp_beg_3'];
    const aliceUnlocked = {
      employee_db: { Beginner: 3, Intermediate: 1, Pro: 0 },
      hospital_db: { Beginner: 0, Intermediate: 0, Pro: 0 }
    };

    saveUserProgress('alice_developer', {
      completedChallenges: aliceSolved,
      unlockedProgress: aliceUnlocked
    });

    const verifyAlice = getUserProgress('alice_developer');
    assert.deepStrictEqual(verifyAlice.completedChallenges, aliceSolved);
    assert.strictEqual(verifyAlice.unlockedProgress.employee_db.Beginner, 3);
  });

  // TEST 3: Alice logs out
  await test('Device: Alice logs out and session is cleared', () => {
    clearActiveSession();
    assert.strictEqual(getActiveSession(), null);
  });

  // TEST 4: Register Account 2 (Bob) on same device
  await test('Device: Register Bob account on same device without inheriting Alice progress', async () => {
    const regBob = await registerUser({
      username: 'bob_analyst',
      email: 'bob@hospital.org',
      password: 'SecureP@ssw0rd456!',
      securityQuestion: 'What city were you born in?',
      securityAnswer: 'Chicago'
    });
    assert.strictEqual(regBob.success, true);
    assert.strictEqual(regBob.user.username, 'bob_analyst');

    // CRITICAL ASSERTION: Bob must NOT have any of Alice's solved questions!
    const bobProg = getUserProgress('bob_analyst');
    assert.deepStrictEqual(bobProg.completedChallenges, [], 'Bob must start with 0 solved challenges');
    assert.strictEqual(bobProg.unlockedProgress.employee_db.Beginner, 0, 'Bob must start at Level 0');
    assert.strictEqual(bobProg.unlockedProgress.employee_db.Intermediate, 0);
  });

  // TEST 5: Bob logs in and solves Hospital DB queries
  await test('Device: Bob solves Hospital DB challenges independently', async () => {
    const bobLogin = await authenticateUser('bob_analyst', 'SecureP@ssw0rd456!');
    assert.strictEqual(bobLogin.success, true);

    const bobSolved = ['hosp_beg_1', 'hosp_beg_2'];
    const bobUnlocked = {
      employee_db: { Beginner: 0, Intermediate: 0, Pro: 0 },
      hospital_db: { Beginner: 2, Intermediate: 0, Pro: 0 }
    };

    saveUserProgress('bob_analyst', {
      completedChallenges: bobSolved,
      unlockedProgress: bobUnlocked
    });

    const verifyBob = getUserProgress('bob_analyst');
    assert.deepStrictEqual(verifyBob.completedChallenges, bobSolved);
    assert.strictEqual(verifyBob.unlockedProgress.hospital_db.Beginner, 2);
    assert.strictEqual(verifyBob.unlockedProgress.employee_db.Beginner, 0);
  });

  // TEST 6: Bob logs out
  await test('Device: Bob logs out and session is cleared', () => {
    clearActiveSession();
    assert.strictEqual(getActiveSession(), null);
  });

  // TEST 7: Alice logs back in & progress is 100% intact with ZERO Bob override
  await test('Device: Alice logs back in and her progress was NOT overridden by Bob', async () => {
    const aliceReLogin = await authenticateUser('alice_developer', 'StrongP@ssw0rd123!');
    assert.strictEqual(aliceReLogin.success, true);

    const aliceCurrent = getUserProgress('alice_developer');
    // Verify Alice still has her exact 3 employee challenges and none of Bob's hospital challenges
    assert.strictEqual(aliceCurrent.completedChallenges.length, 3);
    assert.deepStrictEqual(aliceCurrent.completedChallenges, ['emp_beg_1', 'emp_beg_2', 'emp_beg_3']);
    assert.strictEqual(aliceCurrent.completedChallenges.includes('hosp_beg_1'), false, 'Alice must not have Bob challenges');
    assert.strictEqual(aliceCurrent.unlockedProgress.employee_db.Beginner, 3);
    assert.strictEqual(aliceCurrent.unlockedProgress.hospital_db.Beginner, 0, 'Alice hospital progress must remain 0');
  });

  // TEST 8: Verify storage keys are uniquely isolated per username
  await test('Storage: Verified storage keys are isolated per normalized username', () => {
    const keyAlice = getUserProgressKey('alice_developer');
    const keyBob = getUserProgressKey('bob_analyst');
    assert.strictEqual(keyAlice, 'sql_progress_user_alice_developer');
    assert.strictEqual(keyBob, 'sql_progress_user_bob_analyst');
    assert.notStrictEqual(keyAlice, keyBob);
  });

  console.log(`\n====================================================`);
  console.log(`  MULTI-USER ISOLATION RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log(`====================================================\n`);

  if (failed > 0) process.exit(1);
  process.exit(0);
}

runMultiUserTests();
