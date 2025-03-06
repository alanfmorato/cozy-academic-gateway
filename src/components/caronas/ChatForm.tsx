
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { X, Send } from "lucide-react";

interface ChatFormProps {
  caronaId: string;
  destinatarioId: string;
  destinatarioNome: string;
  onClose: () => void;
}

interface Mensagem {
  id: string;
  carona_id: string;
  remetente_id: string;
  destinatario_id: string;
  mensagem: string;
  created_at: string;
  lida: boolean;
  remetente?: {
    full_name: string;
  } | null;
}

export const ChatForm: React.FC<ChatFormProps> = ({
  caronaId,
  destinatarioId,
  destinatarioNome,
  onClose,
}) => {
  const { user } = useAuth();
  const [mensagem, setMensagem] = useState("");
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchMensagens();
      const interval = setInterval(fetchMensagens, 5000);
      return () => clearInterval(interval);
    }
  }, [user?.id, caronaId, destinatarioId]);

  const fetchMensagens = async () => {
    if (!user) return;

    try {
      // Fetch messages where the user is either the sender or recipient
      const { data, error } = await supabase
        .from("mensagens_caronas")
        .select(`
          *,
          remetente:profiles(full_name)
        `)
        .eq("carona_id", caronaId)
        .or(`remetente_id.eq.${user.id},destinatario_id.eq.${user.id}`)
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Mark messages as read if user is the recipient
      const unreadMessages = (data || []).filter(
        (msg) => !msg.lida && msg.destinatario_id === user.id
      );

      if (unreadMessages.length > 0) {
        await Promise.all(
          unreadMessages.map((msg) =>
            supabase
              .from("mensagens_caronas")
              .update({ lida: true })
              .eq("id", msg.id)
          )
        );
      }

      // Process messages with sender information
      const processedMessages = (data || []).map((msg) => {
        return {
          ...msg,
          remetente: msg.remetente && {
            full_name: (msg.remetente as any)?.full_name || "Usuário"
          }
        };
      });

      setMensagens(processedMessages);
    } catch (error: any) {
      console.error("Erro ao buscar mensagens:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Você precisa estar logado para enviar mensagens",
      });
      return;
    }

    if (!mensagem.trim()) return;

    setLoading(true);

    try {
      const { error } = await supabase.from("mensagens_caronas").insert({
        carona_id: caronaId,
        remetente_id: user.id,
        destinatario_id: destinatarioId,
        mensagem: mensagem.trim(),
      });

      if (error) throw error;

      setMensagem("");
      fetchMensagens();
    } catch (error: any) {
      console.error("Erro ao enviar mensagem:", error);
      toast({
        variant: "destructive",
        title: "Erro ao enviar mensagem",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-card rounded-lg shadow-lg w-full max-w-md p-6 relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Fechar</span>
        </Button>

        <h2 className="text-lg font-semibold mb-4">
          Conversa com {destinatarioNome}
        </h2>

        <div className="overflow-y-auto h-64 mb-4">
          {mensagens.length > 0 ? (
            mensagens.map((msg) => (
              <div
                key={msg.id}
                className={`mb-2 p-2 rounded-md ${
                  msg.remetente_id === user?.id
                    ? "bg-primary/10 ml-auto w-fit"
                    : "bg-secondary/10 mr-auto w-fit"
                }`}
              >
                <p className="text-sm">
                  {msg.mensagem}
                </p>
                <p className="text-xs text-muted-foreground">
                  {msg.remetente?.full_name || "Usuário"} -{" "}
                  {new Date(msg.created_at).toLocaleTimeString()}
                </p>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground">Nenhuma mensagem ainda. Inicie a conversa!</p>
          )}
        </div>

        <div className="flex items-center">
          <Textarea
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="flex-grow mr-2"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button onClick={handleSendMessage} disabled={loading}>
            <Send className="h-4 w-4 mr-2" />
            Enviar
          </Button>
        </div>
      </div>
    </div>
  );
};
