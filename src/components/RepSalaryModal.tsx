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
  parseISO,
  isValid
} from 'date-fns';

const safeFormatDate = (dateStr: string | undefined, formatStr: string) => {
  if (!dateStr) return 'No Date';
  try {
    const date = parseISO(dateStr);
    if (!isValid(date)) return 'Invalid Date';
    return format(date, formatStr);
  } catch (e) {
    return 'Invalid Date';
  }
};

interface Order {
  id: string;
  repId: string;
  amount: number;
  commission: number;
  createdAt: string;
  orderStatus: string;
  includeCake?: boolean;
  cakeQuantity?: number;
  includeSmallChops?: boolean;
  smallChopsQuantity?: number;
  customerName: string;
  customerRoomNumber?: string;
  deliveryType?: string;
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
  const [period, setPeriod] = useState<'week' | 'month' | 'custom' | 'all'>('month');
  const [customRange, setCustomRange] = useState({ 
    start: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd')
  });

  const repOrders = useMemo(() => {
    if (!rep?.id || !orders) return [];
    return orders.filter(o => o && o.repId === rep.id);
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
        const s = new Date(customRange.start);
        const e = new Date(customRange.end);
        if (!isNaN(s.getTime()) && !isNaN(e.getTime())) {
          range = { 
            start: startOfDay(s), 
            end: endOfDay(e) 
          };
        }
      }

      if (range) {
        filtered = repOrders.filter(o => {
          try {
            const date = parseISO(o.createdAt);
            return isWithinInterval(date, range!);
          } catch(e) { return false; }
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
      // Limit history to last 60 days to prevent performance issues
      const maxHistory = subDays(now, 60);
      let startDate = range?.start;
      
      if (!startDate) {
        if (repOrders.length > 0) {
          try {
            const firstOrderDate = parseISO(repOrders[0].createdAt);
            startDate = firstOrderDate < maxHistory ? maxHistory : firstOrderDate;
          } catch(e) {
            startDate = subDays(now, 6);
          }
        } else {
          startDate = subDays(now, 6);
        }
      }

      const endDate = range?.end || now;
      
      // Ensure dates are valid
      if (startDate && endDate && !isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
        const safeStart = startDate > endDate ? endDate : startDate;
        const days = eachDayOfInterval({ start: startOfDay(safeStart), end: endOfDay(endDate) });
        
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
      }
    } catch (e) {
      console.error("Error generating daily breakdown", e);
      dailyBreakdown = [];
    }

    return { totalOrders, totalCommission, totalSales, filtered, dailyBreakdown };
  }, [repOrders, period, customRange]);

  if (!rep || !rep.id) return null;

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

            {/* Order History */}
            <div className="space-y-6">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] flex items-center space-x-3">
                <span>{period === 'all' ? 'Full Order History' : 'Period Activity'}</span>
                <div className="h-px flex-1 bg-gray-100 dark:bg-slate-800"></div>
              </h4>
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-3 custom-scrollbar">
                {stats.filtered.length > 0 ? [...stats.filtered].sort((a, b) => {
                  const dateA = new Date(a.createdAt || 0).getTime();
                  const dateB = new Date(b.createdAt || 0).getTime();
                  return dateB - dateA;
                }).map((order) => {
                  // Calculate breakdown for display
                  const cakeComm = order.includeCake ? 1000 * (order.cakeQuantity || 1) : 0;
                  const scComm = (order.commission || 0) - cakeComm - (order.deliveryType !== 'Pickup' ? 500 : 0); // Rough estimate for display
                  
                  return (
                    <div key={order.id} className="p-5 bg-white dark:bg-slate-800 border border-subtle rounded-[24px] space-y-3 group hover:border-blue-200 dark:hover:border-pink-500 transition-all shadow-sm">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <p className="text-sm font-black text-gray-900 dark:text-white">{order.customerName}</p>
                            {order.customerRoomNumber && (
                              <span className="px-2 py-0.5 bg-blue-50 dark:bg-slate-700 text-blue-600 dark:text-pink-400 text-[8px] font-black rounded-full uppercase tracking-widest">
                                Room {order.customerRoomNumber}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {order.includeCake && (
                              <span className="flex items-center text-[9px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
                                Cake ({order.cakeQuantity}x)
                              </span>
                            )}
                            {order.includeSmallChops && (
                              <span className="flex items-center text-[9px] font-bold text-orange-600 bg-orange-50 dark:bg-orange-900/30 px-2 py-0.5 rounded-full">
                                Small Chops ({order.smallChopsQuantity}x)
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{safeFormatDate(order.createdAt, 'MMM dd, yyyy • p')}</p>
                        </div>
                        <div className="text-right flex flex-col items-end">
                          <div className="bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-xl mb-1 group-hover:scale-105 transition-transform">
                            <p className="text-sm font-black text-green-600 dark:text-green-400">+{formatCurrency(order.commission)}</p>
                          </div>
                          <p className={cn(
                            "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md",
                            order.orderStatus === 'Completed' || order.orderStatus === 'Delivered' ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" :
                            order.orderStatus === 'In Progress' ? "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300" :
                            "bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-300"
                          )}>{order.orderStatus}</p>
                        </div>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="flex flex-col items-center justify-center py-20 bg-gray-50 dark:bg-slate-800/30 rounded-[32px] border border-dashed border-subtle">
                    <p className="text-gray-400 text-xs uppercase tracking-[0.2em] font-black opacity-50">No activity recorded</p>
                  </div>
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
