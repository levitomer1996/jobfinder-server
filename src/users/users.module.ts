import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UploadService } from 'src/upload/upload.service';
import { Pdf, PdfSchema } from 'src/upload/Schemas/pdf.schema';
import {
  ProfileImage,
  ProfileImageSchema,
} from 'src/upload/Schemas/profileimage.schema';
import { Skill, SkillSchema } from 'src/skill/schemas/skill.schema';
import { Company, CompanySchema } from 'src/company/schemas/company.schema';
import { GoogleStrategy } from 'src/auth/google.strategy';

import { SkillModule } from 'src/skill/skill.module';
import { CompanyModule } from 'src/company/company.module';
import { NotificationModule } from 'src/notification/notification.module';
import { ChatModule } from 'src/chat/chat.module';

// ✅ במקום לייבא ולספק שירותים חיצוניים - נייבא את המודולים שלהם
import { JobseekersModule } from 'src/jobseekers/jobseekers.module';
import { EmployersModule } from 'src/employers/employers.module';
import { ApplicationsModule } from 'src/applications/applications.module';
import { JobsModule } from 'src/jobs/jobs.module';
import {
  JobSeeker,
  JobSeekerSchema,
} from 'src/jobseekers/schemas/jobseeker.schema';
import {
  Employer,
  EmployerSchema,
} from 'src/employers/schemas/employer.schema';
import { UserGateway } from './users.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Pdf.name, schema: PdfSchema },
      { name: ProfileImage.name, schema: ProfileImageSchema },
      { name: Skill.name, schema: SkillSchema },
      { name: Company.name, schema: CompanySchema },
      { name: JobSeeker.name, schema: JobSeekerSchema }, // ✅ הוספה חשובה
      { name: Employer.name, schema: EmployerSchema },
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: 'tomer',
      signOptions: { expiresIn: '24h' },
    }),
    SkillModule,
    CompanyModule,
    NotificationModule,
    forwardRef(() => ChatModule),
    forwardRef(() => JobseekersModule), // ✅ במקום JobseekersService
    forwardRef(() => EmployersModule), // ✅ במקום EmployersService
    forwardRef(() => ApplicationsModule), // ✅ במקום ApplicationService
    forwardRef(() => JobsModule), // ✅ במקום JobsService
  ],
  providers: [UsersService, UploadService, GoogleStrategy, UserGateway],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
