import { PartialType } from '@nestjs/mapped-types';
import { IsString, IsNumber } from 'class-validator';

export class CreateMealDto {
  @IsString()
  name: string;

  @IsString()
  type: string;

  @IsNumber()
  originPrice: number;

  @IsNumber()
  discountPrice: number;
}

export class UpdateMealDto extends PartialType(CreateMealDto) {}
