import { useState, useEffect, useMemo, useCallback } from "react";
import {
  FiDollarSign,
  FiPackage,
  FiShoppingBag,
  FiUsers,
} from "react-icons/fi";
import { dashboardService } from "../../../services/DashboardService";
import {
  DashboardData,
  TopSellingProduct,
  DailyRevenueItem,
  MonthlyRevenueItem,
} from "../../../types/dashboard";
import toast from "react-hot-toast";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const periods = [
  { value: "week", label: "Tuẩn này" },
  { value: "month", label: "Tháng này" },
  { value: "year", label: "Nam nay" },
];

const months = [
  "Tháng 1",
  "Tháng 2",
  "Tháng 3",
  "Tháng 4",
  "Tháng 5",
  "Tháng 6",
  "Tháng 7",
  "Tháng 8",
  "Tháng 9",
  "Tháng 10",
  "Tháng 11",
  "Tháng 12",
];

const Dashboard = () => {
  // Dashboard data states
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [topProducts, setTopProducts] = useState<TopSellingProduct[]>([]);
  const [dailyRevenue, setDailyRevenue] = useState<DailyRevenueItem[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenueItem[]>(
    []
  );

  // Filter states
  const [topProductPeriod, setTopProductPeriod] = useState("month");
  const [dailyStartDate, setDailyStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date.toISOString().split("T")[0];
  });
  const [dailyEndDate, setDailyEndDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Loading states
  const [loading, setLoading] = useState({
    dashboard: true,
    topProducts: true,
    dailyRevenue: true,
    monthlyRevenue: true,
  });

  // Load functions with useCallback
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading((prev) => ({ ...prev, dashboard: true }));
      const response = await dashboardService.getDashboardData();

      if (response.data.success && response.data.data) {
        setDashboardData(response.data.data);
      } else {
        toast.error("Không thể tại dữ liệu tổng quan");
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      toast.error("Không thể tại dữ liệu tổng quan");
    } finally {
      setLoading((prev) => ({ ...prev, dashboard: false }));
    }
  }, []);

  const loadTopProducts = useCallback(async () => {
    try {
      setLoading((prev) => ({ ...prev, topProducts: true }));
      const response = await dashboardService.getTopSellingProducts({
        period: topProductPeriod as "week" | "month" | "year",
        limit: 8,
      });

      if (response.data.success && response.data.data) {
        setTopProducts(response.data.data);
      } else {
        toast.error("Không thể tại dữ liệu sản phẩm bán chạy");
      }
    } catch (error) {
      console.error("Error loading top products:", error);
      toast.error("Không thể tại dữ liệu sản phẩm bán chạy");
    } finally {
      setLoading((prev) => ({ ...prev, topProducts: false }));
    }
  }, [topProductPeriod]);

  const loadDailyRevenue = useCallback(async () => {
    try {
      setLoading((prev) => ({ ...prev, dailyRevenue: true }));
      const response = await dashboardService.getDailyRevenue({
        startDate: dailyStartDate,
        endDate: dailyEndDate,
      });

      if (response.data.success && response.data.data) {
        setDailyRevenue(response.data.data);
      } else {
        toast.error("Không thể tại dữ liệu doanh thu hàng ngày");
      }
    } catch (error) {
      console.error("Error loading daily revenue:", error);
      toast.error("Không thể tại dữ liệu doanh thu hàng ngày");
    } finally {
      setLoading((prev) => ({ ...prev, dailyRevenue: false }));
    }
  }, [dailyStartDate, dailyEndDate]);

  const loadMonthlyRevenue = useCallback(async () => {
    try {
      setLoading((prev) => ({ ...prev, monthlyRevenue: true }));
      const response = await dashboardService.getMonthlyRevenue({
        year: selectedYear,
      });

      if (response.data.success && response.data.data) {
        setMonthlyRevenue(response.data.data);
      } else {
        toast.error("Không thể tại dữ liệu doanh thu hàng tháng");
      }
    } catch (error) {
      console.error("Error loading monthly revenue:", error);
      toast.error("Không thể tại dữ liệu doanh thu hàng tháng");
    } finally {
      setLoading((prev) => ({ ...prev, monthlyRevenue: false }));
    }
  }, [selectedYear]);

  // Effects
  useEffect(() => {
    loadDashboardData();
    loadTopProducts();
    loadMonthlyRevenue();
  }, [loadDashboardData, loadTopProducts, loadMonthlyRevenue]);

  useEffect(() => {
    loadDailyRevenue();
  }, [loadDailyRevenue]);

  useEffect(() => {
    loadTopProducts();
  }, [loadTopProducts]);

  useEffect(() => {
    loadMonthlyRevenue();
  }, [loadMonthlyRevenue]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Chart data memos
  const dailyRevenueChartData = useMemo(() => {
    const labels = dailyRevenue.map((item) => {
      const date = new Date(item.date);
      return date.toLocaleDateString("vi-VN", {
        month: "short",
        day: "numeric",
      });
    });

    return {
      labels,
      datasets: [
        {
          label: "Doanh thu",
          data: dailyRevenue.map((item) => item.revenue),
          borderColor: "rgb(59, 130, 246)",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
        {
          label: "Lợi nhuận",
          data: dailyRevenue.map((item) => item.profit),
          borderColor: "rgb(34, 197, 94)",
          backgroundColor: "rgba(34, 197, 94, 0.1)",
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    };
  }, [dailyRevenue]);

  const monthlyRevenueChartData = useMemo(() => {
    const labels = months;
    const revenueData = months.map((_, index) => {
      const month = index + 1;
      const foundMonth = monthlyRevenue.find((item) => item.month === month);
      return foundMonth ? foundMonth.revenue : 0;
    });

    return {
      labels,
      datasets: [
        {
          label: "Doanh thu",
          data: revenueData,
          backgroundColor: "rgba(59, 130, 246, 0.8)",
          borderColor: "rgb(59, 130, 246)",
          borderWidth: 1,
          borderRadius: 6,
        },
      ],
    };
  }, [monthlyRevenue]);

  const topProductsChartData = useMemo(() => {
    return {
      labels: topProducts.map((product) => product.productName),
      datasets: [
        {
          data: topProducts.map((product) => product.totalQuantity),
          backgroundColor: [
            "rgba(255, 99, 132, 0.8)",
            "rgba(54, 162, 235, 0.8)",
            "rgba(255, 205, 86, 0.8)",
            "rgba(75, 192, 192, 0.8)",
            "rgba(153, 102, 255, 0.8)",
            "rgba(255, 159, 64, 0.8)",
            "rgba(199, 199, 199, 0.8)",
            "rgba(83, 102, 255, 0.8)",
          ],
          borderColor: [
            "rgba(255, 99, 132, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 205, 86, 1)",
            "rgba(75, 192, 192, 1)",
            "rgba(153, 102, 255, 1)",
            "rgba(255, 159, 64, 1)",
            "rgba(199, 199, 199, 1)",
            "rgba(83, 102, 255, 1)",
          ],
          borderWidth: 1,
        },
      ],
    };
  }, [topProducts]);

  // Chart options
  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Doanh thu theo ngày",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value: unknown) {
            const numValue = value as number;
            return numValue >= 1000000
              ? `${(numValue / 1000000).toFixed(1)}M`
              : numValue >= 1000
              ? `${(numValue / 1000).toFixed(1)}K`
              : numValue;
          },
        },
      },
    },
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: `Doanh thu theo tháng nam ${selectedYear}`,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value: unknown) {
            const numValue = value as number;
            return numValue >= 1000000
              ? `${(numValue / 1000000).toFixed(1)}M`
              : numValue >= 1000
              ? `${(numValue / 1000).toFixed(1)}K`
              : numValue;
          },
        },
      },
    },
  };

  const doughnutChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "right" as const,
      },
      title: {
        display: true,
        text: "Sản phẩm bán chạy",
      },
    },
  };

  return (
    <div className="p-4 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Products */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-mono-100 rounded-lg">
              <FiPackage className="h-6 w-6 text-mono-black" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-mono-600">Tổng sản phẩm</p>
              {loading.dashboard ? (
                <div className="h-8 bg-mono-200 rounded w-20 animate-pulse"></div>
              ) : (
                <p className="text-2xl font-semibold text-mono-900">
                  {dashboardData?.totalProducts.toLocaleString() || 0}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Total Users */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-mono-100 rounded-lg">
              <FiUsers className="h-6 w-6 text-mono-800" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-mono-600">
                Tổng người dùng
              </p>
              {loading.dashboard ? (
                <div className="h-8 bg-mono-200 rounded w-20 animate-pulse"></div>
              ) : (
                <p className="text-2xl font-semibold text-mono-900">
                  {dashboardData?.totalUsers.toLocaleString() || 0}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-mono-100 rounded-lg">
              <FiShoppingBag className="h-6 w-6 text-mono-700" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-mono-600">Tổng đơn hàng</p>
              {loading.dashboard ? (
                <div className="h-8 bg-mono-200 rounded w-20 animate-pulse"></div>
              ) : (
                <p className="text-2xl font-semibold text-mono-900">
                  {dashboardData?.totalOrders.toLocaleString() || 0}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-mono-200 rounded-lg">
              <FiDollarSign className="h-6 w-6 text-mono-700" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-mono-600">
                Tổng doanh thu
              </p>
              {loading.dashboard ? (
                <div className="h-8 bg-mono-200 rounded w-32 animate-pulse"></div>
              ) : (
                <p className="text-2xl font-semibold text-mono-900">
                  {formatCurrency(dashboardData?.totalRevenue || 0)}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Revenue Chart */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Doanh thu theo ngày</h3>
            <div className="flex gap-2">
              <input
                type="date"
                value={dailyStartDate}
                onChange={(e) => setDailyStartDate(e.target.value)}
                className="px-3 py-1 border border-mono-300 rounded-md text-sm"
              />
              <input
                type="date"
                value={dailyEndDate}
                onChange={(e) => setDailyEndDate(e.target.value)}
                className="px-3 py-1 border border-mono-300 rounded-md text-sm"
              />
            </div>
          </div>

          {loading.dailyRevenue ? (
            <div className="h-80 bg-mono-100 rounded animate-pulse"></div>
          ) : dailyRevenue.length === 0 ? (
            <div className="flex items-center justify-center h-80 text-mono-500">
              Không có dữ liệu doanh thu
            </div>
          ) : (
            <div className="h-80">
              <Line data={dailyRevenueChartData} options={lineChartOptions} />
            </div>
          )}
        </div>

        {/* Monthly Revenue Chart */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Doanh thu theo tháng</h3>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-3 py-1 border border-mono-300 rounded-md text-sm"
            >
              {Array.from(
                { length: 5 },
                (_, i) => new Date().getFullYear() - i
              ).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {loading.monthlyRevenue ? (
            <div className="h-80 bg-mono-100 rounded animate-pulse"></div>
          ) : (
            <div className="h-80">
              <Bar data={monthlyRevenueChartData} options={barChartOptions} />
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Products Chart */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Sản phẩm bán chạy</h3>
            <select
              value={topProductPeriod}
              onChange={(e) => setTopProductPeriod(e.target.value)}
              className="px-3 py-1 border border-mono-300 rounded-md text-sm"
            >
              {periods.map((period) => (
                <option key={period.value} value={period.value}>
                  {period.label}
                </option>
              ))}
            </select>
          </div>

          {loading.topProducts ? (
            <div className="h-80 bg-mono-100 rounded animate-pulse"></div>
          ) : topProducts.length === 0 ? (
            <div className="flex items-center justify-center h-80 text-mono-500">
              Không có dữ liệu sản phẩm bán chạy
            </div>
          ) : (
            <div className="h-80">
              <Doughnut
                data={topProductsChartData}
                options={doughnutChartOptions}
              />
            </div>
          )}
        </div>

        {/* Top Products Table */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              Chi tiết sản phẩm bán chạy
            </h3>
          </div>

          {loading.topProducts ? (
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-mono-200 rounded-md"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-mono-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-mono-200 rounded w-1/2"></div>
                  </div>
                  <div className="w-20">
                    <div className="h-4 bg-mono-200 rounded mb-2"></div>
                    <div className="h-3 bg-mono-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : topProducts.length === 0 ? (
            <div className="flex items-center justify-center h-80 text-mono-500">
              Không có dữ liệu sản phẩm bán chạy
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-mono-500 uppercase tracking-wider">
                      Sản phẩm
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-mono-500 uppercase tracking-wider">
                      Số lượng
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-mono-500 uppercase tracking-wider">
                      Doanh thu
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-mono-500 uppercase tracking-wider">
                      Lợi nhuận
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-mono-500 uppercase tracking-wider">
                      Tỷ suất
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {topProducts.map((product, index) => (
                    <tr
                      key={product.productId}
                      className={index % 2 === 0 ? "bg-white" : "bg-mono-50"}
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-md overflow-hidden">
                            <img
                              src={product.image || "/image/product.jpg"}
                              alt={product.productName}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="ml-4">
                            <div
                              className="text-sm font-medium text-mono-900 line-clamp-1"
                              title={product.productName}
                            >
                              {product.productName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-mono-900">
                        {product.totalQuantity.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-mono-900">
                        {formatCurrency(product.totalRevenue)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-mono-900">
                        {formatCurrency(product.totalProfit)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            product.profitMargin >= 15
                              ? "bg-mono-100 text-mono-800"
                              : product.profitMargin >= 10
                              ? "bg-mono-100 text-mono-800"
                              : "bg-mono-100 text-mono-800"
                          }`}
                        >
                          {product.profitMargin.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Dashboard component for Admin Dashboard Page
export default Dashboard;
