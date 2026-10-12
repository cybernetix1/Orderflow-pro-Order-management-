import React, { useState, useEffect } from 'react';
import { db } from './lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { LayoutDashboard, Users, ShoppingCart, LogOut, Loader2, LogIn } from 'lucide-react';
import { AuthProvider, useAuth } from './components/AuthProvider';
import Dashboard from './components/Dashboard';
import OrderManagement from './components/OrderManagement';
import RepManagement from './components/RepManagement';
import RepSalaryModal from './components/RepSalaryModal';
import { cn } from './lib/utils';
import { handleFirestoreError, OperationType } from './lib/error-handler';

function AppContent() {
  const { user, loading, isAdmin, signIn, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'reps'>('dashboard');
  const [orders, setOrders] = useState<any[]>([]);
  const [reps, setReps] = useState<any[]>([]);
  const [selectedRep, setSelectedRep] = useState<any | null>(null);

  useEffect(() => {
    if (!user) return;

    const ordersQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubOrders = onSnapshot(ordersQuery, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'orders'));

    const repsQuery = query(collection(db, 'reps'));
    const unsubReps = onSnapshot(repsQuery, (snapshot) => {
      setReps(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'reps'));

    return () => {
      unsubOrders();
      unsubReps();
    };
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
            <LayoutDashboard size={40} />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">OrderFlow Pro</h1>
            <p className="text-gray-500">Sign in to manage your orders and representatives.</p>
          </div>
          <button
            onClick={signIn}
            className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg shadow-gray-200"
          >
            <LogIn size={20} />
            <span>Sign in with Google</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 hidden md:flex flex-col">
        <div className="p-6">
          <div className="flex items-center space-x-3 text-blue-600">
            <div className="p-2 bg-blue-100 rounded-xl">
              <LayoutDashboard size={24} />
            </div>
            <span className="font-black text-xl tracking-tight text-gray-900">OrderFlow</span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={cn(
              "w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-colors",
              activeTab === 'dashboard' ? "bg-blue-50 text-blue-600" : "text-gray-500 hover:bg-gray-50"
            )}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={cn(
              "w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-colors",
              activeTab === 'orders' ? "bg-blue-50 text-blue-600" : "text-gray-500 hover:bg-gray-50"
            )}
          >
            <ShoppingCart size={20} />
            <span>Orders</span>
          </button>
          <button
            onClick={() => setActiveTab('reps')}
            className={cn(
              "w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-colors",
              activeTab === 'reps' ? "bg-blue-50 text-blue-600" : "text-gray-500 hover:bg-gray-50"
            )}
          >
            <Users size={20} />
            <span>Representatives</span>
          </button>
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl mb-4">
            <img src={user.photoURL || ''} className="w-10 h-10 rounded-lg" alt="" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">{user.displayName}</p>
              <p className="text-xs text-gray-500 truncate">{isAdmin ? 'Administrator' : 'Staff'}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 md:px-8 sticky top-0 z-10">
          <h2 className="text-lg font-bold text-gray-900 capitalize">
            {activeTab === 'dashboard' ? 'Overview' : activeTab}
          </h2>
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-500">
              <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
            </div>
            <button className="md:hidden p-2 text-gray-500">
              <Users size={24} onClick={() => setActiveTab('reps')} />
            </button>
          </div>
        </header>

        <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && (
            <Dashboard 
              orders={orders} 
              reps={reps} 
              onRepClick={setSelectedRep}
            />
          )}
          {activeTab === 'orders' && (
            <OrderManagement orders={orders} reps={reps} />
          )}
          {activeTab === 'reps' && (
            <RepManagement reps={reps} />
          )}
        </div>
      </main>

      {selectedRep && (
        <RepSalaryModal
          rep={selectedRep}
          orders={orders}
          onClose={() => setSelectedRep(null)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
