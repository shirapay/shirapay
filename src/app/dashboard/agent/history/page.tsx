import { TransactionHistoryTable } from "@/components/shared/transaction-history-table";
import { transactions, getDemoUser } from "@/lib/data";

export default function AgentHistoryPage() {
    const agent = getDemoUser('agent');
    const agentTransactions = transactions.filter(tx => tx.agentId === agent.id).map(tx => ({
        ...tx,
        vendorName: tx.vendorId === 'vendor-1' ? 'Staples Inc.' : 'Local Cafe'
    }));

  return (
    <div className="space-y-6">
       <div>
        <h2 className="text-2xl font-bold tracking-tight">My Request History</h2>
        <p className="text-muted-foreground">
          A log of all payment requests you have initiated.
        </p>
      </div>
      <TransactionHistoryTable transactions={agentTransactions} currentUserRole="agent" />
    </div>
  );
}
