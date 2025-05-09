import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { Pdf, PdfSchema } from './Schemas/pdf.schema';
import { JobseekersService } from 'src/jobseekers/jobseekers.service';
import { JobSeekerSchema } from 'src/jobseekers/schemas/jobseeker.schema';
import {
  Application,
  ApplicationSchema,
} from 'src/applications/schemas/application.schema';
import { ApplicationsModule } from 'src/applications/applications.module';
import { JobsModule } from 'src/jobs/jobs.module';
import { SkillModule } from 'src/skill/skill.module';

@Module({
  imports: [
    ApplicationsModule,
    JobsModule,
    SkillModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: 'tomer',
      signOptions: { expiresIn: '24h' }, // ✅ Set token expiration
    }),
    MongooseModule.forFeature([{ name: Pdf.name, schema: PdfSchema }]),
    MongooseModule.forFeature([{ name: 'JobSeeker', schema: JobSeekerSchema }]),
    MongooseModule.forFeature([
      { name: Application.name, schema: ApplicationSchema },
    ]),
  ],
  controllers: [UploadController],
  providers: [UploadService, JobseekersService],
})
export class UploadModule {}
