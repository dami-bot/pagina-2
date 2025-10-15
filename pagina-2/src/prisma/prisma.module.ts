import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Lo hace global para toda la app
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // ❗ Muy importante
})
export class PrismaModule {}
