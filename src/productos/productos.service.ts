import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

@Injectable()
export class ProductosService {
  constructor(private prisma: PrismaService) { }

  async findAll({ skip = 0, take = 20 }: { skip?: number; take?: number }) {
    try {
      const productos = await this.prisma.producto.findMany({
        skip,
        take,
        orderBy: { id: 'desc' },
      });

      console.log(`📦 Productos encontrados (${productos.length}):`, productos);
      return productos;
    } catch (error) {
      console.error('❌ Error en findAll():', error.message);
      throw new BadRequestException('Error al obtener productos');
    }
  }

  // ✅ Obtener un producto por ID (queda igual)
  async findById(id: number) {
    return this.prisma.producto.findUnique({ where: { id } });
  }




  async create(
    data: { nombre: string; descripcion?: string; stock: number; precio: number; ofertaDiaria?: boolean, vencimiento?: Date | null; },
    file?: Express.Multer.File,
  ) {
    let uploadedImageUrl: string | null = null;

    if (file) {
      try {
        const result = await new Promise<any>((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: 'productos' },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            },
          );
          stream.end(file.buffer); // 👈 subimos desde buffer
        });

        uploadedImageUrl = result.secure_url;
      } catch (err) {
        console.error('❌ Error subiendo imagen a Cloudinary:', err);
        throw new BadRequestException('No se pudo subir la imagen');
      }
    }

    return this.prisma.producto.create({
      data: {
        ...data,
        imagenUrl: uploadedImageUrl,
      },
    });
  }


  async update(
    id: number,
    data: Partial<{
      nombre: string;
      descripcion: string;
      precio: number;
      stock: number;
      ofertaDiaria: boolean;
      vencimiento: string | Date | null;
    }>,
    file?: Express.Multer.File, // 👈 agregamos este parámetro opcional
  ) {
    let uploadedImageUrl: string | undefined = undefined;

    // ✅ Si se subió una nueva imagen, la subimos a Cloudinary
    if (file) {
      try {
        const result = await new Promise<any>((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: 'productos' },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            }
          );
          stream.end(file.buffer);
        });

        uploadedImageUrl = result.secure_url;
      } catch (err) {
        console.error('❌ Error subiendo imagen a Cloudinary:', err);
        throw new BadRequestException('No se pudo subir la imagen');
      }
    }
    if (data.vencimiento !== undefined) {
      data.vencimiento = data.vencimiento ? new Date(data.vencimiento) : null;
    }

    // ✅ Convertir tipos antes de actualizar
    if (data.precio !== undefined) {
      data.precio = Number(data.precio);
    }
    if (data.stock !== undefined) {
      data.stock = Number(data.stock);
    }


    // ✅ Actualizamos el producto en la base de datos
    return this.prisma.producto.update({
      where: { id },
      data: {
        ...data,
        ...(uploadedImageUrl ? { imagenUrl: uploadedImageUrl } : {}),
      },
    });
  }

  async delete(id: number) {
    return this.prisma.producto.delete({ where: { id } });
  }

  async restarStock(id: number, cantidad: number) {
    const producto = await this.prisma.producto.findUnique({ where: { id } });
    if (!producto || producto.stock < cantidad) {
      throw new BadRequestException('Stock insuficiente');
    }
    return this.prisma.producto.update({
      where: { id },
      data: { stock: producto.stock - cantidad },
    });
  }
}
