'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useApiQuery } from '@/lib/react-query';
import { Building2, Crown, Users } from 'lucide-react';
import { useState } from 'react';

interface OrganizationMember {
  id: string;
  name?: string;
  email?: string;
  role: 'org:admin' | 'member';
  joinedAt: string;
}

interface Organization {
  id: string;
  name: string;
  slug: string;
  type: string;
  plan: string;
  maxSubscriptions: number;
  createdAt: string;
  role: 'org:admin' | 'member';
}

interface OrganizationDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orgId: string | null;
}

export function OrganizationDetailModal({
  open,
  onOpenChange,
  orgId,
}: OrganizationDetailModalProps) {
  const [selectedMember, setSelectedMember] =
    useState<OrganizationMember | null>(null);

  const { data: organizationData, isLoading: orgLoading } = useApiQuery<{
    success: boolean;
    organization: Organization;
  }>(['organization', orgId!], orgId ? `/api/organizations/${orgId}` : '', {
    enabled: !!orgId,
  });

  const { data: membersData, isLoading: membersLoading } = useApiQuery<{
    members: OrganizationMember[];
    total: number;
  }>(
    ['organization-members', orgId!],
    orgId ? `/api/organizations/${orgId}/members` : '',
    { enabled: !!orgId }
  );

  const organization = organizationData?.organization;
  const members = membersData?.members || [];
  const loading = (orgLoading || membersLoading) && orgId !== null;

  const handleClose = () => {
    onOpenChange(false);
    setSelectedMember(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Organization Details</DialogTitle>
        </DialogHeader>

        {!orgId ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No organization selected</p>
          </div>
        ) : loading ? (
          <div className="py-8">
            <p className="text-muted-foreground text-center">Loading...</p>
          </div>
        ) : !organization ? (
          <div className="text-center py-8">
            <h2 className="text-xl font-semibold mb-4">
              Organization not found
            </h2>
            <p className="text-muted-foreground">
              The organization you're looking for doesn't exist or you don't
              have access to it.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Organization Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  {organization.name}
                  <Badge
                    variant={
                      organization.role === 'org:admin'
                        ? 'default'
                        : 'secondary'
                    }
                  >
                    {organization.role === 'org:admin' ? 'Admin' : 'Member'}
                  </Badge>
                </CardTitle>
              </CardHeader>

              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Plan</p>
                  <p className="font-medium capitalize">{organization.plan}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">
                    Max Subscriptions
                  </p>
                  <p className="font-medium">{organization.maxSubscriptions}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="font-medium capitalize">{organization.type}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="font-medium">
                    {new Date(organization.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Members */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Members ({members.length})
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">
                {members.length > 0 ? (
                  members.map((member: OrganizationMember) => (
                    <div
                      key={member.id}
                      onClick={() => setSelectedMember(member)}
                      className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium">
                            {member.name?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">
                            {member.name || 'Unknown User'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {member.email}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          member.role === 'org:admin' ? 'default' : 'secondary'
                        }
                      >
                        {member.role === 'org:admin' ? (
                          <div className="flex items-center gap-1">
                            <Crown className="w-3 h-3" />
                            Admin
                          </div>
                        ) : (
                          'Member'
                        )}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p>No members found</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Member Details Modal */}
            <Dialog
              open={!!selectedMember}
              onOpenChange={() => setSelectedMember(null)}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Member Details</DialogTitle>
                </DialogHeader>

                {selectedMember && (
                  <div className="space-y-4">
                    <div>
                      <p className="font-semibold text-lg">
                        {selectedMember.name || 'Unknown User'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {selectedMember.email}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Role</p>
                        <p className="font-medium">
                          {selectedMember.role === 'org:admin'
                            ? 'Administrator'
                            : 'Member'}
                        </p>
                      </div>

                      <div>
                        <p className="text-muted-foreground">Joined</p>
                        <p className="font-medium">
                          {new Date(
                            selectedMember.joinedAt
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
