import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { Pdf, PdfSchema } from './Schemas/pdf.schema';
import { JobseekersService } from 'src/jobseekers/jobseekers.service';
import { JobSeekerSchema } from 'src/jobseekers/schemas/jobseeker.schema';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: 'tomer',
      signOptions: { expiresIn: '24h' }, // ✅ Set token expiration
    }),
    MongooseModule.forFeature([{ name: Pdf.name, schema: PdfSchema }]),
    MongooseModule.forFeature([{ name: 'JobSeeker', schema: JobSeekerSchema }]),
  ],
  controllers: [UploadController],
  providers: [UploadService, JobseekersService],
})
export class UploadModule {}
