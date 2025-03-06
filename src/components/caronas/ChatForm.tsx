
import React, { useState, useEffect, useRef } from "react";
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetchMensagens();
      const interval = setInterval(fetchMensagens, 5000);
      return () => clearInterval(interval);
    }
  }, [user?.id, caronaId, destinatarioId]);

  useEffect(() => {
    scrollToBottom();
  }, [mensagens]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-card rounded-xl shadow-lg w-full max-w-md h-[80vh] sm:h-[500px] flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold truncate">
            Conversa com {destinatarioNome}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full hover:bg-muted"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Fechar</span>
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {mensagens.length > 0 ? (
            mensagens.map((msg) => (
              <div
                key={msg.id}
                className={`p-3 rounded-lg max-w-[80%] break-words ${
                  msg.remetente_id === user?.id
                    ? "bg-primary/10 ml-auto"
                    : "bg-secondary/10 mr-auto"
                }`}
              >
                <p className="text-sm">
                  {msg.mensagem}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {msg.remetente?.full_name || "Usuário"} • {" "}
                  {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </p>
              </div>
            ))
          ) : (
            <div className="text-center h-full flex items-center justify-center">
              <p className="text-muted-foreground">Nenhuma mensagem ainda. Inicie a conversa!</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Textarea
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              placeholder="Digite sua mensagem..."
              className="resize-none min-h-[60px] max-h-[120px]"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <Button 
              onClick={handleSendMessage} 
              disabled={loading || !mensagem.trim()}
              size="icon"
              className="h-[60px] w-[60px] rounded-full flex-shrink-0"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
