import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { CreateApplicationDto } from './dto/create-application.dto';
import { Application, ApplicationDocument } from './schemas/application.schema';
import { Job, JobDocument } from 'src/jobs/schemas/job.schema';
import { JobsService } from 'src/jobs/jobs.service';
import { App } from 'supertest/types';
import { NotificationService } from 'src/notification/notification.service';
import { JobseekersService } from 'src/jobseekers/jobseekers.service';
import { EmployersService } from 'src/employers/employers.service';

@Injectable()
export class ApplicationService {
  constructor(
    @InjectModel(Application.name)
    private applicationModel: Model<ApplicationDocument>,
    private readonly jobService: JobsService,
    private readonly notificationService: NotificationService,
    @Inject(forwardRef(() => EmployersService)) // ✅ אותו דבר כאן
    private readonly employerService: EmployersService,
  ) {}
  private readonly logger = new Logger(ApplicationService.name);
  async create(
    createApplicationDto: CreateApplicationDto,
  ): Promise<Application> {
    const createdApplication = new this.applicationModel(createApplicationDto);
    this.logger.log(`Saving new aplication - ${createdApplication._id}`);
    await createdApplication.save();
    this.logger.log(`Applocation ${createdApplication._id} saved.`);

    this.logger.log(
      `Attaching Aplication - ${createdApplication._id} to job - ${createApplicationDto.jobId}`,
    );

    await this.jobService.addApplicationToJobByJobId(
      createApplicationDto.jobId,
      createdApplication._id,
    );
    this.logger.log(
      `Attached Aplication - ${createdApplication._id} to job - ${createApplicationDto.jobId}`,
    );
    const foundJob = await this.jobService.getJobById(
      new Types.ObjectId(createApplicationDto.jobId),
    );
    const foundEmployer = await this.employerService.getEmployerById(
      foundJob.postedBy,
    );
    await this.notificationService.createNotification(
      foundEmployer.user,
      'You have new job seeker aplication',
    );

    return createdApplication;
  }

  async getApllicationByJobSeekerId(jobSeekerId: any): Promise<Application[]> {
    return await this.applicationModel.find({ jobSeekerId });
  }
  async getNotApplicationByJobSeekerId(
    jobSeekerId: any,
  ): Promise<Application[]> {
    const objId = new Types.ObjectId(jobSeekerId);

    return this.applicationModel.find({
      jobSeekerId: { $ne: objId },
    });
  }
  async getApplicationsByJobId(jobId: Types.ObjectId): Promise<Application[]> {
    return await this.applicationModel.find({ jobId });
  }
}
