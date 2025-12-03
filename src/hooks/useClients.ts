import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Client, Transaction, TransactionCategory, FinancialSummary, DigitalMarketingCost } from '@/types';
import { toast } from '@/hooks/use-toast';

export const useClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<TransactionCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch Clients
  useEffect(() => {
    const q = query(collection(db, 'clients'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const clientsData: Client[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          companySplit: {
            ...data.companySplit,
            digitalMarketingCosts: (data.companySplit?.digitalMarketingCosts || []).map((cost: any) => ({
              ...cost,
              date: cost.date?.toDate() || new Date(),
            })),
          },
        } as Client;
      });
      setClients(clientsData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching clients:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Fetch Transactions
  useEffect(() => {
    const q = query(collection(db, 'transactions'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const transactionsData: Transaction[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      } as Transaction));
      setTransactions(transactionsData);
    }, (error) => {
      console.error('Error fetching transactions:', error);
    });

    return () => unsubscribe();
  }, []);

  // Fetch Categories
  useEffect(() => {
    const q = query(collection(db, 'transactionCategories'), orderBy('name', 'asc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const categoriesData: TransactionCategory[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      } as TransactionCategory));
      setCategories(categoriesData);
    }, (error) => {
      console.error('Error fetching categories:', error);
    });

    return () => unsubscribe();
  }, []);

  // Create Client
  const createClient = async (clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const now = Timestamp.now();
      
      // Clean the data - remove undefined/null values that Firebase doesn't accept
      const cleanData = Object.fromEntries(
        Object.entries(clientData).filter(([_, v]) => v !== undefined)
      );
      
      const dataToSave = {
        ...cleanData,
        companySplit: {
          ...clientData.companySplit,
          digitalMarketingCosts: clientData.companySplit.digitalMarketingCosts.map(cost => ({
            ...cost,
            date: Timestamp.fromDate(cost.date),
          })),
        },
        createdAt: now,
        updatedAt: now,
      };
      
      await addDoc(collection(db, 'clients'), dataToSave);
      
      toast({
        title: "Client Added",
        description: `${clientData.businessName} has been added successfully.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create client",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Update Client
  const updateClient = async (id: string, data: Partial<Client>) => {
    try {
      const updateData: any = {
        ...data,
        updatedAt: Timestamp.now(),
      };
      
      if (data.companySplit?.digitalMarketingCosts) {
        updateData.companySplit = {
          ...data.companySplit,
          digitalMarketingCosts: data.companySplit.digitalMarketingCosts.map(cost => ({
            ...cost,
            date: Timestamp.fromDate(cost.date),
          })),
        };
      }
      
      await updateDoc(doc(db, 'clients', id), updateData);
      toast({
        title: "Client Updated",
        description: "Client information has been updated.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update client",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Delete Client
  const deleteClient = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'clients', id));
      toast({
        title: "Client Deleted",
        description: "Client has been removed.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete client",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Add Digital Marketing Cost to Client
  const addDigitalMarketingCost = async (clientId: string, cost: Omit<DigitalMarketingCost, 'id'>) => {
    try {
      const client = clients.find(c => c.id === clientId);
      if (!client) throw new Error('Client not found');
      
      const newCost: DigitalMarketingCost = {
        ...cost,
        id: Date.now().toString(),
      };
      
      const updatedCosts = [...(client.companySplit.digitalMarketingCosts || []), newCost];
      
      await updateClient(clientId, {
        companySplit: {
          ...client.companySplit,
          digitalMarketingCosts: updatedCosts,
        },
      });
      
      toast({
        title: "Cost Added",
        description: "Digital marketing cost has been added.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add cost",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Create Transaction
  const createTransaction = async (transactionData: Omit<Transaction, 'id' | 'createdAt'>) => {
    try {
      await addDoc(collection(db, 'transactions'), {
        ...transactionData,
        createdAt: Timestamp.now(),
      });
      
      // Save category if it's new
      const existingCategory = categories.find(c => c.name.toLowerCase() === transactionData.category.toLowerCase());
      if (!existingCategory) {
        await addDoc(collection(db, 'transactionCategories'), {
          name: transactionData.category,
          createdAt: Timestamp.now(),
        });
      }
      
      toast({
        title: transactionData.type === 'income' ? "Income Added" : "Expense Added",
        description: `${transactionData.category}: ₹${transactionData.amount}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create transaction",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Update Transaction
  const updateTransaction = async (id: string, data: { type: string; category: string; amount: number; description: string }) => {
    try {
      await updateDoc(doc(db, 'transactions', id), {
        ...data,
        updatedAt: Timestamp.now(),
      });
      
      // Save category if it's new
      const existingCategory = categories.find(c => c.name.toLowerCase() === data.category.toLowerCase());
      if (!existingCategory) {
        await addDoc(collection(db, 'transactionCategories'), {
          name: data.category,
          createdAt: Timestamp.now(),
        });
      }
      
      toast({
        title: "Transaction Updated",
        description: `${data.category}: ₹${data.amount}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update transaction",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Delete Transaction
  const deleteTransaction = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'transactions', id));
      toast({
        title: "Transaction Deleted",
        description: "Transaction has been removed.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete transaction",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Calculate Financial Summary
  const getFinancialSummary = (): FinancialSummary => {
    const totalProjectCosts = clients.reduce((sum, client) => sum + client.totalProjectCost, 0);
    const totalWorkSplit = totalProjectCosts * 0.5;
    const totalCompanySplit = totalProjectCosts * 0.5;
    
    const totalDigitalMarketingCosts = clients.reduce((sum, client) => {
      return sum + (client.companySplit.digitalMarketingCosts || []).reduce((costSum, cost) => costSum + cost.amount, 0);
    }, 0);
    
    const totalTravellingCharges = clients.reduce((sum, client) => sum + (client.companySplit.travellingCharges || 0), 0);
    
    const totalOtherIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalOtherExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalRevenue = totalProjectCosts + totalOtherIncome;
    const netProfit = totalCompanySplit - totalDigitalMarketingCosts - totalTravellingCharges - totalOtherExpenses;
    
    return {
      totalRevenue,
      totalProjectCosts,
      totalWorkSplit,
      totalCompanySplit,
      totalDigitalMarketingCosts,
      totalTravellingCharges,
      totalOtherIncome,
      totalOtherExpenses,
      netProfit,
    };
  };

  return {
    clients,
    transactions,
    categories,
    loading,
    createClient,
    updateClient,
    deleteClient,
    addDigitalMarketingCost,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    getFinancialSummary,
  };
};
