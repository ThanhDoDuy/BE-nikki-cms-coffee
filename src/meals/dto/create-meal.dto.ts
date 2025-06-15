import { PartialType } from '@nestjs/mapped-types';
import { IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class CreateMealDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsNumber()
  @IsNotEmpty()
  originPrice: number;

  @IsNumber()
  @IsNotEmpty()
  discountPrice: number;
}

export class UpdateMealDto extends PartialType(CreateMealDto) {}
