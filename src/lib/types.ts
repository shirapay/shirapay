export type UserRole = 'org_admin' | 'agent_staff' | 'vendor_admin' | 'vendor_staff';

export type ApprovalStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';
export type KycStatus = 'NOT_STARTED' | 'PENDING' | 'VERIFIED' | 'REJECTED' | 'NA';


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
    linkedAdminId?: string | null;
    approvalStatus: ApprovalStatus;
    kycStatus: KycStatus;
    createdAt: Date;
}

export interface Organization {
  orgId: string;
  legalName: string;
  primaryContactEmail: string;
  adminUids: string[];
  departments: string[];
  createdAt: Date;
}

export type TransactionStatus =
  | 'CREATED'
  | 'SCANNED'
  | 'PENDING_APPROVAL'
  | 'PAYMENT_IN_PROGRESS'
  | 'PAYMENT_FAILED'
  | 'PAID'
  | 'REJECTED';

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  status: TransactionStatus;
  vendorId: string;
  vendorName?: string;
  vendorEmail?: string;
  agentId?: string;
  agentName?: string;
  adminId?: string;
  organizationId: string;
  createdAt: any; // Allow for ServerTimestamp
  paidAt?: any; // Allow for ServerTimestamp
  rejectionReason?: string;
  department?: string;
  paymentError?: string;
  paystackReferenceId?: string;
}
