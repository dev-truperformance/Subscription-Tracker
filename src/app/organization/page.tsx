'use client';

import { CreateOrganizationModal } from '@/components/CreateOrganizationModal';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { UserButton, useUser } from '@clerk/nextjs';
import {
  ArrowRight,
  Building2,
  Crown,
  Plus,
  Search,
  Sparkles,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function OrganizationPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const { isSignedIn, user } = useUser();

  // Sync user to database when they land on organization page
  useEffect(() => {
    if (isSignedIn && user) {
      syncUserToDatabase();
    }
  }, [isSignedIn, user]);

  const syncUserToDatabase = async () => {
    try {
      const response = await fetch('/api/user/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('Failed to sync user on organization page');
      }
    } catch (error) {
      console.error('Error syncing user on organization page:', error);
    }
  };

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/organizations/search?q=${encodeURIComponent(query)}`
      );
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.organizations || []);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error searching organizations:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinOrganization = async (orgId: string, orgName: string) => {
    try {
      const response = await fetch('/api/organizations/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ organizationId: orgId }),
      });

      if (response.ok) {
        const data = await response.json();

        if (data.isOwner) {
          toast.success(`Welcome back! You are the owner of "${orgName}".`);
        } else {
          toast.success(`Successfully joined "${orgName}"!`);
        }

        setSearchResults([]);
        setSearchQuery('');
        // Redirect to dashboard after joining/accessing
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1500);
      } else {
        const error = await response.json();

        if (
          response.status === 400 &&
          error.error === 'Already a member of this organization'
        ) {
          toast.info(
            `You are already a member of "${orgName}". Redirecting to dashboard...`
          );
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 1500);
        } else {
          toast.error(error.error || 'Failed to join organization');
        }
      }
    } catch (error) {
      console.error('Error joining organization:', error);
      toast.error('Network error. Please try again.');
    }
  };

  const handleCreateOrganization = () => {
    setIsModalOpen(true);
  };

  const handleCreateSubmit = async (
    name: string,
    type: string,
    isPublic?: boolean
  ) => {
    try {
      setIsLoading(true);

      const response = await fetch('/api/organizations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          type,
          visibility: isPublic ? 'public' : 'private',
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setIsModalOpen(false);
        toast.success(`Organization "${name}" created successfully!`);

        // Refresh organizations list and redirect to dashboard
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1000);
      } else {
        const error = await response.json();
        console.error('Failed to create organization:', error);
        toast.error(error.error || 'Failed to create organization');
        setIsModalOpen(false); // Close modal on error too
      }
    } catch (error) {
      console.error('Error creating organization:', error);
      toast.error('Network error. Please try again.');
      setIsModalOpen(false); // Close modal on error too
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-auto h-10 relative flex items-center justify-center">
              <img
                src="/tru-light.webp"
                alt="Logo"
                className="block dark:hidden object-contain h-8"
              />
              <img
                src="/tru-dark.webp"
                alt="Logo dark"
                className="hidden dark:block object-contain h-8"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/dashboard">
              <Button size="sm" variant="ghost">
                Dashboard
              </Button>
            </Link>
            <UserButton />
          </div>
        </nav>
      </header>

      <div className="max-w-4xl mx-auto py-12 px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-between items-center mb-6">
            <div></div>
            <Link href="/dashboard">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              >
                Skip for now
              </Button>
            </Link>
          </div>
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary/10 rounded-full">
              <Users className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">
            Join or create a new organization
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Collaborate with your team and manage subscriptions together in a
            shared workspace
          </p>
        </div>

        {/* Search Section */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search organizations by name or ID..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value.length > 2) {
                    handleSearch(e.target.value);
                  }
                }}
                className="pl-10 pr-10"
              />
              {isLoading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Search Results */}
        {searchQuery.length > 2 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Search Results</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
                  <p>Searching organizations...</p>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-3">
                  {searchResults.map((org) => (
                    <div
                      key={org.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{org.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            ID: {org.id}
                          </p>
                          {org.type && (
                            <p className="text-xs text-muted-foreground capitalize">
                              {org.type}
                            </p>
                          )}
                          {org.isPublic && (
                            <p className="text-xs text-green-600">
                              🌍 Public Organization
                            </p>
                          )}
                          {org.allowedDomains && (
                            <p className="text-xs text-blue-600">
                              🔒 Restricted Domains: {org.allowedDomains}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        onClick={() => handleJoinOrganization(org.id, org.name)}
                        disabled={isLoading}
                        className="flex items-center gap-2"
                      >
                        <ArrowRight className="h-4 w-4" />
                        Join
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No organizations found matching "{searchQuery}"</p>
                  <p className="text-sm mt-2">
                    Try a different search term or create a new organization
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Create Organization Section */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Create New Organization</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Start a new workspace for your team
                </p>
              </div>
              <Button onClick={handleCreateOrganization} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Organization
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center mb-3">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                      <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <h3 className="font-semibold mb-2">Team Workspace</h3>
                  <p className="text-sm text-muted-foreground">
                    Collaborate with your team members
                  </p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center mb-3">
                    <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                      <Plus className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <h3 className="font-semibold mb-2">Personal Organization</h3>
                  <p className="text-sm text-muted-foreground">
                    For individual use and small projects
                  </p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50 border-primary/20">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center mb-3">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                      <Crown className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <h3 className="font-semibold">Enterprise</h3>
                    <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Advanced features for large teams
                  </p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Continue to Dashboard */}
        <div className="mt-12 text-center border-t pt-8">
          <p className="text-muted-foreground mb-4">
            Want to set up organization later?
          </p>
          <Link href="/dashboard">
            <Button variant="ghost" className="gap-2">
              Continue to Dashboard
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Create Organization Modal */}
      <CreateOrganizationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateSubmit}
      />
    </div>
  );
}
