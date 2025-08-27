'use client';

import { useState } from 'react';
import { Transaction } from '@/types';
import { deleteTransaction } from '@/lib/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Edit, Trash2, MoreVertical } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onRefresh: () => void;
}

export function TransactionList({ transactions, onEdit, onRefresh }: TransactionListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      setDeletingId(id);
      try {
        await deleteTransaction(id);
        onRefresh();
      } catch (error) {
        console.error('Failed to delete transaction:', error);
      } finally {
        setDeletingId(null);
      }
    }
  };

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
      year: 'numeric',
    });
  };

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No transactions found.</p>
        <p className="text-sm text-muted-foreground mt-2">
          Add your first transaction to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {transactions.map((transaction) => (
        <Card key={transaction.id} className="transition-colors hover:bg-muted/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-lg font-semibold ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {transaction.method.toUpperCase()}
                    </Badge>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {transaction.category}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{formatDate(transaction.date)}</span>
                  {transaction.notes && (
                    <span className="flex-1 truncate">{transaction.notes}</span>
                  )}
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    disabled={deletingId === transaction.id}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(transaction)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleDelete(transaction.id)}
                    className="text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}