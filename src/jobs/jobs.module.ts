import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Job, JobSchema } from './schemas/job.schema';
import { User, UserSchema } from 'src/users/schemas/user.schema';
import { Skill, SkillSchema } from 'src/skill/schemas/skill.schema';
import { PassportModule } from '@nestjs/passport';
import { EmployersModule } from 'src/employers/employers.module';
import {
  Employer,
  EmployerSchema,
} from 'src/employers/schemas/employer.schema';
import { EmployersService } from 'src/employers/employers.service';
import { SkillService } from 'src/skill/skill.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Job.name, schema: JobSchema },
      { name: User.name, schema: UserSchema },
      { name: Skill.name, schema: SkillSchema },
      { name: Employer.name, schema: EmployerSchema },
    ]),
    EmployersModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: 'tomer',
      signOptions: { expiresIn: '24h' }, // ✅ Set token expiration
    }),
  ],
  providers: [JobsService, EmployersService, SkillService],
  controllers: [JobsController],
})
export class JobsModule {}
