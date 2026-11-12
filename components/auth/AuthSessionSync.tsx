'use client';

import { useEffect } from 'react';
import { store } from '@/lib/db/store';
import type { StaffUser } from '@/lib/types';

export function AuthSessionSync({ user }: { user: StaffUser }) {
  useEffect(() => {
    store.setCurrentUser(user);
  }, [user]);

  return null;
}

