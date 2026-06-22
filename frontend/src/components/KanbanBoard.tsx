'use client';

import React from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Task, Status } from '../types';
import TaskCard from './TaskCard';
import { Plus, ListTodo, Play, CheckCircle } from 'lucide-react';

interface KanbanBoardProps {
  tasks: Task[];
  onAddTask: (status: Status) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onDragEnd: (result: DropResult) => void;
}

const COLUMNS: { id: Status; title: string; icon: React.ReactNode; color: string; hoverBg: string }[] = [
  {
    id: 'TO_DO',
    title: 'To Do',
    icon: <ListTodo className="w-4 h-4 text-indigo-400" />,
    color: 'border-t-indigo-500',
    hoverBg: 'hover:bg-indigo-500/5',
  },
  {
    id: 'IN_PROGRESS',
    title: 'In Progress',
    icon: <Play className="w-4 h-4 text-amber-400" />,
    color: 'border-t-amber-500',
    hoverBg: 'hover:bg-amber-500/5',
  },
  {
    id: 'DONE',
    title: 'Done',
    icon: <CheckCircle className="w-4 h-4 text-emerald-400" />,
    color: 'border-t-emerald-500',
    hoverBg: 'hover:bg-emerald-500/5',
  },
];

/**
 * Komponent tablicy Kanban grupujący zadania w trzy kolumny (Do wykonania, W toku, Zakończone).
 * Wspiera przeciąganie zadań między kolumnami (Drag & Drop) przy użyciu biblioteki @hello-pangea/dnd.
 */
export default function KanbanBoard({
  tasks,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onDragEnd,
}: KanbanBoardProps) {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {COLUMNS.map((column) => {
          const columnTasks = tasks.filter((t) => t.status === column.id);

          return (
            <div
              key={column.id}
              className={`bg-slate-900/20 border border-slate-800/80 rounded-2xl flex flex-col max-h-[80vh] border-t-2 ${column.color}`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-800/60 bg-slate-900/10 rounded-t-2xl">
                <div className="flex items-center gap-2">
                  {column.icon}
                  <h3 className="font-bold text-slate-200 text-sm">{column.title}</h3>
                  <span className="text-[10px] font-extrabold bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
                    {columnTasks.length}
                  </span>
                </div>
                <button
                  onClick={() => onAddTask(column.id)}
                  className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-all cursor-pointer"
                  title={`Add task to ${column.title}`}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Droppable Task List */}
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 overflow-y-auto p-4 space-y-4 min-h-[250px] transition-colors duration-200 ${
                      snapshot.isDraggingOver ? 'bg-slate-900/10' : ''
                    }`}
                  >
                    {columnTasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              ...provided.draggableProps.style,
                              scale: snapshot.isDragging ? '1.04' : '1',
                              rotate: snapshot.isDragging ? '1.5deg' : '0deg',
                              transition: provided.draggableProps.style?.transition
                                ? `${provided.draggableProps.style.transition}, scale 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), rotate 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)`
                                : 'scale 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), rotate 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                            }}
                            className={`transition-shadow duration-250 ${
                              snapshot.isDragging ? 'shadow-2xl z-50' : ''
                            }`}
                          >
                            <TaskCard
                              task={task}
                              onEdit={onEditTask}
                              onDelete={onDeleteTask}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}
