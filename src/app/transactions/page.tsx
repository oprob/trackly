'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getTransactions } from '@/lib/firestore';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { TransactionForm } from '@/components/transactions/TransactionForm';
import { TransactionList } from '@/components/transactions/TransactionList';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Download, Filter } from 'lucide-react';
import type { Transaction, TransactionType, PaymentMethod } from '@/types';

export default function TransactionsPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>();
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    search: '',
    type: 'all' as 'all' | TransactionType,
    method: 'all' as 'all' | PaymentMethod,
    category: 'all',
    dateFrom: '',
    dateTo: '',
  });

  const fetchTransactions = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await getTransactions(user.uid);
      setTransactions(data);
      setFilteredTransactions(data);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [user]);

  useEffect(() => {
    let filtered = transactions;

    if (filters.search) {
      filtered = filtered.filter(t => 
        t.notes?.toLowerCase().includes(filters.search.toLowerCase()) ||
        t.category.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.type !== 'all') {
      filtered = filtered.filter(t => t.type === filters.type);
    }

    if (filters.method !== 'all') {
      filtered = filtered.filter(t => t.method === filters.method);
    }

    if (filters.category !== 'all') {
      filtered = filtered.filter(t => t.category === filters.category);
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(t => new Date(t.date) >= new Date(filters.dateFrom));
    }

    if (filters.dateTo) {
      filtered = filtered.filter(t => new Date(t.date) <= new Date(filters.dateTo));
    }

    setFilteredTransactions(filtered);
  }, [transactions, filters]);

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingTransaction(undefined);
  };

  const handleFormSuccess = () => {
    fetchTransactions();
  };

  const exportToCSV = () => {
    if (filteredTransactions.length === 0) return;

    const headers = ['Date', 'Type', 'Amount', 'Method', 'Category', 'Notes'];
    const csvContent = [
      headers.join(','),
      ...filteredTransactions.map(t => [
        t.date,
        t.type,
        t.amount.toString(),
        t.method,
        t.category,
        t.notes ? `"${t.notes.replace(/"/g, '""')}"` : ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const categories = Array.from(new Set(transactions.map(t => t.category)));

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Transactions</h1>
            <p className="text-muted-foreground">Manage your income and expenses</p>
          </div>
          <div className="flex gap-2 flex-col sm:flex-row">
            <Button onClick={exportToCSV} variant="outline" disabled={filteredTransactions.length === 0} className="w-full sm:w-auto">
              <Download className="w-4 h-4 mr-2" />
              <span className="sm:inline">Export CSV</span>
              <span className="sm:hidden">Export</span>
            </Button>
            <Button onClick={() => setShowForm(true)} className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Add Transaction
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ₹{totalIncome.toLocaleString('en-IN')}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                ₹{totalExpenses.toLocaleString('en-IN')}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${
                totalIncome - totalExpenses >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                ₹{(totalIncome - totalExpenses).toLocaleString('en-IN')}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden"
            >
              {showFilters ? 'Hide' : 'Show'} Filters
            </Button>
          </CardHeader>
          <CardContent className={`${showFilters ? 'block' : 'hidden'} md:block`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div>
                <Input
                  placeholder="Search..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                />
              </div>

              <div>
                <Select
                  value={filters.type}
                  onValueChange={(value: 'all' | TransactionType) => 
                    setFilters(prev => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Select
                  value={filters.method}
                  onValueChange={(value: 'all' | PaymentMethod) => 
                    setFilters(prev => ({ ...prev, method: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Methods</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="bank">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Select
                  value={filters.category}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Input
                  type="date"
                  placeholder="From Date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                />
              </div>

              <div>
                <Input
                  type="date"
                  placeholder="To Date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <TransactionList
            transactions={filteredTransactions}
            onEdit={handleEdit}
            onRefresh={fetchTransactions}
          />
        )}

        <TransactionForm
          isOpen={showForm}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
          transaction={editingTransaction}
        />
      </div>
    </AuthGuard>
  );
}