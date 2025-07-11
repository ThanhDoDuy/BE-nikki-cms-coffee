export interface Product {
    id: string;
    name: string;
    description?: string;
    price: number;
    unit: string;
    status: 'in_stock' | 'out_of_stock';
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateProductDto {
    name: string;
    description?: string;
    price: number;
    unit: string;
    status?: 'in_stock' | 'out_of_stock';
}

export interface UpdateProductDto {
    name?: string;
    description?: string;
    price?: number;
    unit?: string;
    status?: 'in_stock' | 'out_of_stock';
} 