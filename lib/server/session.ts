import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import type { UserRole } from '../types';

export const SESSION_COOKIE_NAME = 'kmb_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

export interface SessionPayload {
  userId: string;
  role: UserRole;
  exp: number;
}

let cachedSecret: string | null = null;

function getAuthSecret(): string {
  if (process.env.AUTH_SECRET && process.env.AUTH_SECRET.length >= 16) {
    return process.env.AUTH_SECRET;
  }
  if (cachedSecret) return cachedSecret;

  const dataDir = path.join(process.cwd(), 'data');
  const secretPath = path.join(dataDir, '.auth-secret');
  try {
    if (fs.existsSync(secretPath)) {
      const existing = fs.readFileSync(secretPath, 'utf8').trim();
      if (existing.length >= 32) {
        cachedSecret = existing;
        return existing;
      }
    }
    fs.mkdirSync(dataDir, { recursive: true });
    const generated = crypto.randomBytes(32).toString('hex');
    fs.writeFileSync(secretPath, generated, { encoding: 'utf8', mode: 0o600 });
    cachedSecret = generated;
    return generated;
  } catch {
    // Ephemeral fallback if filesystem is read-only
    cachedSecret = process.env.NEXTAUTH_SECRET || crypto.createHash('sha256').update(process.cwd()).digest('hex');
    return cachedSecret;
  }
}

function sign(data: string): string {
  return crypto
    .createHmac('sha256', getAuthSecret())
    .update(data)
    .digest('base64url');
}

export function createSessionToken(userId: string, role: UserRole): string {
  const payload: SessionPayload = {
    userId,
    role,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };
  const encoded = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const signature = sign(encoded);
  return `${encoded}.${signature}`;
}

export function verifySessionToken(token?: string | null): SessionPayload | null {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [encoded, signature] = parts;
  if (!encoded || !signature) return null;

  const expected = sign(encoded);
  const sigBuf = Buffer.from(signature, 'utf8');
  const expBuf = Buffer.from(expected, 'utf8');
  if (sigBuf.length !== expBuf.length) return null;
  if (!crypto.timingSafeEqual(sigBuf, expBuf)) return null;

  try {
    const decoded = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as SessionPayload;
    if (!decoded.userId || !decoded.role || !decoded.exp) return null;
    if (decoded.exp < Math.floor(Date.now() / 1000)) return null;
    return decoded;
  } catch {
    return null;
  }
}

export function getCookieOptions(isHttps: boolean) {
  return {
    httpOnly: true,
    secure: isHttps,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  };
}

