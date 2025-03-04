
import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Home,
  BookOpen,
  Home as HomeIcon,
  ShoppingCart,
  Calendar,
  FileText,
  Briefcase,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { signOut } from "@/lib/auth";
import { useState, useEffect } from "react";

interface NavLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick?: () => void;
}

const NavLink: React.FC<NavLinkProps> = ({ to, icon, label, active, onClick }) => {
  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
        active
          ? "bg-primary/20 text-primary"
          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
      )}
      onClick={onClick}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
};

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, isLoading, checkSession } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);
  
  // Verificar a sessão ao montar o componente ou ao mudar de página
  useEffect(() => {
    const verifySession = async () => {
      await checkSession();
      setSessionChecked(true);
    };
    
    verifySession();
  }, [checkSession, location.pathname]);
  
  // Ensure menu is properly initialized in new tabs
  useEffect(() => {
    // We need to handle the initial state properly for new tabs
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMenuOpen(true);
      } else {
        setMenuOpen(false);
      }
    };
    
    // Set initial state
    handleResize();
    
    // Add event listener for window resize
    window.addEventListener('resize', handleResize);
    
    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Mostrar um estado de carregamento enquanto verificamos a autenticação
  if (isLoading || !sessionChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-xl">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return <>{children}</>;
  }

  const toggleMenu = () => setMenuOpen(prev => !prev);
  
  const closeMenu = () => {
    if (window.innerWidth < 768) {
      setMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  const routes = [
    { path: "/", label: "Início", icon: <Home size={20} /> },
    { path: "/cursos", label: "Cursos", icon: <BookOpen size={20} /> },
    { path: "/moradias", label: "Moradias", icon: <HomeIcon size={20} /> },
    { path: "/marketplace", label: "Compra/Venda", icon: <ShoppingCart size={20} /> },
    { path: "/eventos", label: "Eventos", icon: <Calendar size={20} /> },
    { path: "/materiais", label: "Materiais", icon: <FileText size={20} /> },
    { path: "/estagios", label: "Estágios", icon: <Briefcase size={20} /> },
  ];

  return (
    <div className="flex min-h-screen bg-background w-full">
      {/* Mobile menu button */}
      <button
        className="fixed top-4 left-4 z-50 p-2 rounded-full bg-background border border-border md:hidden"
        onClick={toggleMenu}
      >
        {menuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border transition-transform duration-300 ease-in-out transform glass-morphism md:translate-x-0",
          menuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-6">
            <h2 className="text-2xl font-bold tracking-tight">NewsUniversity</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Sua plataforma acadêmica
            </p>
          </div>

          <nav className="flex-1 px-2 py-4 space-y-1">
            {routes.map((route) => (
              <NavLink
                key={route.path}
                to={route.path}
                icon={route.icon}
                label={route.label}
                active={location.pathname === route.path}
                onClick={closeMenu}
              />
            ))}
          </nav>

          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                {user.user_metadata.full_name?.[0] || user.email?.[0] || "U"}
              </div>
              <div>
                <p className="font-medium truncate">
                  {user.user_metadata.full_name || user.email}
                </p>
                <p className="text-sm text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
            </div>
            <Button
              variant="destructive"
              className="w-full"
              onClick={handleLogout}
              size="sm"
            >
              <LogOut size={16} className="mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main
        className={cn(
          "flex-1 transition-all duration-300 ml-0 md:ml-64 p-6",
          menuOpen && "brightness-50 md:brightness-100"
        )}
        onClick={() => menuOpen && setMenuOpen(false)}
      >
        <div className="max-w-7xl mx-auto animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
