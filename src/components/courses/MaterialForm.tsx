
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CourseModule, CourseLesson } from '@/types/course';

const formSchema = z.object({
  title: z.string().min(3, {
    message: 'O título deve ter pelo menos 3 caracteres',
  }),
  description: z.string().optional(),
  lesson_id: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface MaterialFormProps {
  modules: CourseModule[];
  onSubmit: (data: FormValues, file: File) => void;
  isSubmitting: boolean;
}

const MaterialForm: React.FC<MaterialFormProps> = ({
  modules,
  onSubmit,
  isSubmitting,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // Autofill title with filename if empty
      if (!form.getValues().title) {
        const filename = selectedFile.name.split('.').slice(0, -1).join('.');
        form.setValue('title', filename);
      }
    }
  };

  const handleFormSubmit = (values: FormValues) => {
    if (!file) {
      form.setError('root', {
        type: 'manual',
        message: 'Selecione um arquivo para upload',
      });
      return;
    }
    
    onSubmit(values, file);
  };

  // Get all lessons from the selected module
  const lessons = selectedModule 
    ? modules.find(m => m.id === selectedModule)?.lessons || []
    : [];

  return (
    <Form {...form}>
      <form 
        onSubmit={form.handleSubmit(handleFormSubmit)} 
        className="space-y-4"
      >
        <div className="space-y-2">
          <FormLabel>Arquivo</FormLabel>
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-input rounded-lg p-4">
            {file ? (
              <div className="w-full space-y-2">
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFile(null)}
                >
                  Remover
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-4">
                <p className="text-sm text-muted-foreground mb-2">
                  Faça upload de um arquivo (PDF, DOC, PPT, etc.)
                </p>
                <Input
                  type="file"
                  onChange={handleFileChange}
                  className="w-full max-w-xs"
                />
              </div>
            )}
          </div>
          {form.formState.errors.root && (
            <p className="text-sm font-medium text-destructive">
              {form.formState.errors.root.message}
            </p>
          )}
        </div>

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título do material</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Slides da aula 1" {...field} />
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
                  placeholder="Descrição breve do material"
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
          <div className="space-y-2">
            <FormLabel>Módulo (opcional)</FormLabel>
            <Select onValueChange={setSelectedModule}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um módulo" />
              </SelectTrigger>
              <SelectContent>
                {modules.map((module) => (
                  <SelectItem key={module.id} value={module.id}>
                    {module.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <FormField
            control={form.control}
            name="lesson_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Aula (opcional)</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={!selectedModule || lessons.length === 0}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma aula" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {lessons.map((lesson: CourseLesson) => (
                      <SelectItem key={lesson.id} value={lesson.id}>
                        {lesson.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Enviando...' : 'Enviar material'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default MaterialForm;
