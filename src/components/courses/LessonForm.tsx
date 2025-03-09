
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const formSchema = z.object({
  title: z.string().min(3, {
    message: 'O título deve ter pelo menos 3 caracteres',
  }),
  description: z.string().optional(),
  duration: z.coerce.number().int().min(1, {
    message: 'A duração deve ser pelo menos 1 minuto',
  }),
  order_num: z.coerce.number().int().positive({
    message: 'A ordem deve ser um número positivo',
  }),
  video_url: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface LessonFormProps {
  courseId: string;
  moduleId: string;
  initialData?: Partial<FormValues>;
  onSubmit: (data: FormValues, videoFile?: File) => void;
  isSubmitting: boolean;
}

const LessonForm: React.FC<LessonFormProps> = ({
  courseId,
  moduleId,
  initialData,
  onSubmit,
  isSubmitting,
}) => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUploading, setVideoUploading] = useState(false);
  const [videoPreview, setVideoPreview] = useState<string | null>(
    initialData?.video_url || null
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      title: '',
      description: '',
      duration: 10,
      order_num: 1,
      video_url: '',
    },
  });

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  const handleVideoUpload = async () => {
    if (!videoFile) return null;
    
    try {
      setVideoUploading(true);
      
      const fileExt = videoFile.name.split('.').pop();
      const filePath = `courses/${courseId}/modules/${moduleId}/${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('course-materials')
        .upload(filePath, videoFile);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('course-materials')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao enviar vídeo',
        description: error.message,
      });
      return null;
    } finally {
      setVideoUploading(false);
    }
  };

  const handleFormSubmit = async (values: FormValues) => {
    try {
      let videoUrl = values.video_url;
      
      if (videoFile) {
        const uploadedUrl = await handleVideoUpload();
        if (uploadedUrl) {
          videoUrl = uploadedUrl;
        }
      }
      
      onSubmit(
        {
          ...values,
          video_url: videoUrl,
        },
        videoFile
      );
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao salvar aula',
        description: error.message,
      });
    }
  };

  return (
    <Form {...form}>
      <form 
        onSubmit={form.handleSubmit(handleFormSubmit)} 
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título da aula</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Introdução ao conceito" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição (opcional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descrição breve da aula"
                  rows={3}
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duração (minutos)</FormLabel>
                <FormControl>
                  <Input type="number" min="1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="order_num"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ordem</FormLabel>
                <FormControl>
                  <Input type="number" min="1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-2">
          <FormLabel>Vídeo da aula</FormLabel>
          
          {videoPreview && !videoFile ? (
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="video_url"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <video
                src={videoPreview}
                controls
                className="w-full h-auto max-h-60 rounded-lg"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-input rounded-lg p-4">
              {videoFile ? (
                <div className="w-full space-y-2">
                  <p className="text-sm font-medium">{videoFile.name}</p>
                  <video
                    src={videoPreview || undefined}
                    controls
                    className="w-full h-auto max-h-60 rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setVideoFile(null);
                      setVideoPreview(null);
                    }}
                  >
                    Remover
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    Faça upload de um vídeo ou informe a URL
                  </p>
                  <Input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoChange}
                    className="w-full max-w-xs"
                  />
                  <div className="mt-4 w-full">
                    <FormField
                      control={form.control}
                      name="video_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input 
                              placeholder="Ou informe a URL do vídeo"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            URL do YouTube, Vimeo ou outro serviço de hospedagem
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting || videoUploading}
          >
            {isSubmitting || videoUploading ? 'Salvando...' : 'Salvar aula'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default LessonForm;
