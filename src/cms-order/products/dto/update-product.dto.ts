import { IsString, IsNumber, IsOptional, IsEnum, Min } from 'class-validator';

export class UpdateProductDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    price?: number;

    @IsOptional()
    @IsString()
    unit?: string;

    @IsOptional()
    @IsEnum(['in_stock', 'out_of_stock'])
    status?: 'in_stock' | 'out_of_stock';
} 