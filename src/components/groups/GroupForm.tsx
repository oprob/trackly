'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createGroup } from '@/lib/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { X, Plus } from 'lucide-react';
import type { Group, GroupMember } from '@/types';

interface GroupFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function GroupForm({ isOpen, onClose, onSuccess }: GroupFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const [memberEmails, setMemberEmails] = useState(['']);

  const addMemberField = () => {
    setMemberEmails([...memberEmails, '']);
  };

  const removeMemberField = (index: number) => {
    setMemberEmails(memberEmails.filter((_, i) => i !== index));
  };

  const updateMemberEmail = (index: number, email: string) => {
    const updated = [...memberEmails];
    updated[index] = email;
    setMemberEmails(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      const validEmails = memberEmails.filter(email => email.trim() !== '');
      
      const members: GroupMember[] = [
        {
          userId: user.uid,
          email: user.email || '',
          displayName: user.displayName || '',
          balance: 0,
        },
        ...validEmails.map(email => ({
          userId: '', // Will be filled when user joins
          email: email.trim(),
          displayName: email.split('@')[0],
          balance: 0,
        }))
      ];

      const groupData = {
        name: formData.name,
        description: formData.description,
        createdBy: user.uid,
        members,
        expenses: [],
      };

      await createGroup(groupData);
      onSuccess();
      onClose();
      
      // Reset form
      setFormData({ name: '', description: '' });
      setMemberEmails(['']);
    } catch (error: any) {
      setError(error.message || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      setFormData({ name: '', description: '' });
      setMemberEmails(['']);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Group</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Group Name</Label>
            <Input
              id="name"
              placeholder="e.g., Trip to Goa, Dinner Party"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Brief description of the group"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Group Members</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addMemberField}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Member
              </Button>
            </div>

            <div className="p-3 bg-muted rounded-md text-sm text-muted-foreground">
              You will be automatically added to the group as the creator.
            </div>

            <div className="space-y-3">
              {memberEmails.map((email, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    type="email"
                    placeholder="member@example.com"
                    value={email}
                    onChange={(e) => updateMemberEmail(index, e.target.value)}
                  />
                  {memberEmails.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeMemberField(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {memberEmails.length === 0 && (
              <div className="text-center py-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={addMemberField}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Member
                </Button>
              </div>
            )}
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
              {loading ? 'Creating...' : 'Create Group'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}