import { IsString, IsNumber, IsOptional, Min, IsBoolean, IsEnum } from 'class-validator';
import { RoomStatus, ROOM_MAX_TENANTS } from '../schemas/room.schema';

export class CreateRoomDto {
    @IsString()
    readonly number: string;

    @IsString()
    @IsOptional()
    @IsEnum(RoomStatus)
    readonly status?: RoomStatus = RoomStatus.AVAILABLE;

    @IsNumber()
    @Min(1)
    @IsOptional()
    readonly maxTenants?: number = ROOM_MAX_TENANTS;

    @IsNumber()
    @Min(0)
    readonly price: number;

    @IsNumber()
    @Min(0)
    @IsOptional()
    readonly deposit?: number = 0;

    @IsBoolean()
    @IsOptional()
    readonly isDepositPaid?: boolean = false;
}
