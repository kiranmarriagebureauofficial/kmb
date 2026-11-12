import assert from 'assert';
import fs from 'fs';
import os from 'os';
import path from 'path';
import {
  authenticateUser,
  createUserByAdmin,
  deleteUserByAdmin,
  isSetupRequired,
  listAllUsers,
  setupMasterAdmin,
  updateOwnCredentials,
  updateUserByAdmin,
} from '../lib/server/auth-db';
import { createSessionToken, verifySessionToken } from '../lib/server/session';

const originalCwd = process.cwd();
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'kmb-auth-test-'));

try {
  process.chdir(tmpDir);

  console.log('\n=============================================');
  console.log('RUNNING ADMIN & USER APPROVAL AUTH TEST SUITE');
  console.log('=============================================\n');

  // 1. Fresh state requires Master Admin setup
  assert.strictEqual(isSetupRequired(), true, 'Fresh store should require Admin setup');

  // 2. Setup Master Admin
  const setupRes = setupMasterAdmin({
    name: 'Master Owner',
    email: 'owner@kiranbureau.pk',
    password: 'StrongPassword123',
  });
  assert.strictEqual(setupRes.ok, true, 'Master Admin setup should succeed');
  if (!setupRes.ok) throw new Error('Setup failed');
  const adminUser = setupRes.user;
  assert.strictEqual(adminUser.role, 'admin');
  assert.strictEqual(isSetupRequired(), false, 'Setup should no longer be required');

  // 3. Second setup attempt must be blocked
  const secondSetup = setupMasterAdmin({
    name: 'Attacker',
    email: 'attacker@example.com',
    password: 'password123',
  });
  assert.strictEqual(secondSetup.ok, false, 'Second Master Admin setup must fail');

  // 4. Admin login check
  const wrongLogin = authenticateUser('owner@kiranbureau.pk', 'WrongPass');
  assert.strictEqual(wrongLogin.ok, false);
  if (!wrongLogin.ok) assert.strictEqual(wrongLogin.code, 'INVALID_CREDENTIALS');

  const validLogin = authenticateUser('OWNER@KIRANBUREAU.PK', 'StrongPassword123');
  assert.strictEqual(validLogin.ok, true, 'Case-insensitive Admin login must succeed');

  // 5. Session token signing & tamper protection
  const token = createSessionToken(adminUser.id, adminUser.role);
  const verified = verifySessionToken(token);
  assert.ok(verified && verified.userId === adminUser.id && verified.role === 'admin', 'Token must verify cleanly');
  assert.strictEqual(verifySessionToken(`${token}tampered`), null, 'Tampered token must fail verification');

  // 6. Admin creates pending user by email — blocked until approved
  const pendingRes = createUserByAdmin(adminUser, {
    name: 'Data Operator',
    email: 'dataentry@kiranbureau.pk',
    password: 'TeamPassword1',
    role: 'staff',
    approvalStatus: 'pending',
    permissions: { canAddEditData: true, canPrintExport: true, canManageInvoices: false },
  });
  assert.strictEqual(pendingRes.ok, true, 'Admin should be able to create pending user');
  if (!pendingRes.ok) throw new Error('Pending user creation failed');

  const blockedPendingLogin = authenticateUser('dataentry@kiranbureau.pk', 'TeamPassword1');
  assert.strictEqual(blockedPendingLogin.ok, false);
  if (!blockedPendingLogin.ok) assert.strictEqual(blockedPendingLogin.code, 'PENDING_APPROVAL');

  // 7. Admin approves the pending user — login now succeeds
  const approveRes = updateUserByAdmin(pendingRes.user.id, adminUser, {
    approvalStatus: 'approved',
    active: true,
  });
  assert.strictEqual(approveRes.ok, true, 'Admin approval should succeed');

  const approvedLogin = authenticateUser('dataentry@kiranbureau.pk', 'TeamPassword1');
  assert.strictEqual(approvedLogin.ok, true, 'Approved team user should log in');

  // 8. Admin disables user — login blocked immediately
  const disableRes = updateUserByAdmin(pendingRes.user.id, adminUser, { active: false });
  assert.strictEqual(disableRes.ok, true);
  const disabledLogin = authenticateUser('dataentry@kiranbureau.pk', 'TeamPassword1');
  assert.strictEqual(disabledLogin.ok, false);
  if (!disabledLogin.ok) assert.strictEqual(disabledLogin.code, 'DISABLED');

  // 9. Last Admin protection
  const selfDisable = updateUserByAdmin(adminUser.id, adminUser, { active: false });
  assert.strictEqual(selfDisable.ok, false, 'Cannot disable the only active Admin');
  const selfDelete = deleteUserByAdmin(adminUser.id, adminUser);
  assert.strictEqual(selfDelete.ok, false, 'Cannot delete self Admin');

  // 10. Admin updates own credentials
  const credUpdate = updateOwnCredentials(adminUser.id, {
    currentPassword: 'StrongPassword123',
    newEmail: 'ceo@kiranbureau.pk',
    newPassword: 'NewOwnerPassword99',
  });
  assert.strictEqual(credUpdate.ok, true, 'Admin credentials update should succeed');
  const newLogin = authenticateUser('ceo@kiranbureau.pk', 'NewOwnerPassword99');
  assert.strictEqual(newLogin.ok, true, 'New Admin ID and password must work');

  // 11. List users returns safe DTOs without passwordHash
  const listed = listAllUsers();
  assert.strictEqual(listed.length, 2);
  for (const u of listed) {
    assert.strictEqual('passwordHash' in u, false, 'passwordHash must never be exposed');
  }

  console.log('✓ All Admin Setup, Approval Gate, Permissions & Session Tests Passed!');
} finally {
  process.chdir(originalCwd);
  fs.rmSync(tmpDir, { recursive: true, force: true });
}

