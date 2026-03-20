import { redirect } from 'next/navigation';

export default function MemberDashboardPage() {
  redirect('/dashboard/member/profile');
  return null;
}
