// app/page.tsx
import { redirect } from 'next/navigation';

export default function Home() {
  // 自動引導用戶去 Admin Dashboard
  redirect('/admin/dashboard');
}