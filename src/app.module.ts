import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MealsModule } from './meals/meals.module';
import { StaffModule } from './staff/staff.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { OrdersModule } from './orders/orders.module';
import { SettingModule } from './setting/setting.module';
import { RoomsModule } from './house-renting/room/rooms.module';
import { TenantModule } from './house-renting/tenant/tenant.module';
import { UtilityReadingsModule } from './house-renting/utility-readings/utility-readings.module';
import { InvoiceModule } from './house-renting/invoice/invoice.module';
import { SettingsModule } from './house-renting/settings/settings.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URI || ''),
    MealsModule,
    StaffModule,
    OrdersModule,
    SettingModule,
    RoomsModule,
    TenantModule,
    UtilityReadingsModule,
    InvoiceModule,
    SettingsModule
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: '*path', method: RequestMethod.ALL });
  }
}
