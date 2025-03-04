
import React from "react";
import { motion } from "framer-motion";

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-[#0f172a] to-[#1e293b]">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 rounded-full bg-blue-600/20 blur-[100px]" />
        <div className="absolute top-1/3 -right-40 w-80 h-80 rounded-full bg-purple-600/20 blur-[100px]" />
        <div className="absolute -bottom-40 left-1/3 w-80 h-80 rounded-full bg-indigo-600/20 blur-[100px]" />
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-morphism w-full max-w-md rounded-2xl overflow-hidden z-10"
      >
        {children}
      </motion.div>
    </div>
  );
};

export default AuthLayout;
