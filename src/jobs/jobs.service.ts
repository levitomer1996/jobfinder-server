import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Job, JobDocument } from './schemas/job.schema';
import { CreateJobDto } from './DTO/CreateJob.dto';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import {
  Employer,
  EmployerDocument,
} from 'src/employers/schemas/employer.schema';
import { EmployersService } from 'src/employers/employers.service';
import { SkillService } from 'src/skill/skill.service';

@Injectable()
export class JobsService {
  constructor(
    @InjectModel(Job.name) private jobModel: Model<JobDocument>,
    @InjectModel(Employer.name) private employerModel: Model<EmployerDocument>,
    private employerService: EmployersService,
    private skillService: SkillService,
  ) {}
  private readonly logger = new Logger(JobsService.name);

  async create(createJobDto: CreateJobDto, userId: string): Promise<Job> {
    this.logger.log(`🔍 Received job creation request from user ID: ${userId}`);

    try {
      // ✅ Find the employer by user ID
      this.logger.log(`🔎 Looking up employer for user ID: ${userId}`);
      const employer = await this.employerService.findEmployerByUser(userId);

      if (!employer) {
        this.logger.warn(`❌ No employer found for user ID: ${userId}`);
        throw new BadRequestException(`Employer profile not found for user.`);
      }

      // ✅ Creating a new job
      this.logger.log(
        `🛠 Creating new job: ${createJobDto.title} for employer ID: ${employer._id}`,
      );
      const newJob = new this.jobModel({
        ...createJobDto,
        postedBy: employer._id, // ✅ Using `id` instead of `_id`
      });
      let requiredSkillsToPush = await this.skillService.createMultipleSkills(
        createJobDto.requiredSkills,
      );
      for (let i = 0; i < requiredSkillsToPush.length; i++) {
        newJob.requiredSkills.push(requiredSkillsToPush[i]);
      }
      await newJob.save();
      this.logger.log(`✅ Job successfully created - ID: ${newJob.id}`);

      // ✅ Add the job ID to the employer's job postings
      this.logger.log(
        `🔗 Adding job ID: ${newJob.id} to employer ID: ${employer._id}`,
      );
      await this.employerService.addJobToEmployerById(employer._id, newJob.id);
      this.logger.log(
        `✅ Job ID: ${newJob.id} linked to employer ID: ${employer._id}`,
      );

      return newJob;
    } catch (error) {
      this.logger.error(`❌ Error creating job: ${error.message}`, error.stack);

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Failed to create job. Please try again.',
      );
    }
  }

  async getJobsByUser(userId: string): Promise<Job[]> {
    this.logger.log(`🔍 Fetching jobs for user ID: ${userId}`);

    try {
      // ✅ Find the employer linked to this user
      this.logger.log(`🔎 Looking up employer for user ID: ${userId}`);
      const employer = await this.employerService.findEmployerByUser(userId);

      if (!employer) {
        this.logger.warn(`❌ No employer found for user ID: ${userId}`);
        throw new NotFoundException(`Employer profile not found.`);
      }

      // ✅ Fetch jobs posted by this employer
      this.logger.log(`🛠 Fetching jobs for employer ID: ${employer._id}`);
      const jobs = await this.jobModel.find({ postedBy: employer._id });

      this.logger.log(
        `✅ Found ${jobs.length} job(s) for employer ID: ${employer._id}`,
      );
      return jobs;
    } catch (error) {
      this.logger.error(
        `❌ Error fetching jobs for user ID: ${userId}`,
        error.stack,
      );

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(`Failed to retrieve jobs.`);
    }
  }

  async getJobsByLocation(location: string) {
    return await this.jobModel.find({ location });
  }

  async addApplicationToJobByJobId(id: any, appId: any) {
    try {
      this.logger.log(`Adding ${appId} to job ${id}`);
      await this.jobModel.updateOne(
        { _id: new Types.ObjectId(id) },
        { $push: { applicants: appId } },
      );
      this.logger.log(`Added ${appId} to job ${id}`);
    } catch (error) {
      this.logger.error(error);
    }
  }
}
