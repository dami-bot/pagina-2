import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly maxRetries = 10; // cuántos intentos antes de fallar
  private readonly retryDelay = 5000; // 5 segundos entre intentos

  async onModuleInit() {
    let connected = false;
    let attempts = 0;

    while (!connected && attempts < this.maxRetries) {
      try {
        await this.$connect();
        connected = true;
        console.log('✅ Prisma conectado');
      } catch (err) {
        attempts++;
        console.log(`⏳ Esperando DB... intento ${attempts}/${this.maxRetries}`, err.message);
        await new Promise((r) => setTimeout(r, this.retryDelay));
      }
    }

    if (!connected) {
      throw new Error('❌ No se pudo conectar a la base de datos después de varios intentos');
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('❌ Prisma desconectado');
  }
}

