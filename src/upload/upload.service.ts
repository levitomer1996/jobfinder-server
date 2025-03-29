// src/upload/upload.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Pdf, PdfDocument } from './Schemas/pdf.schema';
import {
  JobSeeker,
  JobSeekerDocument,
} from 'src/jobseekers/schemas/jobseeker.schema';
import { JobseekersService } from 'src/jobseekers/jobseekers.service';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  constructor(
    @InjectModel(Pdf.name) private pdfModel: Model<PdfDocument>,
    private readonly jobseekerSerivce: JobseekersService,
  ) {}

  async savePdfResumeMetadata(userId: string, token: String, filename: String) {
    try {
      const pdf = new this.pdfModel({ userId, token, filename });
      this.logger.log(
        `Creating PDF metadata saved for user: ${userId}, file: ${filename}`,
      );
      this.logger.log(`Saving PDF: ${userId}, file: ${filename}`);
      const result = await pdf.save();
      this.logger.log(
        `PDF metadata saved for user: ${userId}, file: ${filename}`,
      );
      this.logger.log(
        `Trying to save Resume for user id: ${userId}, file: ${filename}`,
      );
      await this.jobseekerSerivce.addResumeToJobSeeker(
        userId,
        `${pdf.filename}_${pdf._id}`,
      );

      return result;
    } catch (error) {
      this.logger.error(
        `Failed to save PDF metadata for user: ${userId}`,
        error.stack,
      );
      throw error;
    }
  }
}
