import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('signup')
  async signup(
    @Body()
    body: {
      name: string;
      email: string;
      password: string;
      role: string;
      phoneNumber?: string;
    },
  ) {
    return this.usersService.register(
      body.name,
      body.email,
      body.password,
      body.role,
      body.phoneNumber,
    );
  }

  @Post('signin')
  async signin(@Body() body: { email: string; password: string }) {
    return this.usersService.login(body.email, body.password);
  }
  @Get('me')
  @UseGuards(JwtAuthGuard) // ✅ Protect route using JWT
  getMe(@Req() req) {
    return req.user; // ✅ Returns user data if token is valid
  }
}
