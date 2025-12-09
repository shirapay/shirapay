export type UserRole = 'admin' | 'agent' | 'vendor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
  organizationId: string;
  isVerified?: boolean; // Primarily for vendors
}

export interface UserProfile {
    uid: string;
    name: string;
    email: string;
    role: UserRole;
    organizationId?: string | null;
    isVerified: boolean;
    createdAt: Date;
}

export type TransactionStatus =
  | 'CREATED'
  | 'SCANNED'
  | 'PENDING_APPROVAL'
  | 'PAID'
  | 'REJECTED';

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  status: TransactionStatus;
  vendorId: string;
  vendorName?: string;
  agentId: string;
  agentName?: string;
  adminId?: string; // Assigned when routed for approval
  organizationId: string;
  createdAt: Date;
  paidAt?: Date;
  rejectionReason?: string;
  department?: string;
}
