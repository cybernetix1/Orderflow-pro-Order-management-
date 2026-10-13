import React, { useState } from 'react';
import { LayoutDashboard, Users, ShoppingCart, Loader2, Bell, Sun, Moon, Sparkles } from 'lucide-react';
import { DataProvider, useData } from './components/DataProvider';
import Dashboard from './components/Dashboard';
import OrderManagement from './components/OrderManagement';
import RepManagement from './components/RepManagement';
import RepSalaryModal from './components/RepSalaryModal';
import Reminders from './components/Reminders';
import BunnyPopups from './components/BunnyPopups';
import { cn } from './lib/utils';
import { BowIcon } from './components/icons/BowIcon';

function AppContent() {
  const { reps, orders, theme, setTheme } = useData();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'reps' | 'reminders'>('dashboard');
  const [selectedRep, setSelectedRep] = useState<any | null>(null);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'reminders', label: 'Reminders', icon: Bell },
    { id: 'reps', label: 'Team', icon: Users },
  ] as const;

  return (
    <div className={cn("min-h-screen transition-colors duration-500", theme)}>
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-card border-r border-subtle hidden md:flex flex-col fixed h-full z-20">
        <div className="p-8">
          <div className="flex items-center space-x-3 text-blue-600 dark:text-pink-500">
            <div className="p-3 bg-blue-100 dark:bg-pink-100 rounded-2xl shadow-sm relative group">
              <Sparkles size={24} />
              {theme === 'pink' && <BowIcon size={16} className="absolute -top-1 -right-1 text-pink-600 animate-bounce" />}
            </div>
            <span className="font-black text-2xl tracking-tighter text-main">CakeFlow</span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center space-x-4 px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all relative",
                activeTab === tab.id 
                  ? "bg-blue-600 dark:bg-pink-600 text-white shadow-xl shadow-blue-100 dark:shadow-none translate-x-2" 
                  : "text-gray-400 hover:text-main hover:bg-gray-50 dark:hover:bg-slate-800"
              )}
            >
              <div className="relative">
                <tab.icon size={20} />
                {theme === 'pink' && activeTab === tab.id && <BowIcon size={12} className="absolute -top-2 -right-2 text-white" />}
              </div>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-subtle space-y-6">
          <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-3xl relative overflow-hidden">
             {theme === 'pink' && <BowIcon size={14} className="absolute top-2 right-2 text-pink-200" />}
             <p className="text-[10px] font-black text-main uppercase tracking-widest">Active Device</p>
             <p className="text-[10px] font-bold text-gray-400">Offline Local Storage</p>
          </div>
          
          <div className="flex items-center justify-between p-2 bg-gray-100 dark:bg-slate-800 rounded-2xl">
             <button onClick={() => setTheme('light')} className={cn("p-2 rounded-xl transition-all", theme === 'light' ? "bg-white text-yellow-500 shadow-sm" : "text-gray-400")}><Sun size={18} /></button>
             <button onClick={() => setTheme('dark')} className={cn("p-2 rounded-xl transition-all", theme === 'dark' ? "bg-slate-700 text-blue-400 shadow-sm" : "text-gray-400")}><Moon size={18} /></button>
             <button onClick={() => setTheme('pink')} className={cn("p-2 rounded-xl transition-all", theme === 'pink' ? "bg-pink-500 text-white shadow-sm" : "text-gray-400")}><Sparkles size={18} /></button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 flex flex-col min-w-0 min-h-screen">
        <header className="h-20 bg-card/80 backdrop-blur-md border-b border-subtle flex items-center justify-between px-8 sticky top-0 z-10">
          <h2 className="text-xl font-black text-main uppercase tracking-widest">
            {activeTab === 'dashboard' ? 'Business Overview' : activeTab}
          </h2>
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs font-black text-main uppercase tracking-widest">{new Date().toLocaleDateString('en-US', { weekday: 'long' })}</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</span>
            </div>
            <div className="md:hidden flex space-x-2">
                <button onClick={() => setTheme('pink')} className="p-2 text-pink-500 bg-pink-50 rounded-xl"><Sparkles size={20} /></button>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto w-full">
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
          {activeTab === 'reminders' && (
            <Reminders />
          )}
        </div>
      </main>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card/90 backdrop-blur-xl border-t border-subtle px-4 py-3 flex items-center justify-between z-30">
         {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex flex-col items-center space-y-1 p-2 transition-all",
                activeTab === tab.id ? "text-blue-600 dark:text-pink-500 scale-110" : "text-gray-400"
              )}
            >
              <tab.icon size={22} />
              <span className="text-[8px] font-black uppercase tracking-tighter">{tab.label}</span>
            </button>
         ))}
      </nav>

      {selectedRep && (
        <RepSalaryModal
          rep={selectedRep}
          orders={orders}
          onClose={() => setSelectedRep(null)}
        />
      )}

      {theme === 'pink' && <BunnyPopups />}
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
