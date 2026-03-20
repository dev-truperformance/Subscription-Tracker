'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { AuthLoader } from './auth-loader';

interface AuthLoaderContextType {
  showLoader: (message?: string) => void;
  hideLoader: () => void;
  isLoading: boolean;
}

const AuthLoaderContext = createContext<AuthLoaderContextType | undefined>(
  undefined
);

export function AuthLoaderProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('Setting up your account...');

  const showLoader = (msg?: string) => {
    setMessage(msg || 'Setting up your account...');
    setIsLoading(true);
  };

  const hideLoader = () => {
    setIsLoading(false);
  };

  return (
    <AuthLoaderContext.Provider value={{ showLoader, hideLoader, isLoading }}>
      {children}
      <AuthLoader isLoading={isLoading} message={message} />
    </AuthLoaderContext.Provider>
  );
}

export function useAuthLoader() {
  const context = useContext(AuthLoaderContext);
  if (context === undefined) {
    throw new Error('useAuthLoader must be used within an AuthLoaderProvider');
  }
  return context;
}
