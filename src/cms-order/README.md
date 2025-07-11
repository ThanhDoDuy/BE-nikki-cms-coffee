# CMS Order System Backend

This module provides the backend API for the CMS Order System frontend, handling products, orders, and reports.

## Structure

```
cms-order/
├── products/           # Product management
│   ├── dto/           # Data Transfer Objects
│   ├── schemas/       # MongoDB schemas
│   ├── types/         # TypeScript interfaces
│   ├── products.controller.ts
│   ├── products.service.ts
│   └── products.module.ts
├── orders/            # Order management
│   ├── dto/           # Data Transfer Objects
│   ├── schemas/       # MongoDB schemas
│   ├── types/         # TypeScript interfaces
│   ├── orders.controller.ts
│   ├── orders.service.ts
│   └── orders.module.ts
├── reports/           # Reporting and analytics
│   ├── reports.controller.ts
│   ├── reports.service.ts
│   └── reports.module.ts
└── cms-order.module.ts
```

## API Endpoints

### Products

- `GET /cms/products` - Get all products
- `GET /cms/products/:id` - Get product by ID
- `POST /cms/products` - Create new product
- `PATCH /cms/products/:id` - Update product
- `DELETE /cms/products/:id` - Delete product

### Orders

- `GET /cms/orders` - Get all orders
- `GET /cms/orders/:id` - Get order by ID
- `POST /cms/orders` - Create new order
- `PATCH /cms/orders/:id` - Update order
- `DELETE /cms/orders/:id` - Delete order

### Reports

- `GET /cms/reports/stats` - Get general statistics
- `GET /cms/reports/order-stats` - Get order status statistics
- `GET /cms/reports/revenue-by-month` - Get monthly revenue data

## Data Models

### Product
```typescript
{
  name: string;
  description?: string;
  price: number;
  unit: string;
  status: 'in_stock' | 'out_of_stock';
  createdAt: Date;
  updatedAt: Date;
}
```

### Order
```typescript
{
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  subtotal: number;
  shippingFee: number;
  total: number;
  notes?: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  orderItems: OrderItem[];
  createdAt: Date;
  updatedAt: Date;
}
```

### OrderItem
```typescript
{
  productId: string;
  productName: string;
  productPrice: number;
  quantity: number;
  unit: string;
  totalPrice: number;
}
```

## Features

- **Product Management**: CRUD operations for products with stock status tracking
- **Order Management**: Create orders with automatic total calculation and order number generation
- **Order Validation**: Validates product availability and calculates totals automatically
- **Soft Delete**: All entities use soft delete (isDeleted flag) instead of hard delete
- **Reports**: Generate statistics and analytics for business insights
- **Data Validation**: Input validation using class-validator decorators

## Integration

The module is integrated into the main application via `app.module.ts` and provides RESTful APIs that match the frontend's expected interface in `cms-order-system/lib/api.ts`. 