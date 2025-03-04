
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "./Sidebar";
import LoadingScreen from "./LoadingScreen";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, isLoading, checkSession } = useAuth();
  const navigate = useNavigate();
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
    return <LoadingScreen />;
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

  return (
    <div className="flex min-h-screen bg-background w-full">
      <button
        className="fixed top-4 left-4 z-50 p-2 rounded-full bg-background border border-border md:hidden"
        onClick={toggleMenu}
      >
        {menuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

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
