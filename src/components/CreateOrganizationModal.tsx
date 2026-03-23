'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Building2, Crown, Globe, Lightbulb, Lock } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface CreateOrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, type: string, isPublic?: boolean) => void;
}

export function CreateOrganizationModal({
  isOpen,
  onClose,
  onCreate,
}: CreateOrganizationModalProps) {
  const [organizationName, setOrganizationName] = useState('');
  const [selectedType, setSelectedType] = useState('personal');
  const [isPublic, setIsPublic] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const organizationTypes = [
    {
      id: 'personal',
      name: 'Personal Organization',
      description: 'For individual use and small projects',
      icon: Building2,
      color:
        'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    },
    {
      id: 'team',
      name: 'Team Workspace',
      description: 'Collaborate with your team members',
      icon: Building2,
      color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'Advanced features for large teams',
      icon: Crown,
      color:
        'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    },
  ];

  const handleSubmit = async () => {
    if (!organizationName.trim()) {
      toast.error('Please enter an organization name');
      return;
    }

    setIsCreating(true);

    try {
      // Call parent callback - let parent handle API call and success/error
      await onCreate(organizationName.trim(), selectedType, isPublic);
      setOrganizationName('');
      setIsPublic(false);
      // Don't close here - let parent decide when to close
    } catch (error) {
      console.error('Error creating organization:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader className="pb-6">
          <DialogTitle className="text-xl font-semibold">
            Create New Organization
          </DialogTitle>
          <DialogDescription className="text-base">
            Choose a name and type for your new organization workspace
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Organization Name Input */}
          <div className="space-y-4">
            <label
              htmlFor="org-name"
              className="text-sm font-medium text-foreground"
            >
              Organization Name
            </label>
            <Input
              id="org-name"
              placeholder="Enter organization name..."
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
              className="w-full h-11 text-base mt-2"
            />
          </div>

          {/* Organization Type Selection */}
          <div className="space-y-4">
            <label className="text-sm font-medium text-foreground">
              Organization Type
            </label>
            <div className="grid gap-3 mt-2">
              {organizationTypes.map((type) => (
                <div
                  key={type.id}
                  className={`
                    relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
                    ${
                      selectedType === type.id
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-border hover:border-primary/30 hover:bg-muted/50'
                    }
                  `}
                  onClick={() => setSelectedType(type.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${type.color}`}>
                      <type.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm mb-1">
                        {type.name}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {type.description}
                      </p>
                    </div>
                    {selectedType === type.id && (
                      <div className="absolute top-3 right-3">
                        <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Public/Private Selection */}
          <div className="space-y-4">
            <label className="text-sm font-medium text-foreground">
              Organization Visibility
            </label>
            <div className="flex gap-8 mt-4">
              {/* Public Option */}
              <div className="flex items-center gap-3 flex-1">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="visibility"
                    checked={isPublic}
                    onChange={() => setIsPublic(true)}
                    className="w-4 h-4 text-primary focus:ring-primary"
                  />
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Public</span>
                  </div>
                </label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Lightbulb className="h-4 w-4 text-muted-foreground cursor-help opacity-60 hover:opacity-100 transition-opacity" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Open organization for anyone to discover and join</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {/* Private Option */}
              <div className="flex items-center gap-3 flex-1">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="visibility"
                    checked={!isPublic}
                    onChange={() => setIsPublic(false)}
                    className="w-4 h-4 text-primary focus:ring-primary"
                  />
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Private</span>
                  </div>
                </label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Lightbulb className="h-4 w-4 text-muted-foreground cursor-help opacity-60 hover:opacity-100 transition-opacity" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>
                        Restricted organization requiring email domain to match
                        with other users
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6 border-t">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 h-11 text-base"
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 h-11 text-base"
              disabled={!organizationName.trim() || isCreating}
            >
              {isCreating ? 'Creating...' : 'Create Organization'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
