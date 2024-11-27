import { auth } from '@clerk/nextjs/server';
import { UserProfileForm } from './_components/UserProfileForm';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
    const {userId} = await auth();
    if (!userId) {
        return redirect('/api/auth/signin');
    }
  return (
    <div className="container py-10">
  <UserProfileForm userId={userId} />
  </div>
  )
}