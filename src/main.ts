import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: ['http://localhost:4200', 'https://chess-tutorials-app.web.app'],
    methods: ['GET','HEAD','PUT','PATCH','POST', 'DELETE','OPTIONS'],
    credentials: true
  });
  await app.listen(process.env.PORT || 3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
