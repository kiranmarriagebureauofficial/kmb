import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import type { ApprovalStatus, StaffUser, UserPermissions, UserRole } from '../types';

interface StoredUser extends StaffUser {
  passwordHash: string;
}

interface AuthDatabase {
  users: StoredUser[];
}

const DEFAULT_ADMIN_PERMISSIONS: UserPermissions = {
  canAddEditData: true,
  canPrintExport: true,
  canManageInvoices: true,
};

const DEFAULT_TEAM_PERMISSIONS: UserPermissions = {
  canAddEditData: true,
  canPrintExport: true,
  canManageInvoices: false,
};

function getDbFilePath(): string {
  return path.join(process.cwd(), 'data', 'auth-users.json');
}

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

function verifyPassword(password: string, storedHash: string): boolean {
  const parts = storedHash.split(':');
  if (parts.length !== 2) return false;
  const [salt, keyHex] = parts;
  if (!salt || !keyHex) return false;

  const keyBuf = Buffer.from(keyHex, 'hex');
  const derivedBuf = crypto.scryptSync(password, salt, 64);
  if (keyBuf.length !== derivedBuf.length) return false;
  return crypto.timingSafeEqual(keyBuf, derivedBuf);
}

export function toSafeUser(user: StoredUser): StaffUser {
  const { passwordHash: _ignored, ...safe } = user;
  return {
    ...safe,
    approvalStatus: safe.approvalStatus || 'approved',
    permissions: safe.permissions || (safe.role === 'admin' ? { ...DEFAULT_ADMIN_PERMISSIONS } : { ...DEFAULT_TEAM_PERMISSIONS }),
  };
}

function readDb(): AuthDatabase {
  const filePath = getDbFilePath();
  let db: AuthDatabase = { users: [] };

  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(raw) as AuthDatabase;
      if (parsed && Array.isArray(parsed.users)) {
        db = { users: parsed.users };
      }
    }
  } catch (err) {
    console.error('Failed to read auth database:', err);
  }

  // Optional environment-based initial admin provisioning for automated Hostinger setup
  if (db.users.length === 0 && process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    const now = new Date().toISOString();
    db.users.push({
      id: `user-admin-${crypto.randomUUID().slice(0, 8)}`,
      name: process.env.ADMIN_NAME?.trim() || 'Bureau Administrator',
      email: process.env.ADMIN_EMAIL.trim().toLowerCase(),
      role: 'admin',
      phone: process.env.ADMIN_PHONE?.trim() || '',
      active: true,
      approvalStatus: 'approved',
      permissions: { ...DEFAULT_ADMIN_PERMISSIONS },
      approvedBy: 'Environment Provisioning',
      approvedAt: now,
      createdAt: now,
      passwordHash: hashPassword(process.env.ADMIN_PASSWORD),
    });
    writeDb(db);
  }

  return db;
}

function writeDb(db: AuthDatabase): void {
  const filePath = getDbFilePath();
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(db, null, 2), { encoding: 'utf8', mode: 0o600 });
}

export function isSetupRequired(): boolean {
  const db = readDb();
  return !db.users.some(u => u.role === 'admin' && u.active && (u.approvalStatus || 'approved') === 'approved');
}

export function setupMasterAdmin(input: {
  name: string;
  email: string;
  password: string;
  phone?: string;
}): { ok: true; user: StaffUser } | { ok: false; error: string } {
  const db = readDb();
  const hasAdmin = db.users.some(u => u.role === 'admin');
  if (hasAdmin) {
    return { ok: false, error: 'Master Admin account already exists. Please sign in.' };
  }

  const email = input.email.trim().toLowerCase();
  const name = input.name.trim();
  if (!name || !email || !input.password || input.password.length < 6) {
    return { ok: false, error: 'Valid name, email, and password (min 6 characters) are required.' };
  }

  const now = new Date().toISOString();
  const adminUser: StoredUser = {
    id: `user-admin-${crypto.randomUUID().slice(0, 8)}`,
    name,
    email,
    role: 'admin',
    phone: input.phone?.trim() || '',
    active: true,
    approvalStatus: 'approved',
    permissions: { ...DEFAULT_ADMIN_PERMISSIONS },
    approvedBy: 'Master Setup',
    approvedAt: now,
    createdAt: now,
    lastLogin: now,
    passwordHash: hashPassword(input.password),
  };

  db.users.push(adminUser);
  writeDb(db);
  return { ok: true, user: toSafeUser(adminUser) };
}

