import { INestApplication, ValidationPipe } from '@nestjs/common';

export function configureApp(app: INestApplication) {
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,             // strip properties not in the DTO
      forbidNonWhitelisted: true,  // reject requests with unknown fields
      transform: true,             // auto-convert payloads to DTO instances
    }),
  );
}