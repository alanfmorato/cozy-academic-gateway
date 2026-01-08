
import React, { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "./Sidebar";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  
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

  const toggleMenu = () => setMenuOpen(prev => !prev);
  
  const closeMenu = () => {
    if (window.innerWidth < 768) {
      setMenuOpen(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background w-full">
      <div className="fixed top-4 left-4 z-50 flex items-center gap-2">
        <button
          className="p-2 rounded-full bg-background border border-border md:hidden"
          onClick={toggleMenu}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <Sidebar 
        menuOpen={menuOpen} 
        setMenuOpen={setMenuOpen}
        closeMenu={closeMenu}
      />

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
