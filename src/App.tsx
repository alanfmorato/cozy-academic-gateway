
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import Layout from "./components/Layout";
import Cursos from "./pages/Cursos";
import CursoNovo from "./pages/CursoNovo";
import CursoDetalhe from "./pages/CursoDetalhe";
import CursoAssistir from "./pages/CursoAssistir";
import Moradias from "./pages/Moradias";
import Marketplace from "./pages/Marketplace";
import Eventos from "./pages/Eventos";
import Materiais from "./pages/Materiais";
import Estagios from "./pages/Estagios";
import Caronas from "./pages/Caronas";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={<Layout><Index /></Layout>} />
              <Route path="/cursos" element={<Layout><Cursos /></Layout>} />
              <Route path="/cursos/novo" element={<Layout><CursoNovo /></Layout>} />
              <Route path="/cursos/:id" element={<Layout><CursoDetalhe /></Layout>} />
              <Route path="/cursos/:id/assistir" element={<Layout><CursoAssistir /></Layout>} />
              <Route path="/moradias" element={<Layout><Moradias /></Layout>} />
              <Route path="/marketplace" element={<Layout><Marketplace /></Layout>} />
              <Route path="/eventos" element={<Layout><Eventos /></Layout>} />
              <Route path="/materiais" element={<Layout><Materiais /></Layout>} />
              <Route path="/estagios" element={<Layout><Estagios /></Layout>} />
              <Route path="/caronas" element={<Layout><Caronas /></Layout>} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
