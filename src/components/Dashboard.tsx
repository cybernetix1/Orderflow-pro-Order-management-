import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';
import { formatCurrency, cn } from '../lib/utils';
import { parseISO, isSameDay, format, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { Package, CheckCircle, Clock, ShoppingCart, TrendingUp, Users, Calendar, Wallet } from 'lucide-react';
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
    const inProgressOrders = orders.filter(o => o.orderStatus === 'In Progress').length;
    const completedOrders = orders.filter(o => o.orderStatus === 'Completed' || o.orderStatus === 'Delivered').length;
    const totalSales = orders.reduce((sum, o) => sum + (o.amount || 0), 0);
    return { totalOrders, inProgressOrders, completedOrders, totalSales };
  }, [orders]);

  const customerStats = useMemo(() => {
    if (!orders) return [];
    
    const statsMap = orders.reduce((acc, order) => {
      const name = order.customerName || 'Anonymous';
      if (!acc[name]) {
        acc[name] = {
          name,
          totalSpend: 0,
          orderCount: 0,
          lastVisit: order.createdAt
        };
      }
      
      acc[name].totalSpend += (order.amount || 0);
      acc[name].orderCount += 1;
      
      try {
        const orderDate = new Date(order.createdAt);
        const lastVisitDate = new Date(acc[name].lastVisit);
        if (orderDate > lastVisitDate) {
          acc[name].lastVisit = order.createdAt;
        }
      } catch (e) {
        // Fallback
      }
      
      return acc;
    }, {} as Record<string, { name: string; totalSpend: number; orderCount: number; lastVisit: string }>);

    return Object.values(statsMap)
      .sort((a, b) => b.totalSpend - a.totalSpend)
      .slice(0, 10); // Show top 10
  }, [orders]);

  const monthlyData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    const data = months.map(name => ({ name, total: 0 }));

    orders.forEach(order => {
      try {
        const date = parseISO(order.createdAt);
        if (date.getFullYear() === currentYear) {
          const monthIndex = date.getMonth();
          data[monthIndex].total += (order.amount || 0);
        }
      } catch (e) {
        // Skip invalid dates
      }
    });

    return data;
  }, [orders]);

  const weeklyData = useMemo(() => {
    const today = new Date();
    const start = startOfWeek(today, { weekStartsOn: 1 }); // Monday
    const end = endOfWeek(today, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start, end });

    return days.map(day => {
      const count = orders.filter(order => {
        try {
          return isSameDay(parseISO(order.createdAt), day);
        } catch (e) {
          return false;
        }
      }).length;

      return {
        name: format(day, 'EEE'),
        count
      };
    });
  }, [orders]);

  const topRepStats = useMemo(() => {
    if (!orders || !reps) return [];
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const statsMap = orders.reduce((acc, order) => {
      try {
        const orderDate = parseISO(order.createdAt);
        if (orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear) {
          acc[order.repId] = (acc[order.repId] || 0) + (order.amount || 0);
        }
      } catch (e) {
        // Skip
      }
      return acc;
    }, {} as Record<string, number>);

    return reps
      .map(rep => ({
        ...rep,
        monthlyVolume: statsMap[rep.id] || 0,
        orderCount: orders.filter(o => {
          try {
            const d = parseISO(o.createdAt);
            return o.repId === rep.id && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
          } catch(e) { return false; }
        }).length
      }))
      .filter(rep => rep.monthlyVolume > 0)
      .sort((a, b) => b.monthlyVolume - a.monthlyVolume)
      .slice(0, 6); // Show top 6
  }, [orders, reps]);

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
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">In Progress</p>
            <p className="text-3xl font-black text-main leading-none">{stats.inProgressOrders}</p>
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
                  onClick={(data: any) => {
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

      {/* Monthly Sales Volume Bar Chart */}
      <div className="bg-card p-8 rounded-3xl shadow-sm border border-subtle relative overflow-hidden">
        {theme === 'pink' && <BowIcon size={24} className="absolute top-4 right-4 text-pink-300 opacity-30" />}
        <h3 className="text-lg font-black text-main mb-8 uppercase tracking-tighter">Monthly Sales Volume ({new Date().getFullYear()})</h3>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(var(--border), 0.1)" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'currentColor', fontSize: 10, fontWeight: 900 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'currentColor', fontSize: 10, fontWeight: 900 }}
                tickFormatter={(value) => `₦${value >= 1000 ? (value / 1000).toFixed(0) + 'k' : value}`}
              />
              <Tooltip 
                cursor={{ fill: 'currentColor', opacity: 0.05, radius: 10 }}
                contentStyle={{ 
                  borderRadius: '16px', 
                  background: 'rgb(var(--card))', 
                  border: '1px solid rgb(var(--border))', 
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', 
                  padding: '12px' 
                }}
                itemStyle={{ fontWeight: 900, fontSize: '12px' }}
                formatter={(value: any) => [formatCurrency(value), 'Total Sales']}
              />
              <Bar 
                dataKey="total" 
                fill={theme === 'pink' ? '#ec4899' : '#2563eb'} 
                radius={[8, 8, 0, 0]}
                barSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Weekly Order Count Line Chart */}
      <div className="bg-card p-8 rounded-3xl shadow-sm border border-subtle relative overflow-hidden">
        {theme === 'pink' && <BowIcon size={24} className="absolute top-4 right-4 text-pink-300 opacity-30" />}
        <h3 className="text-lg font-black text-main mb-8 uppercase tracking-tighter">Orders This Week</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weeklyData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(var(--border), 0.1)" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'currentColor', fontSize: 10, fontWeight: 900 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'currentColor', fontSize: 10, fontWeight: 900 }}
                allowDecimals={false}
              />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '16px', 
                  background: 'rgb(var(--card))', 
                  border: '1px solid rgb(var(--border))', 
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', 
                  padding: '12px' 
                }}
                itemStyle={{ fontWeight: 900, fontSize: '12px' }}
                formatter={(value: any) => [value, 'Orders']}
              />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke={theme === 'pink' ? '#ec4899' : '#2563eb'} 
                strokeWidth={4}
                dot={{ fill: theme === 'pink' ? '#ec4899' : '#2563eb', strokeWidth: 2, r: 6, stroke: '#fff' }}
                activeDot={{ r: 8, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Performing Reps (Current Month) */}
      <div className="bg-card p-8 rounded-3xl shadow-sm border border-subtle relative overflow-hidden">
        {theme === 'pink' && <BowIcon size={24} className="absolute top-4 right-4 text-pink-300 opacity-30" />}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-lg font-black text-main uppercase tracking-tighter">Top Performers ({format(new Date(), 'MMMM')})</h3>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Based on monthly sales volume</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-2xl">
            <TrendingUp className="text-green-600 dark:text-green-400" size={20} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topRepStats.length > 0 ? topRepStats.map((rep, index) => (
            <div 
              key={rep.id}
              className="bg-white dark:bg-slate-900/40 p-6 rounded-2xl border border-subtle group hover:border-green-200 dark:hover:border-green-500/50 transition-all relative overflow-hidden cursor-pointer"
              onClick={() => onRepClick(rep as any)}
            >
              <div className="flex items-center justify-between mb-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-sm"
                  style={{ backgroundColor: rep.color }}
                >
                  {rep.name.charAt(0)}
                </div>
                <div className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                  index === 0 ? "bg-yellow-100 text-yellow-700" :
                  index === 1 ? "bg-slate-100 text-slate-700" :
                  index === 2 ? "bg-orange-100 text-orange-700" :
                  "bg-gray-100 text-gray-600"
                )}>
                  Rank #{index + 1}
                </div>
              </div>

              <h4 className="font-black text-main text-lg mb-1 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                {rep.name}
              </h4>
              
              <div className="space-y-3 mt-4">
                <div className="flex justify-between items-end">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Monthly Sales</p>
                  <p className="text-lg font-black text-main leading-none">{formatCurrency(rep.monthlyVolume)}</p>
                </div>
                
                <div className="w-full bg-gray-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 rounded-full transition-all duration-1000"
                    style={{ width: `${(rep.monthlyVolume / (topRepStats[0].monthlyVolume || 1)) * 100}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                  <span className="text-gray-400">{rep.orderCount} Orders</span>
                  <span className="text-green-600 dark:text-green-400">View Details →</span>
                </div>
              </div>
            </div>
          )) : (
            <div className="col-span-full text-center py-12 text-gray-400 font-bold uppercase tracking-widest text-sm border-2 border-dashed border-subtle rounded-3xl">
              No sales activity for {format(new Date(), 'MMMM')} yet
            </div>
          )}
        </div>
      </div>

      {/* Top Spending Customers */}
      <div className="bg-card p-8 rounded-3xl shadow-sm border border-subtle relative overflow-hidden">
        {theme === 'pink' && <BowIcon size={24} className="absolute top-4 right-4 text-pink-300 opacity-30" />}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-lg font-black text-main uppercase tracking-tighter">Top Spending Customers</h3>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Based on total order volume</p>
          </div>
          <div className="bg-blue-50 dark:bg-pink-900/20 p-3 rounded-2xl">
            <Users className="text-blue-600 dark:text-pink-400" size={20} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {customerStats.length > 0 ? customerStats.map((customer, index) => (
            <div 
              key={customer.name}
              className="bg-white dark:bg-slate-900/40 p-6 rounded-2xl border border-subtle group hover:border-blue-200 dark:hover:border-pink-500/50 transition-all relative overflow-hidden"
            >
              {index < 3 && (
                <div className="absolute top-0 right-0 p-2">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-black",
                    index === 0 ? "bg-yellow-100 text-yellow-700" :
                    index === 1 ? "bg-slate-100 text-slate-700" :
                    "bg-orange-100 text-orange-700"
                  )}>
                    #{index + 1}
                  </div>
                </div>
              )}
              
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-xl font-black text-main">
                  {customer.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-black text-main group-hover:text-blue-600 dark:group-hover:text-pink-400 transition-colors">{customer.name}</h4>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{customer.orderCount} {customer.orderCount === 1 ? 'Order' : 'Orders'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-1 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                    <Wallet size={10} />
                    <span>Total Volume</span>
                  </div>
                  <p className="text-sm font-black text-main">{formatCurrency(customer.totalSpend)}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center space-x-1 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                    <Calendar size={10} />
                    <span>Last Visit</span>
                  </div>
                  <p className="text-sm font-black text-main">
                    {(() => {
                      try {
                        return format(parseISO(customer.lastVisit), 'MMM d, yyyy');
                      } catch (e) {
                        return 'N/A';
                      }
                    })()}
                  </p>
                </div>
              </div>
            </div>
          )) : (
            <div className="col-span-full text-center py-12 text-gray-400 font-bold uppercase tracking-widest text-sm border-2 border-dashed border-subtle rounded-3xl">
              No customer data available yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
