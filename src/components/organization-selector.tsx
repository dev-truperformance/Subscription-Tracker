'use client';

import { useEffect, useState } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Building2, Users, User, Lock, Globe, Plus, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useOrganizations,
  useCreateOrganization,
} from '@/hooks/use-organizations';
import { toast } from 'sonner';

interface Organization {
  id: string;
  name: string;
  type: 'enterprise' | 'industry' | 'personal';
  isPublic: boolean;
  memberCount: number | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  createdBy: string;
  isActive: boolean | null;
}

export function OrganizationSelector() {
  const { user } = useUser();
  const { createOrganization: createClerkOrg } = useClerk();
  const router = useRouter();
  const { data: organizations = [], isLoading } = useOrganizations();
  const createOrganizationMutation = useCreateOrganization();

  const [isCreating, setIsCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: '' as 'enterprise' | 'industry' | 'personal' | '',
    isPublic: true,
  });

  // Redirect to dashboard if user has organizations
  useEffect(() => {
    if (!isLoading && organizations.length > 0) {
      router.push('/dashboard');
    }
  }, [organizations, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.type) return;

    try {
      setIsCreating(true);

      // First create organization in Clerk
      const clerkOrg = await createClerkOrg({
        name: formData.name,
      });

      // Then save additional metadata to database
      await createOrganizationMutation.mutateAsync({
        id: clerkOrg.id,
        clerkOrganizationId: clerkOrg.id,
        name: formData.name,
        slug: formData.name.toLowerCase().replace(/\s+/g, '-'),
        type: formData.type,
        isPublic: formData.isPublic,
      });

      toast.success('Organization created successfully!');

      // Redirect to dashboard after creation
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    } catch (error) {
      console.error('Failed to create organization:', error);
      toast.error('Failed to create organization');
    } finally {
      setIsCreating(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'enterprise':
        return <Building2 className="w-4 h-4" />;
      case 'industry':
        return <Users className="w-4 h-4" />;
      case 'personal':
        return <User className="w-4 h-4" />;
      default:
        return <Building2 className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading organizations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome to Tru Subscription Tracker
          </h1>
          <p className="text-muted-foreground">
            Create or join an organization to get started
          </p>
        </div>

        {!showCreateForm ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Get Started</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => setShowCreateForm(true)}
                className="w-full"
                size="lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create New Organization
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or
                  </span>
                </div>
              </div>

              <Button variant="outline" className="w-full" disabled>
                <Users className="w-4 h-4 mr-2" />
                Join Existing Organization (Coming Soon)
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Create Organization
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Organization Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Enter organization name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="type">Organization Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) =>
                      value &&
                      setFormData((prev) => ({
                        ...prev,
                        type: value as 'enterprise' | 'industry' | 'personal',
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="enterprise">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4" />
                          <div>
                            <div>Enterprise</div>
                            <div className="text-xs text-muted-foreground">
                              For large organizations
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="industry">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <div>
                            <div>Industry Level</div>
                            <div className="text-xs text-muted-foreground">
                              For industry professionals
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="personal">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <div>
                            <div>Personal Workspace</div>
                            <div className="text-xs text-muted-foreground">
                              For individual use
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="visibility">Visibility</Label>
                  <Select
                    value={formData.isPublic ? 'public' : 'private'}
                    onValueChange={(value) =>
                      value &&
                      setFormData((prev) => ({
                        ...prev,
                        isPublic: value === 'public',
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4" />
                          <div>
                            <div>Public</div>
                            <div className="text-xs text-muted-foreground">
                              Anyone can search and join
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="private">
                        <div className="flex items-center gap-2">
                          <Lock className="w-4 h-4" />
                          <div>
                            <div>Private</div>
                            <div className="text-xs text-muted-foreground">
                              Only same email domain can join
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={isCreating}
                    className="flex-1"
                  >
                    {isCreating ? 'Creating...' : 'Create Organization'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
