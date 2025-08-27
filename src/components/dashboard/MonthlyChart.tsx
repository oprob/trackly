'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Transaction } from '@/types';

interface MonthlyChartProps {
  transactions: Transaction[];
}

export function MonthlyChart({ transactions }: MonthlyChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(value);
  };

  // Group transactions by month
  const monthlyData = transactions.reduce((acc, transaction) => {
    const date = new Date(transaction.date);
    const monthYear = date.toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'short' 
    });
    
    if (!acc[monthYear]) {
      acc[monthYear] = { month: monthYear, income: 0, expenses: 0 };
    }
    
    if (transaction.type === 'income') {
      acc[monthYear].income += transaction.amount;
    } else {
      acc[monthYear].expenses += transaction.amount;
    }
    
    return acc;
  }, {} as Record<string, { month: string; income: number; expenses: number }>);

  const chartData = Object.values(monthlyData)
    .sort((a, b) => {
      const dateA = new Date(a.month + ' 1');
      const dateB = new Date(b.month + ' 1');
      return dateA.getTime() - dateB.getTime();
    })
    .slice(-6); // Show last 6 months

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monthly Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            No transaction data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`} />
            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            <Legend />
            <Bar dataKey="income" fill="#22c55e" name="Income" />
            <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}