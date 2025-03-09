
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Clock, 
  Star, 
  Users, 
  Globe, 
  FileText, 
  PlusCircle,
  Video,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Edit,
  ArrowLeft
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { formatMinutesToDuration } from '@/lib/utils';
import { CourseWithDetails, CourseModule, CourseLesson } from '@/types/course';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/context/AuthContext';
import CourseRatingForm from './CourseRatingForm';
import { useAddReview, useEnrollCourse } from '@/hooks/useCourses';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface CourseDetailsProps {
  course: CourseWithDetails;
  isCreator: boolean;
}

const CourseDetails: React.FC<CourseDetailsProps> = ({ course, isCreator }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const enrollMutation = useEnrollCourse();
  const addReviewMutation = useAddReview(course.id);
  
  const handleEnroll = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    enrollMutation.mutate({
      courseId: course.id,
      price: course.price
    });
  };
  
  const handleAddReview = (data: { rating: number; comment?: string }) => {
    addReviewMutation.mutate({
      rating: data.rating,
      comment: data.comment
    });
  };
  
  const totalLessons = course.modules?.reduce(
    (acc, module) => acc + (module.lessons?.length || 0), 
    0
  ) || 0;
  
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/cursos')}
          className="gap-1"
        >
          <ArrowLeft size={16} />
          Voltar para cursos
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{course.category?.name}</Badge>
                <Badge variant={
                  course.difficulty_level === 'iniciante' ? 'outline' :
                  course.difficulty_level === 'intermediário' ? 'secondary' : 'destructive'
                }>
                  {course.difficulty_level}
                </Badge>
                {course.price === 0 && (
                  <Badge variant="success">Gratuito</Badge>
                )}
              </div>
              
              <h1 className="text-3xl font-bold">{course.title}</h1>
              
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock size={16} />
                  <span>{formatMinutesToDuration(course.duration)}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Star size={16} className="text-amber-500" />
                  <span>{(course.average_rating || 0).toFixed(1)}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Users size={16} />
                  <span>{course.total_students || 0} alunos</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <BookOpen size={16} />
                  <span>{totalLessons} aulas</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Globe size={16} />
                  <span>{course.language}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-3">Descrição</h2>
            <p className="text-muted-foreground whitespace-pre-line">
              {course.description}
            </p>
          </div>
          
          <Separator />
          
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-semibold">Conteúdo do curso</h2>
              {isCreator && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  asChild
                >
                  <Link to={`/cursos/${course.id}/gerenciar`} className="flex items-center gap-1">
                    <Edit size={16} />
                    Gerenciar curso
                  </Link>
                </Button>
              )}
            </div>
            
            {course.modules && course.modules.length > 0 ? (
              <Accordion type="single" collapsible className="w-full">
                {course.modules.map((module) => (
                  <AccordionItem key={module.id} value={module.id}>
                    <AccordionTrigger className="py-3">
                      <div className="flex flex-col items-start text-left">
                        <span className="font-medium">{module.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {module.lessons?.length || 0} aulas
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-2 pl-4">
                        {module.lessons?.map((lesson: CourseLesson) => (
                          <li key={lesson.id} className="flex items-center gap-2 py-1">
                            <Video size={16} className="text-muted-foreground" />
                            <span>{lesson.title}</span>
                            {lesson.duration && (
                              <span className="text-xs text-muted-foreground ml-auto">
                                {lesson.duration} min
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <div className="text-center py-8 text-muted-foreground border border-dashed rounded-md">
                {isCreator ? (
                  <div className="space-y-2">
                    <p>Nenhum módulo adicionado ainda.</p>
                    <Button variant="outline" asChild>
                      <Link to={`/cursos/${course.id}/gerenciar`} className="flex items-center gap-1">
                        <PlusCircle size={16} />
                        Adicionar módulos
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <p>Nenhum conteúdo disponível ainda.</p>
                )}
              </div>
            )}
          </div>
          
          {course.materials && course.materials.length > 0 && (
            <>
              <Separator />
              
              <div>
                <h2 className="text-xl font-semibold mb-3">Materiais do curso</h2>
                <ul className="space-y-2">
                  {course.materials.map((material) => (
                    <li key={material.id} className="flex items-center gap-2 p-2 rounded-md hover:bg-accent">
                      <FileText size={16} className="text-primary" />
                      <div>
                        <p className="font-medium">{material.title}</p>
                        {material.description && (
                          <p className="text-xs text-muted-foreground">{material.description}</p>
                        )}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="ml-auto"
                        asChild
                      >
                        <a href={material.file_url} target="_blank" rel="noopener noreferrer">
                          Download
                        </a>
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
        
        <div className="lg:col-span-1 space-y-6">
          <div className="sticky top-20 space-y-6">
            <div className="rounded-xl border border-border overflow-hidden">
              {course.thumbnail_url ? (
                <img 
                  src={course.thumbnail_url} 
                  alt={course.title} 
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-secondary/20 flex items-center justify-center">
                  <BookOpen size={32} className="text-muted-foreground" />
                </div>
              )}
              
              <div className="p-4 space-y-4">
                {course.price > 0 ? (
                  <div className="text-2xl font-bold">
                    R$ {course.price.toFixed(2)}
                  </div>
                ) : (
                  <div className="text-2xl font-bold text-green-600">
                    Gratuito
                  </div>
                )}
                
                {course.is_enrolled ? (
                  <Button className="w-full" asChild>
                    <Link to={`/cursos/${course.id}/assistir`} className="flex items-center justify-center gap-2">
                      <CheckCircle size={16} />
                      Assistir curso
                    </Link>
                  </Button>
                ) : isCreator ? (
                  <Button variant="outline" className="w-full" asChild>
                    <Link to={`/cursos/${course.id}/gerenciar`}>Gerenciar curso</Link>
                  </Button>
                ) : (
                  <Button 
                    className="w-full" 
                    onClick={handleEnroll}
                    disabled={enrollMutation.isPending}
                  >
                    {enrollMutation.isPending ? 'Processando...' : 'Inscrever-se'}
                  </Button>
                )}
                
                {course.is_enrolled && !isCreator && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full">
                        Avaliar curso
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Avaliar curso</DialogTitle>
                      </DialogHeader>
                      <CourseRatingForm
                        onSubmit={handleAddReview}
                        isSubmitting={addReviewMutation.isPending}
                      />
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </div>
            
            <div className="rounded-xl border border-border p-4 space-y-3">
              <h3 className="font-semibold">O que você aprenderá</h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-green-600 mt-1 shrink-0" />
                  <span>Dominar conceitos essenciais da área</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-green-600 mt-1 shrink-0" />
                  <span>Aplicar conhecimentos em projetos práticos</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-green-600 mt-1 shrink-0" />
                  <span>Desenvolver habilidades técnicas avançadas</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;
