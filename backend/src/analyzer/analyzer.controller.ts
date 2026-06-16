import { Controller, Post, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { AnalyzerService } from './analyzer.service';

@Controller('analyzer')
export class AnalyzerController {
  constructor(private readonly analyzerService: AnalyzerService) {}

  @Post('upload')
  @UseInterceptors(FilesInterceptor('files')) // 'files' ලෙස වෙනස් විය
  uploadFiles(@UploadedFiles() files: Array<any>) { // Array එකක් ලෙස භාර ගනී
    return this.analyzerService.processDocuments(files);
  }
}