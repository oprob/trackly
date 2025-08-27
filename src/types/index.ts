export type TransactionType = 'income' | 'expense';
export type PaymentMethod = 'cash' | 'upi' | 'card' | 'bank';

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: TransactionType;
  method: PaymentMethod;
  category: string;
  notes?: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface Debt {
  id: string;
  userId: string;
  creditorName: string;
  creditorUserId?: string;
  amount: number;
  paidAmount?: number;
  description: string;
  type: 'i_owe' | 'they_owe_me';
  isSettled: boolean;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  members: GroupMember[];
  expenses: GroupExpense[];
  createdAt: string;
  updatedAt: string;
}

export interface GroupMember {
  userId: string;
  email: string;
  displayName: string;
  balance: number;
}

export interface GroupExpense {
  id: string;
  description: string;
  amount: number;
  paidBy: string;
  splitType: 'equal' | 'custom';
  splits: ExpenseSplit[];
  category: string;
  date: string;
  createdAt: string;
}

export interface ExpenseSplit {
  userId: string;
  amount: number;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: string;
}