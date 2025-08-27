'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, AlertCircle } from 'lucide-react';
import type { Debt } from '@/types';

interface DebtSummaryProps {
  debts: Debt[];
}

export function DebtSummary({ debts }: DebtSummaryProps) {
  const pendingDebts = debts.filter(d => !d.isSettled);
  const overdueDebts = pendingDebts.filter(d => 
    d.dueDate && new Date(d.dueDate) < new Date()
  );

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

  const priorityDebts = [...overdueDebts, ...pendingDebts.filter(d => !overdueDebts.includes(d))]
    .slice(0, 5);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2">
          Debt Summary
          {overdueDebts.length > 0 && (
            <Badge variant="destructive" className="text-xs">
              {overdueDebts.length} overdue
            </Badge>
          )}
        </CardTitle>
        <Link href="/debts">
          <Button variant="ghost" size="sm">
            View all
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {pendingDebts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No pending debts
          </div>
        ) : (
          <div className="space-y-4">
            {priorityDebts.map((debt) => {
              const isOverdue = debt.dueDate && new Date(debt.dueDate) < new Date();
              
              return (
                <div key={debt.id} className={`flex items-center justify-between p-3 rounded-md ${
                  isOverdue ? 'bg-red-50 border border-red-200' : 'bg-muted/50'
                }`}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{debt.creditorName}</span>
                      <Badge variant={debt.type === 'i_owe' ? 'destructive' : 'default'} className="text-xs">
                        {debt.type === 'i_owe' ? 'I OWE' : 'THEY OWE'}
                      </Badge>
                      {isOverdue && (
                        <Badge variant="destructive" className="text-xs">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          OVERDUE
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground truncate">
                      {debt.description}
                    </div>
                    {debt.dueDate && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Due: {formatDate(debt.dueDate)}
                      </div>
                    )}
                  </div>
                  <div className={`text-right font-semibold ${
                    debt.type === 'they_owe_me' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {debt.type === 'they_owe_me' ? '+' : '-'}{formatCurrency(debt.amount)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}