
import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, Star, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatMinutesToDuration } from '@/lib/utils';
import { CourseWithDetails } from '@/types/course';
import { cn } from '@/lib/utils';

interface CourseCardProps {
  course: CourseWithDetails;
  className?: string;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, className }) => {
  return (
    <Link 
      to={`/cursos/${course.id}`} 
      className={cn(
        'block group rounded-xl border border-border bg-card shadow-sm overflow-hidden transition-all hover:shadow-md hover:border-primary/20 hover:-translate-y-1',
        className
      )}
    >
      <div className="relative">
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
        
        {course.price === 0 ? (
          <Badge variant="success" className="absolute top-2 right-2">
            Gratuito
          </Badge>
        ) : (
          <Badge variant="default" className="absolute top-2 right-2">
            R$ {course.price.toFixed(2)}
          </Badge>
        )}
        
        <Badge 
          variant="outline" 
          className="absolute top-2 left-2 bg-black/60 border-none text-white"
        >
          {course.category?.name}
        </Badge>
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold line-clamp-2 group-hover:text-primary">
          {course.title}
        </h3>
        
        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
          {course.description}
        </p>
        
        <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock size={14} />
            <span>{formatMinutesToDuration(course.duration)}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <Star size={14} className="text-amber-500" />
            <span>{(course.average_rating || 0).toFixed(1)}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <Users size={14} />
            <span>{course.total_students || 0} alunos</span>
          </div>
        </div>
        
        <div className="mt-3 flex items-center justify-between">
          <Badge variant={
            course.difficulty_level === 'iniciante' ? 'outline' :
            course.difficulty_level === 'intermediário' ? 'secondary' : 'destructive'
          }>
            {course.difficulty_level}
          </Badge>
          
          {course.is_enrolled && (
            <Badge variant="success" className="ml-auto">
              Inscrito
            </Badge>
          )}
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;
