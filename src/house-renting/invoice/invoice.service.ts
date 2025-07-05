import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Invoice, InvoiceDocument, InvoiceStatus } from './schemas/invoice.schema';
import { 
  InvoiceResponse, 
  InvoiceListResponse, 
  InvoicesResponse, 
  InvoiceTableResponse, 
  InvoiceTableRow,
  PopulatedInvoice 
} from './types/invoice.types';
import { UtilityReading } from '../utility-readings/schemas/utility-reading.schema';
import { Room } from '../room/schemas/room.schema';
import { SettingsService } from '../settings/settings.service';

export interface InvoiceQueryParams {
  month?: string;
  status?: InvoiceStatus;
  roomId?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

@Injectable()
export class InvoiceService {
  constructor(
    @InjectModel(Invoice.name) private invoiceModel: Model<InvoiceDocument>,
    @InjectModel(UtilityReading.name) private utilityReadingModel: Model<UtilityReading>,
    @InjectModel(Room.name) private roomModel: Model<Room>,
    private readonly settingsService: SettingsService
  ) {}

  private transformToTableFormat(invoices: PopulatedInvoice[]): InvoiceTableRow[] {
    return invoices.map(invoice => ({
      roomName: (invoice.room as any).number || 'Unknown Room',
      roomCharge: invoice.roomCharge,
      electricityCharge: invoice.electricityCharge,
      waterCharge: invoice.waterCharge,
      otherCharges: invoice.garbageCharge,
      totalAmount: invoice.totalAmount,
      invoiceId: invoice._id?.toString() || '',
      status: invoice.status
    }));
  }

  async findByMonthTable(month: string): Promise<InvoiceTableResponse> {
    const invoices = await this.invoiceModel.find({
      month,
      isDeleted: false,
    })
    .populate('room')
    .populate('utilityReading')
    .exec();

    const typedInvoices = invoices as unknown as PopulatedInvoice[];
    const tableData = this.transformToTableFormat(typedInvoices);

    const summary = {
      total: typedInvoices.length,
      paid: typedInvoices.filter(inv => inv.status === InvoiceStatus.PAID).length,
      pending: typedInvoices.filter(inv => inv.status === InvoiceStatus.PENDING).length,
      overdue: typedInvoices.filter(inv => inv.status === InvoiceStatus.OVERDUE).length,
      totalAmount: typedInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
      paidAmount: typedInvoices.filter(inv => inv.status === InvoiceStatus.PAID)
        .reduce((sum, inv) => sum + inv.totalAmount, 0),
      pendingAmount: typedInvoices.filter(inv => 
        inv.status === InvoiceStatus.PENDING || inv.status === InvoiceStatus.OVERDUE
      ).reduce((sum, inv) => sum + inv.totalAmount, 0),
    };

    return {
      data: tableData,
      summary
    };
  }

  async findAll(): Promise<InvoicesResponse> {
    const invoices = await this.invoiceModel.find()
      .populate('room')
      .populate('utilityReading')
      .exec();
    return { data: invoices as unknown as PopulatedInvoice[] };
  }

  async findByMonth(month: string): Promise<InvoiceListResponse> {
    const invoices = await this.invoiceModel.find({
      month,
      isDeleted: false,
    })
    .populate('room')
    .populate('utilityReading')
    .exec();

    const typedInvoices = invoices as unknown as PopulatedInvoice[];

    const summary = {
      total: typedInvoices.length,
      paid: typedInvoices.filter(inv => inv.status === InvoiceStatus.PAID).length,
      pending: typedInvoices.filter(inv => inv.status === InvoiceStatus.PENDING).length,
      overdue: typedInvoices.filter(inv => inv.status === InvoiceStatus.OVERDUE).length,
      totalAmount: typedInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
      paidAmount: typedInvoices.filter(inv => inv.status === InvoiceStatus.PAID)
        .reduce((sum, inv) => sum + inv.totalAmount, 0),
      pendingAmount: typedInvoices.filter(inv => 
        inv.status === InvoiceStatus.PENDING || inv.status === InvoiceStatus.OVERDUE
      ).reduce((sum, inv) => sum + inv.totalAmount, 0),
    };

    return {
      data: typedInvoices,
      summary
    };
  }

