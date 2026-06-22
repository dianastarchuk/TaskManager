import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  /**
   * Pobiera wszystkie zadania przypisane do zalogowanego użytkownika.
   *
   * @param userId Identyfikator zalogowanego użytkownika (wyciągnięty z tokenu JWT).
   */
  @Get()
  async findAll(@GetUser('id') userId: string) {
    return this.tasksService.findAll(userId);
  }

  /**
   * Pobiera pojedyncze zadanie o podanym identyfikatorze, należące do zalogowanego użytkownika.
   *
   * @param id Identyfikator zadania.
   * @param userId Identyfikator zalogowanego użytkownika.
   */
  @Get(':id')
  async findOne(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.tasksService.findOne(id, userId);
  }

  /**
   * Tworzy nowe zadanie dla zalogowanego użytkownika.
   *
   * @param userId Identyfikator zalogowanego użytkownika.
   * @param dto Obiekt transferu danych zawierający szczegóły nowego zadania (tytuł, opis, status).
   */
  @Post()
  async create(@GetUser('id') userId: string, @Body() dto: CreateTaskDto) {
    return this.tasksService.create(userId, dto);
  }

  /**
   * Aktualizuje istniejące zadanie zalogowanego użytkownika.
   *
   * @param id Identyfikator zadania do zaktualizowania.
   * @param userId Identyfikator zalogowanego użytkownika.
   * @param dto Obiekt zawierający zaktualizowane dane zadania.
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasksService.update(id, userId, dto);
  }

  /**
   * Usuwa zadanie o podanym identyfikatorze, o ile należy ono do zalogowanego użytkownika.
   *
   * @param id Identyfikator zadania do usunięcia.
   * @param userId Identyfikator zalogowanego użytkownika.
   */
  @Delete(':id')
  async remove(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.tasksService.remove(id, userId);
  }
}
