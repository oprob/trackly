'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserGroups } from '@/lib/firestore';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { GroupForm } from '@/components/groups/GroupForm';
import { GroupCard } from '@/components/groups/GroupCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Users, Receipt, DollarSign } from 'lucide-react';
import type { Group } from '@/types';

export default function GroupsPage() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchGroups = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await getUserGroups(user.uid);
      setGroups(data);
    } catch (error) {
      console.error('Failed to fetch groups:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [user]);

  const handleFormClose = () => {
    setShowForm(false);
  };

  const handleFormSuccess = () => {
    fetchGroups();
  };

  const totalBalance = groups.reduce((sum, group) => {
    const currentUser = group.members.find(m => m.userId === user?.uid);
    return sum + (currentUser?.balance || 0);
  }, 0);

  const totalExpenses = groups.reduce((sum, group) => 
    sum + group.expenses.reduce((expSum, expense) => expSum + expense.amount, 0), 0
  );

  const oweAmount = groups.reduce((sum, group) => {
    const currentUser = group.members.find(m => m.userId === user?.uid);
    return sum + Math.max(0, -(currentUser?.balance || 0));
  }, 0);

  const owedAmount = groups.reduce((sum, group) => {
    const currentUser = group.members.find(m => m.userId === user?.uid);
    return sum + Math.max(0, currentUser?.balance || 0);
  }, 0);

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Groups</h1>
            <p className="text-muted-foreground">Manage shared expenses with friends and family</p>
          </div>
          <Button onClick={() => setShowForm(true)} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Create Group
          </Button>
        </div>

        {groups.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Groups</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{groups.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                <Receipt className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{totalExpenses.toLocaleString('en-IN')}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">You Owe</CardTitle>
                <DollarSign className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  ₹{oweAmount.toLocaleString('en-IN')}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">You Are Owed</CardTitle>
                <DollarSign className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  ₹{owedAmount.toLocaleString('en-IN')}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : groups.length === 0 ? (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No groups yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first group to start sharing expenses with friends and family.
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Group
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <GroupCard
                key={group.id}
                group={group}
                currentUserId={user?.uid || ''}
              />
            ))}
          </div>
        )}

        <GroupForm
          isOpen={showForm}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      </div>
    </AuthGuard>
  );
}