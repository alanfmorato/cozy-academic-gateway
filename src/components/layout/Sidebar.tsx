
import React from "react";
import { useLocation } from "react-router-dom";
import {
  Home,
  BookOpen,
  Home as HomeIcon,
  ShoppingCart,
  Calendar,
  FileText,
  Briefcase,
  LogOut,
  X,
  Car
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { signOut } from "@/lib/auth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import NavLink from "./NavLink";
import ThemeToggle from "../ThemeToggle";

interface SidebarProps {
  menuOpen: boolean;
  setMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  closeMenu: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ menuOpen, setMenuOpen, closeMenu }) => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

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
    { path: "/caronas", label: "Caronas", icon: <Car size={20} /> },
  ];

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 w-[85vw] max-w-64 bg-card border-r border-border transition-transform duration-300 ease-in-out transform glass-morphism md:translate-x-0",
        menuOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="flex flex-col h-full">
        <div className="p-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight">NewsUniversity</h2>
            <p className="text-muted-foreground text-xs mt-1">
              Sua plataforma acadêmica
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden" 
            onClick={closeMenu}
          >
            <X size={18} />
          </Button>
        </div>

        <nav className="flex-1 px-2 py-2 space-y-1 overflow-y-auto scrollbar-thin">
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
          <div className="flex justify-center mb-3">
            <ThemeToggle />
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              {user.user_metadata.full_name?.[0] || user.email?.[0] || "U"}
            </div>
            <div className="overflow-hidden">
              <p className="font-medium truncate text-sm">
                {user.user_metadata.full_name || user.email}
              </p>
              <p className="text-xs text-muted-foreground truncate">
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
  );
};

export default Sidebar;
