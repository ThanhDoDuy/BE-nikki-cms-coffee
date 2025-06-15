import { Module } from '@nestjs/common';
import { SettingsController } from './setting.controller';
import { SettingsService } from './setting.service';
import { MongooseModule } from '@nestjs/mongoose';
import { SettingsSchema } from './schemas/settings.schema';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Settings', schema: SettingsSchema }]),
  ],
  controllers: [SettingsController],
  providers: [SettingsService],
})
export class SettingModule { }
