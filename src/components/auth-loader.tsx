'use client';

import { Loader2 } from 'lucide-react';

interface AuthLoaderProps {
  isLoading: boolean;
  message?: string;
}

export function AuthLoader({
  isLoading,
  message = 'Setting up your account...',
}: AuthLoaderProps) {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center space-y-4 rounded-lg bg-card p-8 shadow-lg">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
