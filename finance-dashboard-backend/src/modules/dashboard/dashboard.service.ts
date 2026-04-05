import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Document, Types, Model } from 'mongoose';
import { Transaction, TransactionDocument } from '../finance/schemas/transaction.schema';
import { QueryDashboardDto } from './dto/query-dashboard.dto';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Transaction.name) private readonly transactionModel: Model<TransactionDocument>
  ) {}

  async getSummary(organizationId: string, query: QueryDashboardDto) {
    const { startDate, endDate } = query;
    // COLLABORATIVE DATA MODEL: aggregates all transactions in the organization.
    const matchStage: Record<string, any> = { 
      isDeleted: { $ne: true },
      organizationId: new Types.ObjectId(organizationId)
    };

    if (startDate || endDate) {
      matchStage.date = {};
      if (startDate) matchStage.date.$gte = new Date(startDate);
      if (endDate) matchStage.date.$lte = new Date(endDate);
    }

    const result = await this.transactionModel.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalIncome: {
            $sum: {
              $cond: [{ $eq: ["$type", "income"] }, "$amount", 0]
            }
          },
          totalExpense: {
            $sum: {
              $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0]
            }
          }
        }
      }
    ]);

    const summary = result[0] || { totalIncome: 0, totalExpense: 0 };
    return {
      totalIncome: Number(summary.totalIncome || 0),
      totalExpense: Number(summary.totalExpense || 0),
      netBalance: Number((summary.totalIncome || 0) - (summary.totalExpense || 0))
    };
  }

  async getCategoryBreakdown(organizationId: string, query: QueryDashboardDto) {
    const { startDate, endDate } = query;
    // COLLABORATIVE DATA MODEL: shows all categories in the organization.
    const matchStage: Record<string, any> = { 
      isDeleted: { $ne: true },
      organizationId: new Types.ObjectId(organizationId)
    };

    if (startDate || endDate) {
      matchStage.date = {};
      if (startDate) matchStage.date.$gte = new Date(startDate);
      if (endDate) matchStage.date.$lte = new Date(endDate);
    }

    const result = await this.transactionModel.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' }
        }
      },
      {
        $project: {
          _id: 0,
          category: '$_id',
          total: 1
        }
      },
      {
        $sort: { total: -1 }
      }
    ]);

    return result || [];
  }

  async getMonthlyTrends(organizationId: string, query: QueryDashboardDto) {
    const { startDate, endDate, range = '6M' } = query;
    const matchStage: Record<string, any> = { 
      isDeleted: { $ne: true },
      organizationId: new Types.ObjectId(organizationId)
    };

    if (startDate || endDate) {
      matchStage.date = {};
      if (startDate) matchStage.date.$gte = new Date(startDate);
      if (endDate) matchStage.date.$lte = new Date(endDate);
    }

    const aggregated = await this.transactionModel.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          income: { $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] } },
          expense: { $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] } }
        }
      }
    ]);

    // Creating a map for quick lookup
    const dataMap = new Map();
    aggregated.forEach(item => {
      const monthStr = `${item._id.year}-${String(item._id.month).padStart(2, '0')}`;
      dataMap.set(monthStr, { income: item.income, expense: item.expense });
    });

    // Determining months to show based on range
    const monthsToShow = range === '1M' ? 1 : range === '3M' ? 3 : 6;

    // Generating the list based on selected range
    const result = [];
    for (let i = monthsToShow - 1; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      
      const entry = dataMap.get(monthStr) || { income: 0, expense: 0 };
      result.push({
        month: monthStr,
        income: entry.income,
        expense: entry.expense
      });
    }

    return result;
  }

  async getDashboardData(organizationId: string, query: QueryDashboardDto) {
    const { startDate, endDate, range = '6M' } = query;
    const matchStage: Record<string, any> = { 
      isDeleted: { $ne: true },
      organizationId: new Types.ObjectId(organizationId)
    };

    if (startDate || endDate) {
      matchStage.date = {};
      if (startDate) matchStage.date.$gte = new Date(startDate);
      if (endDate) matchStage.date.$lte = new Date(endDate);
    }

    const result = await this.transactionModel.aggregate([
      { $match: matchStage },
      {
        $facet: {
          summary: [
            {
              $group: {
                _id: null,
                totalIncome: { $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] } },
                totalExpense: { $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] } }
              }
            }
          ],
          categories: [
            {
              $group: {
                _id: "$category",
                total: { $sum: "$amount" }
              }
            },
            {
              $project: {
                _id: 0,
                category: "$_id",
                total: 1
              }
            },
            { $sort: { total: -1 } }
          ],
          trends: [
            {
              $group: {
                _id: {
                  year: { $year: "$date" },
                  month: { $month: "$date" }
                },
                income: { $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] } },
                expense: { $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] } }
              }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
          ]
        }
      }
    ]);

    const facetData = result[0];
    
    // Processing Summary
    const summaryRaw = facetData.summary[0] || { totalIncome: 0, totalExpense: 0 };
    const summary = {
      totalIncome: Number(summaryRaw.totalIncome || 0),
      totalExpense: Number(summaryRaw.totalExpense || 0),
      netBalance: Number((summaryRaw.totalIncome || 0) - (summaryRaw.totalExpense || 0))
    };

    // Processing Categories
    const categories = facetData.categories || [];

    // Processing Trends
    const dataMap = new Map();
    (facetData.trends || []).forEach((item: Record<string, any>) => {
      const monthStr = `${item._id.year}-${String(item._id.month).padStart(2, '0')}`;
      dataMap.set(monthStr, { income: item.income, expense: item.expense });
    });

    const monthsToShow = range === '1M' ? 1 : range === '3M' ? 3 : 6;
    const trends = [];
    for (let i = monthsToShow - 1; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      
      const entry = dataMap.get(monthStr) || { income: 0, expense: 0 };
      trends.push({
        month: monthStr,
        income: entry.income,
        expense: entry.expense
      });
    }

    return {
      summary,
      categories,
      trends
    };
  }
}