export type AuthLoginResult =
  | { ok: true; user: StaffUser }
  | { ok: false; code: 'INVALID_CREDENTIALS' | 'PENDING_APPROVAL' | 'REJECTED' | 'DISABLED' };

export function authenticateUser(emailInput: string, passwordInput: string): AuthLoginResult {
  const db = readDb();
  const email = emailInput.trim().toLowerCase();
  const user = db.users.find(u => u.email.toLowerCase() === email);

  if (!user || !verifyPassword(passwordInput, user.passwordHash)) {
    return { ok: false, code: 'INVALID_CREDENTIALS' };
  }

  const status = user.approvalStatus || 'approved';
  if (status === 'pending') {
    return { ok: false, code: 'PENDING_APPROVAL' };
  }
  if (status === 'rejected') {
    return { ok: false, code: 'REJECTED' };
  }
  if (!user.active) {
    return { ok: false, code: 'DISABLED' };
  }

  user.lastLogin = new Date().toISOString();
  writeDb(db);
  return { ok: true, user: toSafeUser(user) };
}

export function getActiveUserById(userId: string): StaffUser | null {
  const db = readDb();
  const user = db.users.find(u => u.id === userId);
  if (!user) return null;
  const status = user.approvalStatus || 'approved';
  if (!user.active || status !== 'approved') return null;
  return toSafeUser(user);
}

export function listAllUsers(): StaffUser[] {
  const db = readDb();
  return db.users.map(toSafeUser);
}

export function createUserByAdmin(
  adminActor: StaffUser,
  input: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    phone?: string;
    approvalStatus?: ApprovalStatus;
    permissions?: Partial<UserPermissions>;
  }
): { ok: true; user: StaffUser } | { ok: false; error: string } {
  const db = readDb();
  const email = input.email.trim().toLowerCase();
  const name = input.name.trim();

  if (!name || !email) {
    return { ok: false, error: 'Name and email are required.' };
  }
  if (!input.password || input.password.length < 6) {
    return { ok: false, error: 'Password must be at least 6 characters.' };
  }
  if (db.users.some(u => u.email.toLowerCase() === email)) {
    return { ok: false, error: 'A user with this email already exists.' };
  }

  const now = new Date().toISOString();
  const approvalStatus: ApprovalStatus = input.approvalStatus === 'pending' ? 'pending' : 'approved';
  const role: UserRole = input.role === 'admin' ? 'admin' : 'staff';

  const permissions: UserPermissions =
    role === 'admin'
      ? { ...DEFAULT_ADMIN_PERMISSIONS }
      : {
          canAddEditData: input.permissions?.canAddEditData ?? true,
          canPrintExport: input.permissions?.canPrintExport ?? true,
          canManageInvoices: input.permissions?.canManageInvoices ?? false,
        };

  const newUser: StoredUser = {
    id: `user-${crypto.randomUUID().slice(0, 8)}`,
    name,
    email,
    role,
    phone: input.phone?.trim() || '',
    active: true,
    approvalStatus,
    permissions,
    approvedBy: approvalStatus === 'approved' ? adminActor.name : undefined,
    approvedAt: approvalStatus === 'approved' ? now : undefined,
    createdAt: now,
    passwordHash: hashPassword(input.password),
  };

  db.users.push(newUser);
  writeDb(db);
  return { ok: true, user: toSafeUser(newUser) };
}

