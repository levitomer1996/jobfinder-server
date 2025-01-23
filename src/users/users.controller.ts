import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { SignupDTO } from './DTO/SignupDTO';
import { User } from './schemas/user.schema';
import { GetUser } from './Decorators/get-user.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('signup')
  async signup(
    @Body()
    signupDTO: SignupDTO,
  ) {
    return this.usersService.register(
      signupDTO.name,
      signupDTO.email,
      signupDTO.password,
      signupDTO.role,
      signupDTO.phoneNumber,
    );
  }

  @Post('signin')
  async signin(@Body() body: { email: string; password: string }) {
    return this.usersService.login(body.email, body.password);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard) // ✅ Protect route using JWT
  getMe(@GetUser() user: User) {
    console.log(user);
    return user; // ✅ Returns user data if token is valid
  }
}
