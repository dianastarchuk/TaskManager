import { Priority, Status } from '@prisma/client';
export declare class UpdateTaskDto {
    title?: string;
    description?: string;
    priority?: Priority;
    status?: Status;
    deadline?: string;
}
