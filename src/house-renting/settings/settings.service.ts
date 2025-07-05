import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Setting } from './schemas/setting.schema';

@Injectable()
export class SettingsService {
  constructor(
    @InjectModel(Setting.name) private settingModel: Model<Setting>,
  ) {}

  async getCurrentSettings(): Promise<Setting> {
    const settings = await this.settingModel.findOne({ isDeleted: false })
      .sort({ createdAt: -1 })
      .exec();

    if (!settings) {
      // Create and return a new settings document with default values
      const defaultSettings = new this.settingModel({
        electricityUnitPrice: 3000,
        waterUnitPrice: 10000,
        garbageCharge: 20000,
        isDeleted: false
      });
      return defaultSettings.save();
    }

    return settings;
  }

  async updateSettings(updateSettingDto: {
    electricityUnitPrice: number;
    waterUnitPrice: number;
    garbageCharge: number;
  }): Promise<Setting> {
    // Mark previous settings as deleted
    await this.settingModel.updateMany(
      { isDeleted: false },
      { isDeleted: true }
    );

    // Create new settings
    const newSettings = new this.settingModel({
      ...updateSettingDto,
      isDeleted: false
    });

    return newSettings.save();
  }
} 