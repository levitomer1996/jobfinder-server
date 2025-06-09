import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateJobDto {
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'Description is required' })
  description: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Salary range minimum must be a valid number' })
  @Min(0, { message: 'Salary range minimum must be a positive number' })
  salaryRangeMin?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Salary range maximum must be a valid number' })
  @Min(0, { message: 'Salary range maximum must be a positive number' })
  salaryRangeMax?: number | null;

  @IsString()
  @IsNotEmpty({ message: 'Location is required' })
  location: string;

  @IsString({ each: true })
  requiredSkills: string[];

  // ✅ New Field: jobType
  @IsString()
  @IsIn(['full-time', 'part-time'], {
    message: 'Job type must be either "full-time" or "part-time"',
  })
  jobType: 'full-time' | 'part-time';
}
