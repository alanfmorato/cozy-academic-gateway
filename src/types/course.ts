export interface CourseCategory {
  id: string;
  name: string;
  description: string | null;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  category_id: string;
  duration: number;
  language: string;
  difficulty_level: 'iniciante' | 'intermediário' | 'avançado';
  price: number;
  thumbnail_url: string | null;
  preview_video_url: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  universidade_id: string | null;
  is_published: boolean;
}

export interface CourseModule {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  order_num: number;
  created_at: string;
  lessons: CourseLesson[];
}

export interface CourseLesson {
  id: string;
  module_id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  duration: number | null;
  order_num: number;
  created_at: string;
}

export interface CourseMaterial {
  id: string;
  course_id: string;
  lesson_id: string | null;
  title: string;
  description: string | null;
  file_url: string;
  file_type: string;
  created_at: string;
}

export interface CourseEnrollment {
  id: string;
  course_id: string;
  user_id: string;
  purchased_at: string;
  price_paid: number;
  status: 'active' | 'completed' | 'refunded' | 'expired';
  progress: Record<string, any> | null;
}

export interface CourseReview {
  id: string;
  course_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
}

export interface CourseWithDetails extends Course {
  category?: CourseCategory;
  modules?: CourseModule[];
  materials?: CourseMaterial[];
  average_rating?: number;
  total_students?: number;
  is_enrolled?: boolean;
  thumbnail_url?: string | null;
}
