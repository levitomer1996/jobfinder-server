import { Controller, Get, Logger, Param, UseGuards } from '@nestjs/common';
import { JobseekersService } from './jobseekers.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from 'src/users/Decorators/get-user.decorator';
import { User, UserDocument } from 'src/users/schemas/user.schema';

@Controller('jobseekers')
export class JobseekersController {
  constructor(private readonly jobseekersService: JobseekersService) {}
  logger = new Logger('Jobseeker-controller');
  @UseGuards(JwtAuthGuard) // ✅ Protect with authentication
  @Get('/getbyuser') // ✅ GET request to fetch job seeker profile by User ID
  async getJobSeekerByUser(@GetUser() user: UserDocument) {
    this.logger.log(user.id);
    return this.jobseekersService.getJobSeekerByUser(user);
  }
}
