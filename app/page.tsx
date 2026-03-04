// Force redeploy - 2026-03-04
import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/admin/dashboard');
}