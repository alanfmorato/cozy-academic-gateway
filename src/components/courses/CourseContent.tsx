
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Video, CheckCircle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CourseWithDetails, CourseLesson, CourseModule } from '@/types/course';
import { cn } from '@/lib/utils';

interface CourseContentProps {
  course: CourseWithDetails;
  currentModuleId: string | undefined;
  currentLessonId: string | undefined;
  onLessonSelect: (module: CourseModule, lesson: CourseLesson) => void;
}

const CourseContent: React.FC<CourseContentProps> = ({
  course,
  currentModuleId,
  currentLessonId,
  onLessonSelect,
}) => {
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  // Find the first lesson if no lesson is selected
  React.useEffect(() => {
    if (!currentLessonId && course.modules && course.modules.length > 0) {
      const firstModule = course.modules[0];
      if (firstModule.lessons && firstModule.lessons.length > 0) {
        onLessonSelect(firstModule, firstModule.lessons[0]);
        // Auto-expand the first module
        setExpandedModules({ [firstModule.id]: true });
      }
    }
  }, [course, currentLessonId, onLessonSelect]);

  return (
    <div className="h-full overflow-y-auto border-r border-border">
      <div className="p-4 border-b border-border">
        <h2 className="font-semibold text-lg">Conteúdo do curso</h2>
      </div>
      
      <div className="divide-y divide-border">
        {course.modules?.map((module) => (
          <div key={module.id} className="p-0">
            <button
              className="flex items-center justify-between w-full p-4 text-left hover:bg-accent"
              onClick={() => toggleModule(module.id)}
            >
              <div>
                <h3 className="font-medium">{module.title}</h3>
                <span className="text-xs text-muted-foreground">
                  {module.lessons?.length || 0} aulas
                </span>
              </div>
              {expandedModules[module.id] ? (
                <ChevronUp size={20} />
              ) : (
                <ChevronDown size={20} />
              )}
            </button>
            
            {expandedModules[module.id] && (
              <div className="pl-4 pr-2 pb-3 space-y-1">
                {module.lessons?.map((lesson: CourseLesson) => (
                  <button
                    key={lesson.id}
                    className={cn(
                      "flex items-center gap-2 w-full p-2 text-left rounded-md text-sm",
                      currentLessonId === lesson.id
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-accent"
                    )}
                    onClick={() => onLessonSelect(module, lesson)}
                  >
                    <div className="flex-none">
                      {currentLessonId === lesson.id ? (
                        <CheckCircle size={16} className="text-primary" />
                      ) : (
                        <Video size={16} className="text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-grow overflow-hidden">
                      <span className="block truncate">{lesson.title}</span>
                    </div>
                    {lesson.duration && (
                      <span className="text-xs text-muted-foreground flex-none">
                        {lesson.duration} min
                      </span>
                    )}
                  </button>
                ))}
                
                {/* Materials related to this module */}
                {course.materials?.filter(material => 
                  material.lesson_id && module.lessons?.some(lesson => lesson.id === material.lesson_id)
                ).map(material => (
                  <a
                    key={material.id}
                    href={material.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 w-full p-2 text-left rounded-md text-sm hover:bg-accent"
                  >
                    <FileText size={16} className="text-muted-foreground" />
                    <span className="truncate">{material.title}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Course materials not attached to a specific lesson */}
      {course.materials?.filter(m => !m.lesson_id).length > 0 && (
        <div className="p-4 border-t border-border">
          <h3 className="font-medium mb-2">Materiais do curso</h3>
          <div className="space-y-1">
            {course.materials
              ?.filter(material => !material.lesson_id)
              .map(material => (
                <a
                  key={material.id}
                  href={material.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 w-full p-2 text-left rounded-md text-sm hover:bg-accent"
                >
                  <FileText size={16} className="text-primary" />
                  <span className="truncate">{material.title}</span>
                </a>
              ))}
          </div>
        </div>
      )}
      
      {(!course.modules || course.modules.length === 0) && (
        <div className="p-4 text-center text-muted-foreground">
          Nenhum conteúdo disponível
        </div>
      )}
    </div>
  );
};

export default CourseContent;
