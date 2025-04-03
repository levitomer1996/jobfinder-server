import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateApplicationDto } from './dto/create-application.dto';
import { Application, ApplicationDocument } from './schemas/application.schema';
import { Job, JobDocument } from 'src/jobs/schemas/job.schema';
import { JobsService } from 'src/jobs/jobs.service';

@Injectable()
export class ApplicationService {
  constructor(
    @InjectModel(Application.name)
    private applicationModel: Model<ApplicationDocument>,
    private readonly jobService: JobsService,
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
    return createdApplication;
  }
}
