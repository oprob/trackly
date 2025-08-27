'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createTransaction, updateTransaction } from '@/lib/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Transaction, TransactionType, PaymentMethod } from '@/types';

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  transaction?: Transaction;
}

const categories = {
  expense: [
    'Food & Dining',
    'Shopping',
    'Entertainment',
    'Transportation',
    'Bills & Utilities',
    'Healthcare',
    'Education',
    'Travel',
    'Other'
  ],
  income: [
    'Salary',
    'Freelance',
    'Business',
    'Investment',
    'Bonus',
    'Gift',
    'Other'
  ]
};

export function TransactionForm({ isOpen, onClose, onSuccess, transaction }: TransactionFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    amount: transaction?.amount.toString() || '',
    type: transaction?.type || 'expense' as TransactionType,
    method: transaction?.method || 'cash' as PaymentMethod,
    category: transaction?.category || '',
    notes: transaction?.notes || '',
    date: transaction?.date || new Date().toISOString().split('T')[0],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      const transactionData = {
        userId: user.uid,
        amount: parseFloat(formData.amount),
        type: formData.type,
        method: formData.method,
        category: formData.category,
        notes: formData.notes,
        date: formData.date,
      };

      if (transaction) {
        await updateTransaction(transaction.id, transactionData);
      } else {
        await createTransaction(transactionData);
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      setError(error.message || 'Failed to save transaction');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {transaction ? 'Edit Transaction' : 'Add Transaction'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: TransactionType) => 
                  setFormData(prev => ({ ...prev, type: value, category: '' }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="method">Payment Method</Label>
              <Select
                value={formData.method}
                onValueChange={(value: PaymentMethod) => 
                  setFormData(prev => ({ ...prev, method: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="bank">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories[formData.type].map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional notes..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (transaction ? 'Update' : 'Add')} Transaction
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}