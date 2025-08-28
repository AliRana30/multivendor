import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import DashboardHeader from './ShopLayout/DashboardHeader';
import DashboardSideBar from './ShopLayout/DashboardSideBar';
import { useDispatch, useSelector } from 'react-redux';
import { getAllOrders } from '../../redux/actions/order';
import api from '../components/axiosCongif';

const ShopWithdrawMoney = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showAddBankModal, setShowAddBankModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  const [withdrawalError, setWithdrawalError] = useState('');
  const [bankAccounts, setBankAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);
  
  const [bankForm, setBankForm] = useState({
    bankName: '',
    accountHolderName: '',
    accountNumber: '',
    pin: ''
  });

  const { seller } = useSelector((state) => state.seller);
  const { orders } = useSelector((state) => state.order);
  const dispatch = useDispatch();

  // Calculate available balance from delivered orders with 10% platform fee deduction
  const availableBalance = useMemo(() => {
    if (!orders || !Array.isArray(orders)) {
      const balance = seller?.availableBalance || 0;
      return balance - (balance * 0.1); // Deduct 10% platform fee
    }

    const totalRevenue = orders.reduce((acc, order) => {
      if (order.orderStatus === 'delivered') {
        acc += order.totalPrice || 0;
      }
      return acc;
    }, 0);

    // Deduct 10% platform fee from total revenue
    return totalRevenue - (totalRevenue * 0.1);
  }, [orders, seller?.availableBalance]);

  // Calculate the amount that will be received after 10% deduction
  const calculateNetAmount = (amount) => {
    const numAmount = parseFloat(amount) || 0;
    return numAmount - (numAmount * 0.1);
  };

  // Pakistani Banks List
  const pakistaniBanks = [
    'HBL - Habib Bank Limited',
    'UBL - United Bank Limited', 
    'NBP - National Bank of Pakistan',
    'MCB - MCB Bank Limited',
    'ABL - Allied Bank Limited',
    'Standard Chartered Bank Pakistan',
    'Faysal Bank Limited',
    'Bank Alfalah Limited',
    'Askari Bank Limited',
    'JS Bank Limited',
    'Soneri Bank Limited',
    'Bank Al Habib Limited',
    'Dubai Islamic Bank Pakistan Limited',
    'Meezan Bank Limited',
    'BankIslami Pakistan Limited'
  ];

  useEffect(() => {
    const handleResize = () => {
      const isNowMobile = window.innerWidth < 768;
      setIsMobile(isNowMobile);
      setIsSidebarOpen(!isNowMobile);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  useEffect(() => {
    if (seller?._id) {
      dispatch(getAllOrders(seller._id));
    }
  }, [dispatch, seller?._id]);

  // Load bank accounts from seller data 
  useEffect(() => {
    if (seller) {
      if (seller.withdrawMethods && Array.isArray(seller.withdrawMethods)) {
        setBankAccounts(seller.withdrawMethods);
      } else if (seller.withdrawMethod) {
        setBankAccounts([seller.withdrawMethod]);
      } else {
        setBankAccounts([]);
      }
    }
  }, [seller]);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const handleBankFormChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'pin' && !/^\d*$/.test(value)) {
      return;
    }
    
    setBankForm({
      ...bankForm,
      [name]: value
    });
  };

  const handleAddBankAccount = async (e) => {
    e.preventDefault();
    
    if (!bankForm.bankName || !bankForm.accountHolderName || !bankForm.accountNumber || !bankForm.pin) {
      toast.info('Please fill all fields');
      return;
    }

    if (bankForm.pin.length !== 4) {
      toast.info('PIN must be 4 digits');
      return;
    }

    // Check if account number already exists
    const existingAccount = bankAccounts.find(acc => acc.accountNumber === bankForm.accountNumber);
    if (existingAccount) {
      toast.error('This account number is already added');
      return;
    }

    setLoading(true);
    try {
      const response = await api.put('/update-payment-method', {
        sellerId: seller._id,
        withdrawMethod: bankForm  
      });

      if (response?.data?.success) {
        if (response.data.seller?.withdrawMethods) {
          setBankAccounts(response.data.seller.withdrawMethods);
        } else {
          setBankAccounts(prev => [...prev, bankForm]);
        }
        
        setBankForm({
          bankName: '',
          accountHolderName: '',
          accountNumber: '',
          pin: ''
        });
        setShowAddBankModal(false);
        toast.success('Bank account added successfully!');
      }
      
    } catch (error) {
      console.error('Error adding bank account:', error);
      toast.error(error.response?.data?.message || 'Failed to add bank account');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBankAccount = async (accountNumber) => {
    if (!window.confirm('Are you sure you want to delete this bank account?')) {
      return;
    }

    setDeleteLoading(accountNumber);
    try {
      const response = await api.delete('/delete-payment-method', {
        data: { 
          sellerId: seller._id,
          accountNumber: accountNumber 
        }
      });

      if (response?.data?.success) {
        setBankAccounts(prev => prev.filter(acc => acc.accountNumber !== accountNumber));
        
        if (selectedBank === accountNumber) {
          setSelectedBank('');
        }
        
        toast.success('Bank account deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting bank account:', error);
      toast.error(error.response?.data?.message || 'Failed to delete bank account');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    setWithdrawalError('');

    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) {
      setWithdrawalError('Please enter a valid amount');
      return;
    }

    if (amount > availableBalance) {
      setWithdrawalError(`Insufficient balance. Available balance: $ ${availableBalance.toLocaleString()}`);
      return;
    }

    if (!selectedBank) {
      setWithdrawalError('Please select a bank account');
      return;
    }

    const selectedBankAccount = bankAccounts.find(acc => acc.accountNumber === selectedBank);
    if (!selectedBankAccount) {
      setWithdrawalError('Selected bank account not found');
      return;
    }

    const netAmount = calculateNetAmount(amount);

    try {
      const response = await api.post('/shop-withdraw-request', {
        amount: amount, // Original amount requested
        netAmount: netAmount, // Amount after 10% deduction
        platformFee: amount * 0.1, // 10% platform fee
        bankAccount: selectedBankAccount
      }, { withCredentials: true });

      if (response?.data?.success) {
        toast.success(`Withdrawal request of $${amount} submitted successfully! You will receive $${netAmount.toFixed(2)} after 10% platform fee deduction. An email has been sent to ${seller.email}`);
        setWithdrawAmount('');
        setSelectedBank('');
      }
      
    } catch (error) {
      console.error('Error processing withdrawal:', error);
      setWithdrawalError(error.response?.data?.message || 'Failed to process withdrawal request');
    }
  };

  // Check if seller has any bank accounts
  const hasBankAccounts = bankAccounts && bankAccounts.length > 0;

  return (
    <div className="flex flex-col h-screen text-black">
      {/* Header */}
      <DashboardHeader onToggleSidebar={toggleSidebar} isMobile={isMobile} />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div
          className={`bg-gray-100 border-r transition-all duration-300 ${
            isMobile
              ? isSidebarOpen
                ? 'fixed z-50 top-0 left-0 w-64 h-full'
                : 'hidden'
              : 'w-64'
          }`}
        >
          <DashboardSideBar isCollapsed={!isSidebarOpen && !isMobile} />
        </div>

        {/* Overlay on mobile */}
        {isMobile && isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black opacity-50 z-40"
            onClick={toggleSidebar}
          ></div>
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-auto bg-gray-100 p-4 ml-0 md:ml-0">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Withdraw Money</h2>
            
            {/* Balance Display */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <h3 className="text-lg font-semibold mb-2">Available Balance</h3>
              <p className="text-3xl font-bold text-green-600">
                $ {availableBalance.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                From delivered orders revenue (after 10% platform fee deduction)
              </p>
            </div>

            {/* Bank Accounts List */}
            {hasBankAccounts && (
              <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Your Bank Accounts</h3>
                  <button
                    onClick={() => setShowAddBankModal(true)}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    + Add New Account
                  </button>
                </div>
                <div className="space-y-3">
                  {bankAccounts.map((account, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-800">{account.bankName}</h4>
                        <p className="text-sm text-gray-600">{account.accountHolderName}</p>
                        <p className="text-sm text-gray-500">
                          {"*".repeat(account.accountNumber.length - 4) + account.accountNumber.slice(-4)}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteBankAccount(account.accountNumber)}
                        disabled={deleteLoading === account.accountNumber}
                        className="text-red-600 hover:text-red-800 p-2 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50"
                        title="Delete bank account"
                      >
                        {deleteLoading === account.accountNumber ? (
                          <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Withdrawal Form */}
            <form onSubmit={handleWithdrawSubmit} className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Withdrawal Request</h3>
              
              {/* Bank Account Selection */}
              <div className="mb-4">
                <label htmlFor="bankAccount" className="block text-sm font-medium text-gray-700 mb-2">
                  Select Bank Account
                </label>
                {bankAccounts.length > 0 ? (
                  <select
                    id="bankAccount"
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Choose bank account</option>
                    {bankAccounts.map((account, index) => (
                      <option key={index} value={account.accountNumber}>
                        {account.bankName} - {"*".repeat(account.accountNumber.length - 4) + account.accountNumber.slice(-4)} ({account.accountHolderName})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <p className="text-gray-500 mb-3">No bank accounts added</p>
                    <button
                      type="button"
                      onClick={() => setShowAddBankModal(true)}
                      className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Add Bank Account
                    </button>
                  </div>
                )}
              </div>

              {/* Amount Input */}
              <div className="mb-4">
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                  Withdrawal Amount ($)
                </label>
                <input
                  type="number"
                  id="amount"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter amount"
                  min="1"
                  max={availableBalance}
                  required
                />
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-gray-500">
                    Maximum withdrawal: $ {availableBalance.toLocaleString()}
                  </p>
                  {withdrawAmount && parseFloat(withdrawAmount) > 0 && (
                    <div className="text-sm bg-yellow-50 p-2 rounded border border-yellow-200">
                      <p className="text-yellow-800">
                        <span className="font-medium">Withdrawal amount:</span> ${parseFloat(withdrawAmount).toFixed(2)}
                      </p>
                      <p className="text-yellow-800">
                        <span className="font-medium">Platform fee (10%):</span> ${(parseFloat(withdrawAmount) * 0.1).toFixed(2)}
                      </p>
                      <p className="text-yellow-800 font-semibold">
                        <span className="font-medium">You will receive:</span> ${calculateNetAmount(withdrawAmount).toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Error Message */}
              {withdrawalError && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {withdrawalError}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!hasBankAccounts}
                className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
                  hasBankAccounts
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Submit Withdrawal Request
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Add Bank Account Modal */}
      {showAddBankModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Add Bank Account</h3>
                <button
                  onClick={() => setShowAddBankModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                  disabled={loading}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleAddBankAccount}>
                {/* Bank Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Bank *
                  </label>
                  <select
                    name="bankName"
                    value={bankForm.bankName}
                    onChange={handleBankFormChange}
                    className="w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={loading}
                  >
                    <option value="">Choose your bank</option>
                    {pakistaniBanks.map((bank) => (
                      <option key={bank} value={bank}>
                        {bank}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Account Holder Name */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Holder Name *
                  </label>
                  <input
                    type="text"
                    name="accountHolderName"
                    value={bankForm.accountHolderName}
                    onChange={handleBankFormChange}
                    className="w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter account holder name"
                    required
                    disabled={loading}
                  />
                </div>

                {/* Account Number */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Number *
                  </label>
                  <input
                    type="text"
                    name="accountNumber"
                    value={bankForm.accountNumber}
                    onChange={handleBankFormChange}
                    className="w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter account number"
                    required
                    disabled={loading}
                  />
                </div>

                {/* PIN */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    4-Digit PIN *
                  </label>
                  <input
                    type="password"
                    name="pin"
                    value={bankForm.pin}
                    onChange={handleBankFormChange}
                    className="w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter 4-digit PIN"
                    maxLength="4"
                    pattern="[0-9]{4}"
                    required
                    disabled={loading}
                  />
                </div>

                {/* Modal Actions */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddBankModal(false)}
                    className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      'Add Account'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopWithdrawMoney;