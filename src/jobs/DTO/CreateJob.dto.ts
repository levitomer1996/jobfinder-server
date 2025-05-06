import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateJobDto {
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'Description is required' })
  description: string;

  @IsOptional() // This makes it completely optional
  @Type(() => Number)
  @IsNumber({}, { message: 'Salary range minimum must be a valid number' })
  @Min(0, { message: 'Salary range minimum must be a positive number' })
  salaryRangeMin?: number | null;

  @IsOptional() // This makes it completely optional
  @Type(() => Number)
  @IsNumber({}, { message: 'Salary range maximum must be a valid number' })
  @Min(0, { message: 'Salary range maximum must be a positive number' })
  salaryRangeMax?: number | null;

  @IsString()
  @IsNotEmpty({ message: 'Location is required' })
  location: string;

  @IsString() //
  requiredSkills: string[];
}
