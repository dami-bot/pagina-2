import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  BadRequestException,
  UseInterceptors,
  UploadedFile,
  InternalServerErrorException,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductosService } from './productos.service';
import { v2 as cloudinary } from 'cloudinary';

// Configuración Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

@Controller('api/productos')
export class ProductosController {
  constructor(private readonly productosService: ProductosService) { }

  @Get()
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    return this.productosService.findAll({ skip, take });
  }


 // CREAR PRODUCTO
@Post()
@UseInterceptors(FileInterceptor('imagen'))
async create(
  @Body() data: {
    nombre: string;
    descripcion?: string;
    precio: number;
    stock: number;
    ofertaDiaria?: boolean | string; // 👈 puede llegar como string
    vencimiento?: string | null;
  },
  @UploadedFile() file?: Express.Multer.File,
) {
  try {
    let uploadedImageUrl: string | undefined = undefined;

    if (file) {
      const result = await new Promise<any>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'productos' },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          },
        );
        stream.end(file.buffer);
      });

      uploadedImageUrl = result.secure_url;
    }

    return this.productosService.create({
      nombre: data.nombre,
      descripcion: data.descripcion,
      precio: Number(data.precio),
      stock: Number(data.stock),
      // 👇 Conversión segura de ofertaDiaria
      ofertaDiaria: data.ofertaDiaria === 'true' || data.ofertaDiaria === true,
      vencimiento: data.vencimiento ? new Date(data.vencimiento) : null,
      ...(uploadedImageUrl ? { imagenUrl: uploadedImageUrl } : {}),
    });

  } catch (err) {
    console.error('❌ Error en create producto:', err);
    throw new InternalServerErrorException('No se pudo crear el producto');
  }
}
// Actualizar precios por porcentaje
@Post('actualizar-precios')
async actualizarPrecios(
  @Body() body: { ids: number[]; porcentaje: number }
) {
  const { ids, porcentaje } = body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    throw new BadRequestException('Debe seleccionar al menos un producto');
  }
  if (isNaN(porcentaje)) {
    throw new BadRequestException('Porcentaje inválido');
  }

  try {
    const updates = await Promise.all(
      ids.map(async (id) => {
        // 🔹 Obtenemos el producto directamente desde Prisma
        const producto = await this.productosService.findById(id);
        if (!producto) return null;

        const nuevoPrecio = producto.precio * (1 + porcentaje / 100);

        return this.productosService.update(id, { precio: Number(nuevoPrecio.toFixed(2)) });
      })
    );

    return updates.filter(u => u !== null);
  } catch (err) {
    console.error(err);
    throw new InternalServerErrorException('No se pudieron actualizar los precios');
  }
}



  // ACTUALIZAR PRODUCTO
  @Put(':id')
  @UseInterceptors(FileInterceptor('imagen'))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: {
      nombre?: string;
      descripcion?: string;
      precio?: number;
      stock?: number;
      ofertaDiaria?: boolean | string; // 👈 puede venir como string
      vencimiento?: string | null;
    },
    @UploadedFile() file?: Express.Multer.File,
  ) {
    try {
      let uploadedImageUrl: string | undefined = undefined;

      if (file) {
        const result = await new Promise<any>((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: 'productos' },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            },
          );
          stream.end(file.buffer);
        });

        uploadedImageUrl = result.secure_url;
      }

      // ✅ Conversión segura de tipos
      const updateData: any = {
        ...data,
        ...(data.precio !== undefined ? { precio: Number(data.precio) } : {}),
        ...(data.stock !== undefined ? { stock: Number(data.stock) } : {}),
        ...(data.vencimiento !== undefined
          ? { vencimiento: data.vencimiento ? new Date(data.vencimiento) : null }
          : {}),
        ...(data.ofertaDiaria !== undefined
          ? { ofertaDiaria: data.ofertaDiaria === 'true' || data.ofertaDiaria === true }
          : {}), // 👈 conversión clave
        ...(uploadedImageUrl ? { imagenUrl: uploadedImageUrl } : {}),
      };

      console.log("📤 updateData enviado a Prisma:", updateData); // 👈 Útil para debug

      return this.productosService.update(Number(id), updateData);
    } catch (err) {
      console.error('❌ Error en update producto:', err);
      throw new InternalServerErrorException('No se pudo actualizar el producto');
    }
  }

  // ELIMINAR PRODUCTO
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.productosService.delete(Number(id));
  }

  // RESTAR STOCK
  @Post(':id/restar-stock')
  async restarStock(
    @Param('id') id: string,
    @Body() body: { cantidad: number },
  ) {
    const cantidad = Number(body.cantidad);
    if (isNaN(cantidad) || cantidad <= 0) {
      throw new BadRequestException('Cantidad inválida');
    }
    return this.productosService.restarStock(Number(id), cantidad);
  }
}
