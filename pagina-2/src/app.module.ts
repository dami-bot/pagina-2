import { Module } from '@nestjs/common';
import { ComprasModule } from './compras/compras.module';
import { ProductosModule } from './productos/productos.module';

@Module({
  imports: [
    // Solo los módulos de tu app
    ComprasModule,
    ProductosModule,
  ],
  // Prisma disponible para todos los servicios
})
export class AppModule {}
