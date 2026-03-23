export interface Organization {
  id: string;
  name: string;
  slug: string;
  type: string;
  plan: string;
  maxSubscriptions: number;
  createdAt: string;
  role: 'org:admin' | 'member';
}

export interface OrganizationMember {
  id: string;
  name?: string;
  email?: string;
  role: 'org:admin' | 'member';
  joinedAt: string;
}
