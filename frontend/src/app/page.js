import { redirect } from 'next/navigation';

export default function Page() {
  redirect('/loginpage');
  return null;
}