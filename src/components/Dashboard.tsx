import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { formatCurrency, cn } from '../lib/utils';
import { parseISO, isSameDay } from 'date-fns';
import { Package, CheckCircle, Clock, ShoppingCart, TrendingUp } from 'lucide-react';
import { useData } from './DataProvider';
import { BowIcon } from './icons/BowIcon';

interface Order {
  id: string;
  repId: string;
  amount: number;
  commission: number;
  orderStatus: string;
  customerName: string;
  createdAt: string;
}

interface Rep {
  id: string;
  name: string;
  color: string;
  commissionPerOrder?: number;
}

interface DashboardProps {
  orders: Order[];
  reps: Rep[];
  onRepClick: (rep: Rep) => void;
}

export default function Dashboard({ orders, reps, onRepClick }: DashboardProps) {
  const { theme } = useData();
  const chartData = useMemo(() => {
    if (!orders || !reps) return [];
    const today = new Date();
    const counts = orders.reduce((acc, order) => {
      acc[order.repId] = (acc[order.repId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return reps.map(rep => {
      const repOrders = orders.filter(o => o.repId === rep.id);
      const todayOrders = repOrders.filter(o => {
        try {
          const date = parseISO(o.createdAt);
          return isSameDay(date, today);
        } catch (e) {
          return false;
        }
      });

      return {
        name: rep.name,
        value: counts[rep.id] || 0,
        todayValue: todayOrders.length,
        totalCommission: repOrders.reduce((sum, o) => sum + (o.commission || 0), 0),
        color: rep.color || '#cbd5e1',
        id: rep.id,
        rep: rep
      };
    }).filter(d => d.value > 0 || reps.length < 20); // Show all if up to 20 reps, else only active
  }, [orders, reps]);

  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const processingOrders = orders.filter(o => o.orderStatus === 'Processing').length;
    const completedOrders = orders.filter(o => o.orderStatus === 'Completed').length;
    const totalSales = orders.reduce((sum, o) => sum + (o.amount || 0), 0);
    return { totalOrders, processingOrders, completedOrders, totalSales };
  }, [orders]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card p-8 rounded-3xl shadow-sm border border-subtle flex items-center space-x-6 relative overflow-hidden group">
          {theme === 'pink' && <BowIcon size={18} className="absolute -top-1 -right-1 text-pink-400 group-hover:rotate-12 transition-transform" />}
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl flex items-center justify-center">
            <ShoppingCart size={32} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Orders</p>
            <p className="text-3xl font-black text-main leading-none">{stats.totalOrders}</p>
          </div>
        </div>
        <div className="bg-card p-8 rounded-3xl shadow-sm border border-subtle flex items-center space-x-6 relative overflow-hidden group">
          {theme === 'pink' && <BowIcon size={18} className="absolute -top-1 -right-1 text-pink-400 group-hover:rotate-12 transition-transform" />}
          <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-2xl flex items-center justify-center">
            <Clock size={32} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Processing</p>
            <p className="text-3xl font-black text-main leading-none">{stats.processingOrders}</p>
          </div>
        </div>
        <div className="bg-card p-8 rounded-3xl shadow-sm border border-subtle flex items-center space-x-6 relative overflow-hidden group">
          {theme === 'pink' && <BowIcon size={18} className="absolute -top-1 -right-1 text-pink-400 group-hover:rotate-12 transition-transform" />}
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-2xl flex items-center justify-center">
            <CheckCircle size={32} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Completed</p>
            <p className="text-3xl font-black text-main leading-none">{stats.completedOrders}</p>
          </div>
        </div>
        <div className="bg-card p-8 rounded-3xl shadow-sm border border-subtle flex items-center space-x-6 relative overflow-hidden group">
          {theme === 'pink' && <BowIcon size={18} className="absolute -top-1 -right-1 text-pink-400 group-hover:rotate-12 transition-transform" />}
          <div className="w-16 h-16 bg-pink-100 dark:bg-pink-900/30 text-pink-600 rounded-2xl flex items-center justify-center">
            <TrendingUp size={32} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Sales</p>
            <p className="text-xl font-black text-main leading-none truncate">{formatCurrency(stats.totalSales)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pie Chart */}
        <div className="bg-card p-8 rounded-3xl shadow-sm border border-subtle min-h-[450px] flex flex-col relative overflow-hidden">
          {theme === 'pink' && <BowIcon size={24} className="absolute top-4 right-4 text-pink-300 opacity-50" />}
          <h3 className="text-lg font-black text-main mb-8 uppercase tracking-tighter">Orders by Representative</h3>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={8}
                  dataKey="value"
                  onClick={(data) => {
                    const rep = data?.payload?.rep || data?.rep;
                    if (rep && rep.id) {
                      onRepClick(rep);
                    }
                  }}
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color} 
                      stroke="none" 
                      className="cursor-pointer outline-none hover:opacity-80 transition-opacity"
                    />
                  ))}
                </Pie>
                <Tooltip 
                   formatter={(value: any) => [`${value} Orders`, 'Volume']}
                   contentStyle={{ borderRadius: '16px', background: 'rgb(var(--card))', border: '1px solid rgb(var(--border))', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  formatter={(value) => <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <p className="text-center text-xs font-black text-blue-600 dark:text-pink-400 mt-4 uppercase tracking-widest animate-pulse">
            Click a slice or list item to view tracker
          </p>
        </div>

        {/* Rep Performance Breakdown */}
        <div className="bg-card p-8 rounded-3xl shadow-sm border border-subtle relative overflow-hidden">
          <h3 className="text-lg font-black text-main mb-8 uppercase tracking-tighter">Performance Breakdown</h3>
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {chartData.length > 0 ? [...chartData].sort((a, b) => b.value - a.value).map((data) => (
              <div
                key={data.id}
                className="w-full p-5 rounded-2xl border border-subtle hover:border-blue-100 dark:hover:border-pink-500 bg-white dark:bg-slate-900/50 transition-all group flex items-center justify-between relative overflow-hidden"
              >
                {theme === 'pink' && <BowIcon size={12} className="absolute -top-1 -right-1 text-pink-400 group-hover:scale-125 transition-transform" />}
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-sm" style={{ backgroundColor: data.color }}>
                    {data.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-black text-main">{data.name}</h4>
                    <div className="flex space-x-2">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{data.todayValue} today</span>
                      <span className="text-[10px] font-black text-blue-600 dark:text-pink-400 uppercase tracking-widest">Commission: {formatCurrency(data.totalCommission)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6">
                  <div className="text-right hidden sm:block">
                    <p className="text-2xl font-black text-main">{data.value}</p>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Orders</p>
                  </div>
                  <button
                    onClick={() => onRepClick(data.rep)}
                    className="px-4 py-2 bg-gray-100 dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-gray-900 hover:text-white dark:hover:bg-pink-600 transition-all active:scale-95"
                  >
                    View Tracker
                  </button>
                </div>
              </div>
            )) : (
              <div className="text-center py-20 text-gray-400 font-bold uppercase tracking-widest text-sm">
                No performance data yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
