// src/upload/upload.controller.ts
import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
  UseGuards,
  Delete,
  Logger,
  Get,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, basename } from 'path';
import { randomBytes } from 'crypto';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { GetUser } from 'src/users/Decorators/get-user.decorator';
import JwtPayload from 'src/auth/JwtPayload';
import { User } from 'src/users/schemas/user.schema';
import { Types } from 'mongoose';

@Controller('upload')
export class UploadController {
  private readonly logger = new Logger(UploadController.name);
  constructor(private readonly uploadService: UploadService) {}

  @Post('/pdf/resume')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/resume',
        filename: (req, file, cb) => {
          const originalName = basename(
            file.originalname,
            extname(file.originalname),
          );
          const extension = extname(file.originalname);
          const token = randomBytes(4).toString('hex');
          const newFilename = `${originalName}_${token}${extension}`;

          // Save token to request object for later use in upload handler
          (req as any).token = token;
          (req as any).newFilename = newFilename;

          cb(null, newFilename);
        },
      }),
    }),
  )
  async uploadPdfResume(
    @UploadedFile() file: Express.Multer.File,
    @GetUser() user: JwtPayload,
  ) {
    const token =
      (file as any).token ||
      (file as any).filename?.split('_')?.[1]?.split('.')?.[0];
    const filename = file.filename;

    // Save to DB
    const saved = await this.uploadService.savePdfResumeMetadata(
      user._id,
      token,
      filename,
    );

    return {
      message: 'Upload successful',
      file,
      saved,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('/pdf/deleteresume')
  async deleteReseume(
    @GetUser() user: User,
    @Body()
    body: {
      resumeId: string;
      jobseekerId: string;
      userId: string;
    },
  ) {
    const { resumeId, jobseekerId, userId } = body;

    if (user._id.toString() !== userId) {
      throw new Error('Unauthorized request');
    }

    return await this.uploadService.deleteReseumeForUser(
      new Types.ObjectId(jobseekerId),
      new Types.ObjectId(resumeId),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('/profile-image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadProfileImage(
    @UploadedFile() file: Express.Multer.File,
    @GetUser() user: JwtPayload,
  ) {
    const userId = user._id;

    if (!file) {
      throw new Error('No file uploaded');
    }

    // Save image to disk and update user + metadata collection
    const imageUrl = await this.uploadService.uploadProfileImage(userId, file);

    return {
      message: 'Profile image uploaded successfully',
      url: imageUrl,
    };
  }

  @Get('/profile-image-url/:userId')
  async getProfileImageUrl(@Param('userId') userId: string) {
    const id = new Types.ObjectId(userId);
    const url = await this.uploadService.getProfileImageByUserId(id);
    if (!url) {
      throw new NotFoundException('Profile image not found');
    }
    return { url };
  }
  @Post('/company-profile-image/:companyId')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadCompanyProfileImage(
    @UploadedFile() file: Express.Multer.File,
    @Param('companyId') companyId: string,
    @GetUser() user: JwtPayload,
  ) {
    if (!file) {
      throw new Error('No file uploaded');
    }

    const imageUrl = await this.uploadService.uploadCompanyProfileImage(
      companyId,
      file,
    );

    return {
      message: 'Company profile image uploaded successfully',
      url: imageUrl,
    };
  }
}
