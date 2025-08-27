'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createDebt, updateDebt } from '@/lib/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Debt } from '@/types';

interface DebtFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  debt?: Debt;
}

export function DebtForm({ isOpen, onClose, onSuccess, debt }: DebtFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    creditorName: debt?.creditorName || '',
    amount: debt?.amount.toString() || '',
    description: debt?.description || '',
    type: debt?.type || 'i_owe' as 'i_owe' | 'they_owe_me',
    dueDate: debt?.dueDate || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      const debtData: Omit<Debt, 'id' | 'createdAt' | 'updatedAt'> = {
        userId: user.uid,
        creditorName: formData.creditorName,
        amount: parseFloat(formData.amount),
        description: formData.description,
        type: formData.type,
        paidAmount: debt?.paidAmount || 0,
        isSettled: false,
        dueDate: formData.dueDate || undefined,
      };

      if (debt) {
        await updateDebt(debt.id, debtData);
      } else {
        await createDebt(debtData);
      }

      onSuccess();
      onClose();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save debt';
      setError(errorMessage);
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
            {debt ? 'Edit Debt' : 'Add Debt'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value: 'i_owe' | 'they_owe_me') => 
                setFormData(prev => ({ ...prev, type: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="i_owe">I owe</SelectItem>
                <SelectItem value="they_owe_me">They owe me</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="creditorName">
              {formData.type === 'i_owe' ? 'Creditor Name' : 'Debtor Name'}
            </Label>
            <Input
              id="creditorName"
              placeholder={formData.type === 'i_owe' ? 'Who do you owe?' : 'Who owes you?'}
              value={formData.creditorName}
              onChange={(e) => setFormData(prev => ({ ...prev, creditorName: e.target.value }))}
              required
            />
          </div>

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
              <Label htmlFor="dueDate">Due Date (Optional)</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="What is this debt for?"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              required
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
              {loading ? 'Saving...' : (debt ? 'Update' : 'Add')} Debt
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}