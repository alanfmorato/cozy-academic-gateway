
import React from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEventForm } from "./hooks/useEventForm";
import EventFormFields from "./components/EventFormFields";
import { tiposEvento } from "./utils/eventTypes";

interface EventFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | undefined;
  userUniversity: string | undefined;
  onEventCreated: () => void;
}

// Re-export tiposEvento for backward compatibility
export { tiposEvento };

const EventForm: React.FC<EventFormProps> = ({
  open,
  onOpenChange,
  userId,
  userUniversity,
  onEventCreated,
}) => {
  const {
    formData,
    formLoading,
    universidadeLoading,
    tiposEventoDb,
    handleInputChange,
    handleSelectChange,
    handleSubmit
  } = useEventForm(
    supabase,
    userId,
    userUniversity,
    onOpenChange,
    onEventCreated,
    open
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] w-[calc(100%-2rem)] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Publicar Novo Evento</DialogTitle>
            <DialogDescription>
              Compartilhe detalhes sobre o evento que você deseja divulgar.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <EventFormFields
              formData={formData}
              tiposEventoDb={tiposEventoDb}
              handleInputChange={handleInputChange}
              handleSelectChange={handleSelectChange}
            />
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="sm:w-auto w-full"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={formLoading || universidadeLoading}
              className="sm:w-auto w-full"
            >
              {formLoading ? "Publicando..." : "Publicar Evento"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EventForm;
