import { IsString, IsOptional, IsArray, IsMongoId } from 'class-validator';
import { Types } from 'mongoose';

export class CreateCompanyDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  recruiters?: Types.ObjectId[];
}
