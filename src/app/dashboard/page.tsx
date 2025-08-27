'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getTransactions, getDebts, getUserGroups } from '@/lib/firestore';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { OverviewCards } from '@/components/dashboard/OverviewCards';
import { ExpenseChart } from '@/components/dashboard/ExpenseChart';
import { MonthlyChart } from '@/components/dashboard/MonthlyChart';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { DebtSummary } from '@/components/dashboard/DebtSummary';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock } from 'lucide-react';
import type { Transaction, Debt, Group } from '@/types';

export default function DashboardPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    if (!user) {
      console.log('No user found, skipping data fetch');
      return;
    }

    try {
      setLoading(true);
      setError('');
      console.log('Fetching data for user:', user.uid);
      
      const [transactionsData, debtsData, groupsData] = await Promise.all([
        getTransactions(user.uid),
        getDebts(user.uid),
        getUserGroups(user.uid)
      ]);

      console.log('Fetched data:', { 
        transactions: transactionsData.length, 
        debts: debtsData.length, 
        groups: groupsData.length 
      });

      setTransactions(transactionsData);
      setDebts(debtsData);
      setGroups(groupsData);
    } catch (error: any) {
      console.error('Failed to fetch dashboard data:', error);
      setError(error.message || 'Failed to load data. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // Refresh data when component becomes visible (user navigates back to dashboard)
  useEffect(() => {
    const handleFocus = () => {
      if (!loading && user) {
        fetchData();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && !loading && user) {
        fetchData();
      }
    });

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, [user, loading]);

  if (loading) {
    return (
      <AuthGuard>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AuthGuard>
    );
  }

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalBalance = totalIncome - totalExpenses;

  const pendingDebts = debts.filter(d => !d.isSettled).length;

  const today = new Date();
  const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const weeklyTransactions = transactions.filter(t => 
    new Date(t.date) >= startOfWeek
  );

  const monthlyTransactions = transactions.filter(t => 
    new Date(t.date) >= startOfMonth
  );

  const weeklyIncome = weeklyTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const weeklyExpenses = weeklyTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyIncome = monthlyTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpenses = monthlyTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {user?.displayName || 'User'}! Here's your financial overview.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={fetchData}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>

        <div className="space-y-8">
          {error && (
            <div className="p-4 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center justify-between">
                <span>{error}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchData}
                  disabled={loading}
                >
                  {loading ? 'Retrying...' : 'Retry'}
                </Button>
              </div>
            </div>
          )}

          {/* Overview Cards */}
          <OverviewCards
            totalIncome={totalIncome}
            totalExpenses={totalExpenses}
            totalBalance={totalBalance}
            pendingDebts={pendingDebts}
          />

          {/* Period Summaries */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Week</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Income</div>
                    <div className="text-lg font-semibold text-green-600">
                      {formatCurrency(weeklyIncome)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Expenses</div>
                    <div className="text-lg font-semibold text-red-600">
                      {formatCurrency(weeklyExpenses)}
                    </div>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t">
                  <div className="text-sm text-muted-foreground">Net</div>
                  <div className={`text-lg font-semibold ${
                    (weeklyIncome - weeklyExpenses) >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(weeklyIncome - weeklyExpenses)}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Month</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Income</div>
                    <div className="text-lg font-semibold text-green-600">
                      {formatCurrency(monthlyIncome)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Expenses</div>
                    <div className="text-lg font-semibold text-red-600">
                      {formatCurrency(monthlyExpenses)}
                    </div>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t">
                  <div className="text-sm text-muted-foreground">Net</div>
                  <div className={`text-lg font-semibold ${
                    (monthlyIncome - monthlyExpenses) >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(monthlyIncome - monthlyExpenses)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
            <MonthlyChart transactions={transactions} />
            <ExpenseChart transactions={transactions} />
          </div>

          {/* Recent Activity */}
          <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
            <RecentTransactions transactions={transactions} />
            <DebtSummary debts={debts} />
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}