export function updateUserByAdmin(
  targetId: string,
  adminActor: StaffUser,
  updates: {
    name?: string;
    email?: string;
    phone?: string;
    role?: UserRole;
    active?: boolean;
    approvalStatus?: ApprovalStatus;
    permissions?: Partial<UserPermissions>;
    newPassword?: string;
  }
): { ok: true; user: StaffUser } | { ok: false; error: string } {
  const db = readDb();
  const idx = db.users.findIndex(u => u.id === targetId);
  if (idx === -1) {
    return { ok: false, error: 'User not found.' };
  }

  const current = db.users[idx];
  const nextRole = updates.role ?? current.role;
  const nextActive = updates.active ?? current.active;
  const nextApproval = updates.approvalStatus ?? (current.approvalStatus || 'approved');

  // Guard against disabling, demoting, or unapproving the last active approved admin
  const activeAdmins = db.users.filter(
    u => u.role === 'admin' && u.active && (u.approvalStatus || 'approved') === 'approved'
  );
  const wasActiveAdmin =
    current.role === 'admin' && current.active && (current.approvalStatus || 'approved') === 'approved';
  const willStayActiveAdmin =
    nextRole === 'admin' && nextActive && nextApproval === 'approved';

  if (wasActiveAdmin && !willStayActiveAdmin && activeAdmins.length <= 1) {
    return { ok: false, error: 'Cannot disable or demote the only active Administrator.' };
  }

  if (updates.email) {
    const cleanEmail = updates.email.trim().toLowerCase();
    if (db.users.some(u => u.id !== targetId && u.email.toLowerCase() === cleanEmail)) {
      return { ok: false, error: 'Another user already uses this email.' };
    }
    current.email = cleanEmail;
  }

  if (updates.name !== undefined) current.name = updates.name.trim() || current.name;
  if (updates.phone !== undefined) current.phone = updates.phone.trim();
  current.role = nextRole;
  current.active = nextActive;
  current.approvalStatus = nextApproval;

  if (updates.approvalStatus === 'approved') {
    current.approvedBy = adminActor.name;
    current.approvedAt = new Date().toISOString();
  }

  if (nextRole === 'admin') {
    current.permissions = { ...DEFAULT_ADMIN_PERMISSIONS };
  } else if (updates.permissions) {
    current.permissions = {
      ...(current.permissions || DEFAULT_TEAM_PERMISSIONS),
      ...updates.permissions,
    };
  }

  if (updates.newPassword && updates.newPassword.length > 0) {
    if (updates.newPassword.length < 6) {
      return { ok: false, error: 'New password must be at least 6 characters.' };
    }
    current.passwordHash = hashPassword(updates.newPassword);
  }

  db.users[idx] = current;
  writeDb(db);
  return { ok: true, user: toSafeUser(current) };
}

export function deleteUserByAdmin(
  targetId: string,
  adminActor: StaffUser
): { ok: true } | { ok: false; error: string } {
  if (targetId === adminActor.id) {
    return { ok: false, error: 'You cannot delete your own currently signed-in Admin account.' };
  }

  const db = readDb();
  const target = db.users.find(u => u.id === targetId);
  if (!target) {
    return { ok: false, error: 'User not found.' };
  }

  const activeAdmins = db.users.filter(
    u => u.role === 'admin' && u.active && (u.approvalStatus || 'approved') === 'approved'
  );
  if (
    target.role === 'admin' &&
    target.active &&
    (target.approvalStatus || 'approved') === 'approved' &&
    activeAdmins.length <= 1
  ) {
    return { ok: false, error: 'Cannot delete the only active Administrator.' };
  }

  db.users = db.users.filter(u => u.id !== targetId);
  writeDb(db);
  return { ok: true };
}

export function updateOwnCredentials(
  userId: string,
  input: {
    currentPassword: string;
    newName?: string;
    newEmail?: string;
    newPassword?: string;
  }
): { ok: true; user: StaffUser } | { ok: false; error: string } {
  const db = readDb();
  const idx = db.users.findIndex(u => u.id === userId);
  if (idx === -1) {
    return { ok: false, error: 'Account not found.' };
  }

  const user = db.users[idx];
  if (!verifyPassword(input.currentPassword, user.passwordHash)) {
    return { ok: false, error: 'Current password is incorrect.' };
  }

  if (input.newEmail) {
    const cleanEmail = input.newEmail.trim().toLowerCase();
    if (db.users.some(u => u.id !== userId && u.email.toLowerCase() === cleanEmail)) {
      return { ok: false, error: 'That email address is already in use.' };
    }
    user.email = cleanEmail;
  }

  if (input.newName && input.newName.trim()) {
    user.name = input.newName.trim();
  }

  if (input.newPassword) {
    if (input.newPassword.length < 6) {
      return { ok: false, error: 'New password must be at least 6 characters.' };
    }
    user.passwordHash = hashPassword(input.newPassword);
  }

  db.users[idx] = user;
  writeDb(db);
  return { ok: true, user: toSafeUser(user) };
}

