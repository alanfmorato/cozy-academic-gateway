
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, ArrowLeft } from "lucide-react";
import { MensagemCarona } from "@/types/carona";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ChatFormProps {
  caronaId: string;
  destinatarioId: string;
  destinatarioNome: string;
  onClose: () => void;
}

export const ChatForm: React.FC<ChatFormProps> = ({
  caronaId,
  destinatarioId,
  destinatarioNome,
  onClose,
}) => {
  const { user } = useAuth();
  const [mensagem, setMensagem] = useState("");
  const [mensagens, setMensagens] = useState<MensagemCarona[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMensagens, setLoadingMensagens] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMensagens();
    const channel = setupRealtimeSubscription();

    return () => {
      channel.unsubscribe();
    };
  }, [caronaId, user?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [mensagens]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel(`chat:${caronaId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "mensagens_caronas",
          filter: `carona_id=eq.${caronaId}`,
        },
        (payload) => {
          const novaMensagem = payload.new as MensagemCarona;
          
          // Só atualiza se a mensagem é relevante para este chat (entre os mesmos usuários)
          if (
            (novaMensagem.remetente_id === user?.id && novaMensagem.destinatario_id === destinatarioId) ||
            (novaMensagem.remetente_id === destinatarioId && novaMensagem.destinatario_id === user?.id)
          ) {
            fetchMensagens();
          }
        }
      )
      .subscribe();

    return channel;
  };

  const fetchMensagens = async () => {
    if (!user) return;
    
    setLoadingMensagens(true);
    
    try {
      const { data, error } = await supabase
        .from("mensagens_caronas")
        .select(`
          id,
          carona_id,
          remetente_id,
          destinatario_id,
          mensagem,
          lida,
          created_at,
          remetente:profiles(full_name)
        `)
        .eq("carona_id", caronaId)
        .or(`remetente_id.eq.${user.id},destinatario_id.eq.${user.id}`)
        .or(`remetente_id.eq.${destinatarioId},destinatario_id.eq.${destinatarioId}`)
        .order("created_at", { ascending: true });

      if (error) throw error;
      
      // Transform the data to match MensagemCarona type
      const typedMessages = data?.map(msg => {
        // Handle possible error from the query by ensuring remetente has full_name
        const remetente = typeof msg.remetente === 'object' && msg.remetente !== null 
          ? { full_name: msg.remetente.full_name || 'Usuário' }
          : { full_name: 'Usuário' };
          
        return {
          ...msg,
          remetente
        } as MensagemCarona;
      }) || [];
      
      setMensagens(typedMessages);
      
      // Marcar mensagens recebidas como lidas
      const mensagensRecebidas = data?.filter(
        m => m.destinatario_id === user.id && !m.lida
      ) || [];
      
      if (mensagensRecebidas.length > 0) {
        await Promise.all(
          mensagensRecebidas.map(m => 
            supabase
              .from("mensagens_caronas")
              .update({ lida: true })
              .eq("id", m.id)
          )
        );
      }
    } catch (error: any) {
      console.error("Erro ao carregar mensagens:", error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar mensagens",
        description: error.message,
      });
    } finally {
      setLoadingMensagens(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mensagem.trim() || !user) return;

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

  if (!user) return null;

  return (
    <div className="bg-card border rounded-lg overflow-hidden flex flex-col h-80">
      <div className="p-3 border-b flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h4 className="font-medium">Chat com {destinatarioNome}</h4>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {loadingMensagens ? (
          <div className="text-center text-sm text-muted-foreground">
            Carregando mensagens...
          </div>
        ) : mensagens.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground">
            Nenhuma mensagem ainda. Inicie a conversa!
          </div>
        ) : (
          mensagens.map((msg) => {
            const isOwn = msg.remetente_id === user.id;
            const time = format(parseISO(msg.created_at), "HH:mm", { locale: ptBR });
            
            return (
              <div
                key={msg.id}
                className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`rounded-lg px-3 py-2 max-w-[70%] ${
                    isOwn
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm">{msg.mensagem}</p>
                  <p className="text-xs text-right mt-1 opacity-70">
                    {isOwn ? "Você" : msg.remetente?.full_name}, {time}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="p-3 border-t flex gap-2">
        <Input
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          placeholder="Digite sua mensagem..."
          disabled={loading}
        />
        <Button type="submit" size="icon" disabled={loading || !mensagem.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};
