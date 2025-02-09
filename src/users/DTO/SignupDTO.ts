import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';

export class EmployerSignupDTO {
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Name must be at most 50 characters long' })
  name: string;

  @IsEmail({}, { message: 'Invalid email address' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @MaxLength(20, { message: 'Password must be at most 20 characters long' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/, {
    message: 'Password must contain letters and numbers',
  })
  password: string;

  @IsOptional()
  @IsString()
  @Matches(/^\+?\d{7,15}$/, {
    message: 'Phone number must be valid (7-15 digits)',
  })
  phoneNumber?: string;

  @IsNotEmpty({ message: 'Company name is required' })
  @IsString()
  @MinLength(2, { message: 'Company name must be at least 2 characters long' })
  companyName: string;
}

export class JobSeekerSignupDTO {
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Name must be at most 50 characters long' })
  name: string;

  @IsEmail({}, { message: 'Invalid email address' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @MaxLength(20, { message: 'Password must be at most 20 characters long' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/, {
    message: 'Password must contain letters and numbers',
  })
  password: string;

  @IsOptional()
  @IsString()
  @Matches(/^\+?\d{7,15}$/, {
    message: 'Phone number must be valid (7-15 digits)',
  })
  phoneNumber?: string;
}
