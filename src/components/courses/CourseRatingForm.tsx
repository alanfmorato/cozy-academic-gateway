
import React from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';

const formSchema = z.object({
  rating: z.number().min(1, {
    message: 'A avaliação é obrigatória',
  }).max(5),
  comment: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface CourseRatingFormProps {
  onSubmit: (data: FormValues) => void;
  isSubmitting: boolean;
}

const CourseRatingForm: React.FC<CourseRatingFormProps> = ({
  onSubmit,
  isSubmitting,
}) => {
  const [hoverRating, setHoverRating] = React.useState(0);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rating: 0,
      comment: '',
    },
  });

  const rating = form.watch('rating');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Avaliação</FormLabel>
              <FormControl>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => field.onChange(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 focus:outline-none"
                    >
                      <Star
                        className={`h-8 w-8 ${
                          star <= (hoverRating || rating)
                            ? 'text-amber-500 fill-amber-500'
                            : 'text-muted-foreground'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Comentário (opcional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Compartilhe sua experiência com o curso"
                  rows={4}
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting || rating === 0}>
            {isSubmitting ? 'Enviando...' : 'Enviar avaliação'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CourseRatingForm;
