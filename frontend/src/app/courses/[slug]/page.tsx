import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CourseOverviewClient from './CourseOverviewClient';
// TODO: Create CourseOverviewClient component
// import CourseOverviewClient from './CourseOverviewClient';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface CourseModule {
  id: string;
  title: string;
  description: string;
  order_index: number;
  duration_minutes: number;
  course_lessons: {
    id: string;
    title: string;
    duration_minutes: number;
    is_free_preview: boolean;
    lesson_type: string;
  }[];
}

interface Course {
  id: string;
  slug: string;
  title: string;
  short_description: string;
  description: string;
  price: number;
  original_price: number | null;
  category: string;
  level: string;
  duration_hours: number;
  thumbnail_url: string | null;
  preview_video_url: string | null;
  rating: number;
  total_students: number;
  learning_outcomes: string[];
  requirements: string[];
  course_modules: CourseModule[];
}

async function getCourse(slug: string): Promise<Course | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/courses/slug/${slug}`, {
      next: { revalidate: 60 }, // ISR: revalidate every 60 seconds
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.course;
  } catch (error) {
    console.error('Failed to fetch course:', error);
    return null;
  }
}

// Generate static paths for known courses
export async function generateStaticParams() {
  // Return all known course slugs
  return [
    { slug: 'fb-automation' },
    { slug: 'fb-automation-mastery' },
    { slug: 'facebook-automation' },
  ];
}

// Generate metadata for SEO
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourse(slug);
  
  if (!course) {
    return {
      title: 'Course Not Found',
    };
  }

  return {
    title: course.title,
    description: course.short_description || course.description?.substring(0, 160),
    openGraph: {
      title: course.title,
      description: course.short_description,
      images: course.thumbnail_url ? [course.thumbnail_url] : [],
    },
  };
}

export default async function CourseOverviewPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params;
  
  // Block access to fb-automation-mastery course overview
  if (slug === 'fb-automation-mastery') {
    notFound();
  }
  
  const course = await getCourse(slug);

  if (!course) {
    notFound();
  }

  // Calculate total lessons
  const totalLessons = course.course_modules?.reduce(
    (total, module) => total + (module.course_lessons?.length || 0),
    0
  ) || 0;

  return <CourseOverviewClient course={course} totalLessons={totalLessons} />;
}
