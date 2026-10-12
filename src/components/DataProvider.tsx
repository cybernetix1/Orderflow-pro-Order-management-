import React, { createContext, useContext, useEffect, useState } from 'react';

export interface Rep {
  id: string;
  name: string;
  email: string;
  color: string;
  commissionPerOrder: number;
  dailyGoal?: number;
}

export interface Order {
  id: string;
  repId: string;
  customerName: string;
  amount: number;
  status: 'pending' | 'sent_to_processor' | 'completed';
  createdAt: string; // ISO string for local storage
  updatedAt: string;
  sentToProcessorAt?: string;
}

interface DataContextType {
  reps: Rep[];
  orders: Order[];
  addRep: (rep: Omit<Rep, 'id'>) => void;
  updateRep: (id: string, rep: Partial<Rep>) => void;
  deleteRep: (id: string) => void;
  addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateOrder: (id: string, order: Partial<Order>) => void;
  deleteOrder: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const STORAGE_KEY_REPS = 'orderflow_reps';
const STORAGE_KEY_ORDERS = 'orderflow_orders';

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [reps, setReps] = useState<Rep[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_REPS);
    return saved ? JSON.parse(saved) : [];
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_ORDERS);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_REPS, JSON.stringify(reps));
  }, [reps]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(orders));
  }, [orders]);

  const addRep = (rep: Omit<Rep, 'id'>) => {
    const newRep = { ...rep, id: crypto.randomUUID() };
    setReps([...reps, newRep]);
  };

  const updateRep = (id: string, rep: Partial<Rep>) => {
    setReps(reps.map(r => r.id === id ? { ...r, ...rep } : r));
  };

  const deleteRep = (id: string) => {
    setReps(reps.filter(r => r.id !== id));
  };

  const addOrder = (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newOrder: Order = {
      ...order,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    setOrders([...orders, newOrder]);
  };

  const updateOrder = (id: string, order: Partial<Order>) => {
    const now = new Date().toISOString();
    setOrders(orders.map(o => o.id === id ? { 
      ...o, 
      ...order, 
      updatedAt: now,
      ...(order.status === 'sent_to_processor' ? { sentToProcessorAt: now } : {})
    } : o));
  };

  const deleteOrder = (id: string) => {
    setOrders(orders.filter(o => o.id !== id));
  };

  return (
    <DataContext.Provider value={{ reps, orders, addRep, updateRep, deleteRep, addOrder, updateOrder, deleteOrder }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
