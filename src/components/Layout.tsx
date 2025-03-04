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
  const [checkingSession, setCheckingSession] = useState(true);
  
  useEffect(() => {
    const verifySession = async () => {
      try {
        setCheckingSession(true);
        const session = await checkSession();
        
        if (!session) {
          console.log("No session found, redirecting to auth");
          navigate('/auth');
        }
      } catch (error) {
        console.error("Error verifying session:", error);
        navigate('/auth');
      } finally {
        setCheckingSession(false);
      }
    };
    
    verifySession();
  }, [checkSession, navigate]);
  
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMenuOpen(true);
      } else {
        setMenuOpen(false);
      }
    };
    
    handleResize();
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    let timeoutId: number;
    
    if (isLoading || checkingSession) {
      timeoutId = window.setTimeout(() => {
        setCheckingSession(false);
      }, 5000);
    }
    
    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [isLoading, checkingSession]);

  if (isLoading || checkingSession) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="animate-pulse text-xl mb-4">Carregando...</div>
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
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
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        variant: "destructive",
        title: "Erro ao fazer logout",
        description: "Tente novamente mais tarde",
      });
    }
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
      <button
        className="fixed top-4 left-4 z-50 p-2 rounded-full bg-background border border-border md:hidden"
        onClick={toggleMenu}
      >
        {menuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

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
