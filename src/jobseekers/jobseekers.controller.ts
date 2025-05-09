import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Post,
  Query,
  Type,
  UseGuards,
} from '@nestjs/common';
import { JobseekersService } from './jobseekers.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from 'src/users/Decorators/get-user.decorator';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import JwtPayload from 'src/auth/JwtPayload';
import { Types } from 'mongoose';
import { Skill } from 'src/skill/schemas/skill.schema';

@Controller('jobseekers')
export class JobseekersController {
  constructor(private readonly jobseekersService: JobseekersService) {}
  logger = new Logger('Jobseeker-controller');
  @Get('/getbyuser')
  @UseGuards(JwtAuthGuard) // ✅ Protect with authentication
  async getJobSeekerByUser(@GetUser() user: JwtPayload) {
    this.logger.log(user._id);
    return this.jobseekersService.getJobSeekerByUser(user);
  }

  @Post('/addskilltojobseeker')
  @UseGuards(JwtAuthGuard)
  async addSkillToJobSeeker(
    @GetUser() user: User,
    @Body() body: { names: string[]; jobSeekerProfileId: Types.ObjectId },
  ) {
    return await this.jobseekersService.addSkillToJobSeeker(
      new Types.ObjectId(body.jobSeekerProfileId),
      body.names,
    );
  }
  @UseGuards(JwtAuthGuard)
  @Get('getskillsbyuserid')
  async getSkillsByUserId(
    @Query('jobseekerid') jobseekerId: string,
  ): Promise<Skill[]> {
    return await this.jobseekersService.getSkillsByJobSeekerID(
      new Types.ObjectId(jobseekerId),
    );
  }
}
