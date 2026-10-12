import React, { useState, useMemo } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { Plus, Send, CheckCircle, Trash2, Clock, AlertCircle } from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { format, isSameDay } from 'date-fns';
import { handleFirestoreError, OperationType } from '../lib/error-handler';

interface Order {
  id: string;
  repId: string;
  customerName: string;
  amount: number;
  status: 'pending' | 'sent_to_processor' | 'completed';
  createdAt: any;
}

interface Rep {
  id: string;
  name: string;
  color: string;
}

interface OrderManagementProps {
  orders: Order[];
  reps: Rep[];
}

export default function OrderManagement({ orders, reps }: OrderManagementProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newOrder, setNewOrder] = useState({ repId: '', customerName: '', amount: '' });

  const ordersToday = useMemo(() => {
    const today = new Date();
    return orders.filter(o => {
      if (!o.createdAt) return false;
      return isSameDay(o.createdAt.toDate(), today);
    });
  }, [orders]);

  const sentToday = ordersToday.filter(o => o.status !== 'pending').length;

  const handleAddOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrder.repId || !newOrder.customerName || !newOrder.amount) return;

    try {
      await addDoc(collection(db, 'orders'), {
        repId: newOrder.repId,
        customerName: newOrder.customerName,
        amount: parseFloat(newOrder.amount),
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setIsAdding(false);
      setNewOrder({ repId: '', customerName: '', amount: '' });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'orders');
    }
  };

  const updateStatus = async (orderId: string, status: Order['status']) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status,
        updatedAt: serverTimestamp(),
        ...(status === 'sent_to_processor' ? { sentToProcessorAt: serverTimestamp() } : {})
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}`);
    }
  };

  const deleteOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to delete this order?')) return;
    try {
      await deleteDoc(doc(db, 'orders', orderId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `orders/${orderId}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Order Management</h2>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 font-medium"
        >
          <Plus size={20} />
          <span>New Order</span>
        </button>
      </div>

      {/* Daily Tracker & Reminder */}
      <div className={cn(
        "p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-4",
        sentToday > 0 ? "bg-green-50 border-green-200" : "bg-orange-50 border-orange-200"
      )}>
        <div className="flex items-center space-x-3 text-center sm:text-left">
          <div className={cn(
            "p-2 rounded-full",
            sentToday > 0 ? "bg-green-100 text-green-600" : "bg-orange-100 text-orange-600"
          )}>
            {sentToday > 0 ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
          </div>
          <div>
            <p className="font-bold text-gray-900">Daily Tracking</p>
            <p className="text-sm text-gray-600">
              You've sent <span className="font-bold text-gray-900">{sentToday}</span> orders to the processor today.
            </p>
          </div>
        </div>
        {sentToday === 0 && ordersToday.length > 0 && (
          <div className="bg-white px-4 py-2 rounded-lg border border-orange-200 flex items-center space-x-2 animate-pulse">
            <Clock size={16} className="text-orange-500" />
            <span className="text-sm font-semibold text-orange-700">Reminder: Send today's orders!</span>
          </div>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleAddOrder} className="bg-gray-50 p-6 rounded-xl border border-gray-200 animate-in slide-in-from-top duration-200 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Representative</label>
              <select
                required
                className="w-full p-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={newOrder.repId}
                onChange={e => setNewOrder({ ...newOrder, repId: e.target.value })}
              >
                <option value="">Select Rep</option>
                {reps.map(rep => (
                  <option key={rep.id} value={rep.id}>{rep.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Customer Name</label>
              <input
                required
                type="text"
                placeholder="Enter customer name"
                className="w-full p-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={newOrder.customerName}
                onChange={e => setNewOrder({ ...newOrder, customerName: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Amount ($)</label>
              <input
                required
                type="number"
                step="0.01"
                placeholder="0.00"
                className="w-full p-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={newOrder.amount}
                onChange={e => setNewOrder({ ...newOrder, amount: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 text-gray-500 hover:text-gray-700 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md"
            >
              Save Order
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Rep</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis()).map(order => {
                const rep = reps.find(r => r.id === order.repId);
                return (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.createdAt ? format(order.createdAt.toDate(), 'MMM d, h:mm a') : '...'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{order.customerName}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: rep?.color || '#cbd5e1' }} />
                        <span className="text-sm text-gray-700">{rep?.name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {formatCurrency(order.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-bold uppercase tracking-tighter",
                        order.status === 'pending' ? "bg-yellow-100 text-yellow-700" :
                        order.status === 'sent_to_processor' ? "bg-blue-100 text-blue-700" :
                        "bg-green-100 text-green-700"
                      )}>
                        {order.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap space-x-2">
                      {order.status === 'pending' && (
                        <button
                          onClick={() => updateStatus(order.id, 'sent_to_processor')}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Send to Processor"
                        >
                          <Send size={18} />
                        </button>
                      )}
                      {order.status === 'sent_to_processor' && (
                        <button
                          onClick={() => updateStatus(order.id, 'completed')}
                          className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                          title="Mark Completed"
                        >
                          <CheckCircle size={18} />
                        </button>
                      )}
                      <button
                        onClick={() => deleteOrder(order.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete Order"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
