import React, { useMemo, useState } from 'react';
import { X, Calculator, Calendar, TrendingUp } from 'lucide-react';
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
  createdAt: string;
  orderStatus: string;
}

interface Rep {
  id: string;
  name: string;
  commissionPerOrder?: number;
}

interface RepSalaryModalProps {
  rep: Rep;
  orders: Order[];
  onClose: () => void;
}

export default function RepSalaryModal({ rep, orders, onClose }: RepSalaryModalProps) {
  const [period, setPeriod] = useState<'week' | 'month' | 'custom' | 'all'>('week');
  const [customRange, setCustomRange] = useState({ 
    start: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd')
  });

  const repOrders = useMemo(() => {
    return orders.filter(o => o.repId === rep.id);
  }, [orders, rep.id]);

  const stats = useMemo(() => {
    const now = new Date();
    let filtered = repOrders;
    let range: { start: Date; end: Date } | null = null;

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

    const count = filtered.length;
    const commission = rep.commissionPerOrder || 1000;
    const totalSalary = count * commission;

    // Daily breakdown
    const breakdownRange = range || { 
      start: repOrders.length > 0 ? parseISO(repOrders[repOrders.length - 1].createdAt) : subDays(now, 6), 
      end: now 
    };
    
    let days: Date[] = [];
    try {
      days = eachDayOfInterval(breakdownRange);
    } catch (e) {
      days = [now];
    }

    const dailyBreakdown = days.map(day => {
      const dayOrders = repOrders.filter(o => isSameDay(parseISO(o.createdAt), day));
      return {
        date: day,
        count: dayOrders.length,
      };
    }).reverse().slice(0, 31);

    return { count, commission, totalSalary, filtered, dailyBreakdown };
  }, [repOrders, period, customRange, rep.commissionPerOrder]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-300 my-8">
        {/* Header */}
        <div className="p-10 border-b border-gray-100 flex items-center justify-between bg-gradient-to-br from-blue-50/50 to-white">
          <div className="flex items-center space-x-5">
            <div className="p-4 bg-gray-900 text-white rounded-3xl shadow-xl shadow-gray-200">
              <Calculator size={32} />
            </div>
            <div>
              <h3 className="text-3xl font-black text-gray-900 leading-tight tracking-tighter">{rep.name}</h3>
              <p className="text-blue-600 font-black text-xs uppercase tracking-[0.2em]">Salary Calculator</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900 transition-all p-3 bg-white rounded-full shadow-sm hover:rotate-90">
            <X size={28} />
          </button>
        </div>

        <div className="p-10 space-y-10">
          {/* Period Selector */}
          <div className="space-y-6">
            <div className="flex p-2 bg-gray-100 rounded-3xl">
              {(['week', 'month', 'custom', 'all'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={cn(
                    "flex-1 py-3 px-4 text-xs font-black rounded-2xl capitalize transition-all tracking-widest",
                    period === p ? "bg-white text-gray-900 shadow-xl" : "text-gray-400 hover:text-gray-600"
                  )}
                >
                  {p === 'all' ? 'Life' : p}
                </button>
              ))}
            </div>

            {period === 'custom' && (
              <div className="flex items-center space-x-4 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex-1 space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Start Date</label>
                  <input 
                    type="date" 
                    value={customRange.start}
                    onChange={e => setCustomRange({...customRange, start: e.target.value})}
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-sm font-black"
                  />
                </div>
                <div className="pt-6 font-black text-gray-300">/</div>
                <div className="flex-1 space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">End Date</label>
                  <input 
                    type="date" 
                    value={customRange.end}
                    onChange={e => setCustomRange({...customRange, end: e.target.value})}
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-sm font-black"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Summary Stats */}
            <div className="space-y-8">
              <div className="bg-gray-50 p-8 rounded-[32px] border border-gray-100 space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Total Orders</span>
                  <span className="font-black text-2xl text-gray-900">{stats.count}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Commission</span>
                  <span className="font-black text-2xl text-gray-900">{formatCurrency(stats.commission)}</span>
                </div>
                <div className="pt-6 border-t border-gray-200">
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">Total Salary Earned</p>
                  <p className="text-5xl font-black text-gray-900 tracking-tighter">{formatCurrency(stats.totalSalary)}</p>
                </div>
              </div>

              <div className="bg-gray-900 p-8 rounded-[32px] text-white shadow-2xl shadow-gray-200 flex items-center justify-between group overflow-hidden relative">
                <div className="relative z-10">
                  <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Performance</p>
                  <p className="text-2xl font-black tracking-tight">
                    {stats.count > 0 ? `${stats.count} orders delivered` : 'No orders in range'}
                  </p>
                </div>
                <TrendingUp size={48} className="text-gray-800 absolute -right-2 -bottom-2 group-hover:scale-110 transition-transform duration-500" />
              </div>
            </div>

            {/* Daily Breakdown */}
            <div className="space-y-6">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] flex items-center space-x-3">
                <span>Timeline</span>
                <div className="h-px flex-1 bg-gray-100"></div>
              </h4>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-3 custom-scrollbar">
                {stats.dailyBreakdown.map((day, i) => (
                  <div key={i} className="p-5 bg-white border border-gray-100 rounded-2xl flex items-center justify-between group hover:border-blue-100 transition-all">
                    <div>
                      <p className="text-sm font-black text-gray-900">{format(day.date, 'MMM dd')}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{format(day.date, 'EEEE')}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm",
                        day.count > 0 ? "bg-blue-600 text-white shadow-lg shadow-blue-100" : "bg-gray-100 text-gray-400"
                      )}>
                        {day.count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="p-10 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-12 py-4 bg-gray-900 text-white rounded-3xl font-black hover:bg-gray-800 transition-all shadow-2xl shadow-gray-200 active:scale-95 uppercase tracking-widest text-xs"
          >
            Close Calculator
          </button>
        </div>
      </div>
    </div>
  );
}
