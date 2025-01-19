import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { JobseekersModule } from './jobseekers/jobseekers.module';
import { EmployersModule } from './employers/employers.module';
import { JobsModule } from './jobs/jobs.module';
import { ApplicationsModule } from './applications/applications.module';
import { MessagesModule } from './messages/messages.module';
import { InterviewsModule } from './interviews/interviews.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/jobtracker'), // Change to your MongoDB URI
    UsersModule,
    JobseekersModule,
    EmployersModule,
    JobsModule,
    ApplicationsModule,
    MessagesModule,
    InterviewsModule,
  ],
})
export class AppModule {}
