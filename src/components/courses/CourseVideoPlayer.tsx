
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Maximize, Minimize } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CourseLesson } from '@/types/course';
import { cn } from '@/lib/utils';

interface VideoPlayerProps {
  title: string;
  videoUrl: string;
  onBack?: () => void;
}

const CourseVideoPlayer: React.FC<VideoPlayerProps> = ({ title, videoUrl, onBack }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<string | null>(null);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  
  const isYouTubeVideo = videoUrl?.includes('youtube.com') || 
                         videoUrl?.includes('youtu.be');
  const isVimeoVideo = videoUrl?.includes('vimeo.com');
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);
  
  const toggleFullscreen = () => {
    const videoContainer = document.getElementById('video-container');
    
    if (!videoContainer) return;
    
    if (!document.fullscreenElement) {
      videoContainer.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };
  
  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setStartY(e.touches[0].clientY);
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!startX || !startY) return;
    
    const xDiff = startX - e.touches[0].clientX;
    const yDiff = startY - e.touches[0].clientY;
    
    if (Math.abs(xDiff) > Math.abs(yDiff)) {
      if (xDiff > 10) {
        setSwipeDirection('left');
      } else if (xDiff < -10) {
        setSwipeDirection('right');
      }
    }
  };
  
  const handleTouchEnd = () => {
    if (swipeDirection === 'left') {
      console.log('Swiped left - could navigate to next lesson');
    } else if (swipeDirection === 'right') {
      console.log('Swiped right - could navigate to previous lesson');
    }
    
    setSwipeDirection(null);
    setStartX(0);
    setStartY(0);
  };
  
  const getEmbedUrl = (url: string) => {
    if (isYouTubeVideo) {
      // Extract YouTube video ID
      const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
      const match = url.match(youtubeRegex);
      if (match && match[1]) {
        return `https://www.youtube.com/embed/${match[1]}?autoplay=1&playsinline=1&rel=0`;
      }
    } else if (isVimeoVideo) {
      // Extract Vimeo video ID
      const vimeoRegex = /vimeo\.com\/(?:video\/)?(\d+)/;
      const match = url.match(vimeoRegex);
      if (match && match[1]) {
        return `https://player.vimeo.com/video/${match[1]}?autoplay=1&playsinline=1`;
      }
    }
    return url;
  };

  return (
    <div className="flex flex-col h-full">
      {onBack && (
        <div className="p-2 sm:p-4 border-b border-border flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onBack} className="h-8 px-2 sm:h-9 sm:px-4">
            <ArrowLeft size={16} className="mr-1 sm:mr-2" />
            <span className="text-sm">Voltar</span>
          </Button>
          
          {!isYouTubeVideo && !isVimeoVideo && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={toggleFullscreen}
              className="h-8 px-2 sm:h-9 sm:px-4"
            >
              {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
            </Button>
          )}
        </div>
      )}
      
      <div className="flex flex-col flex-grow p-2 sm:p-4 overflow-y-auto">
        <div 
          id="video-container"
          className="aspect-video bg-black mb-3 sm:mb-4 rounded-lg overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
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
                playsInline
                className="w-full h-full"
              />
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <p className="text-muted-foreground">Nenhum vídeo disponível</p>
            </div>
          )}
        </div>
        
        <div className="space-y-2 sm:space-y-4">
          <h1 className="text-lg sm:text-2xl font-bold">{title}</h1>
        </div>
      </div>
    </div>
  );
};

export default CourseVideoPlayer;