  async generateInvoicesForMonth(month: string): Promise<InvoiceListResponse> {
    // Validate month format (YYYY-MM)
    if (!/^\d{4}-\d{2}$/.test(month)) {
      throw new BadRequestException('Invalid month format. Use YYYY-MM');
    }

    // Delete existing invoices for this month
    await this.invoiceModel.deleteMany({ month, isDeleted: false });

    // Get all utility readings for the month
    const utilityReadings = await this.utilityReadingModel.find({ month }).populate('room').exec();
    
    if (!utilityReadings.length) {
      throw new NotFoundException('No utility readings found for this month');
    }

    const generatedInvoices: PopulatedInvoice[] = [];

    // Generate invoice for each utility reading
    for (const reading of utilityReadings) {
      const invoice = await this.generateInvoiceFromUtilityReading(reading._id.toString());
      if (invoice.data.invoice) {
        generatedInvoices.push(invoice.data.invoice);
      }
    }

    // Calculate summary
    const summary = {
      total: generatedInvoices.length,
      paid: 0,
      pending: generatedInvoices.length,
      overdue: 0,
      totalAmount: generatedInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
      paidAmount: 0,
      pendingAmount: generatedInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
    };

    return {
      data: generatedInvoices,
      summary
    };
  }

  async generateInvoiceFromUtilityReading(utilityReadingId: string): Promise<InvoiceResponse> {
    // Get utility reading
    const utilityReading = await this.utilityReadingModel.findById(utilityReadingId)
      .populate('room')
      .exec();

    if (!utilityReading) {
      throw new NotFoundException('Utility reading not found');
    }

    // Get room
    const room = await this.roomModel.findById(utilityReading.room).exec();
    if (!room) {
      throw new NotFoundException('Room not found');
    }

    // Get current settings
    const settings = await this.settingsService.getCurrentSettings();
    if (!settings) {
      throw new BadRequestException('Price settings not found. Please configure prices first.');
    }

    // Calculate usage
    const electricityUsage = utilityReading.electricityEnd - utilityReading.electricityStart;
    const waterUsage = utilityReading.waterEnd - utilityReading.waterStart;

    // Calculate charges using settings
    const electricityCharge = electricityUsage * settings.electricityUnitPrice;
    const waterCharge = waterUsage * settings.waterUnitPrice;
    const totalAmount = room.price + electricityCharge + waterCharge + settings.garbageCharge;

    // Create invoice
    const invoice = new this.invoiceModel({
      room: room._id,
      utilityReading: utilityReading._id,
      month: utilityReading.month,
      roomCharge: room.price,
      electricityUsage,
      electricityUnitPrice: settings.electricityUnitPrice,
      electricityCharge,
      waterUsage,
      waterUnitPrice: settings.waterUnitPrice,
      waterCharge,
      garbageCharge: settings.garbageCharge,
      totalAmount,
      status: InvoiceStatus.PENDING
    });

    const savedInvoice = await invoice.save();
    const populatedInvoice = await this.invoiceModel.findById(savedInvoice._id)
      .populate('room')
      .populate('utilityReading')
      .exec();

    if (!populatedInvoice) {
      throw new NotFoundException('Invoice not found after creation');
    }

    return {
      data: {
        message: 'Invoice generated successfully',
        invoice: populatedInvoice as unknown as PopulatedInvoice,
        _id: savedInvoice._id.toString()
      }
    };
  }

  async markAsPaid(id: string): Promise<InvoiceResponse> {
    const invoice = await this.invoiceModel.findById(id);

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    if (invoice.status === InvoiceStatus.PAID) {
      throw new BadRequestException('Invoice is already paid');
    }

    invoice.status = InvoiceStatus.PAID;
    invoice.paidAt = new Date();
    await invoice.save();

    const updatedInvoice = await this.invoiceModel.findById(id)
      .populate('room')
      .populate('utilityReading')
      .exec();

    if (!updatedInvoice) {
      throw new NotFoundException('Invoice not found after update');
    }

    return {
      data: {
        message: 'Invoice marked as paid successfully',
        invoice: updatedInvoice as unknown as PopulatedInvoice,
        _id: id
      }
    };
  }
} 