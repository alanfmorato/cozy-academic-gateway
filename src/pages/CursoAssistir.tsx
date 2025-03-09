
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCourse } from '@/hooks/useCourses';
import CourseContent from '@/components/courses/CourseContent';
import CourseVideoPlayer from '@/components/courses/CourseVideoPlayer';
import { useNavigate } from 'react-router-dom';

const CursoAssistir = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: course, isLoading } = useCourse(id);
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);

  const findLesson = () => {
    if (!course || !currentLessonId) return null;
    
    for (const module of course.modules || []) {
      for (const lesson of module.lessons || []) {
        if (lesson.id === currentLessonId) {
          return lesson;
        }
      }
    }
    return null;
  };

  const currentLesson = findLesson();

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-64px)] animate-pulse">
        <div className="w-80 bg-muted"></div>
        <div className="flex-1 bg-muted-foreground/5"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-64px)]">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Curso não encontrado</h1>
          <p className="text-muted-foreground">
            O curso que você está procurando não existe ou foi removido.
          </p>
        </div>
      </div>
    );
  }

  if (!course.is_enrolled) {
    navigate(`/cursos/${id}`);
    return null;
  }

  return (
    <div className="flex h-[calc(100vh-64px)]">
      <div className="w-80 shrink-0 overflow-hidden">
        <CourseContent
          course={course}
          currentLessonId={currentLessonId}
          onSelectLesson={setCurrentLessonId}
        />
      </div>
      <div className="flex-1">
        <CourseVideoPlayer
          lesson={currentLesson}
          onBack={() => navigate(`/cursos/${id}`)}
        />
      </div>
    </div>
  );
};

export default CursoAssistir;
