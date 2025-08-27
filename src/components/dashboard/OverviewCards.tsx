'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Wallet, AlertCircle } from 'lucide-react';

interface OverviewCardsProps {
  totalIncome: number;
  totalExpenses: number;
  totalBalance: number;
  pendingDebts: number;
}

export function OverviewCards({ totalIncome, totalExpenses, totalBalance, pendingDebts }: OverviewCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Income</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(totalIncome)}
          </div>
          <p className="text-xs text-muted-foreground">
            All time earnings
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {formatCurrency(totalExpenses)}
          </div>
          <p className="text-xs text-muted-foreground">
            All time spending
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
          <Wallet className={`h-4 w-4 ${totalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`} />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${totalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(totalBalance)}
          </div>
          <p className="text-xs text-muted-foreground">
            {totalBalance >= 0 ? 'Savings' : 'Deficit'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Debts</CardTitle>
          <AlertCircle className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">
            {pendingDebts}
          </div>
          <p className="text-xs text-muted-foreground">
            Require attention
          </p>
        </CardContent>
      </Card>
    </div>
  );
}