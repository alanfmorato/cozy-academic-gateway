
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCourse } from '@/hooks/useCourses';
import CourseVideoPlayer from '@/components/courses/CourseVideoPlayer';
import CourseContent from '@/components/courses/CourseContent';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CourseWithDetails, CourseLesson, CourseModule } from '@/types/course';

const CursoAssistir = () => {
  const { id, moduleId, lessonId } = useParams();
  const navigate = useNavigate();
  const { data: course, isLoading } = useCourse(id);
  const [currentModule, setCurrentModule] = useState<CourseModule | null>(null);
  const [currentLesson, setCurrentLesson] = useState<CourseLesson | null>(null);

  useEffect(() => {
    if (course && course.modules) {
      const module = course.modules.find(m => m.id === moduleId) || course.modules[0];
      setCurrentModule(module);
      
      if (module && module.lessons && module.lessons.length > 0) {
        const lesson = lessonId ? module.lessons.find(l => l.id === lessonId) : module.lessons[0];
        setCurrentLesson(lesson || module.lessons[0]);
      }
    }
  }, [course, moduleId, lessonId]);

  const handleLessonSelect = (module: CourseModule, lesson: CourseLesson) => {
    setCurrentModule(module);
    setCurrentLesson(lesson);
    navigate(`/cursos/${id}/assistir/${module.id}/${lesson.id}`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <Skeleton className="h-8 w-48 mb-4" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Skeleton className="w-full aspect-video rounded-md" />
          </div>
          <div>
            <Skeleton className="h-12 w-full mb-4" />
            <Skeleton className="h-8 w-full mb-2" />
            <Skeleton className="h-8 w-3/4 mb-4" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto py-8">
        <p>Curso não encontrado</p>
        <Button onClick={() => navigate('/cursos')}>Voltar para cursos</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Button
        variant="outline"
        size="sm"
        className="mb-4"
        onClick={() => navigate(`/cursos/${id}`)}
      >
        <ChevronLeft className="h-4 w-4 mr-2" />
        Voltar para detalhes do curso
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {currentLesson ? (
            <CourseVideoPlayer
              videoUrl={currentLesson.video_url || ''}
            />
          ) : (
            <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
              <p className="text-muted-foreground">Selecione uma aula para assistir</p>
            </div>
          )}

          {currentLesson && (
            <div className="mt-6">
              <h2 className="text-2xl font-bold">{currentLesson.title}</h2>
              {currentLesson.description && <p className="mt-2">{currentLesson.description}</p>}
            </div>
          )}
        </div>

        <div>
          <CourseContent
            course={course as CourseWithDetails}
            onLessonSelect={handleLessonSelect}
          />
        </div>
      </div>
    </div>
  );
};

export default CursoAssistir;
