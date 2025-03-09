
import React from 'react';
import { useNavigate } from 'react-router-dom';
import CourseForm from '@/components/courses/CourseForm';
import { useCreateCourse, useCategories } from '@/hooks/useCourses';
import { toast } from '@/hooks/use-toast';
import { Course } from '@/types/course';

const CursoNovo = () => {
  const navigate = useNavigate();
  const createCourse = useCreateCourse();
  const { data: categories, isLoading: categoriesLoading } = useCategories();

  const handleCreateCourse = async (courseData: Partial<Course>) => {
    try {
      await createCourse.mutateAsync(courseData);
      toast({
        title: 'Curso criado com sucesso',
        description: 'Seu curso foi criado e está disponível para edição',
      });
      navigate('/cursos');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao criar curso',
        description: error.message || 'Ocorreu um erro ao criar o curso',
      });
    }
  };

  if (categoriesLoading || !categories) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Criar novo curso</h1>
        <div className="flex justify-center items-center p-12">
          <p className="text-muted-foreground">Carregando categorias...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Criar novo curso</h1>
      <div className="bg-card rounded-lg shadow-sm p-6">
        <CourseForm 
          onSubmit={handleCreateCourse} 
          isSubmitting={createCourse.isPending} 
          categories={categories}
        />
      </div>
    </div>
  );
};

export default CursoNovo;
