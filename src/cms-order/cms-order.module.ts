import { Module } from '@nestjs/common';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { ReportsModule } from './reports/reports.module';

@Module({
    imports: [
        ProductsModule,
        OrdersModule,
        ReportsModule,
    ],
    exports: [
        ProductsModule,
        OrdersModule,
        ReportsModule,
    ],
})
export class CmsOrderModule {} 