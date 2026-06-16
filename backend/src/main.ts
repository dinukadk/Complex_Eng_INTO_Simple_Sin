import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Frontend එකට කතා කරන්න අවසර දෙන මේ පේළිය අලුතින් එකතු කළා
  app.enableCors(); 
  
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();