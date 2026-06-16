import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AnalyzerModule } from './analyzer/analyzer.module';

@Module({
  imports: [
    ConfigModule.forRoot(), // .env ෆයිල් එක කියවන්න මේ පේළිය අලුතින් දැම්මා
    AnalyzerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}