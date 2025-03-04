
import React, { useState } from "react";
import { AnimatePresence } from "framer-motion";
import AuthLayout from "@/components/AuthLayout";
import LoginForm from "@/components/LoginForm";
import RegisterForm from "@/components/RegisterForm";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <AuthLayout>
      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          {isLogin ? (
            <LoginForm 
              key="login" 
              onSwitchToRegister={() => setIsLogin(false)} 
            />
          ) : (
            <RegisterForm 
              key="register" 
              onSwitchToLogin={() => setIsLogin(true)} 
            />
          )}
        </AnimatePresence>
      </div>
    </AuthLayout>
  );
};

export default Auth;
