import 'reflect-metadata';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { parseOrigins } from './config/cors';

// Minimal hardening headers for a JSON-only API (no dependency required).
function securityHeaders(_req: any, res: any, next: () => void) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-site');
  res.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'");
  res.setHeader('Cache-Control', 'no-store');
  if (process.env.NODE_ENV === 'production') res.setHeader('Strict-Transport-Security', 'max-age=15552000; includeSubDomains');
  next();
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const http = app.getHttpAdapter().getInstance();
  http.disable('x-powered-by');
  if (process.env.TRUST_PROXY === 'true') http.set('trust proxy', 1); // only behind a reverse proxy you control
  app.use(securityHeaders);
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, forbidUnknownValues: true, transform: true }));
  app.enableCors({
    origin: parseOrigins(process.env.CORS_ORIGIN),
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 600,
  });
  app.enableShutdownHooks();
  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port, '0.0.0.0');
  new Logger('Bootstrap').log(`RAYNEX API listening on port ${port}`);
}

// A rejected promise nobody awaited must be logged and must stop the process (the orchestrator restarts it) rather than leave it in an unknown state.
process.on('unhandledRejection', (reason) => {
  new Logger('Process').error(reason instanceof Error ? reason.stack ?? reason.message : String(reason));
  process.exit(1);
});

bootstrap().catch((error) => {
  new Logger('Bootstrap').error(error instanceof Error ? error.stack ?? error.message : String(error));
  process.exit(1);
});
