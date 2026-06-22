import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsISO8601,
} from 'class-validator';
import { Priority } from '@prisma/client';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(Priority, { message: 'Priority must be LOW, MEDIUM, or HIGH' })
  @IsOptional()
  priority?: Priority;

  @IsISO8601({}, { message: 'Deadline must be a valid ISO 8601 date string' })
  @IsNotEmpty({ message: 'Deadline is required' })
  deadline: string;
}
