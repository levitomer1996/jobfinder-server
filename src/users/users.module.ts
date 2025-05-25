import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { JwtModule } from '@nestjs/jwt';
import {
  JobSeeker,
  JobSeekerSchema,
} from 'src/jobseekers/schemas/jobseeker.schema';
import {
  Employer,
  EmployerSchema,
} from 'src/employers/schemas/employer.schema';
import { PassportModule } from '@nestjs/passport';
import { JobseekersService } from 'src/jobseekers/jobseekers.service';
import { EmployersService } from 'src/employers/employers.service';
import { UploadService } from 'src/upload/upload.service';
import { Pdf, PdfSchema } from 'src/upload/Schemas/pdf.schema';
import { ApplicationService } from 'src/applications/applications.service';
import { JobsService } from 'src/jobs/jobs.service';
import { Job, JobSchema } from 'src/jobs/schemas/job.schema';
import {
  Application,
  ApplicationSchema,
} from 'src/applications/schemas/application.schema';
import { SkillService } from 'src/skill/skill.service';
import { SkillModule } from 'src/skill/skill.module';
import { Skill, SkillSchema } from 'src/skill/schemas/skill.schema';
import { GoogleStrategy } from 'src/auth/google.strategy';
import {
  ProfileImage,
  ProfileImageSchema,
} from 'src/upload/Schemas/profileimage.schema';
import { ChatModule } from 'src/chat/chat.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: JobSeeker.name, schema: JobSeekerSchema },
      { name: Employer.name, schema: EmployerSchema },
      { name: Pdf.name, schema: PdfSchema },
      { name: ProfileImage.name, schema: ProfileImageSchema },
      { name: Job.name, schema: JobSchema },
      { name: Application.name, schema: ApplicationSchema },
      { name: Skill.name, schema: SkillSchema },
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: 'tomer',
      signOptions: { expiresIn: '24h' }, // ✅ Set token expiration
    }),
    forwardRef(() => ChatModule),
  ],

  providers: [
    UsersService,
    JobseekersService,
    EmployersService,
    UploadService,
    ApplicationService,
    JobsService,
    SkillService,
    GoogleStrategy,
  ],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
