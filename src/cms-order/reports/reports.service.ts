import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

@Injectable()
export class ReportsService {
    constructor(
        @InjectModel('Order') private orderModel: Model<any>,
        @InjectModel('Product') private productModel: Model<any>,
    ) {}

    async getStats(userId: Types.ObjectId) {
        const [totalOrders, totalRevenue, totalProducts] = await Promise.all([
            this.orderModel.countDocuments({ userId, isDeleted: false }),
            this.orderModel.aggregate([
                { $match: { userId, isDeleted: false, status: { $ne: 'cancelled' } } },
                { $group: { _id: null, total: { $sum: '$total' } } }
            ]),
            this.productModel.countDocuments({ userId, isDeleted: false }),
        ]);

        const revenue = totalRevenue.length > 0 ? totalRevenue[0].total : 0;
        const avgOrderValue = totalOrders > 0 ? revenue / totalOrders : 0;

        return {
            totalOrders,
            totalRevenue: revenue,
            totalProducts,
            avgOrderValue: Math.round(avgOrderValue * 100) / 100,
        };
    }

    async getOrderStats(userId: Types.ObjectId) {
        const statusStats = await this.orderModel.aggregate([
            { $match: { userId, isDeleted: false } },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        const statusMap = {
            pending: 0,
            processing: 0,
            completed: 0,
            cancelled: 0,
        };

        statusStats.forEach(stat => {
            statusMap[stat._id] = stat.count;
        });

        return statusMap;
    }

    async getRevenueByMonth(userId: Types.ObjectId) {
        const currentYear = new Date().getFullYear();
        
        return this.orderModel.aggregate([
            { 
                $match: { 
                    userId,
                    isDeleted: false, 
                    status: { $ne: 'cancelled' },
                    createdAt: {
                        $gte: new Date(currentYear, 0, 1),
                        $lt: new Date(currentYear + 1, 0, 1)
                    }
                } 
            },
            {
                $group: {
                    _id: { $month: '$createdAt' },
                    revenue: { $sum: '$total' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);
    }
} 