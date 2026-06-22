export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';
export type Status = 'TO_DO' | 'IN_PROGRESS' | 'DONE';

export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  deadline: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}
