import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { OrderSchema } from '../orders/schemas/order.schema';
import { ProductSchema } from '../products/schemas/product.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: 'Order', schema: OrderSchema },
            { name: 'Product', schema: ProductSchema }
        ])
    ],
    controllers: [ReportsController],
    providers: [ReportsService],
    exports: [ReportsService],
})
export class ReportsModule {} 