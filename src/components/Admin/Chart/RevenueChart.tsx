import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import {
  dashboardService,
  MonthlyRevenueItem,
} from "../../../services/DashboardService";

// Đăng ký các thành phần chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const RevenueChart: React.FC = () => {
  const [monthlyData, setMonthlyData] = useState<MonthlyRevenueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchMonthlyRevenue();
  }, [year]);

  const fetchMonthlyRevenue = async () => {
    try {
      setLoading(true);
      const response = await dashboardService.getMonthlyRevenue({ year });
      if (response.data.success && response.data.data) {
        setMonthlyData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching monthly revenue:", error);
    } finally {
      setLoading(false);
    }
  };

  // Tạo mảng đủ 12 tháng với dữ liệu 0 cho các tháng không có doanh thu
  const getMonthlyDataArray = () => {
    const months = Array(12)
      .fill(0)
      .map((_, index) => ({
        month: index + 1,
        revenue: 0,
        cost: 0,
        profit: 0,
        profitMargin: 0,
        count: 0,
      }));

    // Cập nhật dữ liệu cho các tháng có thông tin
    monthlyData.forEach((item) => {
      if (item.month >= 1 && item.month <= 12) {
        months[item.month - 1] = item;
      }
    });

    return months;
  };

  const monthNames = [
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

  const data = {
    labels: monthNames,
    datasets: [
      {
        label: "Doanh thu",
        data: getMonthlyDataArray().map((item) => item.revenue),
        backgroundColor: "rgba(53, 162, 235, 0.5)",
        borderColor: "rgb(53, 162, 235)",
        borderWidth: 1,
      },
      {
        label: "Lợi nhuận",
        data: getMonthlyDataArray().map((item) => item.profit),
        backgroundColor: "rgba(75, 192, 192, 0.5)",
        borderColor: "rgb(75, 192, 192)",
        borderWidth: 1,
      },
      {
        label: "Chi phí",
        data: getMonthlyDataArray().map((item) => item.cost),
        backgroundColor: "rgba(255, 99, 132, 0.5)",
        borderColor: "rgb(255, 99, 132)",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: `Doanh thu theo tháng năm ${year}`,
      },
    },
  };

  const handleYearChange = (delta: number) => {
    setYear((prevYear) => prevYear + delta);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Biểu đồ doanh thu</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleYearChange(-1)}
            className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            &lt;
          </button>
          <span className="font-medium">{year}</span>
          <button
            onClick={() => handleYearChange(1)}
            className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            &gt;
          </button>
        </div>
      </div>
      <div className="h-[calc(100%-40px)]">
        <Bar options={options} data={data} />
      </div>
    </div>
  );
};

export default RevenueChart;
