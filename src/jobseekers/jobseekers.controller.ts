import { Controller, Get, Logger, Param, UseGuards } from '@nestjs/common';
import { JobseekersService } from './jobseekers.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from 'src/users/Decorators/get-user.decorator';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import JwtPayload from 'src/auth/JwtPayload';

@Controller('jobseekers')
export class JobseekersController {
  constructor(private readonly jobseekersService: JobseekersService) {}
  logger = new Logger('Jobseeker-controller');
  @Get('/getbyuser')
  @UseGuards(JwtAuthGuard) // ✅ Protect with authentication
  async getJobSeekerByUser(@GetUser() user: JwtPayload) {
    this.logger.log(user._id);
    return this.jobseekersService.getJobSeekerByUser(user);
    return;
  }
}
