import { Module } from '@nestjs/common';
import { ComprasService } from './compras.service';
import { ComprasController } from './compras.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule], // ❗ Importamos PrismaModule
  controllers: [ComprasController],
  providers: [ComprasService],
})
export class ComprasModule {}

