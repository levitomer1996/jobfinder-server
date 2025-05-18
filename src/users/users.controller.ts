import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Logger,
  NotFoundException,
  Param,
  Req,
  Res,
} from '@nestjs/common';
import { GoogleAuthPayload, UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { JobSeekerSignupDTO, EmployerSignupDTO } from './DTO/SignupDTO';
import { User } from './schemas/user.schema';
import { GetUser } from './Decorators/get-user.decorator';
import { JobseekersService } from 'src/jobseekers/jobseekers.service';
import { Types } from 'mongoose';
import { EmployersService } from 'src/employers/employers.service';
import { UploadService } from 'src/upload/upload.service';
import { AuthGuard } from '@nestjs/passport';
import { Response, Request } from 'express'; // ✅ make sure you import this

@Controller('users')
export class UsersController {
  private readonly logger = new Logger('UserController');

  constructor(
    private readonly usersService: UsersService,
    private readonly jobSeekerService: JobseekersService,
    private readonly uploadService: UploadService,
    private readonly employerService: EmployersService,
  ) {}

  @Post('register/jobseeker')
  async registerJobSeeker(@Body() jobSeekerDTO: JobSeekerSignupDTO) {
    return this.usersService.registerJobSeeker(
      jobSeekerDTO.name,
      jobSeekerDTO.email,
      jobSeekerDTO.password,
      jobSeekerDTO.phoneNumber,
    );
  }

  @Post('register/employer')
  async registerEmployer(@Body() employerDTO: EmployerSignupDTO) {
    return this.usersService.registerEmployer(
      employerDTO.name,
      employerDTO.email,
      employerDTO.password,
      employerDTO.phoneNumber,
      employerDTO.companyName,
    );
  }

  @Post('signin')
  async signin(@Body() body: { email: string; password: string }) {
    return this.usersService.login(body.email, body.password);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@GetUser() user: User) {
    if (user.role === 'jobseeker') {
      const foundJobseeker =
        await this.jobSeekerService.getJobSeekerProfileByUserId(user._id);

      const foundResumes = await this.uploadService.getResumeById(
        foundJobseeker.resume,
      );

      const appliedJobs =
        await this.jobSeekerService.getAppliedJobsByJobSeekerId(
          foundJobseeker._id,
        );

      const suggestedJobs =
        await this.usersService.makeSuggestedJobsByContentBasedFiltering(
          user,
          foundJobseeker._id,
        );

      return {
        ...user,
        jobSeekerProfile: foundJobseeker,
        resumes: foundResumes,
        suggestedJobs,
        appliedJobs,
      };
    } else if (user.role === 'employer') {
      const foundEmployer = await this.employerService.getEmployerByUserId(
        user._id,
      );
      return { ...user, employerProfile: foundEmployer };
    } else {
      return;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('/getuserbyemployerid')
  async getUserByEmployerId(@Body() body) {
    return await this.usersService.getUserByEmployerId(
      new Types.ObjectId(body.id),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('/getapplicantsbyjobid/:id')
  async getApplicantsByJobId(@Param('id') id: string) {
    try {
      const jobId = new Types.ObjectId(id);
      return await this.usersService.getApliedUsersByJobId(jobId);
    } catch {
      throw new NotFoundException('Invalid job ID or job not found.');
    }
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Redirects to Google - handled by Passport
  }

  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(
    @Req() req: Request,
    @Res({ passthrough: false }) res: Response,
  ) {
    const user = req.user as GoogleAuthPayload;

    const token = await this.usersService.googleLoginOrRegister(user);

    res.redirect(`http://localhost:3000/oauth2callback?token=${token}`);
  }
}
