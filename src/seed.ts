import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const productos = [
    { nombre: 'Laptop', descripcion: 'Laptop gamer con 16GB RAM', precio: 1500.5, stock: 10 },
    { nombre: 'Mouse', descripcion: 'Mouse gamer RGB', precio: 25.99, stock: 50 },
    { nombre: 'Teclado', descripcion: 'Teclado mecánico', precio: 80.0, stock: 20 },
    { nombre: 'Monitor', descripcion: 'Monitor 27 pulgadas 144Hz', precio: 300.0, stock: 15 },
    { nombre: 'Auriculares', descripcion: 'Auriculares inalámbricos con micrófono', precio: 60.0, stock: 30 },
    { nombre: 'Silla gamer', descripcion: 'Silla ergonómica para gaming', precio: 200.0, stock: 10 },
    { nombre: 'Webcam', descripcion: 'Webcam Full HD', precio: 45.0, stock: 25 },
    { nombre: 'Disco SSD', descripcion: 'SSD 1TB NVMe', precio: 120.0, stock: 20 },
    { nombre: 'Memoria RAM', descripcion: '16GB DDR4', precio: 75.0, stock: 40 },
    { nombre: 'Fuente de poder', descripcion: 'Fuente 650W 80+ Gold', precio: 90.0, stock: 15 },
  ];

  for (const p of productos) {
    await prisma.producto.upsert({
      where: { nombre: p.nombre }, // ✅ usa nombre como único
      update: {},                  // nada que actualizar si ya existe
      create: p,                   // crear si no existe
    });
  }

  console.log('✅ Productos insertados correctamente');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
