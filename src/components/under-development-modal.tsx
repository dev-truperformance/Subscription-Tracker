'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AlertCircle, Wrench } from 'lucide-react';

interface UnderDevelopmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName: string;
}

export function UnderDevelopmentModal({
  isOpen,
  onClose,
  featureName,
}: UnderDevelopmentModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-muted-foreground" />
            <DialogTitle>Feature Under Development</DialogTitle>
          </div>
        </DialogHeader>
        <div className="flex flex-col items-center py-6">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <Wrench className="w-8 h-8 text-muted-foreground" />
          </div>
          <div className="text-center text-base space-y-3">
            <p>
              <span className="font-semibold">{featureName}</span> is currently
              under development.
            </p>
            <p className="text-muted-foreground">
              We're working hard to bring this feature to you soon! Stay tuned
              for updates.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground pt-2">
              <AlertCircle className="w-4 h-4" />
              <span>This feature will be available in a future update</span>
            </div>
          </div>
        </div>
        <div className="flex justify-center pt-4">
          <Button onClick={onClose} className="w-full sm:w-auto">
            Got it, thanks!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
