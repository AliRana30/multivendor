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
      <div className="relative bg-white rounded-lg shadow-sm border border-gray-100 max-w-md w-full mx-4 transform transition-all">
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-light text-gray-900">{title}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={loading}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mb-6">
            <p className="text-sm sm:text-base text-gray-600 font-light whitespace-pre-line">{message}</p>
            {showInput && (
              <textarea
                value={inputValue}
                onChange={(e) => onInputChange(e.target.value)}
                placeholder={inputPlaceholder}
                className="mt-4 w-full p-3 border border-gray-100 rounded-lg focus:ring-1 focus:ring-gray-300 focus:border-gray-300 resize-none font-light text-sm"
                rows={3}
                disabled={loading}
              />
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-end">
            <button
              onClick={onClose}
              disabled={loading}
              className="w-full sm:w-auto px-4 py-2 text-gray-600 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 font-light text-sm"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading || (showInput && !inputValue.trim())}
              className={`w-full sm:w-auto px-6 py-2 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2 font-light text-sm ${
                type === "accept"
                  ? "bg-gray-900 hover:bg-gray-800"
                  : "bg-gray-900 hover:bg-gray-800"
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
    const baseClasses = "inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-light";

    switch (status) {
      case "Processing":
        return `${baseClasses} bg-orange-50 text-orange-600 border border-orange-100`;
      case "Completed":
        return `${baseClasses} bg-emerald-50 text-emerald-600 border border-emerald-100`;
      case "Rejected":
        return `${baseClasses} bg-gray-100 text-gray-600 border border-gray-200`;
      default:
        return `${baseClasses} bg-gray-50 text-gray-600 border border-gray-100`;
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
    totalAmount: withdrawalRequests
    .filter((r) => r.status === "Completed")
    .reduce(
      (acc, r) => acc + (r.amount || 0), 0
    ),
    completedAmount: withdrawalRequests
      .filter((r) => r.status === "Completed")
      .reduce((acc, r) => acc + (r.amount || 0), 0),
    pendingAmount: withdrawalRequests
      .filter((r) => r.status === "Processing")
      .reduce((acc, r) => acc + (r.amount || 0), 0),
  };

  const StatCard = ({ title, value, subtitle, icon, color = "gray" }) => (
    <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-gray-500 font-light text-xs sm:text-sm tracking-wide mb-2">{title}</p>
          <p className="text-xl sm:text-2xl font-light text-gray-900 mb-1 truncate">{value}</p>
          {subtitle && (
            <p className="text-gray-500 font-light text-xs truncate">{subtitle}</p>
          )}
        </div>
        <div className={`p-2 sm:p-3 rounded-lg flex-shrink-0 ${
          color === 'blue' ? 'bg-blue-50 text-blue-600' :
          color === 'green' ? 'bg-green-50 text-green-600' :
          color === 'purple' ? 'bg-purple-50 text-purple-600' :
          color === 'orange' ? 'bg-orange-50 text-orange-600' :
          color === 'cyan' ? 'bg-cyan-50 text-cyan-600' :
          color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
          color === 'indigo' ? 'bg-indigo-50 text-indigo-600' :
          'bg-gray-50 text-gray-600'
        }`}>
          <div className="w-5 h-5 sm:w-6 sm:h-6">
            {icon}
          </div>
        </div>
      </div>
    </div>
  );

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

        <div className="flex-1 min-h-screen">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-16 sm:py-20">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            ) : (
              <div className="space-y-8 sm:space-y-12">
                <div className="text-center">
                  <div className="inline-block">
                    <p className="text-xs sm:text-sm font-medium text-gray-500 tracking-[0.15em] uppercase mb-2 font-mono">
                      Financial Management
                    </p>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-light text-gray-900 leading-[0.9] mb-4 sm:mb-6">
                      Withdrawal Management
                    </h1>
                    <div className="w-16 sm:w-20 h-[1px] bg-gray-900 mx-auto"></div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 sm:p-6 md:p-8 shadow-sm border border-gray-100">
                  <div className="text-center space-y-4 sm:space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-2xl mx-auto pt-4 sm:pt-6 border-t border-gray-100">
                      <div className="text-center">
                        <p className="text-gray-500 font-light text-xs sm:text-sm">Total Revenue</p>
                        <p className="text-base sm:text-lg font-medium text-gray-900">{formatCurrency(revenueStats.totalRevenue)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-500 font-light text-xs sm:text-sm">Order Commission</p>
                        <p className="text-base sm:text-lg font-medium text-gray-900">{formatCurrency(revenueStats.orderCommission)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-500 font-light text-xs sm:text-sm">Withdrawal Commission</p>
                        <p className="text-base sm:text-lg font-medium text-gray-900">{formatCurrency(revenueStats.withdrawalCommission)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  <StatCard 
                    title="Total Requests" 
                    value={stats.total}
                    subtitle={formatCurrency(stats.totalAmount)}
                    color="blue"
                    icon={<CreditCard className="w-full h-full" />}
                  />
                  
                  <StatCard 
                    title="Processing" 
                    value={stats.processing}
                    subtitle={`${formatCurrency(stats.pendingAmount)} pending`}
                    color="orange"
                    icon={
                      <svg className="w-full h-full" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                      </svg>
                    }
                  />
                  
                  <StatCard 
                    title="Completed" 
                    value={stats.completed}
                    subtitle={`${formatCurrency(stats.completedAmount)} paid`}
                    color="emerald"
                    icon={
                      <svg className="w-full h-full" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                      </svg>
                    }
                  />
                  
                  <StatCard 
                    title="Rejected" 
                    value={stats.rejected}
                    subtitle="Commission saved"
                    color="gray"
                    icon={
                      <svg className="w-full h-full" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                      </svg>
                    }
                  />
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-100">
                  <div className="p-4 sm:p-6 md:p-8 border-b border-gray-100">
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                      {[
                        { key: "all", label: "All", count: stats.total },
                        { key: "processing", label: "Processing", count: stats.processing },
                        { key: "completed", label: "Completed", count: stats.completed },
                        { key: "rejected", label: "Rejected", count: stats.rejected },
                      ].map((tab) => (
                        <button
                          key={tab.key}
                          onClick={() => {
                            setFilter(tab.key);
                            setCurrentPage(1);
                          }}
                          className={`px-3 sm:px-4 py-2 rounded-lg font-light transition-colors flex items-center gap-2 text-xs sm:text-sm ${
                            filter === tab.key
                              ? "bg-gray-900 text-white"
                              : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-100"
                          }`}
                        >
                          {tab.label}
                          <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs ${
                            filter === tab.key ? "bg-white/20" : "bg-white/60"
                          }`}>
                            {tab.count}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b border-gray-100">
                        <tr>
                          <th className="px-4 md:px-8 py-4 md:py-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Seller Details
                          </th>
                          <th className="px-4 md:px-8 py-4 md:py-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Bank Account
                          </th>
                          <th className="px-4 md:px-8 py-4 md:py-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount & Commission
                          </th>
                          <th className="px-4 md:px-8 py-4 md:py-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-4 md:px-8 py-4 md:py-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-4 md:px-8 py-4 md:py-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-50">
                        {paginatedRequests.length === 0 ? (
                          <tr>
                            <td colSpan="6" className="px-4 md:px-8 py-12 text-center">
                              <div className="text-gray-500 font-light text-sm">
                                {filter === "all"
                                  ? "No withdrawal requests found"
                                  : `No ${filter} withdrawal requests`}
                              </div>
                            </td>
                          </tr>
                        ) : (
                          paginatedRequests.map((request) => (
                            <tr key={request._id} className="hover:bg-gray-50/50 transition-colors">
                              <td className="px-4 md:px-8 py-4 md:py-6">
                                <div className="font-light text-gray-900 text-sm">
                                  {request.seller?.name ||
                                    request.seller?.shopName ||
                                    "Unknown Shop"}
                                </div>
                                <div className="text-xs sm:text-sm text-gray-500 font-light">
                                  {request.seller?.email || "No email"}
                                </div>
                              </td>
                              <td className="px-4 md:px-8 py-4 md:py-6">
                                <div className="font-light text-gray-900 text-sm">
                                  {request.withdrawMethod?.bankName ||
                                    "Unknown Bank"}
                                </div>
                                <div className="text-xs sm:text-sm text-gray-500 font-light">
                                  {request.withdrawMethod?.accountHolderName ||
                                    "Unknown Holder"}
                                </div>
                              </td>
                              <td className="px-4 md:px-8 py-4 md:py-6">
                                <div className="font-medium text-gray-900 text-sm">
                                  {formatCurrency(request.amount)}
                                </div>
                                <div className="text-xs text-emerald-600 font-light">
                                  Commission: {formatCurrency(request.amount * 0.1)}
                                </div>
                              </td>
                              <td className="px-4 md:px-8 py-4 md:py-6">
                                <span className={getStatusBadge(request.status)}>
                                  {request.status}
                                </span>
                              </td>
                              <td className="px-4 md:px-8 py-4 md:py-6 text-xs sm:text-sm text-gray-500 font-light">
                                {formatDate(request.createdAt)}
                              </td>
                              <td className="px-4 md:px-8 py-4 md:py-6">
                                {request.status === "Processing" && (
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => openAcceptModal(request)}
                                      disabled={processingId === request._id}
                                      className="bg-gray-900 text-white px-3 py-1.5 rounded-lg font-light hover:bg-gray-800 disabled:opacity-50 transition-colors text-xs sm:text-sm"
                                    >
                                      Accept
                                    </button>
                                    <button
                                      onClick={() => openRejectModal(request)}
                                      disabled={processingId === request._id}
                                      className="border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg font-light hover:bg-gray-50 disabled:opacity-50 transition-colors text-xs sm:text-sm"
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

                  <div className="lg:hidden p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
                    {paginatedRequests.length === 0 ? (
                      <div className="text-center py-12 text-gray-500 font-light text-sm">
                        {filter === "all"
                          ? "No withdrawal requests found"
                          : `No ${filter} withdrawal requests`}
                      </div>
                    ) : (
                      paginatedRequests.map((request) => (
                        <div
                          key={request._id}
                          className="border border-gray-100 rounded-lg p-4 sm:p-6 space-y-3 sm:space-y-4 hover:shadow-md transition-all duration-300"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">
                              <div className="p-1.5 sm:p-2 bg-gray-50 rounded-lg border border-gray-100 flex-shrink-0">
                                <User className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="font-light text-gray-900 truncate text-sm sm:text-base">
                                  {request.seller?.name ||
                                    request.seller?.shopName ||
                                    "Unknown Shop"}
                                </div>
                                <div className="text-xs text-gray-500 font-light truncate">
                                  {request.seller?.email || "No email"}
                                </div>
                              </div>
                            </div>
                            <span className={getStatusBadge(request.status)}>
                              {request.status}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 sm:gap-3">
                            <Building className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <div className="font-light text-gray-900 text-sm sm:text-base">
                                {request.withdrawMethod?.bankName ||
                                  "Unknown Bank"}
                              </div>
                              <div className="text-xs sm:text-sm text-gray-500 font-light truncate">
                                {request.withdrawMethod?.accountHolderName || "Unknown Holder"}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 sm:gap-3">
                            <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                            <div className="flex-1">
                              <div className="font-medium text-gray-900 text-sm sm:text-base">
                                {formatCurrency(request.amount)}
                              </div>
                              <div className="text-xs text-emerald-600 font-light">
                                Commission: {formatCurrency(request.amount * 0.1)}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 sm:gap-3">
                            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                            <div className="text-xs text-gray-500 font-light">
                              {formatDate(request.createdAt)}
                            </div>
                          </div>

                          {request.status === "Processing" && (
                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2 border-t border-gray-100">
                              <button
                                onClick={() => openAcceptModal(request)}
                                disabled={processingId === request._id}
                                className="flex-1 bg-gray-900 text-white py-2.5 sm:py-3 rounded-lg font-light hover:bg-gray-800 disabled:opacity-50 transition-colors text-sm"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => openRejectModal(request)}
                                disabled={processingId === request._id}
                                className="flex-1 border border-gray-200 text-gray-600 py-2.5 sm:py-3 rounded-lg font-light hover:bg-gray-50 disabled:opacity-50 transition-colors text-sm"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  {totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between p-4 sm:p-6 md:p-8 border-t border-gray-100 gap-4">
                      <div className="text-xs sm:text-sm text-gray-500 font-light text-center sm:text-left">
                        Showing {startIndex + 1} to{" "}
                        {Math.min(
                          startIndex + itemsPerPage,
                          filteredRequests.length
                        )}{" "}
                        of {filteredRequests.length} requests
                      </div>
                      <div className="flex gap-2 flex-wrap justify-center">
                        <button
                          onClick={() =>
                            setCurrentPage((prev) => Math.max(prev - 1, 1))
                          }
                          disabled={currentPage === 1}
                          className="px-3 sm:px-4 py-2 border border-gray-100 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 font-light transition-colors text-xs sm:text-sm"
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
                                  className={`px-3 sm:px-4 py-2 rounded-lg font-light transition-colors text-xs sm:text-sm ${
                                    currentPage === pageNum
                                      ? "bg-gray-900 text-white"
                                      : "border border-gray-100 text-gray-600 hover:bg-gray-50"
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
                          className="px-3 sm:px-4 py-2 border border-gray-100 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 font-light transition-colors text-xs sm:text-sm"
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
      </div>

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
