import { IsString, IsNumber, IsOptional, IsArray, IsEnum, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemDto {
    @IsString()
    productId: string;

    @IsNumber()
    @Min(1)
    quantity: number;
}

export class CreateOrderDto {
    @IsString()
    customerName: string;

    @IsString()
    customerPhone: string;

    @IsString()
    customerAddress: string;

    @IsNumber()
    @Min(0)
    shippingFee: number;

    @IsOptional()
    @IsString()
    notes?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)
    items: OrderItemDto[];
} 