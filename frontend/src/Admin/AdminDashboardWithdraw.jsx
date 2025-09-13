import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  CreditCard,
  Loader,
  X,
  DollarSign,
  Calendar,
  User,
  Building,
} from "lucide-react";
import api from "../components/axiosCongif";
import AdminHeader from "./Components/AdminHeader";
import AdminSideBar from "./Components/AdminSideBar";

// Confirmation Modal Component
const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = "accept",
  loading = false,
  showInput = false,
  inputValue = "",
  onInputChange = () => {},
  inputPlaceholder = "",
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={loading}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mb-6">
            <p className="text-gray-600 whitespace-pre-line">{message}</p>
            {showInput && (
              <textarea
                value={inputValue}
                onChange={(e) => onInputChange(e.target.value)}
                placeholder={inputPlaceholder}
                className="mt-4 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
                disabled={loading}
              />
            )}
          </div>

          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading || (showInput && !inputValue.trim())}
              className={`px-6 py-2 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 ${
                type === "accept"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {loading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {type === "accept" ? "Accept" : "Reject"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminDashboardWithdraw = () => {
  const [withdrawalRequests, setWithdrawalRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [revenueStats, setRevenueStats] = useState({
    orderCommission: 0,
    withdrawalCommission: 0,
    totalRevenue: 0,
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Modal states
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: "accept",
    request: null,
    rejectionReason: "",
  });

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setIsSidebarOpen(!mobile);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    fetchWithdrawalRequests();
    fetchAdminRevenue();
  }, []);

  const toggleSidebar = () => {
    const newState = !isSidebarOpen;
    setIsSidebarOpen(newState);
    if (!isMobile) {
      localStorage.setItem("adminSidebarOpen", JSON.stringify(newState));
    }
  };

  const fetchWithdrawalRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get("/get-withdraw-requests", {
        withCredentials: true,
      });

      if (response?.data?.success) {
        setWithdrawalRequests(response.data.withdrawalRequests || []);
      } else {
        toast.error("Failed to fetch withdrawal requests");
        setWithdrawalRequests([]);
      }
    } catch (error) {
      console.error("Error fetching withdrawal requests:", error);
      toast.error(
        error.response?.data?.message || "Error loading withdrawal requests"
      );
      setWithdrawalRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminRevenue = async () => {
    try {
      const response = await api.get("/admin-revenue", {
        withCredentials: true,
      });

      if (response?.data?.success) {
        setRevenueStats({
          orderCommission: response.data.orderCommission || 0,
          withdrawalCommission: response.data.withdrawalCommission || 0,
          totalRevenue: response.data.totalRevenue || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching admin revenue:", error);
    }
  };

  const openAcceptModal = (request) => {
    const commission = request.amount * 0.1;
    const sellerAmount = request.amount * 0.9;

    setConfirmModal({
      isOpen: true,
      type: "accept",
      request,
      title: "Accept Withdrawal Request",
      message: `Withdrawal Amount: $${request.amount.toFixed(
        2
      )}\nYour Commission: $${commission.toFixed(
        2
      )}\nSeller Gets: $${sellerAmount.toFixed(2)}\n\nDo you want to proceed?`,
      rejectionReason: "",
    });
  };

  const openRejectModal = (request) => {
    setConfirmModal({
      isOpen: true,
      type: "reject",
      request,
      title: "Reject Withdrawal Request",
      message: "Please provide a reason for rejecting this withdrawal request:",
      rejectionReason: "",
    });
  };

  const closeModal = () => {
    if (processingId) return;
    setConfirmModal({
      isOpen: false,
      type: "accept",
      request: null,
      rejectionReason: "",
    });
  };

  const handleConfirmAction = async () => {
    const { type, request } = confirmModal;

    if (type === "accept") {
      await handleAcceptWithdrawal(request._id, request.amount);
    } else {
      if (!confirmModal.rejectionReason.trim()) {
        toast.error("Please provide a rejection reason");
        return;
      }
      await handleRejectWithdrawal(
        request._id,
        confirmModal.rejectionReason.trim()
      );
    }
  };

  const handleAcceptWithdrawal = async (withdrawalId, amount) => {
    const adminCommission = amount * 0.1;

    try {
      setProcessingId(withdrawalId);

      const response = await api.post(
        "/accept-withdraw-request",
        {
          withdrawalId,
          amount,
        },
        { withCredentials: true }
      );

      if (response?.data?.success) {
        setWithdrawalRequests((prev) =>
          prev.map((request) =>
            request._id === withdrawalId
              ? {
                  ...request,
                  status: "Completed",
                  updatedAt: new Date().toISOString(),
                }
              : request
          )
        );

        setRevenueStats((prev) => ({
          ...prev,
          withdrawalCommission: prev.withdrawalCommission + adminCommission,
          totalRevenue: prev.totalRevenue + adminCommission,
        }));

        toast.success(
          `Withdrawal accepted! Your commission: $${adminCommission.toFixed(2)}`
        );
        closeModal();
      } else {
        toast.error(response.data?.message || "Failed to accept withdrawal");
      }
    } catch (error) {
      console.error("Error accepting withdrawal:", error);
      toast.error(
        error.response?.data?.message || "Error processing withdrawal request"
      );
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectWithdrawal = async (withdrawalId, reason) => {
    try {
      setProcessingId(withdrawalId);

      const response = await api.post(
        "/reject-withdraw-request",
        {
          withdrawalId,
          reason,
        },
        { withCredentials: true }
      );

      if (response?.data?.success) {
        setWithdrawalRequests((prev) =>
          prev.map((request) =>
            request._id === withdrawalId
              ? {
                  ...request,
                  status: "Rejected",
                  updatedAt: new Date().toISOString(),
                  rejectionReason: reason,
                }
              : request
          )
        );

        toast.success("Withdrawal request rejected successfully");
        closeModal();
      } else {
        toast.error(response.data?.message || "Failed to reject withdrawal");
      }
    } catch (error) {
      console.error("Error rejecting withdrawal:", error);
      toast.error(
        error.response?.data?.message || "Error processing rejection"
      );
    } finally {
      setProcessingId(null);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status) => {
    const baseClasses =
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";

    switch (status) {
      case "Processing":
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case "Completed":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "Rejected":
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const filteredRequests = withdrawalRequests.filter((request) => {
    if (filter === "all") return true;
    return request.status.toLowerCase() === filter;
  });

  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRequests = filteredRequests.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const stats = {
    total: withdrawalRequests.length,
    processing: withdrawalRequests.filter((r) => r.status === "Processing")
      .length,
    completed: withdrawalRequests.filter((r) => r.status === "Completed")
      .length,
    rejected: withdrawalRequests.filter((r) => r.status === "Rejected").length,
    totalAmount: withdrawalRequests.reduce(
      (acc, r) => acc + (r.amount || 0),
      0
    ),
    completedAmount: withdrawalRequests
      .filter((r) => r.status === "Completed")
      .reduce((acc, r) => acc + (r.amount || 0), 0),
    pendingAmount: withdrawalRequests
      .filter((r) => r.status === "Processing")
      .reduce((acc, r) => acc + (r.amount || 0), 0),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader onToggleSidebar={toggleSidebar} isMobile={isMobile} />

      <div className="flex">
        <div
          className={`
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          ${isMobile && isSidebarOpen ? "fixed inset-0 z-40" : ""}
          transition-transform duration-300 ease-in-out
          ${isMobile ? "w-64" : isSidebarOpen ? "w-64" : "w-16"}
          bg-white shadow-lg border-r border-gray-200
          ${isMobile ? "h-screen" : "min-h-screen"}
          overflow-y-auto
        `}
        >
          <AdminSideBar isCollapsed={!isSidebarOpen} />
        </div>

        {isMobile && isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={toggleSidebar}
          />
        )}

        <div
          className={`
          flex-1 p-4 lg:p-6 pt-20 min-h-screen
          ${isMobile ? "ml-0" : isSidebarOpen ? "ml-0" : "ml-0"}
        `}
        >
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Header Section */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <CreditCard className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
                        Withdrawal Management
                      </h1>
                      <p className="text-sm text-gray-600 mt-1">
                        Review and process seller withdrawal requests (
                        {withdrawalRequests.length} total)
                      </p>
                    </div>
                  </div>

                  {/* Revenue Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 min-w-0">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg p-3 text-white">
                      <div className="text-xs opacity-90">Total Revenue</div>
                      <div className="text-base lg:text-lg font-bold truncate">
                        {formatCurrency(revenueStats.totalRevenue)}
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg p-3 text-white">
                      <div className="text-xs opacity-90">Order Commission</div>
                      <div className="text-base lg:text-lg font-bold truncate">
                        {formatCurrency(revenueStats.orderCommission)}
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg p-3 text-white">
                      <div className="text-xs opacity-90">
                        Withdrawal Commission
                      </div>
                      <div className="text-base lg:text-lg font-bold truncate">
                        {formatCurrency(revenueStats.withdrawalCommission)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg">
                  <div className="text-blue-100 text-xs lg:text-sm">
                    Total Requests
                  </div>
                  <div className="text-xl lg:text-2xl font-bold">
                    {stats.total}
                  </div>
                  <div className="text-blue-100 text-xs mt-1 truncate">
                    {formatCurrency(stats.totalAmount)}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl p-4 text-white shadow-lg">
                  <div className="text-yellow-100 text-xs lg:text-sm">
                    Processing
                  </div>
                  <div className="text-xl lg:text-2xl font-bold">
                    {stats.processing}
                  </div>
                  <div className="text-yellow-100 text-xs mt-1 truncate">
                    {formatCurrency(stats.pendingAmount)} pending
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-4 text-white shadow-lg">
                  <div className="text-green-100 text-xs lg:text-sm">
                    Completed
                  </div>
                  <div className="text-xl lg:text-2xl font-bold">
                    {stats.completed}
                  </div>
                  <div className="text-green-100 text-xs mt-1 truncate">
                    {formatCurrency(stats.completedAmount)} paid
                  </div>
                </div>

                <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-xl p-4 text-white shadow-lg">
                  <div className="text-red-100 text-xs lg:text-sm">
                    Rejected
                  </div>
                  <div className="text-xl lg:text-2xl font-bold">
                    {stats.rejected}
                  </div>
                  <div className="text-red-100 text-xs mt-1 truncate">
                    Commission saved
                  </div>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
                <div className="flex flex-wrap gap-2 mb-6">
                  {[
                    { key: "all", label: "All", count: stats.total },
                    {
                      key: "processing",
                      label: "Processing",
                      count: stats.processing,
                    },
                    {
                      key: "completed",
                      label: "Completed",
                      count: stats.completed,
                    },
                    {
                      key: "rejected",
                      label: "Rejected",
                      count: stats.rejected,
                    },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => {
                        setFilter(tab.key);
                        setCurrentPage(1);
                      }}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                        filter === tab.key
                          ? "bg-blue-600 text-white shadow-lg"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {tab.label}
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          filter === tab.key ? "bg-white/20" : "bg-white/60"
                        }`}
                      >
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                          Seller Details
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                          Bank Account
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                          Amount & Commission
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                          Date
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paginatedRequests.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="px-6 py-12 text-center">
                            <div className="text-gray-500">
                              {filter === "all"
                                ? "No withdrawal requests found"
                                : `No ${filter} withdrawal requests`}
                            </div>
                          </td>
                        </tr>
                      ) : (
                        paginatedRequests.map((request) => (
                          <tr key={request._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">
                                {request.seller?.name ||
                                  request.seller?.shopName ||
                                  "Unknown Shop"}
                              </div>
                              <div className="text-sm text-gray-500">
                                {request.seller?.email || "No email"}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">
                                {request.withdrawMethod?.bankName ||
                                  "Unknown Bank"}
                              </div>
                              <div className="text-sm text-gray-500">
                                {request.withdrawMethod?.accountHolderName ||
                                  "Unknown Holder"}
                              </div>
                            </td>

                            <td className="px-6 py-4">
                              <div className="text-sm font-bold text-gray-900">
                                {formatCurrency(request.amount)}
                              </div>
                              <div className="text-xs text-green-600">
                                Your Commission:{" "}
                                {formatCurrency(request.amount * 0.1)}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={getStatusBadge(request.status)}>
                                {request.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {formatDate(request.createdAt)}
                            </td>
                            <td className="px-6 py-4">
                              {request.status === "Processing" && (
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => openAcceptModal(request)}
                                    disabled={processingId === request._id}
                                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50"
                                  >
                                    Accept
                                  </button>
                                  <button
                                    onClick={() => openRejectModal(request)}
                                    disabled={processingId === request._id}
                                    className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 disabled:opacity-50"
                                  >
                                    Reject
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden space-y-4">
                  {paginatedRequests.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      {filter === "all"
                        ? "No withdrawal requests found"
                        : `No ${filter} withdrawal requests`}
                    </div>
                  ) : (
                    paginatedRequests.map((request) => (
                      <div
                        key={request._id}
                        className="border border-gray-200 rounded-lg p-4 space-y-3"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-blue-50 rounded-lg">
                              <User className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-medium text-gray-900 truncate">
                                {request.seller?.name ||
                                  request.seller?.shopName ||
                                  "Unknown Shop"}
                              </div>
                              <div className="text-xs text-gray-500 truncate">
                                {request.seller?.email || "No email"}
                              </div>
                            </div>
                          </div>
                          <span className={getStatusBadge(request.status)}>
                            {request.status}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <Building className="w-4 h-4 text-gray-400" />
                          <div className="min-w-0 flex-1">
                            <div className="text-sm text-gray-900">
                              {request.withdrawMethods?.[0]?.bankName ||
                                "Unknown Bank"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {request.withdrawMethods?.[0]
                                ?.accountHolderName || "Unknown Holder"}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <DollarSign className="w-4 h-4 text-gray-400" />
                          <div className="flex-1">
                            <div className="text-sm font-bold text-gray-900">
                              {formatCurrency(request.amount)}
                            </div>
                            <div className="text-xs text-green-600">
                              Your Commission:{" "}
                              {formatCurrency(request.amount * 0.1)}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <div className="text-xs text-gray-500">
                            {formatDate(request.createdAt)}
                          </div>
                        </div>

                        {request.status === "Processing" && (
                          <div className="flex gap-2 pt-2">
                            <button
                              onClick={() => openAcceptModal(request)}
                              disabled={processingId === request._id}
                              className="flex-1 bg-green-600 text-white py-2 rounded text-sm hover:bg-green-700 disabled:opacity-50"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => openRejectModal(request)}
                              disabled={processingId === request._id}
                              className="flex-1 bg-red-600 text-white py-2 rounded text-sm hover:bg-red-700 disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
                    <div className="text-sm text-gray-700">
                      Showing {startIndex + 1} to{" "}
                      {Math.min(
                        startIndex + itemsPerPage,
                        filteredRequests.length
                      )}{" "}
                      of {filteredRequests.length} requests
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1}
                        className="px-3 py-2 border border-gray-300 rounded text-gray-600 hover:bg-gray-100 disabled:opacity-50 text-sm"
                      >
                        Previous
                      </button>

                      <div className="flex gap-1">
                        {Array.from(
                          { length: Math.min(5, totalPages) },
                          (_, i) => {
                            const pageNum = i + Math.max(1, currentPage - 2);
                            if (pageNum > totalPages) return null;

                            return (
                              <button
                                key={pageNum}
                                onClick={() => setCurrentPage(pageNum)}
                                className={`px-3 py-2 rounded text-sm ${
                                  currentPage === pageNum
                                    ? "bg-blue-600 text-white"
                                    : "border border-gray-300 text-gray-600 hover:bg-gray-100"
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          }
                        )}
                      </div>

                      <button
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages)
                          )
                        }
                        disabled={currentPage === totalPages}
                        className="px-3 py-2 border border-gray-300 rounded text-gray-600 hover:bg-gray-100 disabled:opacity-50 text-sm"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={closeModal}
        onConfirm={handleConfirmAction}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        loading={!!processingId}
        showInput={confirmModal.type === "reject"}
        inputValue={confirmModal.rejectionReason}
        onInputChange={(value) =>
          setConfirmModal((prev) => ({ ...prev, rejectionReason: value }))
        }
        inputPlaceholder="Enter rejection reason..."
      />
    </div>
  );
};

export default AdminDashboardWithdraw;
