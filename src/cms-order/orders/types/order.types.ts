export interface OrderItem {
    productId: string;
    productName: string;
    productPrice: number;
    quantity: number;
    unit: string;
    totalPrice: number;
}

export interface Order {
    id: string;
    orderNumber: string;
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    subtotal: number;
    shippingFee: number;
    total: number;
    totalPrice: number;
    notes?: string;
    status: 'pending' | 'processing' | 'completed' | 'cancelled';
    items: OrderItem[];
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateOrderDto {
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    shippingFee: number;
    notes?: string;
    items: {
        productId: string;
        quantity: number;
    }[];
}

export interface UpdateOrderDto {
    customerName?: string;
    customerPhone?: string;
    customerAddress?: string;
    shippingFee?: number;
    notes?: string;
    status?: 'pending' | 'processing' | 'completed' | 'cancelled';
} 