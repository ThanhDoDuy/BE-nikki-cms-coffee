import { IsString, IsNumber, IsOptional, IsEnum, Min } from 'class-validator';

export class CreateProductDto {
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsNumber()
    @Min(0)
    price: number;

    @IsString()
    unit: string;

    @IsOptional()
    @IsEnum(['in_stock', 'out_of_stock'])
    status?: 'in_stock' | 'out_of_stock';
} 