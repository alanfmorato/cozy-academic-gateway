
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";

interface RatingFormProps {
  caronaId: string;
  avaliadoId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const RatingForm: React.FC<RatingFormProps> = ({
  caronaId,
  avaliadoId,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comentario, setComentario] = useState("");
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast({
        variant: "destructive",
        title: "Selecione uma nota de 1 a 5 estrelas",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from("avaliacoes_caronas").insert({
        carona_id: caronaId,
        avaliador_id: user.id,
        avaliado_id: avaliadoId,
        nota: rating,
        comentario: comentario || null,
      });

      if (error) throw error;

      onSuccess();
    } catch (error: any) {
      console.error("Erro ao enviar avaliação:", error);
      toast({
        variant: "destructive",
        title: "Erro ao enviar avaliação",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card border rounded-lg p-4 mt-4">
      <h4 className="font-medium mb-2">Avaliar motorista</h4>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center justify-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="text-2xl focus:outline-none"
            >
              <Star
                className={`h-8 w-8 ${
                  star <= (hoveredRating || rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            </button>
          ))}
        </div>
        <Textarea
          placeholder="Deixe um comentário (opcional)"
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          className="h-20"
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading || rating === 0}>
            {loading ? "Enviando..." : "Enviar Avaliação"}
          </Button>
        </div>
      </form>
    </div>
  );
};
