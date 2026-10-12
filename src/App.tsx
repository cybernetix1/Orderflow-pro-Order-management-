import React, { useState } from 'react';
import { LayoutDashboard, Users, ShoppingCart, Loader2 } from 'lucide-react';
import { DataProvider, useData } from './components/DataProvider';
import Dashboard from './components/Dashboard';
import OrderManagement from './components/OrderManagement';
import RepManagement from './components/RepManagement';
import RepSalaryModal from './components/RepSalaryModal';
import { cn } from './lib/utils';

function AppContent() {
  const { reps, orders } = useData();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'reps'>('dashboard');
  const [selectedRep, setSelectedRep] = useState<any | null>(null);

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
          <div className="p-4 bg-gray-50 rounded-xl text-center">
            <p className="text-sm font-bold text-gray-900">Offline Mode</p>
            <p className="text-xs text-gray-500">Data stored on device</p>
          </div>
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
    <DataProvider>
      <AppContent />
    </DataProvider>
  );
}
