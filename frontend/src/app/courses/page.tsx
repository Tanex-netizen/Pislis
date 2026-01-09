import { redirect } from 'next/navigation';

export default function CoursesPage() {
  // Removed public Courses page: send users to Profile.
  // If not authenticated, Profile will redirect them to Login.
  redirect('/profile');
}
