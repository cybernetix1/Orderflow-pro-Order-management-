import React, { useState, useMemo, useRef } from 'react';
import { Plus, Send, CheckCircle, Trash2, Clock, AlertCircle, MapPin, Package, CreditCard, ClipboardList, X, Users, Image as ImageIcon, Sparkles, ChevronRight, Cake, Search, Filter } from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { format, isSameDay, parseISO } from 'date-fns';
import { useData, Order, Rep, FrostingType, DeliveryType, PaymentStatus, OrderStatus } from './DataProvider';
import { CAKE_PRICES, CAKE_SIZES, CAKE_LAYERS, FROSTING_TYPES, DELIVERY_TYPES, PAYMENT_STATUSES, ORDER_STATUSES, CAKE_FLAVORS, SMALL_CHOPS_PRICES, DELIVERY_COSTS } from '../lib/constants';

import { BowIcon } from './icons/BowIcon';

interface OrderManagementProps {
  orders: Order[];
  reps: Rep[];
}

const getStatusConfig = (status: OrderStatus) => {
  switch (status) {
    case 'Pending':
      return { icon: Clock, color: 'text-gray-500', bg: 'bg-gray-100', border: 'border-gray-200' };
    case 'In Progress':
      return { icon: Sparkles, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-100' };
    case 'Completed':
      return { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50', border: 'border-green-100' };
    case 'Delivered':
      return { icon: Send, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100' };
    default:
      return { icon: Clock, color: 'text-gray-500', bg: 'bg-gray-100', border: 'border-gray-200' };
  }
};

export default function OrderManagement({ orders, reps }: OrderManagementProps) {
  const { addOrder, updateOrder, deleteOrder, theme } = useData();
  const [isAdding, setIsAdding] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    repId: '',
    includeCake: true,
    includeSmallChops: false,
    customerName: '',
    customerPhone: '',
    customerRoomNumber: '',
    // Cake
    cakeSize: 7,
    cakeLayers: 1,
    cakeQuantity: 1,
    frostingType: 'Buttercream' as FrostingType,
    flavors: [] as string[],
    customization: '',
    inspirationImage: '',
    // Small Chops
    packageType: Object.keys(SMALL_CHOPS_PRICES)[0],
    smallChopsQuantity: 1,
    
    deliveryType: 'Pickup' as DeliveryType,
    deliveryDate: format(new Date(), 'yyyy-MM-dd'),
    paymentStatus: 'Pending' as PaymentStatus,
    orderStatus: 'Pending' as OrderStatus,
    specialRequirements: '',
    notes: ''
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterRep, setFilterRep] = useState<string>('all');

  const calculatedPrice = useMemo(() => {
    let cakePrice = 0;
    if (formData.includeCake) {
      cakePrice = (CAKE_PRICES[formData.cakeSize]?.[formData.cakeLayers]?.[formData.frostingType] || 0) * formData.cakeQuantity;
    }

    let smallChopsPrice = 0;
    if (formData.includeSmallChops) {
      smallChopsPrice = (SMALL_CHOPS_PRICES[formData.packageType]?.price || 0) * formData.smallChopsQuantity;
    }
    
    const delivery = DELIVERY_COSTS[formData.deliveryType] || 0;
    return cakePrice + smallChopsPrice + delivery;
  }, [formData.includeCake, formData.includeSmallChops, formData.cakeSize, formData.cakeLayers, formData.frostingType, formData.cakeQuantity, formData.packageType, formData.smallChopsQuantity, formData.deliveryType]);

  const ordersToday = useMemo(() => {
    const today = new Date();
    return orders.filter(o => {
      try {
        return isSameDay(parseISO(o.createdAt), today);
      } catch (e) { return false; }
    });
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return orders
      .filter(order => {
        const matchesSearch = 
          order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (order.customerRoomNumber?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
          (order.specialRequirements?.toLowerCase() || '').includes(searchTerm.toLowerCase());
        
        const matchesStatus = filterStatus === 'all' || order.orderStatus === filterStatus;
        const matchesRep = filterRep === 'all' || order.repId === filterRep;

        return matchesSearch && matchesStatus && matchesRep;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders, searchTerm, filterStatus, filterRep]);

  const sentToday = ordersToday.filter(o => o.orderStatus !== 'Pending').length;

  const handleAddOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.repId || !formData.customerName) return;

    addOrder({
      ...formData,
      amount: calculatedPrice,
      deliveryCost: DELIVERY_COSTS[formData.deliveryType] || 0,
    } as any);
    setIsAdding(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      repId: '',
      includeCake: true,
      includeSmallChops: false,
      customerName: '',
      customerPhone: '',
      customerRoomNumber: '',
      cakeSize: 7,
      cakeLayers: 1,
      cakeQuantity: 1,
      frostingType: 'Buttercream',
      flavors: [],
      customization: '',
      inspirationImage: '',
      packageType: Object.keys(SMALL_CHOPS_PRICES)[0],
      smallChopsQuantity: 1,
      deliveryType: 'Pickup',
      deliveryDate: format(new Date(), 'yyyy-MM-dd'),
      paymentStatus: 'Pending',
      orderStatus: 'Pending',
      specialRequirements: '',
      notes: ''
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, inspirationImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const updateStatus = (orderId: string, updates: Partial<Order>) => {
    updateOrder(orderId, updates);
  };

  const handleDelete = (orderId: string) => {
    if (!confirm('Are you sure you want to delete this order?')) return;
    deleteOrder(orderId);
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-black text-main tracking-tight uppercase">Order Management</h2>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center space-x-2 px-6 py-3 bg-gray-900 dark:bg-pink-600 text-white rounded-2xl hover:bg-gray-800 dark:hover:bg-pink-700 transition-all shadow-xl dark:shadow-none font-bold relative"
        >
          {theme === 'pink' && <BowIcon size={12} className="absolute -top-1 -right-1 text-white" />}
          {isAdding ? <X size={20} /> : <Plus size={20} />}
          <span>{isAdding ? 'Close Panel' : 'Create New Order'}</span>
        </button>
      </div>

      {/* Daily Status Banner */}
      <div className={cn(
        "p-6 rounded-3xl border flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden transition-all",
        sentToday > 0 ? "bg-green-50 dark:bg-green-900/10 border-green-100" : "bg-orange-50 dark:bg-orange-900/10 border-orange-100"
      )}>
        {theme === 'pink' && <BowIcon size={20} className="absolute -top-1 -right-1 text-pink-400 opacity-30" />}
        <div className="flex items-center space-x-4 relative z-10">
          <div className={cn(
            "p-3 rounded-2xl shadow-sm",
            sentToday > 0 ? "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300" : "bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300"
          )}>
            {sentToday > 0 ? <CheckCircle size={28} /> : <AlertCircle size={28} />}
          </div>
          <div>
            <p className="font-black text-gray-900 dark:text-white uppercase text-xs tracking-widest">Daily Fulfillment</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-bold">
              You've processed <span className="font-black text-gray-900 dark:text-white underline decoration-2">{sentToday}</span> orders today.
            </p>
          </div>
        </div>
        {sentToday === 0 && ordersToday.length > 0 && (
          <div className="bg-white dark:bg-slate-800 px-6 py-2 rounded-2xl border border-orange-200 dark:border-orange-800 flex items-center space-x-3 animate-bounce relative z-10">
            <Sparkles size={18} className="text-orange-500" />
            <span className="text-xs font-black text-orange-700 dark:text-orange-300 uppercase tracking-widest">Action Required!</span>
          </div>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleAddOrder} className="bg-card p-10 rounded-[40px] border border-subtle shadow-2xl animate-in slide-in-from-top duration-500 space-y-10 relative overflow-hidden">
          {/* Product Selection */}
          <div className="flex justify-center flex-col items-center space-y-4">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Select Products Included</p>
            <div className="flex p-2 bg-gray-100 dark:bg-slate-800 rounded-3xl w-full max-w-md">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, includeCake: !formData.includeCake })}
                className={cn(
                  "flex-1 py-3 px-6 text-xs font-black rounded-2xl capitalize transition-all tracking-[0.2em]",
                  formData.includeCake ? "bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-xl" : "text-gray-400 hover:text-gray-600"
                )}
              >
                Cake
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, includeSmallChops: !formData.includeSmallChops })}
                className={cn(
                  "flex-1 py-3 px-6 text-xs font-black rounded-2xl capitalize transition-all tracking-[0.2em]",
                  formData.includeSmallChops ? "bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-xl" : "text-gray-400 hover:text-gray-600"
                )}
              >
                Small Chops
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Core Info */}
            <div className="space-y-8">
              <h3 className="text-xs font-black text-blue-600 dark:text-pink-400 uppercase tracking-[0.3em] flex items-center space-x-3">
                <Users size={18} />
                <span>Basic Information</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Sales Rep</label>
                  <select
                    required
                    className="w-full p-4 bg-gray-50 dark:bg-slate-800 border border-subtle rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold dark:text-white"
                    value={formData.repId}
                    onChange={e => setFormData({ ...formData, repId: e.target.value })}
                  >
                    <option value="">Select Rep</option>
                    {reps.map(rep => <option key={rep.id} value={rep.id}>{rep.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Customer Name</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. John Doe"
                    className="w-full p-4 bg-gray-50 dark:bg-slate-800 border border-subtle rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold dark:text-white"
                    value={formData.customerName}
                    onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Room Number</label>
                  <input
                    type="text"
                    placeholder="e.g. Room 302"
                    className="w-full p-4 bg-gray-50 dark:bg-slate-800 border border-subtle rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold dark:text-white"
                    value={formData.customerRoomNumber}
                    onChange={e => setFormData({ ...formData, customerRoomNumber: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Delivery Date</label>
                  <input
                    required
                    type="date"
                    className="w-full p-4 bg-gray-50 dark:bg-slate-800 border border-subtle rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold dark:text-white"
                    value={formData.deliveryDate}
                    onChange={e => setFormData({ ...formData, deliveryDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Delivery Type</label>
                  <select
                    className="w-full p-4 bg-gray-50 dark:bg-slate-800 border border-subtle rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold dark:text-white"
                    value={formData.deliveryType}
                    onChange={e => setFormData({ ...formData, deliveryType: e.target.value as DeliveryType })}
                  >
                    {DELIVERY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Product Configuration */}
            <div className="space-y-8 lg:col-span-1">
              {formData.includeCake && (
                <div className="space-y-6 animate-in slide-in-from-right duration-300">
                  <h3 className="text-xs font-black text-orange-600 dark:text-orange-400 uppercase tracking-[0.3em] flex items-center space-x-3">
                    <Cake size={18} />
                    <span>Cake Configurator</span>
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Size</label>
                      <select
                        className="w-full p-4 bg-gray-50 dark:bg-slate-800 border border-subtle rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 font-bold dark:text-white"
                        value={formData.cakeSize}
                        onChange={e => setFormData({ ...formData, cakeSize: parseInt(e.target.value) })}
                      >
                        {CAKE_SIZES.map(s => <option key={s} value={s}>{s}"</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Layers</label>
                      <select
                        className="w-full p-4 bg-gray-50 dark:bg-slate-800 border border-subtle rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 font-bold dark:text-white"
                        value={formData.cakeLayers}
                        onChange={e => setFormData({ ...formData, cakeLayers: parseInt(e.target.value) })}
                      >
                        {CAKE_LAYERS.map(l => <option key={l} value={l}>{l}L</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Frosting</label>
                      <select
                        className="w-full p-4 bg-gray-50 dark:bg-slate-800 border border-subtle rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 font-bold dark:text-white"
                        value={formData.frostingType}
                        onChange={e => setFormData({ ...formData, frostingType: e.target.value as FrostingType })}
                      >
                        {FROSTING_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Qty</label>
                      <select
                        className="w-full p-4 bg-gray-50 dark:bg-slate-800 border border-subtle rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 font-bold dark:text-white"
                        value={formData.cakeQuantity}
                        onChange={e => setFormData({ ...formData, cakeQuantity: parseInt(e.target.value) })}
                      >
                        {[1, 2, 3, 4, 5, 10, 15, 20].map(q => <option key={q} value={q}>{q}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Flavor Selection</label>
                    <div className="flex flex-wrap gap-2">
                      {CAKE_FLAVORS.map(flavor => {
                        const isActive = formData.flavors.includes(flavor);
                        return (
                          <button
                            key={flavor}
                            type="button"
                            onClick={() => {
                              if (isActive) {
                                setFormData({ ...formData, flavors: formData.flavors.filter(f => f !== flavor) });
                              } else {
                                setFormData({ ...formData, flavors: [...formData.flavors, flavor] });
                              }
                            }}
                            className={cn(
                              "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                              isActive 
                                ? "bg-orange-500 text-white shadow-lg shadow-orange-100" 
                                : "bg-gray-100 dark:bg-slate-800 text-gray-400 hover:text-gray-600"
                            )}
                          >
                            {flavor}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Customization</label>
                    <input
                      type="text"
                      placeholder="e.g. Blue ombre effect"
                      className="w-full p-4 bg-gray-50 dark:bg-slate-800 border border-subtle rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 font-bold dark:text-white"
                      value={formData.customization}
                      onChange={e => setFormData({ ...formData, customization: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Inspiration Picture</label>
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full p-6 border-2 border-dashed border-subtle rounded-[32px] flex flex-col items-center justify-center space-y-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors group"
                    >
                      {formData.inspirationImage ? (
                        <img src={formData.inspirationImage} className="h-20 w-20 object-cover rounded-xl" alt="Preview" />
                      ) : (
                        <>
                          <ImageIcon className="text-gray-300 group-hover:text-orange-500 transition-colors" size={32} />
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Click to upload</span>
                        </>
                      )}
                      <input type="file" className="hidden" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} />
                    </div>
                  </div>
                </div>
              )}

              {formData.includeSmallChops && (
                <div className={cn("space-y-6 animate-in slide-in-from-right duration-300", formData.includeCake && "pt-10 border-t border-subtle mt-10")}>
                  <h3 className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.3em] flex items-center space-x-3">
                    <Package size={18} />
                    <span>Small Chops Configurator</span>
                  </h3>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Package Selection</label>
                      <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {Object.keys(SMALL_CHOPS_PRICES).map(pkg => (
                          <button
                            key={pkg}
                            type="button"
                            onClick={() => setFormData({ ...formData, packageType: pkg })}
                            className={cn(
                              "w-full p-4 flex items-center justify-between rounded-2xl border transition-all text-left",
                              formData.packageType === pkg 
                                ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200" 
                                : "bg-white dark:bg-slate-800 border-subtle hover:border-gray-200"
                            )}
                          >
                            <div>
                              <p className="font-black text-gray-900 dark:text-white text-sm">{pkg}</p>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">₦{SMALL_CHOPS_PRICES[pkg].price.toLocaleString()}</p>
                            </div>
                            {formData.packageType === pkg && <CheckCircle size={20} className="text-blue-500" />}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="w-full sm:w-24 space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Qty</label>
                      <select
                        className="w-full p-4 bg-gray-50 dark:bg-slate-800 border border-subtle rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold dark:text-white"
                        value={formData.smallChopsQuantity}
                        onChange={e => setFormData({ ...formData, smallChopsQuantity: parseInt(e.target.value) })}
                      >
                        {[1, 2, 3, 4, 5, 10, 15, 20, 25, 30, 40, 50].map(q => <option key={q} value={q}>{q}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {!formData.includeCake && !formData.includeSmallChops && (
                <div className="h-full flex items-center justify-center p-10 bg-gray-50 dark:bg-slate-800/50 rounded-[40px] border-2 border-dashed border-subtle">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest text-center">Please select at least one product type to configure</p>
                </div>
              )}
            </div>
          </div>

          {/* Logistics & Price Footer */}
          <div className="pt-10 border-t border-subtle">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Special Requirements</label>
                 <textarea
                   rows={3}
                   placeholder="Any additional notes..."
                   className="w-full p-4 bg-gray-50 dark:bg-slate-800 border border-subtle rounded-3xl outline-none focus:ring-2 focus:ring-gray-400 font-bold dark:text-white resize-none"
                   value={formData.specialRequirements}
                   onChange={e => setFormData({ ...formData, specialRequirements: e.target.value })}
                 />
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Internal Notes</label>
                 <textarea
                   rows={3}
                   placeholder="Private notes for the team..."
                   className="w-full p-4 bg-gray-50 dark:bg-slate-800 border border-subtle rounded-3xl outline-none focus:ring-2 focus:ring-gray-400 font-bold dark:text-white resize-none"
                   value={formData.notes}
                   onChange={e => setFormData({ ...formData, notes: e.target.value })}
                 />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Payment</label>
                    <select
                      className="w-full p-4 bg-gray-50 dark:bg-slate-800 border border-subtle rounded-2xl outline-none font-bold dark:text-white"
                      value={formData.paymentStatus}
                      onChange={e => setFormData({ ...formData, paymentStatus: e.target.value as PaymentStatus })}
                    >
                      {PAYMENT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Progress</label>
                    <select
                      className="w-full p-4 bg-gray-50 dark:bg-slate-800 border border-subtle rounded-2xl outline-none font-bold dark:text-white"
                      value={formData.orderStatus}
                      onChange={e => setFormData({ ...formData, orderStatus: e.target.value as OrderStatus })}
                    >
                      {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
               </div>
             </div>

             <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="text-center md:text-left">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-2">Final Quotation</p>
                  <p className="text-5xl font-black text-main tracking-tighter">{formatCurrency(calculatedPrice)}</p>
                </div>
                <div className="flex space-x-4 w-full md:w-auto">
                  <button
                    type="button"
                    onClick={() => { setIsAdding(false); resetForm(); }}
                    className="flex-1 md:flex-none px-8 py-5 text-gray-400 font-black uppercase tracking-widest hover:text-gray-600"
                  >
                    Discard
                  </button>
                  <button
                    type="submit"
                    className="flex-1 md:flex-none px-12 py-5 bg-gray-900 dark:bg-pink-600 text-white rounded-[32px] font-black uppercase tracking-widest hover:bg-gray-800 dark:hover:bg-pink-700 transition-all shadow-2xl dark:shadow-none active:scale-95"
                  >
                    Confirm Order
                  </button>
                </div>
             </div>
          </div>
        </form>
      )}
      {/* Search and Filters */}
      <div className="bg-white dark:bg-slate-900/40 p-6 rounded-[32px] border border-subtle shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by name, room, or notes..."
            className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-slate-800 border border-subtle rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold dark:text-white"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-48">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            <select
              className="w-full pl-10 pr-4 py-4 bg-gray-50 dark:bg-slate-800 border border-subtle rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-black uppercase text-[10px] tracking-widest appearance-none dark:text-white"
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="relative flex-1 md:w-48">
            <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            <select
              className="w-full pl-10 pr-4 py-4 bg-gray-50 dark:bg-slate-800 border border-subtle rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-black uppercase text-[10px] tracking-widest appearance-none dark:text-white"
              value={filterRep}
              onChange={e => setFilterRep(e.target.value)}
            >
              <option value="all">All Reps</option>
              {reps.map(rep => <option key={rep.id} value={rep.id}>{rep.name}</option>)}
            </select>
          </div>
        </div>

        {(searchTerm || filterStatus !== 'all' || filterRep !== 'all') && (
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterStatus('all');
              setFilterRep('all');
            }}
            className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-600 px-4 py-2"
          >
            Clear
          </button>
        )}
      </div>

      {/* Interactive Orders List (Descending Order) */}
      <div className="space-y-6">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-40 bg-white dark:bg-slate-900/50 rounded-[40px] border border-dashed border-subtle">
            <Sparkles className="mx-auto text-gray-200 dark:text-slate-800 mb-6" size={80} />
            <p className="text-gray-400 font-black uppercase tracking-[0.4em] text-sm">
              {orders.length === 0 ? 'Waiting for first order...' : 'No orders match your search'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredOrders.map(order => {
              const rep = reps.find(r => r.id === order.repId);
              return (
                <div key={order.id} className="bg-card p-8 rounded-[40px] border border-subtle shadow-sm hover:shadow-xl transition-all group relative overflow-hidden card-bow">
                  <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8">
                    <div className="flex items-start space-x-6">
                      <div className={cn(
                        "w-20 h-20 rounded-[32px] flex items-center justify-center shrink-0 shadow-lg",
                        order.includeCake ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600" : "bg-orange-50 dark:bg-orange-900/30 text-orange-600"
                      )}>
                        {order.inspirationImage ? (
                          <img src={order.inspirationImage} className="h-full w-full object-cover rounded-[32px]" alt="Inspo" />
                        ) : (
                          <div className="flex flex-col items-center justify-center space-y-1">
                            {order.includeCake && <Cake size={order.includeSmallChops ? 24 : 40} />}
                            {order.includeSmallChops && <Package size={order.includeCake ? 24 : 40} />}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-4 mb-2">
                          <div className="flex flex-col">
                            <h3 className="font-black text-main text-2xl tracking-tighter">{order.customerName}</h3>
                            {order.customerRoomNumber && (
                              <span className="text-[10px] font-black text-blue-600 dark:text-pink-400 uppercase tracking-widest -mt-1">
                                {order.customerRoomNumber}
                              </span>
                            )}
                          </div>
                            <div className="flex space-x-2">
                              <span className={cn(
                                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                order.paymentStatus === 'Paid' ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300" :
                                order.paymentStatus === 'Partial' ? "bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300" :
                                "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
                              )}>
                                {order.paymentStatus}
                              </span>
                              {order.includeCake && (
                                <span className="bg-blue-100 dark:bg-blue-900 px-3 py-1 rounded-full text-[10px] font-black text-blue-700 dark:text-blue-300 uppercase tracking-widest">
                                  Cake
                                </span>
                              )}
                              {order.includeSmallChops && (
                                <span className="bg-orange-100 dark:bg-orange-900 px-3 py-1 rounded-full text-[10px] font-black text-orange-700 dark:text-orange-300 uppercase tracking-widest">
                                  Small Chops
                                </span>
                              )}
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-x-6 gap-y-2 mt-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          {(() => {
                            const config = getStatusConfig(order.orderStatus);
                            const StatusIcon = config.icon;
                            return (
                              <span className={cn("flex items-center space-x-1.5 px-3 py-1 rounded-xl border", config.bg, config.color, config.border)}>
                                <StatusIcon size={12} />
                                <span>{order.orderStatus}</span>
                              </span>
                            );
                          })()}
                          <span className="flex items-center space-x-2 h-6">
                            <Clock size={14} className="text-gray-300" />
                            <span>Ordered {format(parseISO(order.createdAt), 'MMM dd, p')}</span>
                          </span>
                          <span className="flex items-center space-x-2 text-blue-600 dark:text-pink-400">
                            <MapPin size={14} />
                            <span>Due {format(parseISO(order.deliveryDate), 'MMM dd')} — {order.deliveryType}</span>
                          </span>
                          <span className="flex items-center space-x-2">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: rep?.color }} />
                            <span>Rep: {rep?.name || 'Unknown'}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-6 xl:justify-end">
                      <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-3xl min-w-[120px]">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Configuration</p>
                        <p className="text-xs font-black text-main">
                          {order.includeCake && `${order.cakeQuantity > 1 ? order.cakeQuantity + 'x ' : ''}${order.cakeSize}" ${order.flavors.join(', ') || 'No Flavor'}`}
                          {order.includeCake && order.includeSmallChops && <span className="block border-t border-subtle my-1" />}
                          {order.includeSmallChops && `${order.smallChopsQuantity > 1 ? order.smallChopsQuantity + 'x ' : ''}${order.packageType}`}
                        </p>
                      </div>
                      <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-3xl">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Price + Delivery</p>
                        <p className="text-sm font-black text-main">
                          {formatCurrency(order.amount)}
                          {order.deliveryCost > 0 && <span className="ml-1 text-[8px] text-blue-500">(+ {formatCurrency(order.deliveryCost)})</span>}
                        </p>
                      </div>
                      <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-3xl">
                        <p className="text-[10px] font-black text-blue-600 dark:text-pink-400 uppercase tracking-widest mb-1">Commission</p>
                        <p className="text-sm font-black text-main underline decoration-blue-200">{formatCurrency(order.commission)}</p>
                      </div>
                      
                      <select
                        className={cn(
                          "px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-[0.2em] outline-none border-none cursor-pointer transition-all",
                          order.orderStatus === 'Completed' ? "bg-green-600 text-white shadow-xl shadow-green-100 dark:shadow-none" :
                          order.orderStatus === 'Delivered' ? "bg-blue-600 text-white shadow-xl shadow-blue-100 dark:shadow-none" :
                          order.orderStatus === 'In Progress' ? "bg-orange-600 text-white shadow-xl shadow-orange-100 dark:shadow-none" :
                          "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300"
                        )}
                        value={order.orderStatus}
                        onChange={e => updateStatus(order.id, { orderStatus: e.target.value as OrderStatus })}
                      >
                        {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>

                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleDelete(order.id)}
                          className="p-3 text-gray-300 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all"
                        >
                          <Trash2 size={24} />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {(order.specialRequirements || order.customization || order.notes) && (
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                      {order.customization && (
                        <div className="p-5 bg-blue-50/50 dark:bg-blue-900/10 rounded-3xl border border-blue-100/50 dark:border-blue-800/30">
                          <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2 flex items-center space-x-2">
                            <Sparkles size={12} />
                            <span>Design Specs</span>
                          </p>
                          <p className="text-sm text-main font-bold italic">"{order.customization}"</p>
                        </div>
                      )}
                      {order.specialRequirements && (
                        <div className="p-5 bg-orange-50/50 dark:bg-orange-900/10 rounded-3xl border border-orange-100/50 dark:border-orange-800/30">
                          <p className="text-[10px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest mb-2 flex items-center space-x-2">
                            <ClipboardList size={12} />
                            <span>Special Notes</span>
                          </p>
                          <p className="text-sm text-main font-bold italic">"{order.specialRequirements}"</p>
                        </div>
                      )}
                      {order.notes && (
                        <div className="p-5 bg-gray-50/50 dark:bg-slate-900/10 rounded-3xl border border-subtle">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center space-x-2">
                            <ClipboardList size={12} />
                            <span>Internal Notes</span>
                          </p>
                          <p className="text-sm text-main font-bold italic">"{order.notes}"</p>
                        </div>
                      )}
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
