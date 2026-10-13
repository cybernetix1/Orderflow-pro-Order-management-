import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { formatCurrency, cn } from '../lib/utils';
import { parseISO, isSameDay } from 'date-fns';
import { Package, CheckCircle, Clock, ShoppingCart } from 'lucide-react';

interface Order {
  id: string;
  repId: string;
  amount: number;
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
  const chartData = useMemo(() => {
    const today = new Date();
    const counts = orders.reduce((acc, order) => {
      acc[order.repId] = (acc[order.repId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return reps.map(rep => {
      const todayOrders = orders.filter(o => {
        const date = parseISO(o.createdAt);
        return o.repId === rep.id && isSameDay(date, today);
      });

      return {
        name: rep.name,
        value: counts[rep.id] || 0,
        todayValue: todayOrders.length,
        color: rep.color,
        id: rep.id,
        rep: rep
      };
    }).filter(d => d.value > 0);
  }, [orders, reps]);

  const totalOrders = orders.length;
  const processingOrders = orders.filter(o => o.orderStatus === 'Processing').length;
  const completedOrders = orders.filter(o => o.orderStatus === 'Completed').length;

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex items-center space-x-6">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
            <ShoppingCart size={32} />
          </div>
          <div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Total Orders</p>
            <p className="text-4xl font-black text-gray-900 leading-none">{totalOrders}</p>
          </div>
        </div>
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex items-center space-x-6">
          <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center">
            <Clock size={32} />
          </div>
          <div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Processing</p>
            <p className="text-4xl font-black text-gray-900 leading-none">{processingOrders}</p>
          </div>
        </div>
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex items-center space-x-6">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center">
            <CheckCircle size={32} />
          </div>
          <div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Completed</p>
            <p className="text-4xl font-black text-gray-900 leading-none">{completedOrders}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pie Chart */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 min-h-[450px] flex flex-col">
          <h3 className="text-lg font-black text-gray-900 mb-8 uppercase tracking-tighter">Orders by Representative</h3>
          <div className="flex-1">
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
                  onClick={(data) => onRepClick(data.rep)}
                  className="cursor-pointer outline-none"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                   formatter={(value: number) => [`${value} Orders`, 'Volume']}
                   contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  formatter={(value) => <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <p className="text-center text-xs font-black text-blue-600 mt-4 uppercase tracking-widest animate-pulse">
            Click a slice to calculate salary
          </p>
        </div>

        {/* Rep List */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-black text-gray-900 mb-8 uppercase tracking-tighter">Performance Breakdown</h3>
          <div className="space-y-4">
            {chartData.sort((a, b) => b.value - a.value).map((data) => (
              <button
                key={data.id}
                onClick={() => onRepClick(data.rep)}
                className="w-full text-left p-5 rounded-2xl border border-gray-50 hover:border-blue-100 hover:bg-blue-50/30 transition-all group flex items-center justify-between"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-sm" style={{ backgroundColor: data.color }}>
                    {data.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-black text-gray-900">{data.name}</h4>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{data.todayValue} orders today</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-2xl font-black text-gray-900">{data.value}</p>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Orders</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
