import { API_URL } from '../config';
import Toast from "./Toast";
import { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

export default function Dashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [userBalance, setUserBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [toast, setToast] = useState({ message: "", type: "info" });

  // Add Money Form State
  const [addMoneyData, setAddMoneyData] = useState({
    amount: "",
    description: "Nạp tiền vào tài khoản",
  });

  // Transaction Form State
  const [transactionData, setTransactionData] = useState({
    type: "expense",
    amount: "",
    category: "other",
    description: "",
  });

  // Categories
  const expenseCategories = [
    "food",
    "transport",
    "entertainment",
    "bills",
    "shopping",
    "health",
    "education",
    "other",
  ];
  const incomeCategories = [
    "salary",
    "freelance",
    "investment",
    "gift",
    "other",
  ];

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token");

      // Fetch user profile
      const profileRes = await fetch(`${API_URL}/api/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        if (profileData.success) {
          setUserBalance(profileData.data.totalBalance || 0);
        }
      }

      // Fetch transactions
      const transactionsRes = await fetch(
        `${API_URL}/api/transactions`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (transactionsRes.ok) {
        const transactionsData = await transactionsRes.json();
        if (transactionsData.success) {
          setTransactions(transactionsData.data.transactions || []);
        }
      }
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu:", err);
      setToast({ message: "Không thể tải dữ liệu", type: "error" });
    }
  };

  const handleAddMoney = async (e) => {
    e.preventDefault();

    // Client-side validation
    const amount = parseFloat(addMoneyData.amount);
    if (!addMoneyData.amount || isNaN(amount) || amount <= 0) {
      setToast({ message: "Vui lòng nhập số tiền hợp lệ", type: "error" });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setToast({ message: "Vui lòng đăng nhập lại", type: "error" });
        return;
      }

      console.log("Sending add money request:", addMoneyData);

      const res = await fetch(
        `${API_URL}/api/transactions/add-money`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: amount,
            description: addMoneyData.description || "Nạp tiền vào tài khoản",
          }),
        },
      );

      const data = await res.json();
      console.log("Add money response:", data);

      if (res.ok && data.success) {
        setToast({ message: data.message, type: "success" });
        setUserBalance(data.data.newBalance);
        setAddMoneyData({ amount: "", description: "Nạp tiền vào tài khoản" });
        fetchUserData(); // Refresh data
      } else {
        if (res.status === 401) {
          setToast({
            message: "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại",
            type: "error",
          });
        } else {
          setToast({ message: data.message || "Có lỗi xảy ra", type: "error" });
        }
      }
    } catch (err) {
      console.error("Add money error:", err);
      setToast({
        message: "Đã xảy ra lỗi khi nạp tiền: " + err.message,
        type: "error",
      });
    }
  };

  const handleCreateTransaction = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/transactions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transactionData),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setToast({ message: data.message, type: "success" });
        setTransactionData({
          type: "expense",
          amount: "",
          category: "other",
          description: "",
        });
        fetchUserData(); // Refresh data
      } else {
        setToast({ message: data.message, type: "error" });
      }
    } catch (err) {
      setToast({ message: "Đã xảy ra lỗi khi tạo giao dịch", type: "error" });
    }
  };

  const handleUndoTransaction = async (transactionId, transactionDescription) => {
    if (!window.confirm(`Bạn có chắc chắn muốn hoàn tác giao dịch "${transactionDescription}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/transactions/${transactionId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setToast({ message: "Hoàn tác giao dịch thành công", type: "success" });
        fetchUserData(); // Refresh data
      } else {
        setToast({ message: data.message || "Có lỗi xảy ra", type: "error" });
      }
    } catch (err) {
      setToast({ message: "Đã xảy ra lỗi khi hoàn tác giao dịch", type: "error" });
    }
  };

  const formatCurrency = (amount) => {
    return amount.toLocaleString("vi-VN") + " VNĐ";
  };

  const categoryLabels = {
    food: "Ăn uống",
    transport: "Di chuyển",
    entertainment: "Giải trí",
    bills: "Hóa đơn",
    shopping: "Mua sắm",
    health: "Sức khỏe",
    education: "Giáo dục",
    salary: "Lương",
    freelance: "Freelance",
    investment: "Đầu tư",
    gift: "Quà tặng",
    other: "Khác",
  };

  // Helper functions for chart data
  const getMonthlyLabels = () => {
    const months = [
      "T1",
      "T2",
      "T3",
      "T4",
      "T5",
      "T6",
      "T7",
      "T8",
      "T9",
      "T10",
      "T11",
      "T12",
    ];
    const currentMonth = new Date().getMonth();
    const labels = [];

    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      labels.push(months[monthIndex]);
    }

    return labels;
  };

  const getMonthlyData = (type) => {
    const data = new Array(6).fill(0);
    const currentDate = new Date();

    transactions.forEach((transaction) => {
      if (transaction.type === type) {
        const transactionDate = new Date(transaction.date);
        const monthsDiff =
          (currentDate.getFullYear() - transactionDate.getFullYear()) * 12 +
          (currentDate.getMonth() - transactionDate.getMonth());

        if (monthsDiff >= 0 && monthsDiff < 6) {
          data[5 - monthsDiff] += transaction.amount;
        }
      }
    });

    return data;
  };

  const getCategoryLabels = () => {
    const categoryTotals = {};

    transactions.forEach((transaction) => {
      if (transaction.type === "expense") {
        const category = transaction.category;
        categoryTotals[category] =
          (categoryTotals[category] || 0) + transaction.amount;
      }
    });

    return Object.keys(categoryTotals)
      .sort((a, b) => categoryTotals[b] - categoryTotals[a])
      .map((category) => categoryLabels[category] || category);
  };

  const getCategoryData = () => {
    const categoryTotals = {};

    transactions.forEach((transaction) => {
      if (transaction.type === "expense") {
        const category = transaction.category;
        categoryTotals[category] =
          (categoryTotals[category] || 0) + transaction.amount;
      }
    });

    return Object.keys(categoryTotals)
      .sort((a, b) => categoryTotals[b] - categoryTotals[a])
      .map((category) => categoryTotals[category]);
  };

  const getMostPopularCategory = () => {
    const categoryCounts = {};

    transactions.forEach((transaction) => {
      const category = transaction.category;
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });

    const mostPopular = Object.keys(categoryCounts).reduce(
      (a, b) => (categoryCounts[a] > categoryCounts[b] ? a : b),
      "other",
    );

    return categoryLabels[mostPopular] || mostPopular;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Xin chào, {user.name}!</span>
              <button
                onClick={onLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Balance Card */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 text-white mb-8 shadow-lg">
          <h2 className="text-lg font-medium opacity-90">Số dư hiện tại</h2>
          <p
            className={`text-3xl font-bold mt-2 ${userBalance >= 0 ? "text-white" : "text-red-200"}`}
          >
            {formatCurrency(userBalance)}
          </p>
          <button
            onClick={fetchUserData}
            className="mt-4 px-4 py-2 bg-white bg-opacity-20 text-indigo-600 font-bold rounded-lg hover:bg-opacity-30 transition-colors"
          >
            Làm mới
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-gray-200 p-1 rounded-lg mb-6">
          {[
            { id: "overview", label: "Tổng quan" },
            { id: "add-money", label: "Nạp tiền" },
            { id: "transaction", label: "Thêm giao dịch" },
            { id: "analytics", label: "Thống kê" },
            { id: "history", label: "Lịch sử" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-white text-gray-900 shadow"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          {activeTab === "overview" && (
            <div>
              <h3 className="text-xl font-semibold mb-4">
                Tổng quan tài khoản
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-800">
                    Thu nhập tháng này
                  </h4>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(
                      transactions
                        .filter(
                          (t) =>
                            t.type === "income" &&
                            new Date(t.date).getMonth() ===
                              new Date().getMonth(),
                        )
                        .reduce((sum, t) => sum + t.amount, 0),
                    )}
                  </p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <h4 className="font-medium text-red-800">
                    Chi tiêu tháng này
                  </h4>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(
                      transactions
                        .filter(
                          (t) =>
                            t.type === "expense" &&
                            new Date(t.date).getMonth() ===
                              new Date().getMonth(),
                        )
                        .reduce((sum, t) => sum + t.amount, 0),
                    )}
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-800">Tổng giao dịch</h4>
                  <p className="text-2xl font-bold text-blue-600">
                    {transactions.length}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "add-money" && (
            <div>
              <h3 className="text-xl font-semibold mb-4">
                Nạp tiền vào tài khoản
              </h3>
              <form onSubmit={handleAddMoney} className="max-w-md">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số tiền (VNĐ)
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={addMoneyData.amount}
                    onChange={(e) =>
                      setAddMoneyData({
                        ...addMoneyData,
                        amount: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nhập số tiền cần nạp"
                    required
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ghi chú (không bắt buộc)
                  </label>
                  <input
                    type="text"
                    value={addMoneyData.description}
                    onChange={(e) =>
                      setAddMoneyData({
                        ...addMoneyData,
                        description: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ví dụ: Nạp tiền từ thẻ ngân hàng"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 px-4 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                >
                  Nạp tiền
                </button>
              </form>
            </div>
          )}

          {activeTab === "transaction" && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Thêm giao dịch mới</h3>
              <form onSubmit={handleCreateTransaction} className="max-w-md">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loại giao dịch
                  </label>
                  <select
                    value={transactionData.type}
                    onChange={(e) =>
                      setTransactionData({
                        ...transactionData,
                        type: e.target.value,
                        category:
                          e.target.value === "income" ? "salary" : "other",
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="expense">Chi tiêu</option>
                    <option value="income">Thu nhập</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số tiền (VNĐ)
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={transactionData.amount}
                    onChange={(e) =>
                      setTransactionData({
                        ...transactionData,
                        amount: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nhập số tiền"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Danh mục
                  </label>
                  <select
                    value={transactionData.category}
                    onChange={(e) =>
                      setTransactionData({
                        ...transactionData,
                        category: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {(transactionData.type === "income"
                      ? incomeCategories
                      : expenseCategories
                    ).map((cat) => (
                      <option key={cat} value={cat}>
                        {categoryLabels[cat]}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mô tả
                  </label>
                  <input
                    type="text"
                    value={transactionData.description}
                    onChange={(e) =>
                      setTransactionData({
                        ...transactionData,
                        description: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Mô tả giao dịch"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className={`w-full py-2 px-4 font-medium rounded-lg transition-colors ${
                    transactionData.type === "income"
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-red-600 text-white hover:bg-red-700"
                  }`}
                >
                  {transactionData.type === "income"
                    ? "Thêm thu nhập"
                    : "Thêm chi tiêu"}
                </button>
              </form>
            </div>
          )}

          {activeTab === "analytics" && (
            <div>
              <h3 className="text-xl font-semibold mb-6">Thống kê giao dịch</h3>

              {transactions.length > 0 ? (
                <div className="space-y-8">
                  {/* Monthly Overview Chart */}
                  <div className="bg-white p-6 rounded-lg border">
                    <h4 className="text-lg font-medium mb-4">
                      Thu chi theo tháng
                    </h4>
                    <div className="h-80">
                      <Bar
                        data={{
                          labels: getMonthlyLabels(),
                          datasets: [
                            {
                              label: "Thu nhập",
                              data: getMonthlyData("income"),
                              backgroundColor: "rgba(34, 197, 94, 0.8)",
                              borderColor: "rgb(34, 197, 94)",
                              borderWidth: 1,
                            },
                            {
                              label: "Chi tiêu",
                              data: getMonthlyData("expense"),
                              backgroundColor: "rgba(239, 68, 68, 0.8)",
                              borderColor: "rgb(239, 68, 68)",
                              borderWidth: 1,
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: "top",
                            },
                            title: {
                              display: false,
                            },
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                              ticks: {
                                callback: function (value) {
                                  return value.toLocaleString("vi-VN") + " VNĐ";
                                },
                              },
                            },
                          },
                        }}
                      />
                    </div>
                  </div>

                  {/* Category Breakdown Chart */}
                  <div className="bg-white p-6 rounded-lg border">
                    <h4 className="text-lg font-medium mb-4">
                      Chi tiêu theo danh mục
                    </h4>
                    <div className="h-80">
                      <Bar
                        data={{
                          labels: getCategoryLabels(),
                          datasets: [
                            {
                              label: "Chi tiêu",
                              data: getCategoryData(),
                              backgroundColor: [
                                "rgba(59, 130, 246, 0.8)",
                                "rgba(16, 185, 129, 0.8)",
                                "rgba(245, 158, 11, 0.8)",
                                "rgba(239, 68, 68, 0.8)",
                                "rgba(139, 92, 246, 0.8)",
                                "rgba(236, 72, 153, 0.8)",
                                "rgba(34, 197, 94, 0.8)",
                                "rgba(156, 163, 175, 0.8)",
                              ],
                              borderColor: [
                                "rgb(59, 130, 246)",
                                "rgb(16, 185, 129)",
                                "rgb(245, 158, 11)",
                                "rgb(239, 68, 68)",
                                "rgb(139, 92, 246)",
                                "rgb(236, 72, 153)",
                                "rgb(34, 197, 94)",
                                "rgb(156, 163, 175)",
                              ],
                              borderWidth: 1,
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              display: false,
                            },
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                              ticks: {
                                callback: function (value) {
                                  return value.toLocaleString("vi-VN") + " VNĐ";
                                },
                              },
                            },
                          },
                        }}
                      />
                    </div>
                  </div>

                  {/* Summary Statistics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-blue-50 p-6 rounded-lg">
                      <h4 className="font-medium text-blue-800 mb-2">
                        Giao dịch lớn nhất
                      </h4>
                      <p className="text-2xl font-bold text-blue-600">
                        {formatCurrency(
                          Math.max(...transactions.map((t) => t.amount)),
                        )}
                      </p>
                    </div>
                    <div className="bg-green-50 p-6 rounded-lg">
                      <h4 className="font-medium text-green-800 mb-2">
                        Trung bình/giao dịch
                      </h4>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(
                          transactions.reduce((sum, t) => sum + t.amount, 0) /
                            transactions.length,
                        )}
                      </p>
                    </div>
                    <div className="bg-purple-50 p-6 rounded-lg">
                      <h4 className="font-medium text-purple-800 mb-2">
                        Danh mục phổ biến
                      </h4>
                      <p className="text-lg font-bold text-purple-600">
                        {getMostPopularCategory()}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl text-gray-300 mb-4">📊</div>
                  <p className="text-gray-500 text-lg">
                    Chưa có dữ liệu để hiển thị thống kê
                  </p>
                  <p className="text-gray-400 text-sm mt-2">
                    Hãy thêm một số giao dịch để xem biểu đồ
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "history" && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Lịch sử giao dịch</h3>
              {transactions.length > 0 ? (
                <div className="space-y-3">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction._id}
                      className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-gray-500">
                          {categoryLabels[transaction.category]} •{" "}
                          {new Date(transaction.date).toLocaleDateString(
                            "vi-VN",
                          )}
                        </p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p
                            className={`font-bold ${
                              transaction.type === "income"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {transaction.type === "income" ? "+" : "-"}
                            {formatCurrency(transaction.amount)}
                          </p>
                        </div>
                        <button
                          onClick={() => handleUndoTransaction(transaction._id, transaction.description)}
                          className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded-md hover:bg-red-200 transition-colors"
                          title="Hoàn tác giao dịch này"
                        >
                          Hoàn tác
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Chưa có giao dịch nào
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "info" })}
      />
    </div>
  );
}
