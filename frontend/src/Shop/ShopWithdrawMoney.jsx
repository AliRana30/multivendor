import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { Trash, Plus, CreditCard, DollarSign, Eye, EyeOff } from 'lucide-react';
import DashboardHeader from './ShopLayout/DashboardHeader';
import DashboardSideBar from './ShopLayout/DashboardSideBar';
import { getAllOrders } from '../../redux/actions/order';
import api from '../components/axiosCongif';

const ShopWithdrawMoney = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  
  const [showAddBankModal, setShowAddBankModal] = useState(false);
  const [showPin, setShowPin] = useState(false);
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

  // Pakistani Banks List 
  const pakistaniBanks = [
    'HBL - Habib Bank Limited', 'UBL - United Bank Limited', 
    'NBP - National Bank of Pakistan', 'MCB - MCB Bank Limited',
    'ABL - Allied Bank Limited', 'Standard Chartered Bank Pakistan',
    'Faysal Bank Limited', 'Bank Alfalah Limited',
    'Askari Bank Limited', 'JS Bank Limited',
    'Soneri Bank Limited', 'Bank Al Habib Limited',
    'Dubai Islamic Bank Pakistan Limited', 'Meezan Bank Limited',
    'BankIslami Pakistan Limited'
  ];

  //  calculations
  const availableBalance = useMemo(() => seller?.availableBalance || 0, [seller?.availableBalance]);
  
  const totalWithdrawn = useMemo(() => {
    if (seller?.transactions && Array.isArray(seller.transactions)) {
      return seller.transactions
        .filter(t => ['Completed', 'Processing'].includes(t.status))
        .reduce((total, t) => total + (t.amount || 0), 0);
    }
    return 0;
  }, [seller?.transactions]);

  const calculateNetAmount = (amount) => {
    const numAmount = parseFloat(amount) || 0;
    return numAmount - (numAmount * 0.1);
  };

  // Effects
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setIsSidebarOpen(!mobile);
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

  useEffect(() => {
    if (seller) {
      const methods = seller.withdrawMethods || (seller.withdrawMethod ? [seller.withdrawMethod] : []);
      setBankAccounts(methods);
    }
  }, [seller]);

  // Event handlers
  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);

  const handleBankFormChange = (e) => {
    const { name, value } = e.target;
    if (name === 'pin' && !/^\d*$/.test(value)) return;
    setBankForm(prev => ({ ...prev, [name]: value }));
  };

  const resetBankForm = () => {
    setBankForm({ bankName: '', accountHolderName: '', accountNumber: '', pin: '' });
    setShowAddBankModal(false);
  };

  const validateBankForm = () => {
    if (!bankForm.bankName || !bankForm.accountHolderName || !bankForm.accountNumber || !bankForm.pin) {
      toast.info('Please fill all fields');
      return false;
    }
    if (bankForm.pin.length !== 4) {
      toast.info('PIN must be 4 digits');
      return false;
    }
    if (bankAccounts.find(acc => acc.accountNumber === bankForm.accountNumber)) {
      toast.error('This account number is already added');
      return false;
    }
    return true;
  };

  const handleAddBankAccount = async (e) => {
    e.preventDefault();
    if (!validateBankForm()) return;

    setLoading(true);
    try {
      const response = await api.put('/update-payment-method', {
        sellerId: seller._id,
        withdrawMethod: bankForm  
      });

      if (response?.data?.success) {
        setBankAccounts(response.data.seller?.withdrawMethods || [...bankAccounts, bankForm]);
        resetBankForm();
        toast.success('Bank account added successfully!');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add bank account');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBankAccount = async (accountNumber) => {
    if (!window.confirm('Are you sure you want to delete this bank account?')) return;

    setDeleteLoading(accountNumber);
    try {
      const response = await api.delete('/delete-payment-method', {
        data: { sellerId: seller._id, accountNumber }
      });

      if (response?.data?.success) {
        setBankAccounts(prev => prev.filter(acc => acc.accountNumber !== accountNumber));
        if (selectedBank === accountNumber) setSelectedBank('');
        toast.success('Bank account deleted successfully!');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete bank account');
    } finally {
      setDeleteLoading(null);
    }
  };

  const validateWithdrawal = (amount) => {
    if (!amount || amount <= 0) return 'Please enter a valid amount';
    if (amount > availableBalance) return `Insufficient balance. Available: $${availableBalance.toLocaleString()}`;
    if (!selectedBank) return 'Please select a bank account';
    if (!bankAccounts.find(acc => acc.accountNumber === selectedBank)) return 'Selected bank account not found';
    return null;
  };

  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    setWithdrawalError('');

    const amount = parseFloat(withdrawAmount);
    const validationError = validateWithdrawal(amount);
    if (validationError) {
      setWithdrawalError(validationError);
      return;
    }

    const selectedBankAccount = bankAccounts.find(acc => acc.accountNumber === selectedBank);
    const netAmount = calculateNetAmount(amount);

    try {
      const response = await api.post('/shop-withdraw-request', {
        amount, netAmount, platformFee: amount * 0.1, bankAccount: selectedBankAccount
      }, { withCredentials: true });

      if (response?.data?.success) {
        toast.success(`Withdrawal request of $${amount} submitted! You'll receive $${netAmount.toFixed(2)} after fees. Email sent to ${seller.email}`);
        setWithdrawAmount('');
        setSelectedBank('');
      }
    } catch (error) {
      setWithdrawalError(error.response?.data?.message || 'Failed to process withdrawal request');
    }
  };

  // Components
  const BalanceCard = () => (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow-md mb-6">
      <div className="flex items-center gap-3 mb-3">
        <DollarSign className="w-6 h-6 text-green-600" />
        <h3 className="text-lg font-semibold">Available Balance</h3>
      </div>
      <p className="text-2xl md:text-3xl font-bold text-green-600 mb-2">
        ${availableBalance.toLocaleString()}
      </p>
      <p className="text-sm text-gray-500">Current withdrawable balance</p>
      {totalWithdrawn > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Total Withdrawn:</span> ${totalWithdrawn.toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );

  const BankAccountsList = () => {
    if (!bankAccounts.length) return null;

    return (
      <div className="bg-white p-4 md:p-6 rounded-lg shadow-md mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Your Bank Accounts</h3>
          </div>
          <button
            onClick={() => setShowAddBankModal(true)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium px-3 py-1.5 rounded-md hover:bg-blue-50 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add New Account
          </button>
        </div>
        <div className="grid gap-3">
          {bankAccounts.map((account, index) => (
            <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="min-w-0 flex-1">
                <h4 className="font-medium text-gray-800 truncate">{account.bankName}</h4>
                <p className="text-sm text-gray-600 truncate">{account.accountHolderName}</p>
                <p className="text-sm text-gray-500 font-mono">
                  {"*".repeat(Math.max(0, account.accountNumber?.length - 4)) + account.accountNumber.slice(-4)}
                </p>
              </div>
              <button
                onClick={() => handleDeleteBankAccount(account.accountNumber)}
                disabled={deleteLoading === account.accountNumber}
                className="text-red-600 hover:text-red-800 p-2 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50 ml-2"
                title="Delete bank account"
              >
                {deleteLoading === account.accountNumber ? (
                  <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Trash className="w-5 h-5" />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const WithdrawalForm = () => (
    <form onSubmit={handleWithdrawSubmit} className="bg-white p-4 md:p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Withdrawal Request</h3>
      
      {/* Bank Account Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Bank Account</label>
        {bankAccounts.length > 0 ? (
          <select
            value={selectedBank}
            onChange={(e) => setSelectedBank(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Choose bank account</option>
            {bankAccounts.map((account, index) => (
              <option key={index} value={account.accountNumber}>
                {account.bankName} - {"*".repeat(Math.max(0, account.accountNumber.length - 4)) + account.accountNumber.slice(-4)} ({account.accountHolderName})
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
        <label className="block text-sm font-medium text-gray-700 mb-2">Withdrawal Amount ($)</label>
        <input
          type="number"
          value={withdrawAmount}
          onChange={(e) => setWithdrawAmount(e.target.value)}
          className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter amount"
          min="1"
          max={availableBalance}
          required
        />
        <div className="mt-2 space-y-1">
          <p className="text-sm text-gray-500">Maximum: ${availableBalance.toLocaleString()}</p>
          {withdrawAmount && parseFloat(withdrawAmount) > 0 && (
            <div className="text-sm bg-yellow-50 p-3 rounded border border-yellow-200">
              <div className="space-y-1">
                <p className="text-yellow-800"><span className="font-medium">Amount:</span> ${parseFloat(withdrawAmount).toFixed(2)}</p>
                <p className="text-yellow-800"><span className="font-medium">Platform fee (10%):</span> ${(parseFloat(withdrawAmount) * 0.1).toFixed(2)}</p>
                <p className="text-yellow-800 font-semibold"><span className="font-medium">You receive:</span> ${calculateNetAmount(withdrawAmount).toFixed(2)}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {withdrawalError && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {withdrawalError}
        </div>
      )}

      <button
        type="submit"
        disabled={!bankAccounts.length}
        className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
          bankAccounts.length
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        Submit Withdrawal Request
      </button>
    </form>
  );

  const AddBankModal = () => (
    showAddBankModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="p-4 md:p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Add Bank Account</h3>
              <button onClick={resetBankForm} disabled={loading} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddBankAccount} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Bank *</label>
                <select
                  name="bankName"
                  value={bankForm.bankName}
                  onChange={handleBankFormChange}
                  className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={loading}
                >
                  <option value="">Choose your bank</option>
                  {pakistaniBanks.map((bank) => (
                    <option key={bank} value={bank}>{bank}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Account Holder Name *</label>
                <input
                  type="text"
                  name="accountHolderName"
                  value={bankForm.accountHolderName}
                  onChange={handleBankFormChange}
                  className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter account holder name"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Account Number *</label>
                <input
                  type="text"
                  name="accountNumber"
                  value={bankForm.accountNumber}
                  onChange={handleBankFormChange}
                  className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter account number"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">4-Digit PIN *</label>
                <div className="relative">
                  <input
                    type={showPin ? "text" : "password"}
                    name="pin"
                    value={bankForm.pin}
                    onChange={handleBankFormChange}
                    className="w-full border border-gray-300 rounded-md p-3 pr-10 focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter 4-digit PIN"
                    maxLength="4"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                  >
                    {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={resetBankForm}
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
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Add Account'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    )
  );

  return (
    <div className="flex flex-col h-screen text-black">
      <DashboardHeader onToggleSidebar={toggleSidebar} isMobile={isMobile} />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className={`bg-gray-100 border-r transition-all duration-300 ${
          isMobile
            ? isSidebarOpen ? 'fixed z-50 top-0 left-0 w-64 h-full' : 'hidden'
            : 'w-64'
        }`}>
          <DashboardSideBar isCollapsed={!isSidebarOpen && !isMobile} />
        </div>

        {/* Mobile Overlay */}
        {isMobile && isSidebarOpen && (
          <div className="fixed inset-0 bg-black opacity-50 z-40" onClick={toggleSidebar} />
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-auto bg-gray-100 p-4 ml-0 md:ml-0">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-xl md:text-2xl font-bold mb-6 text-gray-800">Withdraw Money</h2>
            
            <BalanceCard />
            <BankAccountsList />
            <WithdrawalForm />
          </div>
        </div>
      </div>

      <AddBankModal />
    </div>
  );
};

export default ShopWithdrawMoney;