
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CourseLesson } from '@/types/course';

interface VideoPlayerProps {
  lesson: CourseLesson | null;
  onBack: () => void;
}

const CourseVideoPlayer: React.FC<VideoPlayerProps> = ({ lesson, onBack }) => {
  const isYouTubeVideo = lesson?.video_url?.includes('youtube.com') || 
                          lesson?.video_url?.includes('youtu.be');
  const isVimeoVideo = lesson?.video_url?.includes('vimeo.com');
  
  const getEmbedUrl = (url: string) => {
    if (isYouTubeVideo) {
      // Extract YouTube video ID
      const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
      const match = url.match(youtubeRegex);
      if (match && match[1]) {
        return `https://www.youtube.com/embed/${match[1]}?autoplay=1`;
      }
    } else if (isVimeoVideo) {
      // Extract Vimeo video ID
      const vimeoRegex = /vimeo\.com\/(?:video\/)?(\d+)/;
      const match = url.match(vimeoRegex);
      if (match && match[1]) {
        return `https://player.vimeo.com/video/${match[1]}?autoplay=1`;
      }
    }
    return url;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft size={16} className="mr-2" />
          Voltar para cursos
        </Button>
      </div>
      
      <div className="flex flex-col flex-grow p-4 overflow-y-auto">
        {lesson ? (
          <>
            <div className="aspect-video bg-black mb-4 rounded-lg overflow-hidden">
              {lesson.video_url ? (
                isYouTubeVideo || isVimeoVideo ? (
                  <iframe
                    src={getEmbedUrl(lesson.video_url)}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video 
                    src={lesson.video_url} 
                    controls 
                    autoPlay
                    className="w-full h-full"
                  />
                )
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <p className="text-muted-foreground">Nenhum vídeo disponível</p>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <h1 className="text-2xl font-bold">{lesson.title}</h1>
              
              {lesson.description && (
                <p className="text-muted-foreground whitespace-pre-line">
                  {lesson.description}
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">
              Selecione uma aula para assistir
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseVideoPlayer;
