import { IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdatePriceSettingDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  electricityUnitPrice?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  waterUnitPrice?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  garbageCharge?: number;
} 