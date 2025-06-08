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
import { JobSeekerSignupDTO, CreateEmployerDto } from './DTO/SignupDTO';
import { User, UserDocument } from './schemas/user.schema';
import { GetUser } from './Decorators/get-user.decorator';
import { JobseekersService } from 'src/jobseekers/jobseekers.service';
import { Types } from 'mongoose';
import { EmployersService } from 'src/employers/employers.service';
import { UploadService } from 'src/upload/upload.service';
import { AuthGuard } from '@nestjs/passport';
import { Response, Request } from 'express'; // ✅ make sure you import this
import { NotificationService } from 'src/notification/notification.service';
import { CreateApplicationDto } from 'src/applications/dto/create-application.dto';
import { ApplicationService } from 'src/applications/applications.service';
import { Application } from 'src/applications/schemas/application.schema';
import { JobsService } from 'src/jobs/jobs.service';
import UserProfilePublicDTO from './DTO/UserProfilePublic.dto';

@Controller('users')
export class UsersController {
  private readonly logger = new Logger('UserController');

  constructor(
    private readonly usersService: UsersService,

    private readonly jobSeekerService: JobseekersService,
    private readonly uploadService: UploadService,
    private readonly employerService: EmployersService,
    private readonly notificationService: NotificationService,
    private readonly applicationService: ApplicationService,
    private readonly jobService: JobsService,
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
  async registerEmployer(@Body() employerDto: CreateEmployerDto) {
    return this.usersService.registerEmployer(employerDto);
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
      this.logger.log(user);
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
      let profileImageUrl = await this.uploadService.getProfileImageByUserId(
        user._id,
      );

      const unreadedChats = await this.usersService.getUserUndreadedChats(
        user._id,
      );

      const notifications = await this.notificationService.getUserNotifications(
        user._id,
      );

      this.logger.log(`profileimagge${profileImageUrl}`);
      this.logger.log(`Profileimage user${user.profileImageUrl}`);
      const chats = await this.usersService.getUsersChats(user._id);

      return {
        ...user,
        jobSeekerProfile: foundJobseeker,
        resumes: foundResumes,
        suggestedJobs,
        appliedJobs,
        profileImageUrl:
          profileImageUrl == null ? user.profileImageUrl : profileImageUrl,
        chats,
        unreadedChats,
        notifications,
      };
    } else if (user.role === 'employer') {
      let profileImageUrl = await this.uploadService.getProfileImageByUserId(
        user._id,
      );

      const unreadedChats = await this.usersService.getUserUndreadedChats(
        user._id,
      );

      const notifications = await this.notificationService.getUserNotifications(
        user._id,
      );
      this.logger.log(
        `Found ${notifications.length} notifications for user ${user._id}`,
      );

      const foundEmployer = await this.employerService.getEmployerByUserId(
        user._id,
      );
      const chats = await this.usersService.getUsersChats(user._id);
      return {
        ...user,
        employerProfile: foundEmployer,
        profileImageUrl,
        unreadedChats,
        notifications,
        chats,
      };
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

  @Post('/createuseraplication')
  async createUserApplication(
    @Body() createApplicationDto: CreateApplicationDto,
  ): Promise<Application> {
    this.logger.log(`Payload: ${JSON.stringify(createApplicationDto)}`);
    const apllication =
      await this.applicationService.create(createApplicationDto);
    this.logger.log('Creating notification');
    this.logger.log(`Searching for Job by ID ${apllication.jobId}`);
    const foundJob = await this.jobService.getJobById(apllication.jobId);

    return apllication;
  }

  @Post('usersprofiles')
  async getUsersProfilesByIds(
    @Body() body: { ids: Types.ObjectId[] },
  ): Promise<UserProfilePublicDTO[]> {
    const foundUsers = await this.usersService.getUsersProfilesByIds(body.ids);

    return foundUsers.map((user) => ({
      _id: user._id,
      profileImageUrl: user.profileImageUrl,
      name: user.name,
      email: user.email,
    }));
  }
}
