import { IsMongoId, IsOptional, IsString } from 'class-validator';

export class CreateApplicationDto {
  @IsMongoId()
  jobId: string;

  @IsMongoId()
  jobSeekerId: string;

  @IsOptional()
  @IsString()
  resumeId?: string;

  @IsOptional()
  @IsString()
  coverLetter?: string;
}
