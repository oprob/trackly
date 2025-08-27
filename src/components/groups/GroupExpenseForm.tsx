'use client';

import { useState } from 'react';
import { updateGroup } from '@/lib/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Group, GroupExpense, ExpenseSplit } from '@/types';

interface GroupExpenseFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  group: Group;
}

const categories = [
  'Food & Dining',
  'Transportation',
  'Accommodation',
  'Entertainment',
  'Shopping',
  'Utilities',
  'Other'
];

export function GroupExpenseForm({ isOpen, onClose, onSuccess, group }: GroupExpenseFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [splitType, setSplitType] = useState<'equal' | 'custom'>('equal');

  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    paidBy: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
  });

  const [customSplits, setCustomSplits] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const amount = parseFloat(formData.amount);
      let splits: ExpenseSplit[];

      if (splitType === 'equal') {
        const splitAmount = amount / group.members.length;
        splits = group.members.map(member => ({
          userId: member.userId,
          amount: splitAmount,
        }));
      } else {
        splits = group.members.map(member => ({
          userId: member.userId,
          amount: parseFloat(customSplits[member.userId] || '0'),
        }));

        const totalSplit = splits.reduce((sum, split) => sum + split.amount, 0);
        if (Math.abs(totalSplit - amount) > 0.01) {
          setError('Custom split amounts must equal the total expense amount');
          setLoading(false);
          return;
        }
      }

      const expense: GroupExpense = {
        id: Date.now().toString(),
        description: formData.description,
        amount,
        paidBy: formData.paidBy,
        splitType,
        splits,
        category: formData.category,
        date: formData.date,
        createdAt: new Date().toISOString(),
      };

      // Calculate new balances
      const updatedMembers = group.members.map(member => {
        const split = splits.find(s => s.userId === member.userId);
        const owedAmount = split ? split.amount : 0;
        const paidAmount = member.userId === formData.paidBy ? amount : 0;
        const balanceChange = paidAmount - owedAmount;
        
        return {
          ...member,
          balance: member.balance + balanceChange,
        };
      });

      await updateGroup(group.id, {
        members: updatedMembers,
        expenses: [...group.expenses, expense],
      });

      onSuccess();
      onClose();
      
      // Reset form
      setFormData({
        description: '',
        amount: '',
        paidBy: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
      });
      setCustomSplits({});
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add expense';
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

  const updateCustomSplit = (userId: string, amount: string) => {
    setCustomSplits(prev => ({
      ...prev,
      [userId]: amount,
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add Group Expense</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="e.g., Dinner at restaurant"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                required
              />
            </div>

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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="paidBy">Paid By</Label>
              <Select
                value={formData.paidBy}
                onValueChange={(value) => setFormData(prev => ({ ...prev, paidBy: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select who paid" />
                </SelectTrigger>
                <SelectContent>
                  {group.members.map((member) => (
                    <SelectItem key={member.userId} value={member.userId}>
                      {member.displayName} ({member.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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

          <div className="space-y-4">
            <Label>Split Method</Label>
            <Tabs value={splitType} onValueChange={(value) => setSplitType(value as 'equal' | 'custom')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="equal">Split Equally</TabsTrigger>
                <TabsTrigger value="custom">Custom Split</TabsTrigger>
              </TabsList>

              <TabsContent value="equal" className="mt-4">
                <div className="p-4 bg-muted rounded-md">
                  <p className="text-sm text-muted-foreground">
                    The expense will be split equally among all {group.members.length} members.
                    {formData.amount && (
                      <span className="block mt-1 font-medium">
                        Each member owes: ₹{(parseFloat(formData.amount) / group.members.length).toFixed(2)}
                      </span>
                    )}
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="custom" className="mt-4">
                <div className="space-y-3">
                  {group.members.map((member) => (
                    <div key={member.userId} className="flex items-center gap-3">
                      <div className="flex-1">
                        <span className="text-sm font-medium">{member.displayName}</span>
                        <span className="text-xs text-muted-foreground ml-2">({member.email})</span>
                      </div>
                      <div className="w-24">
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          value={customSplits[member.userId] || ''}
                          onChange={(e) => updateCustomSplit(member.userId, e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                  {formData.amount && (
                    <div className="p-3 bg-muted rounded-md text-sm">
                      <div className="flex justify-between">
                        <span>Total Expense:</span>
                        <span className="font-medium">₹{parseFloat(formData.amount).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Split:</span>
                        <span className="font-medium">
                          ₹{Object.values(customSplits).reduce((sum, val) => sum + parseFloat(val || '0'), 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
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
            <Button type="submit" disabled={loading || !formData.paidBy}>
              {loading ? 'Adding...' : 'Add Expense'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}