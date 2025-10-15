import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  try {
    console.log('📦 Iniciando aplicación NestJS...');
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
      logger: ['error', 'warn', 'log'],
    });

    const allowedOrigins = [
      'http://localhost:3000',
      process.env.FRONTEND_URL || 'https://sistema-de-inventario-kwdlo2rak-dami-bots-projects.vercel.app/',
      'https://sistema-de-inventario-ccb7dyyxp-dami-bots-projects.vercel.app',
      'https://sistema-de-inventario-three.vercel.app/ '
    ];

    console.log('✅ FRONTEND_URL:', process.env.FRONTEND_URL);
    console.log('✅ Allowed origins:', allowedOrigins);
    app.enableCors({
      origin: true, // 👈 acepta cualquier origen (solo para test)
      credentials: true,
    });

    /* 
        app.enableCors({
          origin: (origin, callback) => {
            if (!origin) return callback(null, true);
            if (allowedOrigins.includes(origin)) {
              callback(null, true);
            } else {
              console.error('❌ CORS bloqueado para origen:', origin);
              callback(new Error('CORS no permitido'));
            }
          },
          credentials: true,
        }); */

    const port = process.env.PORT || 8080;
    console.log(`🚀 Intentando iniciar en puerto ${port}...`);

    await app.listen(port, '0.0.0.0');
    console.log(`✅ Servidor corriendo en http://0.0.0.0:${port}`);
  } catch (error) {
    console.error('❌ Error crítico en bootstrap:', error);
  }
}

bootstrap();
