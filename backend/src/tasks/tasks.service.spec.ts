import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { Priority, Status } from '@prisma/client';

describe('TasksService', () => {
  let service: TasksService;

  const mockPrisma = {
    task: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all tasks for a specific user', async () => {
      const mockTasks = [
        { id: '1', title: 'Task 1', userId: 'user-1' },
        { id: '2', title: 'Task 2', userId: 'user-1' },
      ];
      mockPrisma.task.findMany.mockResolvedValue(mockTasks);

      const result = await service.findAll('user-1');

      expect(result).toEqual(mockTasks);
      expect(mockPrisma.task.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a task if found and owned by user', async () => {
      const mockTask = { id: '1', title: 'Task 1', userId: 'user-1' };
      mockPrisma.task.findFirst.mockResolvedValue(mockTask);

      const result = await service.findOne('1', 'user-1');

      expect(result).toEqual(mockTask);
    });

    it('should throw NotFoundException if task not found or not owned', async () => {
      mockPrisma.task.findFirst.mockResolvedValue(null);

      await expect(service.findOne('1', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create a new task', async () => {
      const dto = {
        title: 'New Task',
        description: 'Desc',
        priority: Priority.HIGH,
        deadline: new Date().toISOString(),
      };

      const mockCreatedTask = {
        id: '1',
        ...dto,
        deadline: new Date(dto.deadline),
        userId: 'user-1',
        status: Status.TO_DO,
      };

      mockPrisma.task.create.mockResolvedValue(mockCreatedTask);

      const result = await service.create('user-1', dto);

      expect(result).toEqual(mockCreatedTask);
      expect(mockPrisma.task.create).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update a task', async () => {
      const mockTask = { id: '1', title: 'Task 1', userId: 'user-1' };
      mockPrisma.task.findFirst.mockResolvedValue(mockTask);

      const updateDto = { title: 'Updated Title', status: Status.IN_PROGRESS };
      const mockUpdated = { ...mockTask, ...updateDto };
      mockPrisma.task.update.mockResolvedValue(mockUpdated);

      const result = await service.update('1', 'user-1', updateDto);

      expect(result).toEqual(mockUpdated);
      expect(mockPrisma.task.update).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete a task', async () => {
      const mockTask = { id: '1', title: 'Task 1', userId: 'user-1' };
      mockPrisma.task.findFirst.mockResolvedValue(mockTask);
      mockPrisma.task.delete.mockResolvedValue(mockTask);

      const result = await service.remove('1', 'user-1');

      expect(result).toEqual(mockTask);
      expect(mockPrisma.task.delete).toHaveBeenCalled();
    });
  });
});
