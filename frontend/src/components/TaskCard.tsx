import React from 'react';
import { Task } from '../types';
import { Calendar, AlertTriangle, Edit3, Trash2 } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

/**
 * Komponent reprezentujący kartę pojedynczego zadania na tablicy.
 * Wyświetla priorytet, tytuł, opis, termin wykonania oraz przyciski akcji
 * (edycja i usuwanie), które pojawiają się po najechaniu kursorem.
 */
export default function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const isOverdue = new Date(task.deadline) < new Date() && task.status !== 'DONE';

  const priorityColors = {
    LOW: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    MEDIUM: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    HIGH: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  };

  const formattedDate = new Date(task.deadline).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 hover:border-indigo-500/50 hover:bg-slate-900/60 hover:scale-[1.01] hover:shadow-lg transition-all duration-200 ease-out group shadow-md flex flex-col gap-3 relative overflow-hidden animate-card-enter">
      {isOverdue && (
        <div className="absolute top-0 left-0 w-full h-[3px] bg-rose-500" />
      )}
      
      <div className="flex justify-between items-start gap-2">
        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${priorityColors[task.priority]}`}>
          {task.priority}
        </span>
        
        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(task);
            }}
            onMouseDown={(e) => e.stopPropagation()}
            className="p-1 text-slate-400 hover:text-indigo-400 rounded transition-colors cursor-pointer"
            title="Edit Task"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task.id);
            }}
            onMouseDown={(e) => e.stopPropagation()}
            className="p-1 text-slate-400 hover:text-rose-400 rounded transition-colors cursor-pointer"
            title="Delete Task"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-slate-100 group-hover:text-white transition-colors text-sm">
          {task.title}
        </h4>
        {task.description && (
          <p className="text-slate-400 text-xs mt-1 line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between mt-1 pt-3 border-t border-slate-800/60 text-xs">
        <div className={`flex items-center gap-1.5 ${isOverdue ? 'text-rose-400 font-medium' : 'text-slate-400'}`}>
          {isOverdue ? (
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
          ) : (
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
          )}
          <span>{formattedDate}</span>
          {isOverdue && <span className="text-[10px] uppercase tracking-wide bg-rose-500/10 px-1.5 py-0.5 rounded ml-1 border border-rose-500/20">Overdue</span>}
        </div>
      </div>
    </div>
  );
}
