'use client';

import { useState } from 'react';
import { updateDebt } from '@/lib/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Debt } from '@/types';

interface PartialSettlementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  debt: Debt;
}

export function PartialSettlementDialog({ isOpen, onClose, onSuccess, debt }: PartialSettlementDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');

  const currentPaidAmount = debt.paidAmount || 0;
  const remainingAmount = debt.amount - currentPaidAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payment = parseFloat(paymentAmount);
    
    if (payment <= 0) {
      setError('Payment amount must be greater than 0');
      setLoading(false);
      return;
    }

    if (payment > remainingAmount) {
      setError('Payment amount cannot exceed remaining debt');
      setLoading(false);
      return;
    }

    try {
      const newPaidAmount = currentPaidAmount + payment;
      const isFullySettled = newPaidAmount >= debt.amount;

      await updateDebt(debt.id, {
        paidAmount: newPaidAmount,
        isSettled: isFullySettled,
      });

      onSuccess();
      onClose();
      setPaymentAmount('');
    } catch (error: any) {
      setError(error.message || 'Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      setPaymentAmount('');
      setError('');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-md">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Total Debt:</span>
                  <div className="font-medium">{formatCurrency(debt.amount)}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Paid So Far:</span>
                  <div className="font-medium">{formatCurrency(currentPaidAmount)}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Remaining:</span>
                  <div className="font-medium text-red-600">{formatCurrency(remainingAmount)}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Progress:</span>
                  <div className="font-medium">{Math.round((currentPaidAmount / debt.amount) * 100)}%</div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentAmount">Payment Amount</Label>
              <Input
                id="paymentAmount"
                type="number"
                step="0.01"
                min="0.01"
                max={remainingAmount}
                placeholder="Enter payment amount"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Maximum: {formatCurrency(remainingAmount)}
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPaymentAmount((remainingAmount / 4).toFixed(2))}
                disabled={loading}
              >
                25%
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPaymentAmount((remainingAmount / 2).toFixed(2))}
                disabled={loading}
              >
                50%
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPaymentAmount((remainingAmount * 0.75).toFixed(2))}
                disabled={loading}
              >
                75%
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPaymentAmount(remainingAmount.toFixed(2))}
                disabled={loading}
              >
                Full
              </Button>
            </div>
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
            <Button type="submit" disabled={loading || !paymentAmount}>
              {loading ? 'Recording...' : 'Record Payment'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}