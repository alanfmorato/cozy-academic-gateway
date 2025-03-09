
import React from 'react';
import { useParams } from 'react-router-dom';
import { useCourse } from '@/hooks/useCourses';
import CourseDetails from '@/components/courses/CourseDetails';
import { useAuth } from '@/context/AuthContext';

const CursoDetalhe = () => {
  const { id } = useParams<{ id: string }>();
  const { data: course, isLoading } = useCourse(id);
  const { user } = useAuth();
  
  const isCreator = user && course && user.id === course.created_by;

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 animate-pulse">
        <div className="h-12 bg-muted rounded-lg w-1/3 mb-8"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-32 bg-muted rounded-lg"></div>
            <div className="h-64 bg-muted rounded-lg"></div>
            <div className="h-96 bg-muted rounded-lg"></div>
          </div>
          <div className="lg:col-span-1">
            <div className="h-96 bg-muted rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Curso não encontrado</h1>
        <p className="text-muted-foreground mb-8">
          O curso que você está procurando não existe ou foi removido.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <CourseDetails course={course} isCreator={!!isCreator} />
    </div>
  );
};

export default CursoDetalhe;
