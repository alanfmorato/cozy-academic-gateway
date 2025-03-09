
import React, { useState } from 'react';
import { useCategories, useCourses } from '@/hooks/useCourses';
import CourseCard from '@/components/courses/CourseCard';
import CourseFilters from '@/components/courses/CourseFilters';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';
import { CourseWithDetails } from '@/types/course';

interface CourseFiltersState {
  search: string;
  categoryId: string | undefined;
  difficulty: string | undefined;
  priceRange: [number, number];
}

const Cursos = () => {
  const { user } = useAuth();
  const [filters, setFilters] = useState<CourseFiltersState>({
    search: '',
    categoryId: undefined,
    difficulty: undefined,
    priceRange: [0, 1000],
  });

  const { data: courses, isLoading } = useCourses(filters);
  const { data: categories, isLoading: loadingCategories } = useCategories();

  const handleFilterChange = (newFilters: Partial<CourseFiltersState>) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      ...newFilters
    }));
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Cursos</h1>
        
        <Button asChild>
          <Link to="/cursos/novo" className="flex items-center gap-2">
            <PlusCircle size={16} />
            Criar curso
          </Link>
        </Button>
      </div>

      {loadingCategories ? (
        <div className="h-16 flex items-center justify-center">
          <p className="text-muted-foreground">Carregando filtros...</p>
        </div>
      ) : (
        <CourseFilters
          categories={categories || []}
          onFilterChange={handleFilterChange}
        />
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-80 bg-muted rounded-xl"></div>
          ))}
        </div>
      ) : courses && courses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course as CourseWithDetails} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <h3 className="text-xl font-semibold mb-2">Nenhum curso encontrado</h3>
          <p className="text-muted-foreground mb-6">
            Não encontramos cursos que correspondam aos filtros selecionados.
          </p>
          <Button 
            variant="outline" 
            onClick={() => setFilters({
              search: '',
              categoryId: undefined,
              difficulty: undefined,
              priceRange: [0, 1000],
            })}
          >
            Limpar filtros
          </Button>
        </div>
      )}
    </div>
  );
};

export default Cursos;
