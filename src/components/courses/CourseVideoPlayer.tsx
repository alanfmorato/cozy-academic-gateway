
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CourseLesson } from '@/types/course';

interface VideoPlayerProps {
  title: string;
  videoUrl: string;
  onBack?: () => void;
}

const CourseVideoPlayer: React.FC<VideoPlayerProps> = ({ title, videoUrl, onBack }) => {
  const isYouTubeVideo = videoUrl?.includes('youtube.com') || 
                         videoUrl?.includes('youtu.be');
  const isVimeoVideo = videoUrl?.includes('vimeo.com');
  
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
      {onBack && (
        <div className="p-4 border-b border-border flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft size={16} className="mr-2" />
            Voltar para cursos
          </Button>
        </div>
      )}
      
      <div className="flex flex-col flex-grow p-4 overflow-y-auto">
        <div className="aspect-video bg-black mb-4 rounded-lg overflow-hidden">
          {videoUrl ? (
            isYouTubeVideo || isVimeoVideo ? (
              <iframe
                src={getEmbedUrl(videoUrl)}
                className="w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video 
                src={videoUrl} 
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
          <h1 className="text-2xl font-bold">{title}</h1>
        </div>
      </div>
    </div>
  );
};

export default CourseVideoPlayer;
