// src/settings/settings.controller.ts
import { Body, Controller, Get, Put } from '@nestjs/common';
import { UpdateSettingsDto } from './dto/settings.dto.ts';
import { SettingsService } from './setting.service.js';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  getSettings() {
    return this.settingsService.get();
  }

  @Put()
  updateSettings(@Body() settingsDto: UpdateSettingsDto) {
    return this.settingsService.update(settingsDto);
  }
}
