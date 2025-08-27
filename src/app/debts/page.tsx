'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getDebts } from '@/lib/firestore';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { DebtForm } from '@/components/debts/DebtForm';
import { DebtList } from '@/components/debts/DebtList';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, TrendingDown, TrendingUp, AlertCircle } from 'lucide-react';
import type { Debt } from '@/types';

export default function DebtsPage() {
  const { user } = useAuth();
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | undefined>();

  const fetchDebts = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await getDebts(user.uid);
      setDebts(data);
    } catch (error) {
      console.error('Failed to fetch debts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDebts();
  }, [user]);

  const handleEdit = (debt: Debt) => {
    setEditingDebt(debt);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingDebt(undefined);
  };

  const handleFormSuccess = () => {
    fetchDebts();
  };

  const iOweDebts = debts.filter(d => d.type === 'i_owe');
  const theyOweDebts = debts.filter(d => d.type === 'they_owe_me');

  const totalIOwe = iOweDebts
    .filter(d => !d.isSettled)
    .reduce((sum, d) => sum + d.amount, 0);

  const totalTheyOwe = theyOweDebts
    .filter(d => !d.isSettled)
    .reduce((sum, d) => sum + d.amount, 0);

  const overdueDebts = debts.filter(d => 
    !d.isSettled && 
    d.dueDate && 
    new Date(d.dueDate) < new Date()
  );

  const netBalance = totalTheyOwe - totalIOwe;

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Debts & Dues</h1>
            <p className="text-muted-foreground">Track what you owe and what others owe you</p>
          </div>
          <Button onClick={() => setShowForm(true)} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Add Debt
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">I Owe</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                ₹{totalIOwe.toLocaleString('en-IN')}
              </div>
              <p className="text-xs text-muted-foreground">
                {iOweDebts.filter(d => !d.isSettled).length} active debts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">They Owe Me</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ₹{totalTheyOwe.toLocaleString('en-IN')}
              </div>
              <p className="text-xs text-muted-foreground">
                {theyOweDebts.filter(d => !d.isSettled).length} active dues
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${
                netBalance >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {netBalance >= 0 ? '+' : ''}₹{netBalance.toLocaleString('en-IN')}
              </div>
              <p className="text-xs text-muted-foreground">
                {netBalance >= 0 ? 'In your favor' : 'You owe more'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <AlertCircle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {overdueDebts.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Need attention
              </p>
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList>
              <TabsTrigger value="all">All ({debts.length})</TabsTrigger>
              <TabsTrigger value="i_owe">I Owe ({iOweDebts.length})</TabsTrigger>
              <TabsTrigger value="they_owe">They Owe Me ({theyOweDebts.length})</TabsTrigger>
              <TabsTrigger value="overdue">Overdue ({overdueDebts.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <DebtList
                debts={debts}
                onEdit={handleEdit}
                onRefresh={fetchDebts}
              />
            </TabsContent>

            <TabsContent value="i_owe">
              <DebtList
                debts={iOweDebts}
                onEdit={handleEdit}
                onRefresh={fetchDebts}
              />
            </TabsContent>

            <TabsContent value="they_owe">
              <DebtList
                debts={theyOweDebts}
                onEdit={handleEdit}
                onRefresh={fetchDebts}
              />
            </TabsContent>

            <TabsContent value="overdue">
              <DebtList
                debts={overdueDebts}
                onEdit={handleEdit}
                onRefresh={fetchDebts}
              />
            </TabsContent>
          </Tabs>
        )}

        <DebtForm
          isOpen={showForm}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
          debt={editingDebt}
        />
      </div>
    </AuthGuard>
  );
}