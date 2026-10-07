import { adminDashboardApi } from "@/lib/api/admin/dashboard";
import { StatsCard } from "@/components/admin/stats-card";

function formatInr(amount: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}

export default async function AdminDashboardPage() {
  const stats = await adminDashboardApi.getStats();

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-[11px] uppercase tracking-[0.28em]">Dashboard</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatsCard label="Revenue" value={formatInr(stats.totalRevenue)} />
        <StatsCard label="Orders" value={stats.totalOrders} />
        <StatsCard label="Products" value={stats.totalProducts} />
        <StatsCard label="Customers" value={stats.totalCustomers} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <StatsCard label="Pending Orders" value={stats.pendingOrders} />
        <StatsCard label="Low Stock" value={stats.lowStockProducts} />
      </div>
    </div>
  );
}
