import { IsEmail, IsOptional, MinLength } from 'class-validator';

export class UpdateUserDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsOptional()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @MinLength(6)
  password?: string;
}
