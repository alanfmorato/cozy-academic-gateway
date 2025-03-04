
// Define the event types exactly as they must be in the database
// IMPORTANT: This array MUST match the constraint in the database exactly
export const tiposEvento = [
  "Festa",
  "Palestra",
  "Workshop",
  "Seminário",
  "Conferência",
  "Encontro",
  "Curso",
  "Outro",
];

// Function to update event types constraint in the database
export const updateEventTypesConstraint = async (supabase: any) => {
  try {
    const { data, error } = await supabase.functions.invoke('fixEventTypes');
    
    if (error) {
      console.error('Error updating event types constraint:', error);
      return { success: false, error };
    }
    
    if (data?.success) {
      console.log('Event types constraint updated successfully:', data.validEventTypes);
      return { success: true, validEventTypes: data.validEventTypes };
    }
    
    return { success: false };
  } catch (error) {
    console.error('Error calling fixEventTypes function:', error);
    return { success: false, error };
  }
};
