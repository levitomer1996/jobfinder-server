import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { JobseekersModule } from './jobseekers/jobseekers.module';
import { EmployersModule } from './employers/employers.module';
import { JobsModule } from './jobs/jobs.module';
import { ApplicationsModule } from './applications/applications.module';
import { MessagesModule } from './messages/messages.module';
import { InterviewsModule } from './interviews/interviews.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { SkillModule } from './skill/skill.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // Load .env globally
    MongooseModule.forRoot(process.env.MONGO_URI), // Change to your MongoDB URI
    UsersModule,
    JobseekersModule,
    EmployersModule,
    JobsModule,
    ApplicationsModule,
    MessagesModule,
    InterviewsModule,
    AuthModule,
    SkillModule,
  ],
})
export class AppModule {}
