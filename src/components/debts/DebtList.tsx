'use client';

import { useState } from 'react';
import { Debt } from '@/types';
import { deleteDebt, updateDebt } from '@/lib/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Edit, Trash2, MoreVertical, CheckCircle, Clock, CreditCard } from 'lucide-react';
import { PartialSettlementDialog } from './PartialSettlementDialog';

interface DebtListProps {
  debts: Debt[];
  onEdit: (debt: Debt) => void;
  onRefresh: () => void;
}

export function DebtList({ debts, onEdit, onRefresh }: DebtListProps) {
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [partialSettlementDebt, setPartialSettlementDebt] = useState<Debt | null>(null);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this debt?')) {
      setActionLoading(id);
      try {
        await deleteDebt(id);
        onRefresh();
      } catch (error) {
        console.error('Failed to delete debt:', error);
      } finally {
        setActionLoading(null);
      }
    }
  };

  const handleSettle = async (debt: Debt) => {
    if (window.confirm(`Mark this debt as ${debt.isSettled ? 'unsettled' : 'settled'}?`)) {
      setActionLoading(debt.id);
      try {
        await updateDebt(debt.id, { 
          isSettled: !debt.isSettled,
          updatedAt: new Date().toISOString()
        });
        onRefresh();
      } catch (error) {
        console.error('Failed to update debt:', error);
      } finally {
        setActionLoading(null);
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

  const isOverdue = (debt: Debt) => {
    if (!debt.dueDate || debt.isSettled) return false;
    return new Date(debt.dueDate) < new Date();
  };

  if (debts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No debts found.</p>
        <p className="text-sm text-muted-foreground mt-2">
          Add a debt to start tracking what you owe or what others owe you.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {debts.map((debt) => (
        <Card key={debt.id} className={`transition-colors hover:bg-muted/50 ${
          isOverdue(debt) ? 'border-red-200 bg-red-50/50' : ''
        } ${debt.isSettled ? 'opacity-60' : ''}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col">
                      <span className={`text-lg font-semibold ${
                        debt.type === 'they_owe_me' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {debt.type === 'they_owe_me' ? '+' : '-'}{formatCurrency(debt.amount)}
                      </span>
                      {debt.paidAmount && debt.paidAmount > 0 && (
                        <span className="text-xs text-muted-foreground">
                          Paid: {formatCurrency(debt.paidAmount)} 
                          ({Math.round((debt.paidAmount / debt.amount) * 100)}%)
                        </span>
                      )}
                    </div>
                    <Badge variant={debt.type === 'i_owe' ? 'destructive' : 'default'}>
                      {debt.type === 'i_owe' ? 'I OWE' : 'THEY OWE ME'}
                    </Badge>
                    {debt.isSettled && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        SETTLED
                      </Badge>
                    )}
                    {isOverdue(debt) && (
                      <Badge variant="destructive">
                        <Clock className="w-3 h-3 mr-1" />
                        OVERDUE
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="font-medium">{debt.creditorName}</div>
                  <div className="text-sm text-muted-foreground">{debt.description}</div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {debt.dueDate && (
                      <span>Due: {formatDate(debt.dueDate)}</span>
                    )}
                    <span>Created: {formatDate(debt.createdAt)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {!debt.isSettled && (
                  <Button
                    onClick={() => setPartialSettlementDebt(debt)}
                    disabled={actionLoading === debt.id}
                    variant="outline"
                    size="sm"
                  >
                    <CreditCard className="w-3 h-3 mr-1" />
                    Pay
                  </Button>
                )}
                
                <Button
                  onClick={() => handleSettle(debt)}
                  disabled={actionLoading === debt.id}
                  variant={debt.isSettled ? "outline" : "default"}
                  size="sm"
                >
                  {debt.isSettled ? 'Mark Unsettled' : 'Mark Settled'}
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      disabled={actionLoading === debt.id}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(debt)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(debt.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {partialSettlementDebt && (
        <PartialSettlementDialog
          isOpen={true}
          onClose={() => setPartialSettlementDebt(null)}
          onSuccess={() => {
            onRefresh();
            setPartialSettlementDebt(null);
          }}
          debt={partialSettlementDebt}
        />
      )}
    </div>
  );
}