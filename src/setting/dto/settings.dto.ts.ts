import { IsString, IsOptional } from 'class-validator';

export class UpdateSettingsDto {
  @IsString()
  shopName: string;

  @IsString()
  shopAddress: string;

  @IsString()
  contactPhone: string;

  @IsString()
  openingTime: string;

  @IsString()
  closingTime: string;

  @IsString()
  currency: string;

  @IsOptional()
  @IsString()
  updatedAt?: string;
}