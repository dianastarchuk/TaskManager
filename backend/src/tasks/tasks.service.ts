import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  /**
   * Pobiera wszystkie zadania należące do danego użytkownika z bazy danych,
   * posortowane według daty utworzenia malejąco.
   *
   * @param userId Identyfikator użytkownika, którego zadania mają zostać pobrane.
   */
  async findAll(userId: string) {
    return this.prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Pobiera pojedyncze zadanie o podanym identyfikatorze, należące do określonego użytkownika.
   *
   * @param id Identyfikator szukanego zadania.
   * @param userId Identyfikator użytkownika.
   * @throws NotFoundException Jeśli zadanie o podanym ID nie istnieje lub nie należy do użytkownika.
   */
  async findOne(id: string, userId: string) {
    const task = await this.prisma.task.findFirst({
      where: { id, userId },
    });
    if (!task) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }
    return task;
  }

  /**
   * Tworzy nowe zadanie dla określonego użytkownika i zapisuje je w bazie danych.
   *
   * @param userId Identyfikator użytkownika, dla którego tworzone jest zadanie.
   * @param dto Obiekt z danymi nowego zadania (tytuł, opis, priorytet, termin).
   */
  async create(userId: string, dto: CreateTaskDto) {
    return this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description || '',
        priority: dto.priority,
        deadline: new Date(dto.deadline),
        userId,
      },
    });
  }

  /**
   * Aktualizuje wybrane pola istniejącego zadania. Przed aktualizacją sprawdza,
   * czy zadanie należy do zalogowanego użytkownika (wywołując findOne).
   *
   * @param id Identyfikator aktualizowanego zadania.
   * @param userId Identyfikator zalogowanego użytkownika.
   * @param dto Obiekt z polami przeznaczonymi do aktualizacji.
   */
  async update(id: string, userId: string, dto: UpdateTaskDto) {
    // Check ownership first
    await this.findOne(id, userId);

    const data: any = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.priority !== undefined) data.priority = dto.priority;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.deadline !== undefined) data.deadline = new Date(dto.deadline);

    return this.prisma.task.update({
      where: { id },
      data,
    });
  }

  /**
   * Usuwa zadanie z bazy danych. Przed usunięciem weryfikuje własność zadania.
   *
   * @param id Identyfikator zadania do usunięcia.
   * @param userId Identyfikator zalogowanego użytkownika.
   */
  async remove(id: string, userId: string) {
    // Check ownership first
    await this.findOne(id, userId);

    return this.prisma.task.delete({
      where: { id },
    });
  }
}
