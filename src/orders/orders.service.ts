import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel('Order') private orderModel: Model<any>,
    @InjectModel('Staff') private staffModel: Model<any>,
  ) { }

  async findAll(
    page: number,
    limit: number,
    search?: string,
    status?: string,
    startDate?: string,
    endDate?: string,
    staffId?: string,
  ) {
    const skip = (page - 1) * limit;
    const query: any = { isDeleted: false };

    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
      ];
    }
    if (status) query.status = status;
    if (staffId) query.staffId = staffId;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const data = await this.orderModel.find(query).skip(skip).limit(limit).sort({ createdAt: -1 });
    const total = await this.orderModel.countDocuments(query);
    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    return this.orderModel.findById(id);
  }

  async create(body: CreateOrderDto) {
    const totalAmount = body.items.reduce((sum, item) => sum + item.subtotal, 0);

    const staff = await this.staffModel.findById(body.staffId);
    if (!staff) throw new NotFoundException('Staff not found');

    const payload = {
      ...body,
      orderNumber: undefined, // will be replaced by MongoDB _id
      staffName: staff.name,
      totalAmount,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const order = await new this.orderModel(payload).save();
    order.orderNumber = `ORD${order._id.toString().slice(-6).toUpperCase()}`;
    await order.save();
    return order;
  }

  async update(id: string, body: CreateOrderDto) {
    const totalAmount = body.items?.reduce((sum, item) => sum + item.subtotal, 0) || 0;

    const staff = await this.staffModel.findById(body.staffId);
    if (!staff) throw new NotFoundException('Staff not found');

    const payload = {
      ...body,
      staffName: staff.name,
      totalAmount,
      updatedAt: new Date(),
    };
    return this.orderModel.findByIdAndUpdate(id, payload, { new: true });
  }


  async getStats(startDate?: string, endDate?: string) {
    const match: any = { isDeleted: false };
    if (startDate || endDate) {
      match.createdAt = {};
      if (startDate) match.createdAt.$gte = new Date(startDate);
      if (endDate) match.createdAt.$lte = new Date(endDate);
    }

    const result = await this.orderModel.aggregate([
      { $match: match },

      {
        $facet: {
          statusStats: [
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 },
              },
            },
          ],
          revenueStats: [
            {
              $group: {
                _id: null,
                totalRevenue: { $sum: '$totalAmount' },
                averageOrderValue: { $avg: '$totalAmount' },
              },
            },
          ],
          paymentStats: [
            {
              $group: {
                _id: '$paymentMethod',
                count: { $sum: 1 },
                revenue: { $sum: '$totalAmount' },
              },
            },
          ],
          topItems: [
            { $unwind: '$items' },
            {
              $group: {
                _id: '$items.mealId',
                mealName: { $first: '$items.mealName' },
                quantity: { $sum: '$items.quantity' },
                revenue: { $sum: '$items.subtotal' },
              },
            },
            { $sort: { quantity: -1 } },
            { $limit: 5 },
          ],
          topStaff: [
            {
              $group: {
                _id: '$staffId',
                staffName: { $first: '$staffName' },
                totalOrders: { $sum: 1 },
                totalRevenue: { $sum: '$totalAmount' },
              },
            },
            { $sort: { totalOrders: -1 } },
            { $limit: 5 },
          ],
        },
      },
    ]);

    const [stats] = result;
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const todayOrders = await this.orderModel.countDocuments({
      isDeleted: false,
      createdAt: { $gte: startOfToday },
    });
    const weekOrders = await this.orderModel.countDocuments({
      isDeleted: false,
      createdAt: { $gte: startOfWeek },
    });
    const monthOrders = await this.orderModel.countDocuments({
      isDeleted: false,
      createdAt: { $gte: startOfMonth },
    });
    const totalOrders = await this.orderModel.countDocuments({ isDeleted: false });

    return {
      statusStats: {
        total: totalOrders,
        pending: stats.statusStats.find(s => s._id === 'pending')?.count || 0,
        completed: stats.statusStats.find(s => s._id === 'completed')?.count || 0,
        cancelled: stats.statusStats.find(s => s._id === 'cancelled')?.count || 0,
      },
      revenueStats: {
        totalRevenue: stats.revenueStats[0]?.totalRevenue || 0,
        averageOrderValue: stats.revenueStats[0]?.averageOrderValue || 0,
        todayRevenue: await this.#getRevenueSince(startOfToday),
        weekRevenue: await this.#getRevenueSince(startOfWeek),
        monthRevenue: await this.#getRevenueSince(startOfMonth),
      },
      timeStats: {
        todayOrders,
        weekOrders,
        monthOrders,
        averageOrdersPerDay: totalOrders / 30, // sample logic
      },
      paymentStats: this.#formatPaymentStats(stats.paymentStats),
      topItems: stats.topItems,
      topStaff: stats.topStaff,
    };
  }

  async #getRevenueSince(date: Date) {
    const result = await this.orderModel.aggregate([
      { $match: { isDeleted: false, createdAt: { $gte: date } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    return result[0]?.total || 0;
  }

  #formatPaymentStats(rawStats: any[]) {
    const cash = rawStats.find((s) => s._id === 'cash') || { count: 0, revenue: 0 };
    const card = rawStats.find((s) => s._id === 'card') || { count: 0, revenue: 0 };
    return {
      cashPayments: cash.count,
      cardPayments: card.count,
      cashRevenue: cash.revenue,
      cardRevenue: card.revenue,
    };
  }
}
