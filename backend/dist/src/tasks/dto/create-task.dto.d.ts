import { Priority } from '@prisma/client';
export declare class CreateTaskDto {
    title: string;
    description?: string;
    priority?: Priority;
    deadline: string;
}
