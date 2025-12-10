'use client';
import type { Transaction, UserRole } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";

interface TransactionHistoryTableProps {
  transactions: Transaction[];
  currentUserRole: UserRole;
}

const statusColors: { [key in Transaction['status']]: string } = {
    PAID: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700",
    PENDING_APPROVAL: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700",
    REJECTED: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700",
    CREATED: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700",
    SCANNED: "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-300 dark:border-indigo-700",
    PAYMENT_IN_PROGRESS: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-700",
    PAYMENT_FAILED: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700"
};

export function TransactionHistoryTable({ transactions, currentUserRole }: TransactionHistoryTableProps) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Description</TableHead>
            <TableHead>Status</TableHead>
            {currentUserRole === 'admin' && <TableHead>Agent</TableHead>}
            {currentUserRole !== 'vendor' && <TableHead>Vendor</TableHead>}
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Date</TableHead>
            <TableHead><span className="sr-only">Actions</span></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                No transactions found.
              </TableCell>
            </TableRow>
          ) : (
            transactions.map((tx) => (
              <TableRow key={tx.id}>
                <TableCell className="font-medium max-w-xs truncate">{tx.description}</TableCell>
                <TableCell>
                  <Badge className={cn("border", statusColors[tx.status])}>
                    {tx.status.replace("_", " ")}
                  </Badge>
                </TableCell>
                {currentUserRole === 'admin' && <TableCell>{tx.agentName ?? 'N/A'}</TableCell>}
                {currentUserRole !== 'vendor' && <TableCell>{tx.vendorName ?? 'N/A'}</TableCell>}
                <TableCell className="text-right font-mono">₦{tx.amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                <TableCell>{new Date(tx.createdAt?.seconds * 1000).toLocaleDateString()}</TableCell>
                 <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      {tx.status === 'PAID' && <DropdownMenuItem>Download Receipt</DropdownMenuItem>}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
