'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import type { Transaction } from '@/types';

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const recentTransactions = transactions
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Recent Transactions</CardTitle>
        <Link href="/transactions">
          <Button variant="ghost" size="sm">
            View all
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {recentTransactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No recent transactions
          </div>
        ) : (
          <div className="space-y-4">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{transaction.category}</span>
                    <Badge variant="outline" className="text-xs">
                      {transaction.method.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{formatDate(transaction.date)}</span>
                    {transaction.notes && (
                      <span className="truncate max-w-[200px]">
                        • {transaction.notes}
                      </span>
                    )}
                  </div>
                </div>
                <div className={`text-right font-semibold ${
                  transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}