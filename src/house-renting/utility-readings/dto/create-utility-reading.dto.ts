import { IsString, IsNumber, Min } from 'class-validator';

export class CreateUtilityReadingDto {
  @IsString()
  room: string;

  @IsString()
  month: string;

  @IsNumber()
  @Min(0)
  electricityStart: number;

  @IsNumber()
  @Min(0)
  electricityEnd: number;

  @IsNumber()
  @Min(0)
  waterStart: number;

  @IsNumber()
  @Min(0)
  waterEnd: number;
} 