import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Course, CourseCategory, CourseModule, CourseLesson, CourseMaterial } from '@/types/course';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

export const useCourses = (filters?: {
  categoryId?: string;
  search?: string;
  priceRange?: [number, number];
  difficulty?: string;
}) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['courses', filters],
    queryFn: async () => {
      let query = supabase
        .from('courses')
        .select(`
          *,
          course_categories(*)
        `)
        .eq('is_published', true);

      if (filters?.categoryId) {
        query = query.eq('category_id', filters.categoryId);
      }

      if (filters?.search) {
        query = query.ilike('title', `%${filters.search}%`);
      }

      if (filters?.difficulty) {
        query = query.eq('difficulty_level', filters.difficulty);
      }

      if (filters?.priceRange) {
        query = query
          .gte('price', filters.priceRange[0])
          .lte('price', filters.priceRange[1]);
      }

      const { data, error } = await query;

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Erro ao carregar cursos',
          description: error.message,
        });
        throw error;
      }

      const coursesWithEnrollment = await Promise.all(
        data.map(async (course) => {
          if (!user) return { ...course, is_enrolled: false };

          const { data: enrollment } = await supabase
            .from('course_enrollments')
            .select('*')
            .eq('course_id', course.id)
            .eq('user_id', user.id)
            .maybeSingle();

          const { data: rating } = await supabase.rpc('get_course_avg_rating', {
            course_id: course.id
          });

          const { count } = await supabase
            .from('course_enrollments')
            .select('*', { count: 'exact', head: true })
            .eq('course_id', course.id);

          return {
            ...course,
            is_enrolled: !!enrollment,
            average_rating: rating,
            total_students: count || 0
          };
        })
      );

      return coursesWithEnrollment;
    },
    enabled: true,
  });
};

