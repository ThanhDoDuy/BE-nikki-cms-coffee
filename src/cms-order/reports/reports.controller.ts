import { Controller, Get } from '@nestjs/common';
import { ReportsService } from './reports.service';

@Controller('cms/reports')
export class ReportsController {
    constructor(private readonly reportsService: ReportsService) {}

    @Get('stats')
    getStats() {
        return this.reportsService.getStats();
    }

    @Get('order-stats')
    getOrderStats() {
        return this.reportsService.getOrderStats();
    }

    @Get('revenue-by-month')
    getRevenueByMonth() {
        return this.reportsService.getRevenueByMonth();
    }
} 