'use client';

import { OrganizationDetailModal } from '@/components/OrganizationDetailModal';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Organization } from '@/types/organization';
import {
  Building2,
  Calendar,
  Crown,
  MoreHorizontal,
  Plus,
  Trash2,
  User,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

interface OrganizationsListProps {
  organizations: Organization[];
  loadingOrgs: boolean;
  onOrganizationDeleted?: () => Promise<void>;
}

export function OrganizationsList({
  organizations,
  loadingOrgs,
  onOrganizationDeleted,
}: OrganizationsListProps) {
  const router = useRouter();
  const [deletingOrg, setDeletingOrg] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orgToDelete, setOrgToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);

  const handleDeleteOrganization = async (orgId: string, orgName: string) => {
    setOrgToDelete({ id: orgId, name: orgName });
    setDeleteDialogOpen(true);
  };

  const confirmDeleteOrganization = async () => {
    if (!orgToDelete) return;

    setDeletingOrg(orgToDelete.id);
    try {
      const response = await fetch(`/api/organizations/${orgToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete organization');
      }

      toast.success('Organization deleted successfully');
      // Refresh the organizations list
      if (onOrganizationDeleted) {
        await onOrganizationDeleted();
      }
    } catch (error) {
      console.error('Error deleting organization:', error);
      toast.error('Failed to delete organization');
    } finally {
      setDeletingOrg(null);
      setDeleteDialogOpen(false);
      setOrgToDelete(null);
    }
  };

  if (loadingOrgs) {
    return (
      <div className="rounded-xl border bg-card p-6">
        <h4 className="text-base font-semibold text-foreground mb-5 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-primary" />
          Your Organizations
          <span className="ml-auto text-sm text-muted-foreground font-normal">
            Loading...
          </span>
        </h4>
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-24 rounded-lg bg-muted/50 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (organizations.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-6">
        <h4 className="text-base font-semibold text-foreground mb-5 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-primary" />
          Your Organizations
          <span className="ml-auto text-sm text-muted-foreground font-normal">
            0 organizations
          </span>
        </h4>
        <div className="text-center py-10 text-muted-foreground">
          <Building2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-base">No organizations yet</p>
          <a
            href="/organization"
            className="text-sm text-primary hover:underline mt-2 inline-block"
          >
            Create or join an organization
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl border bg-card p-6">
        <h4 className="text-base font-semibold text-foreground mb-5 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-primary" />
          Your Organizations
          <span className="ml-auto text-sm text-muted-foreground font-normal">
            {organizations.length} organization
            {organizations.length !== 1 ? 's' : ''}
          </span>
        </h4>
        <div className="space-y-3">
          {organizations.map((org) => (
            <div
              key={org.id}
              className="border rounded-lg p-4 hover:bg-muted/50 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h5 className="font-medium text-foreground">{org.name}</h5>
                    {org.role === 'org:admin' && (
                      <span className="px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 flex items-center gap-1">
                        <Crown className="w-3 h-3" />
                        Admin
                      </span>
                    )}
                    {org.role === 'member' && (
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 flex items-center gap-1">
                        <User className="w-3 h-3" />
                        Member
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                    <span className="capitalize">{org.type}</span>
                    <span>•</span>
                    <span className="capitalize">{org.plan}</span>
                    <span>•</span>
                    <span>{org.maxSubscriptions} subscriptions max</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    Created{' '}
                    {new Date(org.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <button className="px-3 py-1.5 text-sm border rounded-lg hover:bg-muted transition-all flex items-center gap-2">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        className=" dark:text-white"
                        onClick={() => setSelectedOrgId(org.id)}
                      >
                        <Building2 className="w-4 h-4 mr-2" />
                        View Organization
                      </DropdownMenuItem>
                      {org.role === 'org:admin' && (
                        <DropdownMenuItem
                          onClick={() =>
                            handleDeleteOrganization(org.id, org.name)
                          }
                          className="text-red-600 dark:text-red-400"
                          disabled={deletingOrg === org.id}
                        >
                          <Trash2 className="w-4 h-4 mr-2 dark:text-white" />
                          {deletingOrg === org.id
                            ? 'Deleting...'
                            : 'Delete Organization'}
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 text-center">
        <Button
          onClick={() => router.push('/organization')}
          className="gap-2"
          variant="outline"
        >
          <Plus className="w-4 h-4" />
          Join or Create New Organization
        </Button>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Organization</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{orgToDelete?.name}&quot;?
              This action cannot be undone and will permanently remove all data
              associated with this organization.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteOrganization}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Organization
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <OrganizationDetailModal
        open={!!selectedOrgId}
        onOpenChange={(open) => !open && setSelectedOrgId(null)}
        orgId={selectedOrgId}
      />
    </>
  );
}
