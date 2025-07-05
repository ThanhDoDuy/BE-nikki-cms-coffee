import { Document } from 'mongoose';
import { Room, RoomStatus } from '../schemas/room.schema';
import { Types } from 'mongoose';

export interface TenantInfo {
  id: string;
  fullName: string;
  phoneNumber: string;
  moveInDate: Date;
  status: string;
}

export interface RoomResponseData {
  id: string;
  number: string;
  status: RoomStatus;
  price: number;
  deposit: number;
  isDepositPaid: boolean;
  maxTenants: number;
  tenants: TenantInfo[];
  currentTenants: number;
  availableSpots: number;
  isFull: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RoomResponse extends RoomResponseData {
  [key: string]: any;
} 