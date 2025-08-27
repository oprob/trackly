import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Transaction, Debt, Group, User } from '@/types';

export const COLLECTIONS = {
  USERS: 'users',
  TRANSACTIONS: 'transactions',
  DEBTS: 'debts',
  GROUPS: 'groups',
} as const;

export async function createUser(userData: Omit<User, 'createdAt'>) {
  const userRef = doc(db, COLLECTIONS.USERS, userData.id);
  const userDoc = {
    ...userData,
    createdAt: new Date().toISOString(),
  };
  
  await updateDoc(userRef, userDoc);
  return userDoc;
}

export async function getTransactions(userId: string) {
  const q = query(
    collection(db, COLLECTIONS.TRANSACTIONS),
    where('userId', '==', userId),
    orderBy('date', 'desc')
  );
  
  try {
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Transaction[];
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
}

export async function createTransaction(transactionData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) {
  const timestamp = new Date().toISOString();
  const transaction = {
    ...transactionData,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  
  const docRef = await addDoc(collection(db, COLLECTIONS.TRANSACTIONS), transaction);
  return { id: docRef.id, ...transaction };
}

export async function updateTransaction(id: string, updates: Partial<Transaction>) {
  const transactionRef = doc(db, COLLECTIONS.TRANSACTIONS, id);
  const updatedData = {
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  await updateDoc(transactionRef, updatedData);
  return updatedData;
}

export async function deleteTransaction(id: string) {
  const transactionRef = doc(db, COLLECTIONS.TRANSACTIONS, id);
  await deleteDoc(transactionRef);
}

export async function getDebts(userId: string) {
  const q = query(
    collection(db, COLLECTIONS.DEBTS),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  
  try {
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Debt[];
  } catch (error) {
    console.error('Error fetching debts:', error);
    return [];
  }
}

export async function createDebt(debtData: Omit<Debt, 'id' | 'createdAt' | 'updatedAt'>) {
  const timestamp = new Date().toISOString();
  const debt = {
    ...debtData,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  
  const docRef = await addDoc(collection(db, COLLECTIONS.DEBTS), debt);
  return { id: docRef.id, ...debt };
}

export async function updateDebt(id: string, updates: Partial<Debt>) {
  const debtRef = doc(db, COLLECTIONS.DEBTS, id);
  const updatedData = {
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  await updateDoc(debtRef, updatedData);
  return updatedData;
}

export async function deleteDebt(id: string) {
  const debtRef = doc(db, COLLECTIONS.DEBTS, id);
  await deleteDoc(debtRef);
}

export async function getUserGroups(userId: string) {
  // Query only groups created by the user for now
  const q = query(
    collection(db, COLLECTIONS.GROUPS),
    where('createdBy', '==', userId),
    orderBy('createdAt', 'desc')
  );
  
  try {
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Group[];
  } catch (error) {
    console.error('Error fetching user groups:', error);
    return [];
  }
}

export async function createGroup(groupData: Omit<Group, 'id' | 'createdAt' | 'updatedAt'>) {
  const timestamp = new Date().toISOString();
  const group = {
    ...groupData,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  
  const docRef = await addDoc(collection(db, COLLECTIONS.GROUPS), group);
  return { id: docRef.id, ...group };
}

export async function updateGroup(id: string, updates: Partial<Group>) {
  const groupRef = doc(db, COLLECTIONS.GROUPS, id);
  const updatedData = {
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  await updateDoc(groupRef, updatedData);
  return updatedData;
}