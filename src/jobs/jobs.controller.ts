import {
  Controller,
  Post,
  Body,
  UseGuards,
  Logger,
  Get,
  Query,
} from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './DTO/CreateJob.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { GetUser } from 'src/users/Decorators/get-user.decorator';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}
  private readonly logger = new Logger(JobsController.name);

  @Post('create')
  @UseGuards(JwtAuthGuard)
  async createJob(@Body() createJobDto: CreateJobDto, @GetUser() user: any) {
    this.logger.log(`Creating job for user ${user._id}`);
    return this.jobsService.create(createJobDto, user._id);
  }

  @Get('getbyuser')
  @UseGuards(JwtAuthGuard)
  async getJobsByUser(@GetUser() user: any) {
    this.logger.log(`Fetching jobs for user ${user._id}`);
    return this.jobsService.getJobsByUser(user._id);
  }

  @Get('bylocation')
  async getJobByLocation(@Query('q') q: string) {
    this.logger.log(`Searching jobs by location: ${q}`);
    return this.jobsService.getJobsByLocation(q);
  }

  @Get('getbytitle')
  async getJobByTitle(@Query('q') q: string) {
    this.logger.log(`Searching jobs by title: ${q}`);
    return this.jobsService.getJobsByTitle(q);
  }

  @Get('searchjob')
  async getJobByTitleAndLocation(
    @Query('title') title: string,
    @Query('location') location: string,
  ) {
    this.logger.log(
      `Searching jobs by title="${title}" and location="${location}"`,
    );
    return await this.jobsService.getJobsByTitleAndLocation(title, location);
  }
}
