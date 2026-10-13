import React, { useState } from 'react';
import { UserPlus, Trash2, Edit2, X } from 'lucide-react';
import { useData, Rep } from './DataProvider';

const PRESET_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', 
  '#ec4899', '#06b6d4', '#f97316', '#6366f1', '#14b8a6'
];

interface RepManagementProps {
  reps: Rep[];
}

export default function RepManagement({ reps }: RepManagementProps) {
  const { addRep, updateRep, deleteRep } = useData();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', color: PRESET_COLORS[0], commission: '1000' });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addRep({
      name: formData.name,
      email: formData.email,
      color: formData.color,
      commissionPerOrder: parseFloat(formData.commission),
    });
    setIsAdding(false);
    resetForm();
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    updateRep(editingId, {
      name: formData.name,
      email: formData.email,
      color: formData.color,
      commissionPerOrder: parseFloat(formData.commission),
    });
    setEditingId(null);
    resetForm();
  };

  const startEdit = (rep: Rep) => {
    setEditingId(rep.id);
    setFormData({
      name: rep.name,
      email: rep.email,
      color: rep.color,
      commission: rep.commissionPerOrder.toString(),
    });
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', color: PRESET_COLORS[0], commission: '1000' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Sales Representatives</h2>
        <button
          onClick={() => { setIsAdding(true); resetForm(); }}
          className="flex items-center space-x-2 px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all shadow-xl shadow-gray-200 font-bold"
        >
          <UserPlus size={20} />
          <span>Add Representative</span>
        </button>
      </div>

      {(isAdding || editingId) && (
        <form onSubmit={isAdding ? handleAdd : handleUpdate} 
              className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl animate-in slide-in-from-top duration-300 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase">Full Name</label>
              <input
                required
                type="text"
                placeholder="Rep Name"
                className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase">Email Address</label>
              <input
                required
                type="email"
                placeholder="email@example.com"
                className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Commission (₦)</label>
              <input
                required
                type="number"
                placeholder="1000"
                className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                value={formData.commission}
                onChange={e => setFormData({ ...formData, commission: e.target.value })}
              />
            </div>
          </div>
          
          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Dashboard Color</label>
            <div className="flex flex-wrap gap-3">
              {PRESET_COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={`w-10 h-10 rounded-2xl border-4 transition-all hover:scale-110 shadow-sm ${
                    formData.color === color ? 'border-gray-900 scale-110 rotate-3' : 'border-white'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-50">
            <button
              type="button"
              onClick={() => { setIsAdding(false); setEditingId(null); resetForm(); }}
              className="px-6 py-3 text-gray-500 font-bold hover:text-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-10 py-3 bg-gray-900 text-white rounded-2xl font-black hover:bg-gray-800 transition-all shadow-xl shadow-gray-100 active:scale-95"
            >
              {isAdding ? 'Create Representative' : 'Save Changes'}
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reps.map(rep => (
          <div key={rep.id} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div 
                  className="w-16 h-16 rounded-3xl flex items-center justify-center text-white font-black text-2xl shadow-lg"
                  style={{ backgroundColor: rep.color }}
                >
                  {rep.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-black text-gray-900 text-lg tracking-tight">{rep.name}</h3>
                  <p className="text-sm text-gray-500 font-medium">{rep.email}</p>
                </div>
              </div>
              <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => startEdit(rep)} className="p-2 text-gray-400 hover:text-blue-600 rounded-xl hover:bg-blue-50">
                  <Edit2 size={18} />
                </button>
                <button onClick={() => deleteRep(rep.id)} className="p-2 text-gray-400 hover:text-red-600 rounded-xl hover:bg-red-50">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between">
              <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Commission</span>
              <span className="font-black text-gray-900 text-lg">₦{rep.commissionPerOrder.toLocaleString()} / order</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
