
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

serve(async (req) => {
  // Log the webhook invocation
  console.log("Function invoked");
  
  try {
    // Create a Supabase client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Check current constraint by querying existing events
    const { data: existingEvents, error: queryError } = await supabaseAdmin
      .from('eventos')
      .select('tipo_evento')
      .limit(10);

    if (queryError) {
      console.error('Error querying eventos:', queryError);
      return new Response(JSON.stringify({ error: queryError.message }), {
        headers: { "Content-Type": "application/json" },
        status: 500,
      });
    }

    console.log('Existing event types:', existingEvents);

    // Valid event types array - MUST EXACTLY match what's in the frontend
    const validEventTypes = [
      "Festa",
      "Palestra",
      "Workshop",
      "Seminário",
      "Conferência",
      "Encontro",
      "Curso",
      "Outro"
    ];
    
    // Generate the SQL IN clause string with proper quoting
    const eventTypesForSql = validEventTypes.map(type => `'${type}'`).join(', ');
    
    // Update the constraint using parameterized SQL with the exact values
    const { error: alterError } = await supabaseAdmin.rpc('execute_sql', {
      query: `
        ALTER TABLE public.eventos 
        DROP CONSTRAINT IF EXISTS eventos_tipo_evento_check;
        
        ALTER TABLE public.eventos 
        ADD CONSTRAINT eventos_tipo_evento_check 
        CHECK (tipo_evento IN (${eventTypesForSql}));
      `
    });

    if (alterError) {
      console.error('Error updating constraint:', alterError);
      return new Response(JSON.stringify({ error: alterError.message }), {
        headers: { "Content-Type": "application/json" },
        status: 500,
      });
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Check constraint updated successfully",
        validEventTypes
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: "Internal Server Error" }),
      {
        headers: { "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
