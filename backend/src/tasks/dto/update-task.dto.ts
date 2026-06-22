import { IsEnum, IsOptional, IsString, IsISO8601 } from 'class-validator';
import { Priority, Status } from '@prisma/client';

export class UpdateTaskDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(Priority, { message: 'Priority must be LOW, MEDIUM, or HIGH' })
  @IsOptional()
  priority?: Priority;

  @IsEnum(Status, { message: 'Status must be TO_DO, IN_PROGRESS, or DONE' })
  @IsOptional()
  status?: Status;

  @IsISO8601({}, { message: 'Deadline must be a valid ISO 8601 date string' })
  @IsOptional()
  deadline?: string;
}
