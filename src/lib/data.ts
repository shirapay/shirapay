import type { User, Transaction, UserRole } from './types';
import { placeholderImages } from './placeholder-images';

const avatar1 = placeholderImages.find((p) => p.id === 'avatar-1')?.imageUrl ?? '';
const avatar2 = placeholderImages.find((p) => p.id === 'avatar-2')?.imageUrl ?? '';
const avatar3 = placeholderImages.find((p) => p.id === 'avatar-3')?.imageUrl ?? '';

export const users: User[] = [
  {
    id: 'admin-1',
    name: 'Catherine Admin',
    email: 'catherine.a@example.com',
    role: 'admin',
    avatarUrl: avatar1,
    organizationId: 'org-1',
  },
  {
    id: 'agent-1',
    name: 'Bob Agent',
    email: 'bob.agent@example.com',
    role: 'agent',
    avatarUrl: avatar2,
    organizationId: 'org-1',
  },
  {
    id: 'vendor-1',
    name: 'Staples Inc.',
    email: 'contact@staples.com',
    role: 'vendor',
    avatarUrl: avatar3,
    organizationId: 'org-1',
    isVerified: true,
  },
  {
    id: 'vendor-2',
    name: 'Local Cafe',
    email: 'joe@localcafe.com',
    role: 'vendor',
    avatarUrl: '/placeholder.svg',
    organizationId: 'org-1',
    isVerified: false,
  },
];

export const transactions: Transaction[] = [
  {
    id: 'txn-001',
    amount: 75.5,
    description: 'Office supplies: paper, pens, and sticky notes.',
    status: 'PAID',
    vendorId: 'vendor-1',
    agentId: 'agent-1',
    adminId: 'admin-1',
    organizationId: 'org-1',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    paidAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    department: 'Office Management'
  },
  {
    id: 'txn-002',
    amount: 250.0,
    description: 'New office keyboard and mouse for developer.',
    status: 'PENDING_APPROVAL',
    vendorId: 'vendor-1',
    agentId: 'agent-1',
    adminId: 'admin-1',
    organizationId: 'org-1',
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    department: 'IT/Hardware'
  },
  {
    id: 'txn-003',
    amount: 15.75,
    description: 'Team coffee run.',
    status: 'REJECTED',
    vendorId: 'vendor-2',
    agentId: 'agent-1',
    adminId: 'admin-1',
    organizationId: 'org-1',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    rejectionReason: 'Not a valid business expense.',
    department: 'Marketing'
  },
  {
    id: 'txn-004',
    amount: 1200.0,
    description: 'Monthly software subscription for design tools.',
    status: 'PAID',
    vendorId: 'vendor-1',
    agentId: 'agent-1',
    adminId: 'admin-1',
    organizationId: 'org-1',
    createdAt: new Date(new Date().setMonth(new Date().getMonth() - 1)), // 1 month ago
    paidAt: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    department: 'Design'
  },
  {
    id: 'txn-005',
    amount: 350.0,
    description: 'Marketing banner printing for upcoming event.',
    status: 'PENDING_APPROVAL',
    vendorId: 'vendor-1',
    agentId: 'agent-1',
    adminId: 'admin-1',
    organizationId: 'org-1',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    department: 'Marketing'
  },
  {
    id: 'txn-006',
    amount: 45.00,
    description: 'Catering for client meeting',
    status: 'CREATED',
    vendorId: 'vendor-2',
    agentId: 'agent-1',
    organizationId: 'org-1',
    createdAt: new Date(),
  },
];

// Helper to get user by role for demo purposes
export const getDemoUser = (role: UserRole) => users.find((u) => u.role === role)!;
