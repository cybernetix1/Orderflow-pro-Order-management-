import React, { useState } from 'react';
import { Plus, Bell, CheckCircle, Circle, Trash2, Calendar, Clock, AlertCircle } from 'lucide-react';
import { useData } from './DataProvider';
import { format, isPast, parseISO } from 'date-fns';
import { cn } from '../lib/utils';
import { BowIcon } from './icons/BowIcon';

export default function Reminders() {
  const { reminders, addReminder, toggleReminder, deleteReminder, theme } = useData();
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', dueDate: format(new Date(), "yyyy-MM-dd'T'HH:mm") });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;
    addReminder(formData);
    setIsAdding(false);
    setFormData({ title: '', description: '', dueDate: format(new Date(), "yyyy-MM-dd'T'HH:mm") });
  };

  const sortedReminders = [...reminders].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-main tracking-tight uppercase">Reminders & Follow-ups</h2>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center space-x-2 px-6 py-3 bg-gray-900 dark:bg-pink-600 text-white rounded-2xl hover:bg-gray-800 dark:hover:bg-pink-700 transition-all shadow-xl dark:shadow-none font-bold relative"
        >
          {theme === 'pink' && <BowIcon size={12} className="absolute -top-1 -right-1 text-white" />}
          <Plus size={20} />
          <span>New Task</span>
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="bg-card p-8 rounded-[32px] border border-subtle shadow-2xl animate-in slide-in-from-top duration-300 space-y-6 relative overflow-hidden">
          {theme === 'pink' && <BowIcon size={24} className="absolute -top-1 -right-1 text-pink-400" />}          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Title</label>
              <input
                required
                type="text"
                placeholder="e.g. Call John about his cake order"
                className="w-full p-4 bg-gray-50 dark:bg-slate-800 border border-subtle rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold dark:text-white"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Due Date & Time</label>
              <input
                required
                type="datetime-local"
                className="w-full p-4 bg-gray-50 dark:bg-slate-800 border border-subtle rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold dark:text-white"
                value={formData.dueDate}
                onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Notes</label>
            <textarea
              placeholder="Additional context..."
              rows={2}
              className="w-full p-4 bg-gray-50 dark:bg-slate-800 border border-subtle rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold dark:text-white resize-none"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-6 py-3 text-gray-400 font-black uppercase tracking-widest hover:text-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-10 py-3 bg-gray-900 dark:bg-pink-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl dark:shadow-none"
            >
              Set Reminder
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {sortedReminders.length === 0 ? (
          <div className="text-center py-32 bg-card rounded-[40px] border border-dashed border-subtle">
            <Bell className="mx-auto text-gray-200 dark:text-slate-800 mb-6" size={64} />
            <p className="text-gray-400 font-black uppercase tracking-[0.4em] text-xs">No active reminders</p>
          </div>
        ) : (
          sortedReminders.map(reminder => {
            const isOverdue = !reminder.completed && isPast(new Date(reminder.dueDate));
            return (
              <div key={reminder.id} className={cn(
                "bg-card p-6 rounded-[32px] border border-subtle shadow-sm transition-all flex items-center justify-between group",
                reminder.completed ? "opacity-60 grayscale-[0.5]" : "hover:shadow-md hover:border-blue-100 dark:hover:border-pink-500"
              )}>
                <div className="flex items-center space-x-6">
                  <button 
                    onClick={() => toggleReminder(reminder.id)}
                    className={cn(
                      "w-10 h-10 rounded-2xl flex items-center justify-center transition-all",
                      reminder.completed ? "bg-green-100 text-green-600" : "bg-gray-100 dark:bg-slate-800 text-gray-400 hover:text-blue-600 dark:hover:text-pink-400"
                    )}
                  >
                    {reminder.completed ? <CheckCircle size={24} /> : <Circle size={24} />}
                  </button>
                  <div>
                    <h3 className={cn(
                      "font-black text-lg tracking-tight",
                      reminder.completed ? "line-through text-gray-400" : "text-main"
                    )}>
                      {reminder.title}
                    </h3>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-widest flex items-center space-x-1",
                        isOverdue ? "text-red-500" : "text-gray-400"
                      )}>
                        <Clock size={12} />
                        <span>Due {format(parseISO(reminder.dueDate), 'MMM dd, p')}</span>
                        {isOverdue && <span className="ml-2 bg-red-100 px-2 py-0.5 rounded-full text-red-600 animate-pulse">Overdue</span>}
                      </span>
                      {reminder.description && (
                        <span className="text-[10px] font-bold text-gray-400 italic truncate max-w-md">
                          — {reminder.description}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => deleteReminder(reminder.id)}
                  className="p-3 text-gray-300 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
