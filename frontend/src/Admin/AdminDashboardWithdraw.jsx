import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { useDispatch, useSelector } from 'react-redux'
import api from '../components/axiosCongif'

const AdminDashboardWithdraw = () => {
  const [withdrawalRequests, setWithdrawalRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState(null)
  const [adminRevenue, setAdminRevenue] = useState(0)
  const [filter, setFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [revenueStats, setRevenueStats] = useState({
    orderCommission: 0,
    withdrawalCommission: 0,
    totalRevenue: 0
  })


  useEffect(() => {
    fetchWithdrawalRequests()
    fetchAdminRevenue()
  }, [])

  const fetchWithdrawalRequests = async () => {
    try {
      setLoading(true)
      const response = await api.get('/get-withdraw-requests', { withCredentials: true })
      
      if (response?.data?.success) {
        setWithdrawalRequests(response.data.withdrawalRequests || [])
      } else {
        toast.error('Failed to fetch withdrawal requests')
        setWithdrawalRequests([])
      }
    } catch (error) {
      console.error('Error fetching withdrawal requests:', error)
      toast.error(error.response?.data?.message || 'Error loading withdrawal requests')
      setWithdrawalRequests([])
    } finally {
      setLoading(false)
    }
  }

  const fetchAdminRevenue = async () => {
    try {
      const response = await api.get('/admin-revenue', { withCredentials: true })
      
      if (response?.data?.success) {
        setAdminRevenue(response.data.totalRevenue || 0)
        setRevenueStats({
          orderCommission: response.data.orderCommission || 0,
          withdrawalCommission: response.data.withdrawalCommission || 0,
          totalRevenue: response.data.totalRevenue || 0
        })
      }
    } catch (error) {
      console.error('Error fetching admin revenue:', error)
      // Don't show error toast for revenue as it's not critical
    }
  }

  const handleAcceptWithdrawal = async (withdrawalId, amount) => {
    const adminCommission = amount * 0.1
    if (!window.confirm(`Are you sure you want to accept this withdrawal request?\n\nWithdrawal Amount: $ ${amount.toFixed(2)}\nYour Commission: US$ ${adminCommission.toFixed(2)}\nSeller Gets: US$ ${(amount * 0.9).toFixed(2)}`)) {
      return
    }

    try {
      setProcessingId(withdrawalId)
      
      const response = await api.post('/accept-withdraw-request', {
        withdrawalId,
        amount
      }, { withCredentials: true })

      if (response?.data?.success) {
        // Update withdrawal requests list
        setWithdrawalRequests(prev => 
          prev.map(request => 
            request._id === withdrawalId 
              ? { ...request, status: 'Completed', updatedAt: new Date().toISOString() }
              : request
          )
        )
        
        // Update admin revenue
        const newRevenue = response.data.newAdminRevenue || (adminRevenue + adminCommission)
        setAdminRevenue(newRevenue)
        
        // Update revenue stats
        setRevenueStats(prev => ({
          ...prev,
          withdrawalCommission: prev.withdrawalCommission + adminCommission,
          totalRevenue: prev.totalRevenue + adminCommission
        }))
        
        toast.success(`Withdrawal accepted! Your commission: $ ${adminCommission.toFixed(2)}`)
      } else {
        toast.error(response.data?.message || 'Failed to accept withdrawal')
      }
    } catch (error) {
      console.error('Error accepting withdrawal:', error)
      toast.error(error.response?.data?.message || 'Error processing withdrawal request')
    } finally {
      setProcessingId(null)
    }
  }

  const handleRejectWithdrawal = async (withdrawalId, amount) => {
    const reason = window.prompt('Please enter rejection reason:')
    if (!reason || reason.trim() === '') {
      toast.error('Rejection reason is required')
      return
    }

    try {
      setProcessingId(withdrawalId)
      
      const response = await api.post('/reject-withdraw-request', {
        withdrawalId,
        reason: reason.trim()
      }, { withCredentials: true })

      if (response?.data?.success) {
        setWithdrawalRequests(prev => 
          prev.map(request => 
            request._id === withdrawalId 
              ? { 
                  ...request, 
                  status: 'Rejected', 
                  updatedAt: new Date().toISOString(), 
                  rejectionReason: reason.trim() 
                }
              : request
          )
        )
        
        toast.success('Withdrawal request rejected successfully')
      } else {
        toast.error(response.data?.message || 'Failed to reject withdrawal')
      }
    } catch (error) {
      console.error('Error rejecting withdrawal:', error)
      toast.error(error.response?.data?.message || 'Error processing rejection')
    } finally {
      setProcessingId(null)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-medium"
    
    switch (status) {
      case 'Processing':
        return `${baseClasses} bg-yellow-100 text-yellow-800`
      case 'Completed':
        return `${baseClasses} bg-green-100 text-green-800`
      case 'Rejected':
        return `${baseClasses} bg-red-100 text-red-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  // Filter requests based on selected filter
  const filteredRequests = withdrawalRequests.filter(request => {
    if (filter === 'all') return true
    return request.status.toLowerCase() === filter
  })

  // Calculate pagination
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedRequests = filteredRequests.slice(startIndex, startIndex + itemsPerPage)

  // Calculate stats
  const stats = {
    total: withdrawalRequests.length,
    processing: withdrawalRequests.filter(r => r.status === 'Processing').length,
    completed: withdrawalRequests.filter(r => r.status === 'Completed').length,
    rejected: withdrawalRequests.filter(r => r.status === 'Rejected').length,
    totalAmount: withdrawalRequests.reduce((acc, r) => acc + (r.amount || 0), 0),
    completedAmount: withdrawalRequests
      .filter(r => r.status === 'Completed')
      .reduce((acc, r) => acc + (r.amount || 0), 0),
    pendingAmount: withdrawalRequests
      .filter(r => r.status === 'Processing')
      .reduce((acc, r) => acc + (r.amount || 0), 0)
  }

  if (loading) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 md:p-8">
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-2 text-gray-600">Loading withdrawal requests...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 md:p-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Withdrawal Management
            </h1>
            <p className="text-gray-600 text-sm md:text-base">
              Review and process seller withdrawal requests
            </p>
          </div>
          
          {/* Revenue Display */}
          <div className="mt-4 lg:mt-0 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg p-4 text-white text-center">
              <div className="text-xs opacity-80">Total Revenue</div>
              <div className="text-lg font-bold">{formatCurrency(revenueStats.totalRevenue)}</div>
            </div>
            <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg p-4 text-white text-center">
              <div className="text-xs opacity-80">Order Commission</div>
              <div className="text-lg font-bold">{formatCurrency(revenueStats.orderCommission)}</div>
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg p-4 text-white text-center">
              <div className="text-xs opacity-80">Withdrawal Commission</div>
              <div className="text-lg font-bold">{formatCurrency(revenueStats.withdrawalCommission)}</div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="text-blue-100 text-sm">Total Requests</div>
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-blue-100 text-xs mt-1">
              {formatCurrency(stats.totalAmount)}
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl p-4 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="text-yellow-100 text-sm">Processing</div>
            <div className="text-2xl font-bold">{stats.processing}</div>
            <div className="text-yellow-100 text-xs mt-1">
              {formatCurrency(stats.pendingAmount)} pending
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-4 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="text-green-100 text-sm">Completed</div>
            <div className="text-2xl font-bold">{stats.completed}</div>
            <div className="text-green-100 text-xs mt-1">
              {formatCurrency(stats.completedAmount)} paid
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-xl p-4 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="text-red-100 text-sm">Rejected</div>
            <div className="text-2xl font-bold">{stats.rejected}</div>
            <div className="text-red-100 text-xs mt-1">
              Commission saved: {formatCurrency((stats.totalAmount - stats.completedAmount) * 0.1)}
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { key: 'all', label: 'All', count: stats.total },
            { key: 'processing', label: 'Processing', count: stats.processing },
            { key: 'completed', label: 'Completed', count: stats.completed },
            { key: 'rejected', label: 'Rejected', count: stats.rejected }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setFilter(tab.key)
                setCurrentPage(1)
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                filter === tab.key
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.label}
              <span className={`px-2 py-1 rounded-full text-xs ${
                filter === tab.key ? 'bg-white/20' : 'bg-white/60'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Withdrawal Requests Table */}
        <div className="overflow-x-auto bg-white rounded-lg shadow-sm">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Seller Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bank Account
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount & Commission
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedRequests.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
                        <svg fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {filter === 'all' ? 'No withdrawal requests found' : `No ${filter} withdrawal requests`}
                      </h3>
                      <p className="text-gray-500">
                        {filter === 'all' ? 
                          'Withdrawal requests from sellers will appear here when submitted.' :
                          `No withdrawal requests with ${filter} status found.`
                        }
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedRequests.map((request) => (
                  <tr key={request._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {request.seller?.name || request.seller?.shopName || 'Unknown Shop'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {request.seller?.email || 'No email'}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          ID: {request.seller?._id ? `${request.seller._id.slice(0, 8)}...` : 'Unknown'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 font-medium">
                        {request.bankAccount?.bankName || 'Unknown Bank'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {request.bankAccount?.accountHolderName || 'Unknown Holder'}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {"*".repeat(Math.max(0, (request.bankAccount?.accountNumber?.length || 4) - 4)) + 
                         (request.bankAccount?.accountNumber?.slice(-4) || "****")}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-gray-900">
                        {formatCurrency(request.amount)}
                      </div>
                      <div className="text-xs text-green-600 font-medium mt-1">
                        Your Commission: {formatCurrency(request.amount * 0.1)}
                      </div>
                      <div className="text-xs text-blue-600">
                        Seller Gets: {formatCurrency(request.amount * 0.9)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={getStatusBadge(request.status)}>
                        {request.status}
                      </span>
                      {request.rejectionReason && (
                        <div className="text-xs text-red-600 mt-2 max-w-xs" title={request.rejectionReason}>
                          <strong>Reason:</strong> {request.rejectionReason.length > 30 ? 
                            `${request.rejectionReason.substring(0, 30)}...` : 
                            request.rejectionReason
                          }
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div><strong>Created:</strong></div>
                      <div>{formatDate(request.createdAt)}</div>
                      {request.updatedAt && request.updatedAt !== request.createdAt && (
                        <>
                          <div className="mt-2"><strong>Updated:</strong></div>
                          <div>{formatDate(request.updatedAt)}</div>
                        </>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {request.status === 'Processing' ? (
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => handleAcceptWithdrawal(request._id, request.amount)}
                            disabled={processingId === request._id}
                            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center min-w-[80px]"
                          >
                            {processingId === request._id ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              'Accept'
                            )}
                          </button>
                          <button
                            onClick={() => handleRejectWithdrawal(request._id, request.amount)}
                            disabled={processingId === request._id}
                            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      ) : request.status === 'Completed' ? (
                        <div className="text-center">
                          <div className="text-green-600 font-medium text-sm">✓ Processed</div>
                          <div className="text-xs text-gray-500 mt-1">
                            Earned: {formatCurrency(request.amount * 0.1)}
                          </div>
                        </div>
                      ) : request.status === 'Rejected' ? (
                        <div className="text-center">
                          <div className="text-red-600 font-medium text-sm">✗ Rejected</div>
                          <div className="text-xs text-gray-500 mt-1">No commission</div>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
            <div className="text-sm text-gray-700">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredRequests.length)} of {filteredRequests.length} requests
            </div>
            <div className="flex gap-2 flex-wrap justify-center">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              
              {/* Show page numbers with smart pagination */}
              {(() => {
                const maxVisiblePages = 5
                let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
                let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)
                
                if (endPage - startPage + 1 < maxVisiblePages) {
                  startPage = Math.max(1, endPage - maxVisiblePages + 1)
                }
                
                const pages = []
                for (let i = startPage; i <= endPage; i++) {
                  pages.push(i)
                }
                
                return pages.map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 rounded-md transition-colors ${
                      currentPage === page
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'border border-gray-300 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                ))
              })()}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboardWithdraw