import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';

import { Pdf, PdfDocument } from './Schemas/pdf.schema';
import { ResumeBase } from './Schemas/resume.abstractschema';

import {
  JobSeeker,
  JobSeekerDocument,
} from 'src/jobseekers/schemas/jobseeker.schema';
import { JobseekersService } from 'src/jobseekers/jobseekers.service';
import { JOB_SEEKER_PROFILE_ACTIONS } from 'src/jobseekers/DTO/JOB_SEEKER_PROFILE_ACTIONS.enum';

import { User, UserDocument } from 'src/users/schemas/user.schema';
import {
  ProfileImage,
  ProfileImageDocument,
} from './Schemas/profileimage.schema';
import { Company, CompanyDocument } from 'src/company/schemas/company.schema';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  constructor(
    @InjectModel(Pdf.name) private pdfModel: Model<PdfDocument>,
    private readonly jobseekerSerivce: JobseekersService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(ProfileImage.name)
    private profileImageModel: Model<ProfileImageDocument>,
    @InjectModel(Company.name)
    private companyModel: Model<CompanyDocument>,
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

      const extractedIds = idList.map((str) => {
        const parts = str.split('_');
        const id = parts[parts.length - 1];
        return new Types.ObjectId(id);
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

  async uploadProfileImage(
    userId: string,
    file: Express.Multer.File,
  ): Promise<string> {
    try {
      const fileExtension = path.extname(file.originalname);
      const filename = `profile_${userId}${fileExtension}`; // ✅ changed filename format
      const token = userId; // using userId as token
      const folderPath = path.join(
        __dirname,
        '..',
        '..',
        'uploads',
        'profileimage',
      );
      const filePath = path.join(folderPath, filename);
      const profileImageUrl = `/uploads/profileimage/${filename}`;

      this.logger.log(`Received profile image upload for user: ${userId}`);

      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
        this.logger.log(`Created directory: ${folderPath}`);
      }

      fs.writeFileSync(filePath, file.buffer);
      this.logger.log(`Saved file to: ${filePath}`);

      // Update user document
      await this.userModel.findByIdAndUpdate(userId, { profileImageUrl });
      this.logger.log(
        `Updated User ${userId} with image URL: ${profileImageUrl}`,
      );

      // Save metadata to ProfileImage collection
      const profileImage = new this.profileImageModel({
        userId,
        token,
        filename,
      });

      await profileImage.save();
      this.logger.log(`Saved ProfileImage metadata for user: ${userId}`);

      return profileImageUrl;
    } catch (error) {
      this.logger.error(
        `Failed to upload profile image for user: ${userId}`,
        error.stack,
      );
      throw new Error('Failed to upload profile image');
    }
  }

  async getProfileImageByUserId(
    userId: Types.ObjectId,
  ): Promise<string | null> {
    try {
      this.logger.log(`Fetching profile image for user: ${userId}`);

      const image = await this.profileImageModel.findOne({ userId }).lean();

      if (!image) {
        this.logger.warn(`No profile image found for user: ${userId}`);
        return null;
      }

      const profileImageUrl = `/uploads/profileimage/${image.filename}`;
      return profileImageUrl;
    } catch (error) {
      this.logger.error(
        `Failed to get profile image for user: ${userId}`,
        error.stack,
      );
      throw new Error('Failed to get profile image');
    }
  }
  async createGoogleProfileImage(
    userId: Types.ObjectId,
    profileImageUrl: string,
  ) {
    return;
  }

  async uploadCompanyProfileImage(
    companyId: string,
    file: Express.Multer.File,
  ): Promise<string> {
    try {
      this.logger.log(`🔄 Starting company image upload for ID: ${companyId}`);

      if (!Types.ObjectId.isValid(companyId)) {
        this.logger.warn(`❌ Invalid ObjectId: ${companyId}`);
        throw new Error('Invalid company ID');
      }

      const company = await this.companyModel.findById(companyId);
      if (!company) {
        this.logger.warn(`❌ Company not found with ID: ${companyId}`);
        throw new Error('Company not found');
      }

      const fileExtension = path.extname(file.originalname) || '.png';
      const filename = `company_${companyId}${fileExtension}`;
      const folderPath = path.join(
        __dirname,
        '..',
        '..',
        'uploads',
        'companyimage',
      );
      const filePath = path.join(folderPath, filename);
      const profileImageUrl = `/uploads/companyimage/${filename}`;

      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
        this.logger.log(`📁 Created directory: ${folderPath}`);
      }

      fs.writeFileSync(filePath, file.buffer);
      this.logger.log(`📦 Saved company image to: ${filePath}`);

      company.profileImage = profileImageUrl;
      await company.save();

      this.logger.log(
        `✅ Updated company (${companyId}) with new profile image: ${profileImageUrl}`,
      );

      return profileImageUrl;
    } catch (error) {
      this.logger.error(
        `🔥 Failed to upload company image for company: ${companyId}`,
        error.stack,
      );
      throw new Error('Failed to upload company profile image');
    }
  }
}
