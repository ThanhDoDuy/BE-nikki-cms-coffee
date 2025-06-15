import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StaffController } from './staff.controller';
import { StaffService } from './staff.service';
import { StaffSchema } from './schemas/staff.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Staff', schema: StaffSchema }])],
  controllers: [StaffController],
  providers: [StaffService],
})
export class StaffModule {}