// src/compras/compras.controller.ts
import { Controller, Get, Post, Body, Delete } from '@nestjs/common';
import { ComprasService } from './compras.service';

@Controller('api/compras')
export class ComprasController {
  constructor(private readonly comprasService: ComprasService) {}

  @Post()
  async crearCompra(@Body('items') items: any) {
    return this.comprasService.crearCompra(items);
  }

  @Get()
  async obtenerHistorial() {
    return this.comprasService.obtenerHistorial();
  }

  @Delete()
  async limpiarHistorial() {
    return this.comprasService.limpiarHistorial();
  }
}
