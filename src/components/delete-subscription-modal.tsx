'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AlertTriangle } from 'lucide-react';
import { Subscription } from '@/hooks/use-subscriptions';

interface DeleteSubscriptionModalProps {
  subscription: Subscription | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
  isLoading?: boolean;
}

export function DeleteSubscriptionModal({
  subscription,
  isOpen,
  onClose,
  onDelete,
  isLoading = false,
}: DeleteSubscriptionModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-destructive/10 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <DialogTitle>Delete Subscription</DialogTitle>
          </div>
          <DialogDescription>
            Are you sure you want to delete "{subscription?.name}"? This action
            cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-medium mb-2">Subscription Details:</h4>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>
                <strong>Name:</strong> {subscription?.name}
              </p>
              <p>
                <strong>Email:</strong> {subscription?.email}
              </p>
              <p>
                <strong>Payment:</strong> {subscription?.payment}
              </p>
              <p>
                <strong>Frequency:</strong> {subscription?.frequency}
              </p>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onDelete}
            disabled={isLoading}
          >
            {isLoading ? 'Deleting...' : 'Delete Subscription'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
