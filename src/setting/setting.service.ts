import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class SettingsService {
  constructor(@InjectModel('Settings') private settingModel: Model<any>) {}

  async get() {
    const doc = await this.settingModel.findOne().sort({ updatedAt: -1 });
    if (!doc) {
      const defaultData = {
        shopName: 'My Coffee Shop',
        shopAddress: '123 Main Street',
        contactPhone: '0123456789',
        openingTime: '07:00',
        closingTime: '22:00',
        currency: 'VND',
        updatedAt: new Date(),
      };
      return new this.settingModel(defaultData).save();
    }
    return doc;
  }
  

  async update(data: any) {
    const updateData = { ...data, updatedAt: new Date() };
    const existing = await this.settingModel.findOne();
    if (existing) {
      return this.settingModel.findByIdAndUpdate(existing._id, updateData, { new: true });
    } else {
      return new this.settingModel(updateData).save();
    }
  }
}