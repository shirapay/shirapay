'use client';

import { DollarSign, CreditCard, Users, Activity, Loader2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { useMemo } from 'react';
import { collection, query, where } from 'firebase/firestore';
import type { Transaction } from '@/lib/types';
import { format } from 'date-fns';

export function AnalyticsDashboard() {
  const { userProfile } = useUser();
  const firestore = useFirestore();

  const transactionsQuery = useMemo(() => {
    if (!userProfile?.organizationId) return null;
    return query(
      collection(firestore, 'transactions'),
      where('organizationId', '==', userProfile.organizationId)
    );
  }, [userProfile, firestore]);

  const { data: transactions, loading } = useCollection<Transaction>(transactionsQuery);

  const {
    totalSpent,
    totalTransactions,
    pendingApprovalsCount,
    activeAgentsCount,
    monthlySpending,
    spendingByDepartment
  } = useMemo(() => {
    if (!transactions) {
      return {
        totalSpent: 0,
        totalTransactions: 0,
        pendingApprovalsCount: 0,
        activeAgentsCount: 0,
        monthlySpending: [],
        spendingByDepartment: [],
      };
    }
    
    const paidTransactions = transactions.filter(tx => tx.status === 'PAID');
    const totalSpent = paidTransactions.reduce((sum, t) => sum + t.amount, 0);

    const pendingApprovalsCount = transactions.filter(t => t.status === 'PENDING_APPROVAL').length;
    
    const uniqueAgentIds = new Set(transactions.map(t => t.agentId).filter(Boolean));
    const activeAgentsCount = uniqueAgentIds.size;

    // Monthly spending aggregation
    const monthlySpendingMap = new Map<string, number>();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Initialize all months to 0
    monthNames.forEach(monthName => monthlySpendingMap.set(monthName, 0));

    paidTransactions.forEach(tx => {
      if (tx.paidAt) {
        const date = tx.paidAt.toDate ? tx.paidAt.toDate() : new Date(tx.paidAt);
        const monthName = format(date, 'MMM');
        const currentTotal = monthlySpendingMap.get(monthName) || 0;
        monthlySpendingMap.set(monthName, currentTotal + tx.amount);
      }
    });

    const monthlySpending = monthNames.map(name => ({
      name,
      total: monthlySpendingMap.get(name) || 0
    }));

    // Spending by department aggregation
    const departmentSpendingMap = new Map<string, number>();
    paidTransactions.forEach(tx => {
      const department = tx.department || 'Uncategorized';
      const currentTotal = departmentSpendingMap.get(department) || 0;
      departmentSpendingMap.set(department, currentTotal + tx.amount);
    });

    const spendingByDepartment = Array.from(departmentSpendingMap.entries()).map(([name, total]) => ({
      name,
      total,
    }));

    return {
      totalSpent,
      totalTransactions: transactions.length,
      pendingApprovalsCount,
      activeAgentsCount,
      monthlySpending,
      spendingByDepartment,
    };
  }, [transactions]);
  
  if (loading) {
    return (
        <div className="flex justify-center items-center h-96">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    )
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{totalSpent.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">
              Across all paid transactions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Transactions
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalTransactions}
            </div>
            <p className="text-xs text-muted-foreground">
              Total invoices processed
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeAgentsCount}</div>
            <p className="text-xs text-muted-foreground">
              Have processed requests
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Approvals
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingApprovalsCount}</div>
            <p className="text-xs text-muted-foreground">
              Invoices awaiting action
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Spending Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={monthlySpending}>
                <XAxis
                  dataKey="name"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `₦${Number(value).toLocaleString()}`}
                />
                 <Tooltip
                    cursor={{fill: 'hsl(var(--muted))'}}
                    contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        borderColor: 'hsl(var(--border))',
                    }}
                    formatter={(value: number) => `₦${value.toLocaleString()}`}
                />
                <Legend />
                <Bar
                  dataKey="total"
                  name="Spent"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="col-span-4 md:col-span-3">
          <CardHeader>
            <CardTitle>Spending by Department</CardTitle>
            <p className="text-sm text-muted-foreground">
              An overview of where funds are being allocated.
            </p>
          </CardHeader>
          <CardContent>
             <ResponsiveContainer width="100%" height={350}>
              <BarChart data={spendingByDepartment} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} width={100} />
                <Tooltip
                  cursor={{fill: 'hsl(var(--muted))'}}
                   contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        borderColor: 'hsl(var(--border))',
                    }}
                    formatter={(value: number) => `₦${value.toLocaleString()}`}
                 />
                <Legend />
                <Bar dataKey="total" name="Spent" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
