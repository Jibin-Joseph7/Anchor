
import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import api from "../api/axios.js";

const CARD_DEFS = [
  { key: "totalCustomers", label: "Total Customers", icon: "👥" },
  { key: "totalLeads", label: "Total Leads", icon: "📞" },
  { key: "dealsWon", label: "Deals Won", icon: "🏆" },
  { key: "dealsLost", label: "Deals Lost", icon: "📉" },
  {
    key: "monthlyRevenue",
    label: "Monthly Revenue",
    icon: "💰",
    isCurrency: true,
  },
  {
    key: "upcomingFollowUps",
    label: "Upcoming Follow-ups",
    icon: "📅",
  },
];

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/dashboard")
      .then(({ data }) => setSummary(data))
      .catch((err) =>
        setError(
          err.response?.data?.message || "Failed to load dashboard"
        )
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div>Loading dashboard...</div>;
  }

  if (error) {
    return <div className="page-error">{error}</div>;
  }

  const chartData = (summary?.revenueTrend || []).map((item) => ({
    name: `${item._id.month}/${String(item._id.year).slice(2)}`,
    revenue: item.revenue,
  }));

  return (
    <div>
      <h1 className="page-title">Dashboard</h1>

      <div className="kpi-grid">
        {CARD_DEFS.map((card) => (
          <div className="kpi-card" key={card.key}>
            <div className="kpi-icon">{card.icon}</div>

            <div className="kpi-value">
              {card.isCurrency
                ? `$${(summary?.[card.key] || 0).toLocaleString()}`
                : summary?.[card.key] ?? 0}
            </div>

            <div className="kpi-label">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="chart-card">
        <h2>Revenue Trend</h2>

        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />

            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#2563eb"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
