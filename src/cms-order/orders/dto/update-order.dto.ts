import { IsString, IsNumber, IsOptional, IsEnum, Min } from 'class-validator';

export class UpdateOrderDto {
    @IsOptional()
    @IsString()
    customerName?: string;

    @IsOptional()
    @IsString()
    customerPhone?: string;

    @IsOptional()
    @IsString()
    customerAddress?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    shippingFee?: number;

    @IsOptional()
    @IsString()
    notes?: string;

    @IsOptional()
    @IsEnum(['pending', 'processing', 'completed', 'cancelled'])
    status?: 'pending' | 'processing' | 'completed' | 'cancelled';
} 