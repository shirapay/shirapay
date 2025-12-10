
'use client';

import { DollarSign, CreditCard, Users, Activity, Loader2, CalendarIcon } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
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
import { useMemo, useState } from 'react';
import { collection, query, where } from 'firebase/firestore';
import type { Transaction, UserProfile, TransactionStatus } from '@/lib/types';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

export function AnalyticsDashboard() {
  const { userProfile } = useUser();
  const firestore = useFirestore();

  // State for filters
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), 0, 1),
    to: new Date(),
  });
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [agentFilter, setAgentFilter] = useState<string>('all');

  // Query for all transactions in the organization
  const transactionsQuery = useMemo(() => {
    if (!userProfile?.organizationId) return null;
    return query(
      collection(firestore, 'transactions'),
      where('organizationId', '==', userProfile.organizationId)
    );
  }, [userProfile, firestore]);

  const { data: allTransactions, loading } = useCollection<Transaction>(transactionsQuery);

  // Query for all agents in the organization
  const agentsQuery = useMemo(() => {
    if (!userProfile?.organizationId) return null;
    return query(
      collection(firestore, 'users'),
      where('organizationId', '==', userProfile.organizationId),
      where('role', '==', 'agent')
    );
  }, [userProfile, firestore]);

  const { data: agents } = useCollection<UserProfile>(agentsQuery);

  const filteredTransactions = useMemo(() => {
    if (!allTransactions) return [];
    return allTransactions.filter(tx => {
      const transactionDate = tx.createdAt?.toDate ? tx.createdAt.toDate() : new Date(tx.createdAt);
      
      const dateFrom = date?.from ? new Date(date.from.setHours(0, 0, 0, 0)) : null;
      const dateTo = date?.to ? new Date(date.to.setHours(23, 59, 59, 999)) : null;

      const isAfterFrom = dateFrom ? transactionDate >= dateFrom : true;
      const isBeforeTo = dateTo ? transactionDate <= dateTo : true;
      
      const statusMatch = statusFilter === 'all' || tx.status.toLowerCase() === statusFilter;
      const agentMatch = agentFilter === 'all' || tx.agentId === agentFilter;

      return isAfterFrom && isBeforeTo && statusMatch && agentMatch;
    });
  }, [allTransactions, date, statusFilter, agentFilter]);


  const {
    totalSpent,
    totalTransactions,
    pendingApprovalsCount,
    activeAgentsCount,
    monthlySpending,
    spendingByDepartment
  } = useMemo(() => {
    const transactions = filteredTransactions;
    
    const paidTransactions = transactions.filter(tx => tx.status === 'PAID');
    const totalSpent = paidTransactions.reduce((sum, t) => sum + t.amount, 0);
    const pendingApprovalsCount = transactions.filter(t => t.status === 'PENDING_APPROVAL').length;
    const uniqueAgentIds = new Set(transactions.map(t => t.agentId).filter(Boolean));
    const activeAgentsCount = uniqueAgentIds.size;

    const monthlySpendingMap = new Map<string, number>();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    monthNames.forEach(monthName => monthlySpendingMap.set(monthName, 0));

    paidTransactions.forEach(tx => {
      const txDate = tx.paidAt?.toDate ? tx.paidAt.toDate() : new Date(tx.paidAt);
      if (tx.paidAt) {
          const dateFrom = date?.from ? new Date(date.from.setHours(0, 0, 0, 0)) : null;
          const dateTo = date?.to ? new Date(date.to.setHours(23, 59, 59, 999)) : null;
          const isAfterFrom = dateFrom ? txDate >= dateFrom : true;
          const isBeforeTo = dateTo ? txDate <= dateTo : true;

          if (isAfterFrom && isBeforeTo) {
            const monthName = format(txDate, 'MMM');
            const currentTotal = monthlySpendingMap.get(monthName) || 0;
            monthlySpendingMap.set(monthName, currentTotal + tx.amount);
          }
      }
    });
    
    const spendingByDepartmentMap = new Map<string, number>();
    paidTransactions.forEach(tx => {
      const department = tx.department || 'Uncategorized';
      const currentTotal = spendingByDepartmentMap.get(department) || 0;
      spendingByDepartmentMap.set(department, currentTotal + tx.amount);
    });

    return {
      totalSpent,
      totalTransactions: transactions.length,
      pendingApprovalsCount,
      activeAgentsCount,
      monthlySpending: monthNames.map(name => ({ name, total: monthlySpendingMap.get(name) || 0 })),
      spendingByDepartment: Array.from(spendingByDepartmentMap.entries()).map(([name, total]) => ({ name, total })),
    };
  }, [filteredTransactions, date]);
  
  if (loading) {
    return (
        <div className="flex justify-center items-center h-96">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
            <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="grid gap-2">
              <Label>Date Range</Label>
               <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant={"outline"}
                    className={cn(
                      "justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date?.from ? (
                      date.to ? (
                        <>
                          {format(date.from, "LLL dd, y")} -{" "}
                          {format(date.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(date.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={date?.from}
                    selected={date}
                    onSelect={setDate}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid gap-2">
                <Label>Status</Label>
                 <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                        <SelectValue placeholder="Filter by status..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="pending_approval">Pending Approval</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="created">Created</SelectItem>
                    </SelectContent>
                </Select>
            </div>
             <div className="grid gap-2">
                <Label>Agent</Label>
                 <Select value={agentFilter} onValueChange={setAgentFilter}>
                    <SelectTrigger>
                        <SelectValue placeholder="Filter by agent..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Agents</SelectItem>
                        {agents?.map(agent => (
                            <SelectItem key={agent.uid} value={agent.uid}>{agent.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </CardContent>
      </Card>


      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{totalSpent.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">
              Total for selected period and filters
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
              In selected period
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
              In selected period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Now
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
             <CardDescription>
                Paid transactions over time.
            </CardDescription>
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
                    formatter={(value: number) => [`₦${value.toLocaleString()}`, 'Spent']}
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
              Breakdown of paid transactions by department.
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
                    formatter={(value: number) => [`₦${value.toLocaleString()}`, 'Spent']}
                 />
                <Legend />
                <Bar dataKey="total" name="Spent" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </card>
      </div>
    </>
  );
}
