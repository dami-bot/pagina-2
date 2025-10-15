// src/compras/compras.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ComprasService {
  constructor(private prisma: PrismaService) {}

  async crearCompra(items: any[]) {
    return this.prisma.purchase.create({
      data: { items },
    });
  }

  async obtenerHistorial() {
    return this.prisma.purchase.findMany({
      orderBy: { date: 'desc' },
    });
  }

  async limpiarHistorial() {
    return this.prisma.purchase.deleteMany();
  }
}
