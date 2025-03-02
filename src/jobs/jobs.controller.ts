import { Controller, Post, Body, UseGuards, Logger, Get } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './DTO/CreateJob.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { User } from 'src/users/schemas/user.schema';
import { GetUser } from 'src/users/Decorators/get-user.decorator';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}
  private readonly logger = new Logger(JobsController.name);
  @Post('create')
  @UseGuards(JwtAuthGuard)
  async createJob(@Body() createJobDto: CreateJobDto, @GetUser() user: any) {
    this.logger.log(user);
    return this.jobsService.create(createJobDto, user.userId);
  }

  @Get('getbyuser')
  @UseGuards(JwtAuthGuard)
  async getJobsByUser(@GetUser() user: any) {
    this.logger.log(user);
    return this.jobsService.getJobsByUser(user.userId);
  }
}
