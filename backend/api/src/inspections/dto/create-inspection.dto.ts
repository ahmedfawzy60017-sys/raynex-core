import { ArrayMaxSize, IsArray, IsIn, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateInspectionDto {
  @IsUUID() vehicleId!: string;
  @IsIn(['pre_purchase', 'post_accident', 'post_repair', 'periodic', 'comprehensive']) inspectionType!: string;
  @IsOptional() @IsIn(['en', 'ar']) reportLocale?: string;
  @IsOptional() @IsArray() @ArrayMaxSize(200) findings?: unknown[];
  @IsOptional() @IsArray() @ArrayMaxSize(50) evidence?: unknown[];
  @IsOptional() @IsString() @MaxLength(160) inspectorName?: string;
}