export const useCourse = (courseId: string | undefined) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      if (!courseId) return null;

      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          course_categories(*)
        `)
        .eq('id', courseId)
        .maybeSingle();

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Erro ao carregar curso',
          description: error.message,
        });
        throw error;
      }

      if (!data) return null;

      const { data: modules } = await supabase
        .from('course_modules')
        .select('*')
        .eq('course_id', courseId)
        .order('order_num');

      if (modules) {
        for (const module of modules) {
          const { data: lessons } = await supabase
            .from('course_lessons')
            .select('*')
            .eq('module_id', module.id)
            .order('order_num');
          
          module.lessons = lessons || [];
        }
      }

      const { data: materials } = await supabase
        .from('course_materials')
        .select('*')
        .eq('course_id', courseId);

      const { data: rating } = await supabase.rpc('get_course_avg_rating', {
        course_id: courseId
      });

      const { count } = await supabase
        .from('course_enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('course_id', courseId);

      let isEnrolled = false;
      if (user) {
        const { data: enrollment } = await supabase
          .from('course_enrollments')
          .select('*')
          .eq('course_id', courseId)
          .eq('user_id', user.id)
          .maybeSingle();
        
        isEnrolled = !!enrollment;
      }

      return {
        ...data,
        modules: modules || [],
        materials: materials || [],
        average_rating: rating,
        total_students: count || 0,
        is_enrolled: isEnrolled
      };
    },
    enabled: !!courseId,
  });
};

export const useUserCourses = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-courses'],
    queryFn: async () => {
      if (!user) return [];

      // Fetch courses created by user
      const { data: createdCourses, error: createdError } = await supabase
        .from('courses')
        .select(`
          *,
          course_categories(*)
        `)
        .eq('created_by', user.id);

      if (createdError) {
        toast({
          variant: 'destructive',
          title: 'Erro ao carregar cursos criados',
          description: createdError.message,
        });
        throw createdError;
      }

      // Fetch courses enrolled by user
      const { data: enrollments, error: enrolledError } = await supabase
        .from('course_enrollments')
        .select(`
          *,
          courses(
            *,
            course_categories(*)
          )
        `)
        .eq('user_id', user.id);

      if (enrolledError) {
        toast({
          variant: 'destructive',
          title: 'Erro ao carregar inscrições',
          description: enrolledError.message,
        });
        throw enrolledError;
      }

      const enrolledCourses = enrollments.map(enrollment => ({
        ...enrollment.courses,
        enrollment_status: enrollment.status,
        progress: enrollment.progress
      }));

      return {
        created: createdCourses || [],
        enrolled: enrolledCourses || []
      };
    },
    enabled: !!user,
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['course-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_categories')
        .select('*');

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Erro ao carregar categorias',
          description: error.message,
        });
        throw error;
      }

      return data;
    },
  });
};

export const useEnrollCourse = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ courseId, price }: { courseId: string; price: number }) => {
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const { data, error } = await supabase
        .from('course_enrollments')
        .insert({
          course_id: courseId,
          user_id: user.id,
          price_paid: price,
          status: 'active',
          progress: {}
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: (_, { courseId }) => {
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
      queryClient.invalidateQueries({ queryKey: ['user-courses'] });
      
      toast({
        title: 'Inscrição realizada',
        description: 'Sua inscrição no curso foi realizada com sucesso',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Erro na inscrição',
        description: error.message,
      });
    },
  });
};

export const useCreateCourse = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (courseData: Partial<Course>) => {
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Ensure required fields are present
      if (!courseData.title || !courseData.description || !courseData.duration || 
          !courseData.language || !courseData.difficulty_level) {
        throw new Error('Campos obrigatórios não preenchidos');
      }

      const { data, error } = await supabase
        .from('courses')
        .insert({
          title: courseData.title,
          description: courseData.description,
          category_id: courseData.category_id,
          duration: courseData.duration,
          language: courseData.language,
          difficulty_level: courseData.difficulty_level,
          price: courseData.price || 0,
          thumbnail_url: courseData.thumbnail_url || null,
          preview_video_url: courseData.preview_video_url || null,
          is_published: courseData.is_published || false,
          created_by: user.id
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-courses'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      
      toast({
        title: 'Curso criado',
        description: 'Seu curso foi criado com sucesso',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Erro ao criar curso',
        description: error.message,
      });
    },
  });
};

export const useUpdateCourse = (courseId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseData: Partial<Course>) => {
      const { data, error } = await supabase
        .from('courses')
        .update(courseData)
        .eq('id', courseId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
      queryClient.invalidateQueries({ queryKey: ['user-courses'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      
      toast({
        title: 'Curso atualizado',
        description: 'As alterações foram salvas com sucesso',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar curso',
        description: error.message,
      });
    },
  });
};

export const useCreateModule = (courseId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (moduleData: Partial<CourseModule>) => {
      // Get the maximum order number
      const { data: existingModules } = await supabase
        .from('course_modules')
        .select('order_num')
        .eq('course_id', courseId)
        .order('order_num', { ascending: false })
        .limit(1);
      
      const nextOrderNum = existingModules && existingModules.length > 0 
        ? existingModules[0].order_num + 1 
        : 1;

      // Ensure title is present
      if (!moduleData.title) {
        throw new Error('Título do módulo é obrigatório');
      }

      const { data, error } = await supabase
        .from('course_modules')
        .insert({
          title: moduleData.title,
          description: moduleData.description || null,
          course_id: courseId,
          order_num: nextOrderNum
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
      
      toast({
        title: 'Módulo adicionado',
        description: 'O módulo foi adicionado com sucesso',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Erro ao adicionar módulo',
        description: error.message,
      });
    },
  });
};

export const useCreateLesson = (moduleId: string, courseId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (lessonData: Partial<CourseLesson>) => {
      // Get the maximum order number
      const { data: existingLessons } = await supabase
        .from('course_lessons')
        .select('order_num')
        .eq('module_id', moduleId)
        .order('order_num', { ascending: false })
        .limit(1);
      
      const nextOrderNum = existingLessons && existingLessons.length > 0 
        ? existingLessons[0].order_num + 1 
        : 1;

      // Ensure title is present
      if (!lessonData.title) {
        throw new Error('Título da aula é obrigatório');
      }

      const { data, error } = await supabase
        .from('course_lessons')
        .insert({
          title: lessonData.title,
          description: lessonData.description || null,
          video_url: lessonData.video_url || null,
          duration: lessonData.duration || null,
          module_id: moduleId,
          order_num: nextOrderNum
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
      
      toast({
        title: 'Aula adicionada',
        description: 'A aula foi adicionada com sucesso',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Erro ao adicionar aula',
        description: error.message,
      });
    },
  });
};

export const useAddMaterial = (courseId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      file, 
      title, 
      description, 
      lessonId 
    }: { 
      file: File; 
      title: string; 
      description?: string; 
      lessonId?: string;
    }) => {
      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${courseId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('course-materials')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('course-materials')
        .getPublicUrl(filePath);

      // Save to database
      const { data, error } = await supabase
        .from('course_materials')
        .insert({
          course_id: courseId,
          lesson_id: lessonId || null,
          title,
          description: description || null,
          file_url: publicUrl,
          file_type: file.type
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
      
      toast({
        title: 'Material adicionado',
        description: 'O material foi adicionado com sucesso',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Erro ao adicionar material',
        description: error.message,
      });
    },
  });
};

export const useAddReview = (courseId: string) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ rating, comment }: { rating: number; comment?: string }) => {
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const { data, error } = await supabase
        .from('course_reviews')
        .insert({
          course_id: courseId,
          user_id: user.id,
          rating,
          comment: comment || null
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
      
      toast({
        title: 'Avaliação enviada',
        description: 'Sua avaliação foi enviada com sucesso',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Erro ao enviar avaliação',
        description: error.message,
      });
    },
  });
};
