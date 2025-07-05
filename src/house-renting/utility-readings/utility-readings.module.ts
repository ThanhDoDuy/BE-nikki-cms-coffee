import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UtilityReadingsService } from './utility-readings.service';
import { UtilityReadingsController } from './utility-readings.controller';
import { UtilityReading, UtilityReadingSchema } from './schemas/utility-reading.schema';
import { Room, RoomSchema } from '../room/schemas/room.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UtilityReading.name, schema: UtilityReadingSchema },
      { name: Room.name, schema: RoomSchema }
    ])
  ],
  controllers: [UtilityReadingsController],
  providers: [UtilityReadingsService]
})
export class UtilityReadingsModule {} 