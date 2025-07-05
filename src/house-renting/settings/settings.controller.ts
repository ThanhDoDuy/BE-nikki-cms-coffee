import { Controller, Get, Put, Body, BadRequestException } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { Setting } from './schemas/setting.schema';
import { UpdatePriceSettingDto } from './dto/update-price-setting.dto';

@Controller('house-settings')
export class SettingsController {
    constructor(private readonly settingsService: SettingsService) { }

    @Get()
    async getCurrentSettings(): Promise<{ data: Setting }> {
        const settings = await this.settingsService.getCurrentSettings();
        return { data: settings };
    }

    @Put()
    async updateSettings(@Body() updateSettingDto: UpdatePriceSettingDto): Promise<{ data: Setting }> {
        // Validate that at least one price is provided
        if (!updateSettingDto.electricityUnitPrice && !updateSettingDto.waterUnitPrice && !updateSettingDto.garbageCharge) {
            throw new BadRequestException('At least one price must be provided');
        }

        const transformedDto = {
            electricityUnitPrice: updateSettingDto.electricityUnitPrice || 3000,
            waterUnitPrice: updateSettingDto.waterUnitPrice || 10000,
            garbageCharge: updateSettingDto.garbageCharge || 20000
        };

        const settings = await this.settingsService.updateSettings(transformedDto);
        return { data: settings };
    }
} 