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
    this.logger.log(`Received job creation request from user ID: ${userId}`);

    try {
      this.logger.log(`Looking up employer for user ID: ${userId}`);
      const employer = await this.employerService.findEmployerByUser(userId);

      if (!employer) {
        this.logger.warn(`No employer found for user ID: ${userId}`);
        throw new BadRequestException(`Employer profile not found for user.`);
      }

      this.logger.log(
        `Creating new job: ${createJobDto.title} for employer ID: ${employer._id}`,
      );

      const requiredSkillsToPush = await this.skillService.createMultipleSkills(
        createJobDto.requiredSkills,
      );

      const newJob = new this.jobModel({
        ...createJobDto,
        postedBy: employer._id,
      });

      newJob.requiredSkills = requiredSkillsToPush;

      await newJob.save();
      this.logger.log(`Job successfully created - ID: ${newJob.id}`);

      this.logger.log(
        `Adding job ID: ${newJob.id} to employer ID: ${employer._id}`,
      );
      await this.employerService.addJobToEmployerById(employer._id, newJob.id);
      this.logger.log(
        `Job ID: ${newJob.id} linked to employer ID: ${employer._id}`,
      );

      return newJob;
    } catch (error) {
      this.logger.error(`Error creating job: ${error.message}`, error.stack);

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Failed to create job. Please try again.',
      );
    }
  }

  async getAllJobs() {
    return await this.jobModel.find();
  }
  async getJobById(id: Types.ObjectId) {
    return await this.jobModel.findById(id);
  }
  async getJobsByUser(userId: string): Promise<Job[]> {
    this.logger.log(`Fetching jobs for user ID: ${userId}`);

    try {
      this.logger.log(`Looking up employer for user ID: ${userId}`);
      const employer = await this.employerService.findEmployerByUser(userId);

      if (!employer) {
        this.logger.warn(`No employer found for user ID: ${userId}`);
        throw new NotFoundException(`Employer profile not found.`);
      }

      this.logger.log(`Fetching jobs for employer ID: ${employer._id}`);
      const jobs = await this.jobModel.find({ postedBy: employer._id });
      this.logger.log(
        `Found ${jobs.length} job(s) for employer ID: ${employer._id}`,
      );

      return jobs;
    } catch (error) {
      this.logger.error(
        `Error fetching jobs for user ID: ${userId}`,
        error.stack,
      );

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(`Failed to retrieve jobs.`);
    }
  }

  async getJobsByLocation(location: string) {
    this.logger.log(`Searching for jobs by location: ${location}`);
    try {
      const jobs = await this.jobModel.find({
        location: { $regex: `^${location}$`, $options: 'i' },
      });
      this.logger.log(`Found ${jobs.length} jobs for location: ${location}`);
      return jobs;
    } catch (error) {
      this.logger.error(
        `Error while searching jobs by location: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Failed to fetch jobs by location.',
      );
    }
  }

  async getJobsByTitle(title: string) {
    this.logger.log(`Searching for jobs by title: ${title}`);
    try {
      const jobs = await this.jobModel.find({
        jobTitle: { $regex: `^${title}$`, $options: 'i' },
      });
      this.logger.log(`Found ${jobs.length} jobs for title: ${title}`);
      return jobs;
    } catch (error) {
      this.logger.error(
        `Error while searching jobs by title: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to fetch jobs by title.');
    }
  }

  async getJobsByTitleAndLocation(title?: string, location?: string) {
    this.logger.log(
      `Searching for jobs by title and/or location. Title: ${title}, Location: ${location}`,
    );
    try {
      const filter: any = {};

      if (title) {
        filter.title = { $regex: title, $options: 'i' };
      }

      if (location) {
        filter.location = { $regex: location, $options: 'i' };
      }

      const jobs = await this.jobModel.find(filter);
      this.logger.log(`Found ${jobs.length} jobs matching filters`);
      return jobs;
    } catch (error) {
      this.logger.error(
        `Error while searching jobs with filters: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Failed to fetch jobs by title and location.',
      );
    }
  }

  async addApplicationToJobByJobId(id: any, appId: any) {
    this.logger.log(`Adding application ID: ${appId} to job ID: ${id}`);
    try {
      await this.jobModel.updateOne(
        { _id: new Types.ObjectId(id) },
        { $push: { applicants: appId } },
      );
      this.logger.log(
        `Successfully added application ID: ${appId} to job ID: ${id}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to add application to job: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Failed to update job with application.',
      );
    }
  }

  async getAppliedJobsByUser(applicants: string): Promise<Job[]> {
    return await this.jobModel.find({ applicants });
  }
}
