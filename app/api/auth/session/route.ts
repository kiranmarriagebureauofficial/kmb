import { NextResponse } from 'next/server';
import { isSetupRequired } from '@/lib/server/auth-db';
import { getServerSessionUser } from '@/lib/server/auth-helpers';

export async function GET() {
  const setupRequired = isSetupRequired();
  const user = setupRequired ? null : await getServerSessionUser();
  return NextResponse.json({ setupRequired, user });
}

