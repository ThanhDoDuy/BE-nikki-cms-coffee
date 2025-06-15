import { PartialType } from '@nestjs/mapped-types';
import { IsString } from 'class-validator';

export class CreateStaffDto {
  @IsString()
  name: string;

  @IsString()
  shift: number;

  @IsString()
  status: number;
}

export class UpdateStaffDto extends PartialType(CreateStaffDto) {}
