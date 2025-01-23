import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsOptional,
  IsEnum,
} from 'class-validator';

export class SignupDTO {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  @MaxLength(20)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/, {
    message:
      'Password must be at least 6 characters long, contain letters and numbers',
  })
  password: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsEnum(['jobseeker', 'employer'])
  role: string;
}
