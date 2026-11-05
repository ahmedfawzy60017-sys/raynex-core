import { IsInt, IsOptional, IsString, IsUUID, Matches, Max, MaxLength, Min } from 'class-validator';
export class CreateVehicleDto {
  @IsOptional() @IsUUID() brandId?: string;
  @IsOptional() @IsUUID() modelId?: string;
  @IsOptional() @IsInt() @Min(1886) @Max(2100) modelYear?: number;
  @IsOptional() @IsString() @MaxLength(8) @Matches(/^[A-Za-z]{2,8}$/, { message: 'marketCode must be 2-8 letters' }) marketCode?: string;
  @IsOptional() @IsString() @MaxLength(80) nickname?: string;
}
