import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TaskCard from './TaskCard';
import { Task } from '../types';

describe('TaskCard Component', () => {
  const mockTask: Task = {
    id: 'task-1',
    title: 'Test Task Title',
    description: 'This is a test description.',
    priority: 'HIGH',
    status: 'TO_DO',
    deadline: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    userId: 'user-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render task title and description', () => {
    render(<TaskCard task={mockTask} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    
    expect(screen.getByText('Test Task Title')).toBeInTheDocument();
    expect(screen.getByText('This is a test description.')).toBeInTheDocument();
  });

  it('should display the priority badge', () => {
    render(<TaskCard task={mockTask} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    
    const priorityBadge = screen.getByText('HIGH');
    expect(priorityBadge).toBeInTheDocument();
  });

  it('should trigger onEdit when edit button is clicked', () => {
    render(<TaskCard task={mockTask} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    
    const editButton = screen.getByTitle('Edit Task');
    fireEvent.click(editButton);
    
    expect(mockOnEdit).toHaveBeenCalledWith(mockTask);
  });

  it('should trigger onDelete when delete button is clicked', () => {
    render(<TaskCard task={mockTask} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    
    const deleteButton = screen.getByTitle('Delete Task');
    fireEvent.click(deleteButton);
    
    expect(mockOnDelete).toHaveBeenCalledWith('task-1');
  });

  it('should display overdue label if deadline is in the past', () => {
    const overdueTask = {
      ...mockTask,
      deadline: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    };

    render(<TaskCard task={overdueTask} onEdit={mockOnEdit} onDelete={mockOnDelete} />);
    
    expect(screen.getByText('Overdue')).toBeInTheDocument();
  });
});
