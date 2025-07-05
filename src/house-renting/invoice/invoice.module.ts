import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InvoiceController } from './invoice.controller';
import { InvoiceService } from './invoice.service';
import { Invoice, InvoiceSchema } from './schemas/invoice.schema';
import { UtilityReading, UtilityReadingSchema } from '../utility-readings/schemas/utility-reading.schema';
import { Room, RoomSchema } from '../room/schemas/room.schema';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Invoice.name, schema: InvoiceSchema },
      { name: UtilityReading.name, schema: UtilityReadingSchema },
      { name: Room.name, schema: RoomSchema }
    ]),
    SettingsModule
  ],
  controllers: [InvoiceController],
  providers: [InvoiceService],
  exports: [InvoiceService]
})
export class InvoiceModule {} 