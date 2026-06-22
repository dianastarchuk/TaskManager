'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/services/api';
import { Task, Status, User } from '@/types';
import KanbanBoard from '@/components/KanbanBoard';
import TaskModal from '@/components/TaskModal';
import { LogOut, Plus, User as UserIcon, Loader2, RefreshCw } from 'lucide-react';
import { DropResult } from '@hello-pangea/dnd';

/**
 * Główny komponent strony domowej panelu Kanban.
 * Sprawdza autoryzację użytkownika, pobiera zadania i renderuje tablicę Kanban.
 */
export default function Home() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeStatus, setActiveStatus] = useState<Status>('TO_DO');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (!token || !storedUser) {
      router.push('/login');
      return;
    }

    try {
      setUser(JSON.parse(storedUser));
      fetchTasks();
    } catch (e) {
      localStorage.clear();
      router.push('/login');
    }
  }, [router]);

  /**
   * Pobiera listę zadań zalogowanego użytkownika z backendu.
   * W przypadku błędu autoryzacji (np. wygasły token) wylogowuje użytkownika.
   */
  const fetchTasks = async () => {
    setError('');
    try {
      const data = await apiFetch('/tasks');
      setTasks(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load tasks');
      if (err.message?.includes('Unauthorized') || err.message?.includes('token')) {
        localStorage.clear();
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Obsługuje proces wylogowania użytkownika przez wyczyszczenie pamięci lokalnej
   * i przekierowanie na stronę logowania.
   */
  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  /**
   * Przygotowuje stan pod dodanie nowego zadania w konkretnej kolumnie i otwiera okno modalne.
   */
  const handleAddTaskClick = (status: Status) => {
    setActiveStatus(status);
    setEditingTask(null);
    setIsModalOpen(true);
  };

  /**
   * Przygotowuje stan pod edycję istniejącego zadania i otwiera okno modalne.
   */
  const handleEditTaskClick = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  /**
   * Usuwa zadanie na podstawie jego ID. Wykorzystuje podejście optymistycznej
   * aktualizacji interfejsu użytkownika (UI) z możliwością cofnięcia zmian w razie błędu API.
   */
  const handleDeleteTask = async (id: string) => {
    // Optimistic delete
    const originalTasks = [...tasks];
    setTasks(tasks.filter((t) => t.id !== id));

    try {
      await apiFetch(`/tasks/${id}`, { method: 'DELETE' });
    } catch (err: any) {
      alert(err.message || 'Failed to delete task');
      setTasks(originalTasks); // rollback
    }
  };

  /**
   * Obsługuje zapisanie formularza w modalnym oknie zadania (dla nowego bądź edytowanego zadania).
   * Aktualizuje stan lokalny zadań po otrzymaniu odpowiedzi z API.
   */
  const handleModalSubmit = async (data: { title: string; description: string; priority: any; deadline: string }) => {
    if (editingTask) {
      // Edit task
      const updated = await apiFetch(`/tasks/${editingTask.id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      setTasks(tasks.map((t) => (t.id === editingTask.id ? updated : t)));
    } else {
      // Add task
      const created = await apiFetch('/tasks', {
        method: 'POST',
        body: JSON.stringify({
          ...data,
          status: activeStatus,
        }),
      });
      setTasks([created, ...tasks]);
    }
  };

  /**
   * Obsługuje zakończenie przeciągania karty zadania na tablicy.
   * Aktualizuje status zadania w bazie danych oraz optymistycznie odświeża stan interfejsu.
   */
  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStatus = destination.droppableId as Status;
    const draggedTask = tasks.find((t) => t.id === draggableId);

    if (!draggedTask) return;

    // Optimistic UI update
    const originalTasks = [...tasks];
    const updatedTasks = tasks.map((t) =>
      t.id === draggableId ? { ...t, status: newStatus } : t
    );
    setTasks(updatedTasks);

    try {
      await apiFetch(`/tasks/${draggableId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (err: any) {
      console.error(err.message || 'Failed to update task status');
      setTasks(originalTasks); // rollback
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center bg-slate-950 text-white min-h-screen">
        <Loader2 className="animate-spin h-10 w-10 text-indigo-500 mb-4" />
        <p className="text-slate-400 text-sm">Loading your workspace...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white min-h-screen flex flex-col">
      {/* Workspace Header */}
      <header className="border-b border-slate-800 bg-slate-900/40 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-500/20">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">TaskManager</h1>
              <p className="text-[10px] text-slate-400 font-medium">Personal Kanban Board</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 border border-slate-800 bg-slate-900/50 px-3 py-1.5 rounded-lg text-xs">
              <UserIcon className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-slate-300 font-semibold">{user?.name || user?.email}</span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-lg border border-slate-800 hover:border-slate-700 transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Your Workspace</h2>
            <p className="text-sm text-slate-400 mt-1">Manage and track your active tasks.</p>
          </div>
          
          <button
            onClick={() => handleAddTaskClick('TO_DO')}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-all cursor-pointer shadow-lg hover:shadow-indigo-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </button>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/50 text-rose-400 px-4 py-3 rounded-lg text-sm flex justify-between items-center">
            <span>{error}</span>
            <button onClick={fetchTasks} className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Board Component */}
        <div className="flex-1 mt-2">
          <KanbanBoard
            tasks={tasks}
            onAddTask={handleAddTaskClick}
            onEditTask={handleEditTaskClick}
            onDeleteTask={handleDeleteTask}
            onDragEnd={handleDragEnd}
          />
        </div>
      </main>

      {/* Modal Dialog */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        task={editingTask}
      />
    </div>
  );
}
