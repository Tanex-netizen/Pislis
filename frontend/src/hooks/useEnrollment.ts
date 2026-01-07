'use client';

import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface EnrollmentStatus {
  isEnrolled: boolean;
  enrollment?: {
    id: string;
    status: string;
    created_at: string;
    expires_at: string | null;
  };
}

interface CourseWithProgress {
  id: string;
  slug: string;
  title: string;
  short_description: string;
  thumbnail_url: string;
  duration_hours: number;
}

interface EnrolledCourse {
  id: string;
  status: string;
  created_at: string;
  expires_at: string | null;
  courses: CourseWithProgress;
}

export function useEnrollment() {
  const { token, isAuthenticated } = useAuth();

  /**
   * Check if user is enrolled in a specific course by slug
   */
  const checkEnrollmentBySlug = useCallback(async (slug: string): Promise<EnrollmentStatus> => {
    if (!isAuthenticated || !token) {
      return { isEnrolled: false };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/enrollments/check-slug/${slug}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        return {
          isEnrolled: data.isEnrolled,
          enrollment: data.enrollment,
        };
      }
      return { isEnrolled: false };
    } catch (error) {
      console.error('Check enrollment error:', error);
      return { isEnrolled: false };
    }
  }, [token, isAuthenticated]);

  /**
   * Check if user is enrolled in a specific course by ID
   */
  const checkEnrollmentById = useCallback(async (courseId: string): Promise<EnrollmentStatus> => {
    if (!isAuthenticated || !token) {
      return { isEnrolled: false };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/enrollments/status?courseId=${courseId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        return {
          isEnrolled: data.isEnrolled,
          enrollment: data.enrollment,
        };
      }
      return { isEnrolled: false };
    } catch (error) {
      console.error('Check enrollment error:', error);
      return { isEnrolled: false };
    }
  }, [token, isAuthenticated]);

  /**
   * Get all courses the user is enrolled in
   */
  const getMyEnrolledCourses = useCallback(async (): Promise<EnrolledCourse[]> => {
    if (!isAuthenticated || !token) {
      return [];
    }

    try {
      const response = await fetch(`${API_BASE_URL}/enrollments/my-courses`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data.enrollments || [];
      }
      return [];
    } catch (error) {
      console.error('Get enrolled courses error:', error);
      return [];
    }
  }, [token, isAuthenticated]);

  return {
    checkEnrollmentBySlug,
    checkEnrollmentById,
    getMyEnrolledCourses,
  };
}
