import { TransactionHistoryTable } from "@/components/shared/transaction-history-table";
import { transactions, getDemoUser } from "@/lib/data";

export default function VendorHistoryPage() {
    const vendor = getDemoUser('vendor');
    const vendorTransactions = transactions.filter(tx => tx.vendorId === vendor.id);

  return (
    <div className="space-y-6">
       <div>
        <h2 className="text-2xl font-bold tracking-tight">My Invoice History</h2>
        <p className="text-muted-foreground">
          A record of all invoices you have generated.
        </p>
      </div>
      <TransactionHistoryTable transactions={vendorTransactions} currentUserRole="vendor" />
    </div>
  );
}
