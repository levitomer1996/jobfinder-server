import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { EmployersService } from './employers.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../users/Decorators/get-user.decorator';

@Controller('employers')
export class EmployersController {
  constructor(private readonly employersService: EmployersService) {}

  @UseGuards(JwtAuthGuard)
  @UsePipes(ValidationPipe)
  @Get('/getbyuser') // ✅ Get Employer Profile by User
  async getEmployerByUser(@GetUser() user) {
    return this.employersService.getEmployerByUser(user._id);
  }
}
