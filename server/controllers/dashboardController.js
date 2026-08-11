const Customer = require("../models/Customer");
const Lead = require("../models/Lead");
const Opportunity = require("../models/Opportunity");
const Task = require("../models/Task");

// GET /api/dashboard
// Top-line KPIs for dashboard cards
exports.getSummary = async (req, res) => {
  try {
    const [
      totalCustomers,
      totalLeads,
      dealsWon,
      dealsLost,
      upcomingFollowUps,
    ] = await Promise.all([
      Customer.countDocuments(),

      Lead.countDocuments(),

      Opportunity.countDocuments({
        stage: "Won",
      }),

      Opportunity.countDocuments({
        stage: "Lost",
      }),

      Task.countDocuments({
        status: { $ne: "completed" },
        dueDate: { $gte: new Date() },
      }),
    ]);

    // Revenue grouped by month for won opportunities
    const revenueAgg = await Opportunity.aggregate([
      {
        $match: {
          stage: "Won",
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$updatedAt" },
            month: { $month: "$updatedAt" },
          },
          revenue: {
            $sum: "$value",
          },
        },
      },
      {
        $sort: {
          "_id.year": -1,
          "_id.month": -1,
        },
      },
      {
        $limit: 12,
      },
    ]);

    const now = new Date();

    const currentMonthRevenue =
      revenueAgg.find(
        (item) =>
          item._id.year === now.getFullYear() &&
          item._id.month === now.getMonth() + 1
      )?.revenue || 0;

    res.status(200).json({
      totalCustomers,
      totalLeads,
      dealsWon,
      dealsLost,
      monthlyRevenue: currentMonthRevenue,
      upcomingFollowUps,
      revenueTrend: revenueAgg.reverse(),
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// GET /api/dashboard/reports/conversion
// Lead conversion report
exports.getConversionReport = async (req, res) => {
  try {
    const total = await Lead.countDocuments();

    const converted = await Lead.countDocuments({
      status: "converted",
    });

    const byStatus = await Lead.aggregate([
      {
        $group: {
          _id: "$status",
          count: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
    ]);

    res.status(200).json({
      totalLeads: total,
      converted,
      conversionRate: total
        ? Number(((converted / total) * 100).toFixed(2))
        : 0,
      byStatus,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// GET /api/dashboard/reports/employee-performance
// Employee performance based on won opportunities
exports.getEmployeePerformance = async (req, res) => {
  try {
    const performance = await Opportunity.aggregate([
      {
        $match: {
          stage: "Won",
        },
      },
      {
        $group: {
          _id: "$owner",
          dealsWon: {
            $sum: 1,
          },
          revenue: {
            $sum: "$value",
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          _id: 0,
          userId: "$user._id",
          name: "$user.name",
          role: "$user.role",
          dealsWon: 1,
          revenue: 1,
        },
      },
      {
        $sort: {
          revenue: -1,
        },
      },
    ]);

    res.status(200).json(performance);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// GET /api/dashboard/reports/customer-growth
// New customers per month
exports.getCustomerGrowth = async (req, res) => {
  try {
    const growth = await Customer.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          newCustomers: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
      {
        $limit: 12,
      },
    ]);

    res.status(200).json(growth);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};