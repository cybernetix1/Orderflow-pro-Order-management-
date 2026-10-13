import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Send, CheckCircle, Trash2, Clock, AlertCircle, MapPin, Package, CreditCard, ClipboardList, X, Users } from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { format, isSameDay, parseISO } from 'date-fns';
import { useData, Order, Rep, FrostingType, DeliveryType, PaymentStatus, OrderStatus } from './DataProvider';
import { CAKE_PRICES, CAKE_SIZES, CAKE_LAYERS, FROSTING_TYPES, DELIVERY_TYPES, PAYMENT_STATUSES, ORDER_STATUSES } from '../lib/constants';

interface OrderManagementProps {
  orders: Order[];
  reps: Rep[];
}

export default function OrderManagement({ orders, reps }: OrderManagementProps) {
  const { addOrder, updateOrder, deleteOrder } = useData();
  const [isAdding, setIsAdding] = useState(false);
  
  const [formData, setFormData] = useState({
    repId: '',
    customerName: '',
    customerPhone: '',
    cakeSize: 7,
    cakeLayers: 1,
    frostingType: 'Buttercream' as FrostingType,
    deliveryType: 'Pickup' as DeliveryType,
    deliveryDate: format(new Date(), 'yyyy-MM-dd'),
    paymentStatus: 'Pending' as PaymentStatus,
    orderStatus: 'Pending' as OrderStatus,
    specialRequirements: ''
  });

  const calculatedPrice = useMemo(() => {
    return CAKE_PRICES[formData.cakeSize]?.[formData.cakeLayers]?.[formData.frostingType] || 0;
  }, [formData.cakeSize, formData.cakeLayers, formData.frostingType]);

  const ordersToday = useMemo(() => {
    const today = new Date();
    return orders.filter(o => {
      if (!o.createdAt) return false;
      return isSameDay(parseISO(o.createdAt), today);
    });
  }, [orders]);

  const completedToday = ordersToday.filter(o => o.orderStatus === 'Completed').length;

  const handleAddOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.repId || !formData.customerName) return;

    addOrder({
      ...formData,
      amount: calculatedPrice,
    });
    setIsAdding(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      repId: '',
      customerName: '',
      customerPhone: '',
      cakeSize: 7,
      cakeLayers: 1,
      frostingType: 'Buttercream',
      deliveryType: 'Pickup',
      deliveryDate: format(new Date(), 'yyyy-MM-dd'),
      paymentStatus: 'Pending',
      orderStatus: 'Pending',
      specialRequirements: ''
    });
  };

  const updateStatus = (orderId: string, updates: Partial<Order>) => {
    updateOrder(orderId, updates);
  };

  const handleDelete = (orderId: string) => {
    if (!confirm('Are you sure you want to delete this order?')) return;
    deleteOrder(orderId);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Order Management</h2>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center space-x-2 px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all shadow-xl shadow-gray-200 font-bold"
        >
          {isAdding ? <X size={20} /> : <Plus size={20} />}
          <span>{isAdding ? 'Close' : 'New Cake Order'}</span>
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAddOrder} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl animate-in slide-in-from-top duration-300 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Customer & Rep Details */}
            <div className="space-y-6">
              <h3 className="text-sm font-black text-blue-600 uppercase tracking-widest flex items-center space-x-2">
                <Users size={16} />
                <span>Customer & Sales Rep</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase">Sales Rep</label>
                  <select
                    required
                    className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    value={formData.repId}
                    onChange={e => setFormData({ ...formData, repId: e.target.value })}
                  >
                    <option value="">Select Rep</option>
                    {reps.map(rep => (
                      <option key={rep.id} value={rep.id}>{rep.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase">Customer Name</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. John Doe"
                    className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    value={formData.customerName}
                    onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase">Customer Phone</label>
                  <input
                    type="tel"
                    placeholder="e.g. 08012345678"
                    className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    value={formData.customerPhone}
                    onChange={e => setFormData({ ...formData, customerPhone: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase">Delivery Date</label>
                  <input
                    required
                    type="date"
                    className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    value={formData.deliveryDate}
                    onChange={e => setFormData({ ...formData, deliveryDate: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Cake Customization */}
            <div className="space-y-6">
              <h3 className="text-sm font-black text-orange-600 uppercase tracking-widest flex items-center space-x-2">
                <Package size={16} />
                <span>Cake Details</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase">Size (Inches)</label>
                  <select
                    className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 font-medium"
                    value={formData.cakeSize}
                    onChange={e => setFormData({ ...formData, cakeSize: parseInt(e.target.value) })}
                  >
                    {CAKE_SIZES.map(size => <option key={size} value={size}>{size}"</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase">Layers</label>
                  <select
                    className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 font-medium"
                    value={formData.cakeLayers}
                    onChange={e => setFormData({ ...formData, cakeLayers: parseInt(e.target.value) })}
                  >
                    {CAKE_LAYERS.map(l => <option key={l} value={l}>{l} Layer{l > 1 ? 's' : ''}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase">Frosting</label>
                  <select
                    className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 font-medium"
                    value={formData.frostingType}
                    onChange={e => setFormData({ ...formData, frostingType: e.target.value as FrostingType })}
                  >
                    {FROSTING_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Delivery & Payment */}
            <div className="space-y-6">
              <h3 className="text-sm font-black text-purple-600 uppercase tracking-widest flex items-center space-x-2">
                <MapPin size={16} />
                <span>Logistics & Payment</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase">Delivery Mode</label>
                  <div className="flex p-1 bg-gray-100 rounded-xl">
                    {DELIVERY_TYPES.map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setFormData({ ...formData, deliveryType: t })}
                        className={cn(
                          "flex-1 py-2 px-3 text-sm font-bold rounded-lg transition-all",
                          formData.deliveryType === t ? "bg-white text-purple-600 shadow-sm" : "text-gray-500"
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase">Payment Status</label>
                  <select
                    className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                    value={formData.paymentStatus}
                    onChange={e => setFormData({ ...formData, paymentStatus: e.target.value as PaymentStatus })}
                  >
                    {PAYMENT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Special Requirements */}
            <div className="space-y-6">
              <h3 className="text-sm font-black text-gray-600 uppercase tracking-widest flex items-center space-x-2">
                <ClipboardList size={16} />
                <span>Special Requirements</span>
              </h3>
              <textarea
                placeholder="Type any special instructions here..."
                rows={3}
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-gray-400 font-medium resize-none"
                value={formData.specialRequirements}
                onChange={e => setFormData({ ...formData, specialRequirements: e.target.value })}
              />
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center sm:text-left">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Price</p>
              <p className="text-4xl font-black text-gray-900">{formatCurrency(calculatedPrice)}</p>
            </div>
            <div className="flex space-x-4 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => { setIsAdding(false); resetForm(); }}
                className="flex-1 sm:flex-none px-8 py-4 text-gray-500 font-bold hover:text-gray-700"
              >
                Discard
              </button>
              <button
                type="submit"
                className="flex-1 sm:flex-none px-12 py-4 bg-gray-900 text-white rounded-2xl font-black hover:bg-gray-800 transition-all shadow-2xl shadow-gray-200 active:scale-95"
              >
                Create Order
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Orders List */}
      <div className="space-y-4">
        {orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
            <Package className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-500 font-medium">No orders yet. Start by creating one!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(order => {
              const rep = reps.find(r => r.id === order.repId);
              return (
                <div key={order.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
                        <Package size={24} />
                      </div>
                      <div>
                        <div className="flex items-center space-x-3 mb-1">
                          <h3 className="font-black text-gray-900 text-lg">{order.customerName}</h3>
                          <span className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                            order.paymentStatus === 'Paid' ? "bg-green-100 text-green-700" :
                            order.paymentStatus === 'Partial' ? "bg-orange-100 text-orange-700" :
                            "bg-red-100 text-red-700"
                          )}>
                            {order.paymentStatus}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-4 text-xs font-bold text-gray-400 uppercase tracking-tighter">
                          <span className="flex items-center space-x-1">
                            <Clock size={12} />
                            <span>Ordered: {format(parseISO(order.createdAt), 'MMM dd')}</span>
                          </span>
                          <span className="flex items-center space-x-1 text-blue-600">
                            <MapPin size={12} />
                            <span>Due: {format(parseISO(order.deliveryDate), 'MMM dd')} ({order.deliveryType})</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: rep?.color }} />
                            <span>Rep: {rep?.name}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 lg:justify-end">
                      <div className="px-4 py-2 bg-gray-50 rounded-2xl">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Cake Spec</p>
                        <p className="text-sm font-black text-gray-900">{order.cakeSize}" {order.cakeLayers}L {order.frostingType}</p>
                      </div>
                      <div className="px-4 py-2 bg-gray-50 rounded-2xl">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Amount</p>
                        <p className="text-sm font-black text-gray-900">{formatCurrency(order.amount)}</p>
                      </div>
                      
                      <select
                        className={cn(
                          "px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest outline-none border-none cursor-pointer",
                          order.orderStatus === 'Completed' ? "bg-green-600 text-white shadow-lg shadow-green-100" :
                          order.orderStatus === 'Out for Delivery' ? "bg-blue-600 text-white shadow-lg shadow-blue-100" :
                          "bg-gray-100 text-gray-700"
                        )}
                        value={order.orderStatus}
                        onChange={e => updateStatus(order.id, { orderStatus: e.target.value as OrderStatus })}
                      >
                        {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>

                      <button
                        onClick={() => handleDelete(order.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                  
                  {order.specialRequirements && (
                    <div className="mt-4 p-4 bg-orange-50/50 rounded-2xl border border-orange-100/50">
                      <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-1 flex items-center space-x-1">
                        <ClipboardList size={10} />
                        <span>Requirements</span>
                      </p>
                      <p className="text-sm text-gray-700 font-medium italic">"{order.specialRequirements}"</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}


