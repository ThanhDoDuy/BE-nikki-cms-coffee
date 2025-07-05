import { Controller, Get, Post, Put, Param, Query, Body } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { InvoiceResponse, InvoiceListResponse, InvoiceTableResponse } from './types/invoice.types';

@Controller('invoices')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Get()
  async findAll(@Query('month') month?: string): Promise<InvoiceTableResponse> {
    if (!month) {
      throw new Error('Month is required');
    }
    return this.invoiceService.findByMonthTable(month);
  }

  @Post('generate/:utilityReadingId')
  async generateInvoice(@Param('utilityReadingId') utilityReadingId: string): Promise<InvoiceResponse> {
    return this.invoiceService.generateInvoiceFromUtilityReading(utilityReadingId);
  }

  @Post('generate-month')
  async generateInvoicesForMonth(@Body('month') month: string): Promise<InvoiceListResponse> {
    return this.invoiceService.generateInvoicesForMonth(month);
  }

  @Put(':id/mark-paid')
  async markAsPaid(@Param('id') id: string): Promise<InvoiceResponse> {
    return this.invoiceService.markAsPaid(id);
  }
} 