import { Invoice, InvoiceDocument } from '../schemas/invoice.schema';
import { Document } from 'mongoose';
import { Room } from '../../room/schemas/room.schema';
import { UtilityReading } from '../../utility-readings/schemas/utility-reading.schema';

export type PopulatedInvoice = Omit<InvoiceDocument, 'room' | 'utilityReading'> & {
  room: Room & Document;
  utilityReading: UtilityReading & Document;
};

export interface InvoiceTableRow {
  roomName: string;          // Phòng
  roomCharge: number;        // Tiền phòng
  electricityCharge: number; // Tiền điện
  waterCharge: number;       // Tiền nước
  otherCharges: number;      // Phí khác (garbage fee)
  totalAmount: number;       // Tổng cộng
  invoiceId: string;         // ID của hóa đơn
  status: string;           // Trạng thái hóa đơn
}

export interface InvoiceTableResponse {
  data: InvoiceTableRow[];
  summary: InvoiceSummary;
}

export interface InvoiceResponse {
  data: {
    message?: string;
    invoice?: PopulatedInvoice;
    _id?: string;
  };
}

export interface InvoiceSummary {
  total: number;
  paid: number;
  pending: number;
  overdue: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
}

export interface InvoiceListResponse {
  data: PopulatedInvoice[];
  summary: InvoiceSummary;
}

export interface InvoicesResponse {
  data: PopulatedInvoice[];
} 