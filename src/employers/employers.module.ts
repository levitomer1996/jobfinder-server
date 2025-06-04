import { forwardRef, Module } from '@nestjs/common';
import { EmployersService } from './employers.service';
import { EmployersController } from './employers.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Employer, EmployerSchema } from './schemas/employer.schema';
import { User, UserSchema } from 'src/users/schemas/user.schema';
import { UsersModule } from 'src/users/users.module';
import { ApplicationsModule } from 'src/applications/applications.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Employer.name, schema: EmployerSchema },
    ]),
    forwardRef(() => ApplicationsModule),
    forwardRef(() => UsersModule),
  ],
  providers: [EmployersService],
  controllers: [EmployersController],
  exports: [EmployersService],
})
export class EmployersModule {}
