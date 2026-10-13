import React, { createContext, useContext, useEffect, useState } from 'react';

export interface Rep {
  id: string;
  name: string;
  email: string;
  color: string;
  commissionPerOrder?: number; // Base commission if applicable
}

export type FrostingType = 'Buttercream' | 'Whipped Cream';
export type DeliveryType = 'Room Delivery' | 'Pickup' | 'Delivery Pickup' | 'Wrong Delivery';
export type PaymentStatus = 'Pending' | 'Partial' | 'Paid';
export type OrderStatus = 'Pending' | 'Processing' | 'Ready' | 'Out for Delivery' | 'Completed';
export type OrderCategory = 'Cake' | 'Small Chops';

export interface Order {
  id: string;
  repId: string;
  category: OrderCategory;
  customerName: string;
  customerPhone?: string;
  // Cake specific
  cakeSize?: number;
  cakeLayers?: number;
  frostingType?: FrostingType;
  flavor?: string;
  customization?: string;
  inspirationImage?: string; // base64
  // Small Chops specific
  packageType?: string;
  
  amount: number;
  commission: number;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  deliveryType: DeliveryType;
  deliveryDate: string;
  specialRequirements: string;
  createdAt: string;
  updatedAt: string;
}

export interface Reminder {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  completed: boolean;
  orderId?: string;
  createdAt: string;
}

export type Theme = 'light' | 'dark' | 'pink';

interface DataContextType {
  reps: Rep[];
  orders: Order[];
  reminders: Reminder[];
  theme: Theme;
  setTheme: (theme: Theme) => void;
  addRep: (rep: Omit<Rep, 'id'>) => void;
  updateRep: (id: string, rep: Partial<Rep>) => void;
  deleteRep: (id: string) => void;
  addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'commission'>) => void;
  updateOrder: (id: string, order: Partial<Order>) => void;
  deleteOrder: (id: string) => void;
  addReminder: (reminder: Omit<Reminder, 'id' | 'createdAt' | 'completed'>) => void;
  toggleReminder: (id: string) => void;
  deleteReminder: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const STORAGE_KEY_REPS = 'cakeflow_reps_v2';
const STORAGE_KEY_ORDERS = 'cakeflow_orders_v2';
const STORAGE_KEY_REMINDERS = 'cakeflow_reminders_v2';
const STORAGE_KEY_THEME = 'cakeflow_theme_v2';

import { SMALL_CHOPS_PRICES } from '../lib/constants';

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [reps, setReps] = useState<Rep[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_REPS);
    return saved ? JSON.parse(saved) : [];
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_ORDERS);
    return saved ? JSON.parse(saved) : [];
  });

  const [reminders, setReminders] = useState<Reminder[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_REMINDERS);
    return saved ? JSON.parse(saved) : [];
  });

  const [theme, setThemeState] = useState<Theme>(() => {
    return (localStorage.getItem(STORAGE_KEY_THEME) as Theme) || 'light';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_REPS, JSON.stringify(reps));
  }, [reps]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_REMINDERS, JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_THEME, theme);
    document.documentElement.classList.remove('light', 'dark', 'pink');
    document.documentElement.classList.add(theme);
  }, [theme]);

  const setTheme = (newTheme: Theme) => setThemeState(newTheme);

  const calculateCommission = (order: Partial<Order>) => {
    let commission = 0;
    
    // Base product commission
    if (order.category === 'Cake') {
      commission = 1000;
    } else if (order.category === 'Small Chops' && order.packageType) {
      commission = SMALL_CHOPS_PRICES[order.packageType]?.commission || 0;
    }

    // Delivery type adjustments (as specified)
    // "Pickup or delivery pickup: ₦500" - Usually meant as additional or specific?
    // User says: "Pickup or delivery pickup: ₦500 per order", "Wrong delivery: ₦750 per order"
    // I'll assume these override the base if selected, or are added. 
    // Given the phrasing "Cake order: 1000", it sounds like these are categories.
    if (order.deliveryType === 'Pickup' || order.deliveryType === 'Delivery Pickup') {
      commission = 500;
    } else if (order.deliveryType === 'Wrong Delivery') {
      commission = 750;
    }

    return commission;
  };

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

  const addOrder = (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'commission'>) => {
    const now = new Date().toISOString();
    const commission = calculateCommission(order);
    const newOrder: Order = {
      ...order as Order,
      id: crypto.randomUUID(),
      commission,
      createdAt: now,
      updatedAt: now,
    };
    setOrders([...orders, newOrder]);
  };

  const updateOrder = (id: string, order: Partial<Order>) => {
    const now = new Date().toISOString();
    setOrders(orders.map(o => {
      if (o.id === id) {
        const updated = { ...o, ...order, updatedAt: now };
        updated.commission = calculateCommission(updated);
        return updated;
      }
      return o;
    }));
  };

  const deleteOrder = (id: string) => {
    setOrders(orders.filter(o => o.id !== id));
  };

  const addReminder = (reminder: Omit<Reminder, 'id' | 'createdAt' | 'completed'>) => {
    const newReminder: Reminder = {
      ...reminder,
      id: crypto.randomUUID(),
      completed: false,
      createdAt: new Date().toISOString(),
    };
    setReminders([...reminders, newReminder]);
  };

  const toggleReminder = (id: string) => {
    setReminders(reminders.map(r => r.id === id ? { ...r, completed: !r.completed } : r));
  };

  const deleteReminder = (id: string) => {
    setReminders(reminders.filter(r => r.id !== id));
  };

  return (
    <DataContext.Provider value={{ 
      reps, orders, reminders, theme, setTheme,
      addRep, updateRep, deleteRep, 
      addOrder, updateOrder, deleteOrder,
      addReminder, toggleReminder, deleteReminder 
    }}>
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
