import React, { useState } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { Plus, UserPlus, Trash2, Edit2, Check, X } from 'lucide-react';
import { handleFirestoreError, OperationType } from '../lib/error-handler';

interface Rep {
  id: string;
  name: string;
  email: string;
  color: string;
  commissionPerOrder: number;
  dailyGoal?: number;
}

interface RepManagementProps {
  reps: Rep[];
}

const PRESET_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', 
  '#ec4899', '#06b6d4', '#f97316', '#6366f1', '#14b8a6'
];

export default function RepManagement({ reps }: RepManagementProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', color: PRESET_COLORS[0], commission: '50', dailyGoal: '5' });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'reps'), {
        name: formData.name,
        email: formData.email,
        color: formData.color,
        role: 'rep',
        commissionPerOrder: parseFloat(formData.commission),
        dailyGoal: parseInt(formData.dailyGoal)
      });
      setIsAdding(false);
      resetForm();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'reps');
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      await updateDoc(doc(db, 'reps', id), {
        name: formData.name,
        email: formData.email,
        color: formData.color,
        commissionPerOrder: parseFloat(formData.commission),
        dailyGoal: parseInt(formData.dailyGoal)
      });
      setEditingId(null);
      resetForm();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `reps/${id}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure? This will not delete their orders but they will show as "Unknown".')) return;
    try {
      await deleteDoc(doc(db, 'reps', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `reps/${id}`);
    }
  };

  const startEdit = (rep: Rep) => {
    setEditingId(rep.id);
    setFormData({
      name: rep.name,
      email: rep.email,
      color: rep.color,
      commission: rep.commissionPerOrder.toString(),
      dailyGoal: (rep.dailyGoal || 5).toString()
    });
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', color: PRESET_COLORS[0], commission: '50', dailyGoal: '5' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Sales Representatives</h2>
        <button
          onClick={() => { setIsAdding(true); resetForm(); }}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200"
        >
          <UserPlus size={20} />
          <span>Add Representative</span>
        </button>
      </div>

      {(isAdding || editingId) && (
        <form onSubmit={isAdding ? handleAdd : (e) => { e.preventDefault(); handleUpdate(editingId!); }} 
              className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm animate-in slide-in-from-top duration-200 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Name</label>
              <input
                required
                type="text"
                placeholder="Rep Name"
                className="w-full p-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email</label>
              <input
                required
                type="email"
                placeholder="email@example.com"
                className="w-full p-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Commission ($)</label>
              <input
                required
                type="number"
                placeholder="50"
                className="w-full p-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.commission}
                onChange={e => setFormData({ ...formData, commission: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Daily Goal</label>
              <input
                required
                type="number"
                placeholder="5"
                className="w-full p-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.dailyGoal}
                onChange={e => setFormData({ ...formData, dailyGoal: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Chart Color</label>
              <div className="flex flex-wrap gap-2 pt-1">
                {PRESET_COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData({ ...formData, color })}
                    className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                      formData.color === color ? 'border-gray-900 scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => { setIsAdding(false); setEditingId(null); resetForm(); }}
              className="px-4 py-2 text-gray-500 hover:text-gray-700 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {isAdding ? 'Create Representative' : 'Save Changes'}
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reps.map(rep => (
          <div key={rep.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-xl"
                  style={{ backgroundColor: rep.color }}
                >
                  {rep.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{rep.name}</h3>
                  <p className="text-sm text-gray-500">{rep.email}</p>
                </div>
              </div>
              <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => startEdit(rep)} className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => handleDelete(rep.id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Commission Rate</span>
                <span className="font-bold text-gray-900">${rep.commissionPerOrder} / order</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Daily Order Goal</span>
                <span className="font-bold text-blue-600">{rep.dailyGoal || 5} orders</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
