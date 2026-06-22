import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
export declare class TasksService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string;
        priority: import("@prisma/client").$Enums.Priority;
        deadline: Date;
        status: import("@prisma/client").$Enums.Status;
        userId: string;
    }[]>;
    findOne(id: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string;
        priority: import("@prisma/client").$Enums.Priority;
        deadline: Date;
        status: import("@prisma/client").$Enums.Status;
        userId: string;
    }>;
    create(userId: string, dto: CreateTaskDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string;
        priority: import("@prisma/client").$Enums.Priority;
        deadline: Date;
        status: import("@prisma/client").$Enums.Status;
        userId: string;
    }>;
    update(id: string, userId: string, dto: UpdateTaskDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string;
        priority: import("@prisma/client").$Enums.Priority;
        deadline: Date;
        status: import("@prisma/client").$Enums.Status;
        userId: string;
    }>;
    remove(id: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string;
        priority: import("@prisma/client").$Enums.Priority;
        deadline: Date;
        status: import("@prisma/client").$Enums.Status;
        userId: string;
    }>;
}
