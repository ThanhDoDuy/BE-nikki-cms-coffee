import { IsString, IsNotEmpty, IsDate, IsEnum, IsMongoId, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export enum TenantStatus {
  STAYING = 'STAYING',
  DEBT = 'DEBT',
  MOVED_OUT = 'MOVED_OUT'
}

export class CreateTenantDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsMongoId()
  @IsNotEmpty()
  room: string;

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  moveInDate: Date;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  moveOutDate?: Date;

  @IsEnum(TenantStatus)
  @IsNotEmpty()
  status: TenantStatus = TenantStatus.STAYING;
} 