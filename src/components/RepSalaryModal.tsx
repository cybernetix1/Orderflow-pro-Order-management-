import React, { useMemo, useState } from 'react';
import { X, Calculator, Calendar, TrendingUp, DollarSign } from 'lucide-react';
import { useData } from './DataProvider';
import { BowIcon } from './icons/BowIcon';
import { formatCurrency, cn } from '../lib/utils';
import { 
  format, 
  isWithinInterval, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  isSameDay, 
  eachDayOfInterval,
  subDays,
  startOfDay,
  endOfDay,
  parseISO
} from 'date-fns';

interface Order {
  id: string;
  repId: string;
  amount: number;
  commission: number;
  createdAt: string;
  orderStatus: string;
}

interface Rep {
  id: string;
  name: string;
}

interface RepSalaryModalProps {
  rep: Rep;
  orders: Order[];
  onClose: () => void;
}

export default function RepSalaryModal({ rep, orders, onClose }: RepSalaryModalProps) {
  const { theme } = useData();
  const [period, setPeriod] = useState<'week' | 'month' | 'custom' | 'all'>('week');
  const [customRange, setCustomRange] = useState({ 
    start: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd')
  });

  const repOrders = useMemo(() => {
    if (!rep || !orders) return [];
    return orders.filter(o => o.repId === rep.id);
  }, [orders, rep?.id]);

  const stats = useMemo(() => {
    const now = new Date();
    let filtered = repOrders;
    let range: { start: Date; end: Date } | null = null;

    try {
      if (period === 'week') {
        range = { start: startOfWeek(now), end: endOfWeek(now) };
      } else if (period === 'month') {
        range = { start: startOfMonth(now), end: endOfMonth(now) };
      } else if (period === 'custom') {
        range = { 
          start: startOfDay(new Date(customRange.start)), 
          end: endOfDay(new Date(customRange.end)) 
        };
      }

      if (range) {
        filtered = repOrders.filter(o => {
          const date = parseISO(o.createdAt);
          return isWithinInterval(date, range!);
        });
      }
    } catch (e) {
      console.error("Error filtering orders by range", e);
      filtered = [];
    }

    const totalOrders = filtered.length;
    const totalCommission = filtered.reduce((sum, o) => sum + (o.commission || 0), 0);
    const totalSales = filtered.reduce((sum, o) => sum + (o.amount || 0), 0);

    // Daily breakdown
    let dailyBreakdown: any[] = [];
    try {
      // Use oldest order as start for 'Lifetime' view, otherwise use the selected range
      const breakdownRange = range || { 
        start: repOrders.length > 0 ? parseISO(repOrders[0].createdAt) : subDays(now, 6), 
        end: now 
      };
      
      // Ensure start is not after end to prevent eachDayOfInterval from throwing
      const safeStart = breakdownRange.start > breakdownRange.end ? breakdownRange.end : breakdownRange.start;
      
      const days = eachDayOfInterval({ start: startOfDay(safeStart), end: endOfDay(breakdownRange.end) });
      dailyBreakdown = days.map(day => {
        const dayOrders = repOrders.filter(o => {
           try {
             return isSameDay(parseISO(o.createdAt), day);
           } catch(e) { return false; }
        });
        return {
          date: day,
          count: dayOrders.length,
          commission: dayOrders.reduce((sum, o) => sum + (o.commission || 0), 0)
        };
      }).reverse().slice(0, 31);
    } catch (e) {
      console.error("Error generating daily breakdown", e);
      dailyBreakdown = [];
    }

    return { totalOrders, totalCommission, totalSales, filtered, dailyBreakdown };
  }, [repOrders, period, customRange]);

  if (!rep) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-300 my-8 border border-subtle">
        {/* Header */}
        <div className="p-10 border-b border-subtle flex items-center justify-between bg-gradient-to-br from-blue-50/50 to-white dark:from-slate-800 dark:to-slate-900">
          <div className="flex items-center space-x-5">
            <div className="p-4 bg-gray-900 dark:bg-pink-600 text-white rounded-3xl shadow-xl shadow-gray-200 dark:shadow-none relative">
              {theme === 'pink' && <BowIcon size={16} className="absolute -top-1 -right-1 text-white" />}
              <Calculator size={32} />
            </div>
            <div>
              <h3 className="text-3xl font-black text-gray-900 dark:text-white leading-tight tracking-tighter">{rep.name}</h3>
              <p className="text-blue-600 dark:text-pink-400 font-black text-xs uppercase tracking-[0.2em]">Commission Tracker</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all p-3 bg-white dark:bg-slate-800 rounded-full shadow-sm hover:rotate-90">
            <X size={28} />
          </button>
        </div>

        <div className="p-10 space-y-10">
          {/* Period Selector */}
          <div className="space-y-6">
            <div className="flex p-2 bg-gray-100 dark:bg-slate-800 rounded-3xl">
              {(['week', 'month', 'custom', 'all'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={cn(
                    "flex-1 py-3 px-4 text-xs font-black rounded-2xl capitalize transition-all tracking-widest",
                    period === p ? "bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-xl" : "text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"
                  )}
                >
                  {p === 'all' ? 'Lifetime' : p}
                </button>
              ))}
            </div>

            {period === 'custom' && (
              <div className="flex items-center space-x-4 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex-1 space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Start</label>
                  <input 
                    type="date" 
                    value={customRange.start}
                    onChange={e => setCustomRange({...customRange, start: e.target.value})}
                    className="w-full p-4 bg-gray-50 dark:bg-slate-800 border border-subtle rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-sm font-black dark:text-white"
                  />
                </div>
                <div className="pt-6 font-black text-gray-300">/</div>
                <div className="flex-1 space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">End</label>
                  <input 
                    type="date" 
                    value={customRange.end}
                    onChange={e => setCustomRange({...customRange, end: e.target.value})}
                    className="w-full p-4 bg-gray-50 dark:bg-slate-800 border border-subtle rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-sm font-black dark:text-white"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Summary Stats */}
            <div className="space-y-8">
              <div className="bg-gray-50 dark:bg-slate-800/50 p-8 rounded-[32px] border border-subtle space-y-6 relative overflow-hidden group">
                {theme === 'pink' && <BowIcon size={24} className="absolute -top-1 -right-1 text-pink-400 opacity-30 group-hover:rotate-12 transition-transform" />}                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Total Orders</span>
                  <span className="font-black text-2xl text-gray-900 dark:text-white">{stats.totalOrders}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Total Sales</span>
                  <span className="font-black text-xl text-gray-900 dark:text-white">{formatCurrency(stats.totalSales)}</span>
                </div>
                <div className="pt-6 border-t border-subtle">
                  <p className="text-[10px] font-black text-blue-600 dark:text-pink-400 uppercase tracking-widest mb-2">Total Commission Earned</p>
                  <p className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter">{formatCurrency(stats.totalCommission)}</p>
                </div>
              </div>

              <div className="bg-gray-900 dark:bg-pink-600 p-8 rounded-[32px] text-white shadow-2xl dark:shadow-none flex items-center justify-between group overflow-hidden relative">
                <div className="relative z-10">
                  <p className="text-gray-400 dark:text-pink-100 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Efficiency</p>
                  <p className="text-2xl font-black tracking-tight">
                    {stats.totalOrders > 0 ? `${stats.totalOrders} items handled` : 'No activity found'}
                  </p>
                </div>
                <TrendingUp size={48} className="text-white/10 absolute -right-2 -bottom-2 group-hover:scale-110 transition-transform duration-500" />
              </div>
            </div>

            {/* Daily Breakdown */}
            <div className="space-y-6">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] flex items-center space-x-3">
                <span>Daily History</span>
                <div className="h-px flex-1 bg-gray-100 dark:bg-slate-800"></div>
              </h4>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-3 custom-scrollbar">
                {stats.dailyBreakdown.length > 0 ? stats.dailyBreakdown.map((day, i) => (
                  <div key={i} className="p-5 bg-white dark:bg-slate-800 border border-subtle rounded-2xl flex items-center justify-between group hover:border-blue-100 dark:hover:border-pink-500 transition-all">
                    <div>
                      <p className="text-sm font-black text-gray-900 dark:text-white">{format(day.date, 'MMM dd')}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{format(day.date, 'EEEE')}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <p className="text-xs font-black text-gray-900 dark:text-white">{formatCurrency(day.commission)}</p>
                        <p className="text-[10px] font-bold text-gray-400">{day.count} orders</p>
                      </div>
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center",
                        day.count > 0 ? "bg-blue-600 dark:bg-pink-500 text-white shadow-lg" : "bg-gray-100 dark:bg-slate-700 text-gray-400"
                      )}>
                        <DollarSign size={14} />
                      </div>
                    </div>
                  </div>
                )) : (
                  <p className="text-center text-gray-400 text-sm py-10">No data for this period</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-10 bg-gray-50 dark:bg-slate-800 border-t border-subtle flex justify-end">
          <button
            onClick={onClose}
            className="px-12 py-4 bg-gray-900 dark:bg-pink-600 text-white rounded-3xl font-black hover:bg-gray-800 dark:hover:bg-pink-700 transition-all shadow-2xl dark:shadow-none active:scale-95 uppercase tracking-widest text-xs"
          >
            Close Tracker
          </button>
        </div>
      </div>
    </div>
  );
}
