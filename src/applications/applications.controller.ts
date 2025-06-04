import { Body, Controller, Post, HttpCode, Logger } from '@nestjs/common';
import { CreateApplicationDto } from './dto/create-application.dto';
import { Application } from './schemas/application.schema';
import { ApplicationService } from './applications.service';
import { UsersController } from 'src/users/users.controller';

@Controller('applications')
export class ApplicationController {
  private readonly logger = new Logger(ApplicationController.name);

  constructor(private readonly applicationService: ApplicationService) {}

  @Post('/create')
  async create(
    @Body() createApplicationDto: CreateApplicationDto,
  ): Promise<Application> {
    this.logger.log(`Payload: ${JSON.stringify(createApplicationDto)}`);
    const apllication =
      await this.applicationService.create(createApplicationDto);
    this.logger.log('Creating notification');
    return apllication;
  }
}
