import { redirect } from 'next/navigation';
import { getServerSessionUser } from '@/lib/server/auth-helpers';

export default async function RootPage() {
  const user = await getServerSessionUser();
  if (user) {
    redirect('/dashboard');
  }
  redirect('/login');
}
