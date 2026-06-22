import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private pool: Pool;

  /**
   * Inicjalizuje połączenie z bazą danych PostgreSQL za pomocą PrismaPg adaptera i pg Pool.
   * Pobiera URL bazy danych ze zmiennej środowiskowej DATABASE_URL.
   */
  constructor() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not defined.');
    }
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    super({ adapter });
    this.pool = pool;
  }

  /**
   * Wywoływane podczas inicjalizacji modułu NestJS. Nawiązuje połączenie z bazą danych.
   */
  async onModuleInit() {
    await this.$connect();
  }

  /**
   * Wywoływane przy niszczeniu modułu NestJS. Zamyka połączenie z bazą danych oraz pulę połączeń pg.
   */
  async onModuleDestroy() {
    await this.$disconnect();
    await this.pool.end();
  }
}
