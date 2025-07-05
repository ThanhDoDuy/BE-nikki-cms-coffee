import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TenantController } from './tenant.controller';
import { TenantService } from './tenant.service';
import { Tenant, TenantSchema } from './schemas/tenant.schema';
import { Room, RoomSchema } from '../room/schemas/room.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Tenant.name, schema: TenantSchema },
      { name: Room.name, schema: RoomSchema }
    ])
  ],
  controllers: [TenantController],
  providers: [TenantService],
})
export class TenantModule {} 