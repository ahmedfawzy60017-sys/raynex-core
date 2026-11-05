import { Transform } from 'class-transformer';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import { MaxBytes } from '../../common/validators/max-bytes';

export class LoginDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail() @MaxLength(254) email: string;
  // No 12-char minimum on login: policy changes must not turn a wrong password into a confusing 400.
  @IsString() @MinLength(1) @MaxLength(72) @MaxBytes(72) password: string;
}
