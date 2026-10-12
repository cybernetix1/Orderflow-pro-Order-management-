import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { formatCurrency } from '../lib/utils';
import { parseISO } from 'date-fns';

interface Order {
  id: string;
  repId: string;
  amount: number;
  status: string;
  customerName: string;
  createdAt: string;
}

interface Rep {
  id: string;
  name: string;
  color: string;
  commissionPerOrder?: number;
  dailyGoal?: number;
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
        return o.repId === rep.id && date.toDateString() === today.toDateString();
      });

      return {
        name: rep.name,
        value: counts[rep.id] || 0,
        todayValue: todayOrders.length,
        goal: rep.dailyGoal || 5,
        color: rep.color,
        id: rep.id,
        rep: rep
      };
    }).filter(d => d.value > 0);
  }, [orders, reps]);

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const processedOrders = orders.filter(o => o.status === 'sent_to_processor' || o.status === 'completed').length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500">Total Orders</p>
          <p className="text-3xl font-bold text-gray-900">{totalOrders}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500">Pending</p>
          <p className="text-3xl font-bold text-yellow-600">{pendingOrders}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500">Sent to Processor</p>
          <p className="text-3xl font-bold text-green-600">{processedOrders}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-h-[400px]">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Orders by Representative</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  onClick={(data) => onRepClick(data.rep)}
                  className="cursor-pointer"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                   formatter={(value: number) => [`${value} Orders`, 'Volume']}
                   contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <p className="text-center text-sm text-gray-500 mt-2 italic">
            Click a slice to calculate salary
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Representative Breakdown</h3>
          <div className="space-y-4">
            {chartData.sort((a, b) => b.value - a.value).map((data) => {
              const progress = Math.min((data.todayValue / data.goal) * 100, 100);
              return (
                <button
                  key={data.id}
                  onClick={() => onRepClick(data.rep)}
                  className="w-full text-left p-4 rounded-xl border border-gray-50 hover:border-blue-100 hover:bg-blue-50/30 transition-all group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: data.color }} />
                      <span className="font-bold text-gray-900">{data.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{data.todayValue} / {data.goal} Goal Today</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-700 rounded-full ${
                          progress >= 100 ? 'bg-green-500' : progress >= 50 ? 'bg-blue-500' : 'bg-orange-500'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                      <span>{data.value} Total Orders</span>
                      <span className={progress >= 100 ? "text-green-600" : ""}>
                        {progress >= 100 ? 'Goal Met!' : `${Math.round(progress)}% of daily goal`}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
