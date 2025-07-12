import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('cms/reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
    constructor(private readonly reportsService: ReportsService) {}

    @Get('stats')
    getStats(@Request() req) {
        return this.reportsService.getStats(req.user._id);
    }

    @Get('order-stats')
    getOrderStats(@Request() req) {
        return this.reportsService.getOrderStats(req.user._id);
    }

    @Get('revenue-by-month')
    getRevenueByMonth(@Request() req) {
        return this.reportsService.getRevenueByMonth(req.user._id);
    }
} 