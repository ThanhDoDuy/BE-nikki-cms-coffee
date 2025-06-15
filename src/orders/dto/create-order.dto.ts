import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemDto {
    @IsString() mealId: string;
    @IsString() mealName: string;
    @IsNotEmpty() quantity: number;
    @IsNotEmpty() price: number;
    @IsNotEmpty() subtotal: number;
}

export class CreateOrderDto {
    @IsString() customerName: string;
    @IsOptional() @IsString() tableNumber?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)
    items: OrderItemDto[];

    @IsEnum(['cash', 'card'])
    paymentMethod: 'cash' | 'card';

    @IsEnum(['pending', 'completed', 'cancelled'])
    status: 'pending' | 'completed' | 'cancelled';

    @IsString() staffId: string;
    @IsOptional() @IsString() note?: string;
}