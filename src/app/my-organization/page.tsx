'use client';

import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UnderDevelopmentModal } from '@/components/under-development-modal';
import { useOrganizationMembers } from '@/hooks/use-organization-members';
import { useOrganizations } from '@/hooks/use-organizations';
import { useUser } from '@clerk/nextjs';
import {
  ArrowLeft,
  Building2,
  Calendar,
  Crown,
  Globe,
  Plus,
  Settings,
  Shield,
  Star,
  User,
  Users,
} from 'lucide-react';
import Link from 'next/link';

export default function MyOrganizationPage() {
  const { data: organizations, isLoading, error } = useOrganizations();
  const { user } = useUser();
  const org = organizations?.[0]; // Get first organization
  const { data: members, isLoading: isLoadingMembers } = useOrganizationMembers(
    org?.id || null
  );

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState('');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-muted rounded-lg w-1/3"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 h-96 bg-muted rounded-xl"></div>
              <div className="h-96 bg-muted rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
            <Building2 className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-2xl font-semibold text-foreground">
            Error Loading Organization
          </h2>
          <p className="text-muted-foreground max-w-md">
            Unable to load your organization data. Please try again later.
          </p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (!organizations || organizations.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-8 max-w-2xl mx-auto px-4">
          <div className="w-24 h-24 bg-primary rounded-2xl flex items-center justify-center mx-auto shadow-lg">
            <Building2 className="w-12 h-12 text-primary-foreground" />
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-primary">
              No Organization Yet
            </h1>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              You don't belong to any organization yet. Create your own or join
              an existing one to get started.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/organization">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                <Plus className="w-5 h-5 mr-2" />
                Create Organization
              </Button>
            </Link>
            <Link href="/organization">
              <Button size="lg" variant="outline" className="border-2">
                <Users className="w-5 h-5 mr-2" />
                Join Organization
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/dashboard">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
          <div className="text-center">
            <h1 className="text-4xl font-bold text-primary mb-4">
              My Organization
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Manage your organization settings and collaborate with your team
            </p>
          </div>
        </div>

        {organizations.map((org) => (
          <div key={org.id} className="space-y-6">
            {/* Organization Hero Card */}
            <Card className="border shadow-xl">
              <CardContent className="p-8">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
                      <Building2 className="w-10 h-10 text-primary-foreground" />
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <h2 className="text-3xl font-bold text-foreground">
                          {org.name}
                        </h2>
                        {org.role === 'org:admin' && (
                          <Badge className="bg-amber-500 text-white border-0 flex items-center gap-1">
                            <Crown className="w-3 h-3" />
                            Admin
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <Badge
                          variant={
                            org.type === 'business' ? 'default' : 'secondary'
                          }
                          className="px-3 py-1"
                        >
                          {org.type}
                        </Badge>
                        <Badge variant="outline" className="px-3 py-1">
                          {org.plan}
                        </Badge>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          {new Date(org.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm">
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats and Info Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Organization Info */}
              <Card className="border shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-primary" />
                    </div>
                    Organization Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Type</span>
                      </div>
                      <Badge variant="secondary">{org.type}</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Plan</span>
                      </div>
                      <Badge variant="outline">{org.plan}</Badge>
                    </div>
                    {org.maxSubscriptions && (
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            Max Subscriptions
                          </span>
                        </div>
                        <span className="text-sm font-semibold">
                          {org.maxSubscriptions}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Created</span>
                      </div>
                      <span className="text-sm">
                        {new Date(org.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Team Members */}
              <Card className="border shadow-lg">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <div className="w-8 h-8 bg-chart-2/10 rounded-lg flex items-center justify-center">
                        <Users className="w-4 h-4 text-chart-2" />
                      </div>
                      Team Members
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {isLoadingMembers ? (
                      <div className="space-y-2">
                        {[1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border animate-pulse"
                          >
                            <div className="w-10 h-10 bg-muted rounded-full"></div>
                            <div className="flex-1">
                              <div className="h-4 bg-muted rounded w-24 mb-2"></div>
                              <div className="h-3 bg-muted rounded w-32"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : members && members.length > 0 ? (
                      members.map((member) => {
                        const isCurrentUser =
                          user?.primaryEmailAddress?.emailAddress ===
                          member.email;
                        return (
                          <div
                            key={member.id}
                            className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border"
                          >
                            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-primary-foreground" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  {isCurrentUser
                                    ? 'You'
                                    : member.firstName && member.lastName
                                      ? `${member.firstName} ${member.lastName}`
                                      : member.email.split('@')[0]}
                                </span>
                                <Badge variant="secondary" className="text-xs">
                                  {member.role === 'org:admin' ||
                                  member.role === 'admin'
                                    ? 'Admin'
                                    : 'Member'}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {isCurrentUser
                                  ? member.role === 'org:admin' ||
                                    member.role === 'admin'
                                    ? 'Organization owner'
                                    : 'Organization member'
                                  : member.email}
                              </p>
                            </div>
                            {member.role === 'org:admin' ||
                              (member.role === 'admin' && (
                                <Crown className="w-4 h-4 text-amber-500" />
                              ))}
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-6 text-muted-foreground">
                        <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No team members found</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="border shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="w-8 h-8 bg-chart-3/10 rounded-lg flex items-center justify-center">
                      <Settings className="w-4 h-4 text-chart-3" />
                    </div>
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start h-12"
                    onClick={() => {
                      setSelectedFeature('Manage Members');
                      setIsModalOpen(true);
                    }}
                  >
                    <Users className="w-4 h-4 mr-3 text-chart-2" />
                    <span className="font-medium">Manage Members</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start h-12"
                    onClick={() => {
                      setSelectedFeature('Organization Settings');
                      setIsModalOpen(true);
                    }}
                  >
                    <Settings className="w-4 h-4 mr-3 text-chart-3" />
                    <span className="font-medium">Organization Settings</span>
                  </Button>
                  {org.role === 'org:admin' && (
                    <Button
                      variant="outline"
                      className="w-full justify-start h-12"
                      onClick={() => {
                        setSelectedFeature('Admin Panel');
                        setIsModalOpen(true);
                      }}
                    >
                      <Crown className="w-4 h-4 mr-3 text-amber-500" />
                      <span className="font-medium">Admin Panel</span>
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        ))}
      </div>

      {/* Under Development Modal */}
      <UnderDevelopmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        featureName={selectedFeature}
      />
    </div>
  );
}
