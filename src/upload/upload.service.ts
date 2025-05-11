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
import { JOB_SEEKER_PROFILE_ACTIONS } from 'src/jobseekers/DTO/JOB_SEEKER_PROFILE_ACTIONS.enum';
import { ResumeBase } from './Schemas/resume.abstractschema';

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

  async getResumeById(idList: string[]): Promise<ResumeBase[]> {
    try {
      this.logger.log(`Received raw resume IDs: ${JSON.stringify(idList)}`);

      // Extract just the Mongo ObjectId from the formatted strings
      const extractedIds = idList.map((str) => {
        const parts = str.split('_');
        const id = parts[parts.length - 1];
        return new Types.ObjectId(id); // Convert to ObjectId
      });

      this.logger.log(
        `Searching for resumes with extracted IDs: ${JSON.stringify(extractedIds)}`,
      );

      const results = await this.pdfModel.find({ _id: { $in: extractedIds } });

      this.logger.log(`Found ${results.length} resumes.`);
      return results;
    } catch (error) {
      this.logger.error(
        `Failed to fetch resumes. Error: ${error.message}`,
        error.stack,
      );
      throw new Error('An error occurred while fetching resumes');
    }
  }

  async deleteReseumeForUser(
    jobSeekerId: Types.ObjectId,
    resumeId: Types.ObjectId,
  ): Promise<ResumeBase[]> {
    this.logger.log(`Starting resume deletion for jobSeekerId: ${jobSeekerId}`);
    this.logger.log(`Attempting to remove resumeId: ${resumeId}`);

    const j = await this.jobseekerSerivce.editJobSeeker(
      jobSeekerId,
      JOB_SEEKER_PROFILE_ACTIONS.RESUME_REMOVE,
      resumeId,
    );

    if (!j) {
      this.logger.error(`JobSeeker with ID ${jobSeekerId} not found.`);
      throw new Error(`JobSeeker with ID ${jobSeekerId} not found.`);
    }

    this.logger.log(
      `Resume removed. Updated resume list: ${JSON.stringify(j.resume)}`,
    );

    const updatedResumes = await this.getResumeById(j.resume);

    this.logger.log(
      `Resolved updated resumes: ${JSON.stringify(updatedResumes)}`,
    );

    return updatedResumes;
  }
}
