import { IsString, IsNumber, Min, IsOptional } from 'class-validator';

export class UpdateUtilityReadingDto {
  @IsString()
  @IsOptional()
  room?: string;

  @IsString()
  @IsOptional()
  month?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  electricityStart?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  electricityEnd?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  waterStart?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  waterEnd?: number;
} 