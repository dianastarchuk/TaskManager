import React, { useState, useEffect, useRef } from 'react';
import { Task, Priority } from '../types';
import { X, Loader2 } from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; description: string; priority: Priority; deadline: string }) => Promise<void>;
  task?: Task | null;
}

/**
 * Komponent modalny służący do tworzenia lub edycji zadania.
 * Obsługuje formularz z polami tytułu, opisu, priorytetu oraz terminu wykonania (deadline).
 */
export default function TaskModal({ isOpen, onClose, onSubmit, task }: TaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [deadline, setDeadline] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Automatically adjust description textarea height to fit content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [description, isOpen]);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setPriority(task.priority);
      // Format deadline date as YYYY-MM-DD for date input
      const date = new Date(task.deadline);
      const formatted = date.toISOString().split('T')[0];
      setDeadline(formatted);
    } else {
      setTitle('');
      setDescription('');
      setPriority('MEDIUM');
      // Set tomorrow as default deadline
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setDeadline(tomorrow.toISOString().split('T')[0]);
    }
    setError('');
  }, [task, isOpen]);

  if (!isOpen) return null;

  /**
   * Obsługuje wysyłanie formularza zadania.
   * Waliduje pola tytułu i daty ukończenia, przekazuje dane do metody onSubmit,
   * a następnie zamyka okno modalne.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    if (!deadline) {
      setError('Deadline is required');
      return;
    }

    setError('');
    setLoading(true);
    try {
      // API expects ISO string
      const isoDeadline = new Date(deadline).toISOString();
      await onSubmit({ title, description, priority, deadline: isoDeadline });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b border-slate-800">
          <h3 className="text-lg font-bold text-white">
            {task ? 'Edit Task' : 'Add New Task'}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/50 text-rose-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="block w-full px-3.5 py-2 border border-slate-800 rounded-lg bg-slate-950 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-sm transition-all"
              placeholder="E.g., Complete backend tests"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Description
              </label>
              <span className="text-[10px] text-slate-500 font-medium">
                {description.length}/500
              </span>
            </div>
            <textarea
              ref={textareaRef}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              className="block w-full px-3.5 py-2 border border-slate-800 rounded-lg bg-slate-950 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-sm transition-all resize-none min-h-[80px] overflow-hidden"
              placeholder="What needs to be done?"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="block w-full pl-3.5 pr-10 py-2 border border-slate-800 rounded-lg bg-slate-950 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-sm transition-all cursor-pointer"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Deadline *
              </label>
              <input
                type="date"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="block w-full pl-3.5 pr-4 py-2 border border-slate-800 rounded-lg bg-slate-950 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-sm transition-all cursor-pointer"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-800/60 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-lg text-sm cursor-pointer transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold flex items-center gap-1.5 cursor-pointer shadow-lg hover:shadow-indigo-500/20 disabled:opacity-50 transition-all"
            >
              {loading ? (
                <Loader2 className="animate-spin w-4 h-4 text-white" />
              ) : task ? (
                'Save Changes'
              ) : (
                'Add Task'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
