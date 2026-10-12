import React, { useMemo, useState } from 'react';
import { X, Calculator, Calendar, TrendingUp, ChevronRight } from 'lucide-react';
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
  endOfDay
} from 'date-fns';

interface Order {
  id: string;
  repId: string;
  amount: number;
  createdAt: any; // Firestore Timestamp
  status: string;
}

interface Rep {
  id: string;
  name: string;
  commissionPerOrder?: number;
  dailyGoal?: number;
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
        const date = o.createdAt?.toDate();
        return date && isWithinInterval(date, range!);
      });
    }

    const count = filtered.length;
    const commission = rep.commissionPerOrder || 50;
    const totalSalary = count * commission;

    // Daily breakdown for the selected range (or last 7 days if 'all')
    const breakdownRange = range || { start: subDays(now, 6), end: now };
    const days = eachDayOfInterval(breakdownRange);
    
    const dailyBreakdown = days.map(day => {
      const dayOrders = repOrders.filter(o => o.createdAt && isSameDay(o.createdAt.toDate(), day));
      return {
        date: day,
        count: dayOrders.length,
        goal: rep.dailyGoal || 5
      };
    }).reverse();

    return { count, commission, totalSalary, filtered, dailyBreakdown };
  }, [repOrders, period, customRange, rep.commissionPerOrder, rep.dailyGoal]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200 my-8">
        {/* Header */}
        <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-white">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-200">
              <Calculator size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-gray-900 leading-tight">{rep.name}</h3>
              <p className="text-blue-600 font-semibold text-sm uppercase tracking-wider">Salary Breakdown</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-2 bg-white rounded-full shadow-sm">
            <X size={24} />
          </button>
        </div>

        <div className="p-8 space-y-8">
          {/* Period Selector */}
          <div className="space-y-4">
            <div className="flex p-1.5 bg-gray-100 rounded-2xl">
              {(['week', 'month', 'custom', 'all'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={cn(
                    "flex-1 py-2.5 px-4 text-sm font-bold rounded-xl capitalize transition-all",
                    period === p ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  {p === 'all' ? 'All Time' : p}
                </button>
              ))}
            </div>

            {period === 'custom' && (
              <div className="flex items-center space-x-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <input 
                  type="date" 
                  value={customRange.start}
                  onChange={e => setCustomRange({...customRange, start: e.target.value})}
                  className="flex-1 p-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                />
                <span className="text-gray-400 font-bold">to</span>
                <input 
                  type="date" 
                  value={customRange.end}
                  onChange={e => setCustomRange({...customRange, end: e.target.value})}
                  className="flex-1 p-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Summary Stats */}
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Orders Found</span>
                  <span className="font-black text-xl text-gray-900">{stats.count}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Commission / Order</span>
                  <span className="font-black text-xl text-gray-900">{formatCurrency(stats.commission)}</span>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">Total Payout</p>
                  <p className="text-4xl font-black text-gray-900">{formatCurrency(stats.totalSalary)}</p>
                </div>
              </div>

              <div className="bg-blue-600 p-6 rounded-3xl text-white shadow-xl shadow-blue-100 flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-xs font-bold uppercase tracking-widest mb-1">Goal Status</p>
                  <p className="text-2xl font-black">
                    {stats.count >= (rep.dailyGoal || 5) ? 'Goal Met! 🎉' : 'Keep Going! 💪'}
                  </p>
                </div>
                <TrendingUp size={32} className="text-blue-400" />
              </div>
            </div>

            {/* Daily Breakdown */}
            <div className="space-y-4">
              <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center space-x-2">
                <span>Daily Breakdown</span>
                <div className="h-px flex-1 bg-gray-100"></div>
              </h4>
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {stats.dailyBreakdown.map((day, i) => {
                  const progress = Math.min((day.count / day.goal) * 100, 100);
                  return (
                    <div key={i} className="p-4 bg-white border border-gray-100 rounded-2xl hover:border-blue-200 transition-colors group">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-gray-700">{format(day.date, 'MMM dd, EEE')}</span>
                        <span className="text-xs font-black text-gray-900">{day.count} / {day.goal}</span>
                      </div>
                      <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full transition-all duration-500 rounded-full",
                            progress >= 100 ? "bg-green-500" : progress >= 50 ? "bg-blue-500" : "bg-orange-500"
                          )}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-xl shadow-gray-200 active:scale-95"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
