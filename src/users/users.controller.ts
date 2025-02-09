import { Controller, Post, Body, Get, UseGuards, Logger } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { JobSeekerSignupDTO, EmployerSignupDTO } from './DTO/SignupDTO';
import { User } from './schemas/user.schema';
import { GetUser } from './Decorators/get-user.decorator';
import Log from 'src/Helpers/Log';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  logger = new Logger('User controller');

  // ✅ Register JobSeeker
  @Post('register/jobseeker')
  async registerJobSeeker(@Body() jobSeekerDTO: JobSeekerSignupDTO) {
    return this.usersService.registerJobSeeker(
      jobSeekerDTO.name,
      jobSeekerDTO.email,
      jobSeekerDTO.password,
      jobSeekerDTO.phoneNumber,
    );
  }

  // ✅ Register Employer
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
  getMe(@GetUser() user: User) {
    return user;
  }
}
