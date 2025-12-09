import { TransactionHistoryTable } from "@/components/shared/transaction-history-table";
import { transactions } from "@/lib/data";

export default function AdminHistoryPage() {
  const populatedTransactions = transactions.map(tx => ({
      ...tx,
      agentName: 'Bob Agent',
      vendorName: tx.vendorId === 'vendor-1' ? 'Staples Inc.' : 'Local Cafe'
  }));

  return (
    <div className="space-y-6">
       <div>
        <h2 className="text-2xl font-bold tracking-tight">Full Transaction History</h2>
        <p className="text-muted-foreground">
          View all transactions across the organization.
        </p>
      </div>
      <TransactionHistoryTable transactions={populatedTransactions} currentUserRole="admin" />
    </div>
  );
}
