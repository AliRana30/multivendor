import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { loadUser } from "../../redux/actions/user";
import { getAllCoupons } from "../../redux/actions/coupon";
import Loader from "../components/Loader";
import toast from "react-hot-toast";
import { createOrder } from "../../redux/actions/order";
import { updateProductStock } from "../../redux/actions/product";

const CheckOut = () => {
  const dispatch = useDispatch();
  const { cart } = useSelector((state) => state.cart);
  const { user, loading } = useSelector((state) => state.user);
  const { coupons } = useSelector((state) => state.coupon);

  const [currentStep, setCurrentStep] = useState("shipping");
  const [shippingData, setShippingData] = useState({
    address: "",
    city: "",
    state: "",
    country: "",
    zipCode: "",
    phoneNumber: "",
  });
  const [paymentData, setPaymentData] = useState({
    paymentMethod: "card",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardHolderName: "",
  });
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [orderData, setOrderData] = useState(null);

  const normalizeImages = (images) => {
    if (!images) return [];
    
    if (Array.isArray(images) && images.length > 0 && typeof images[0] === 'object') {
      return images;
    }
    
    if (Array.isArray(images)) {
      return images.map(img => ({
        url: typeof img === 'string' ? img : img?.url || '',
        public_id: typeof img === 'string' ? img : img?.public_id || ''
      }));
    }
    
    if (typeof images === 'string') {
      return [{
        url: images,
        public_id: images
      }];
    }
    
    if (typeof images === 'object') {
      return [{
        url: images.url || '',
        public_id: images.public_id || ''
      }];
    }
    
    return [];
  };

  const getImageUrl = (item) => {
    const normalizedImages = normalizeImages(item?.images);
    const firstImage = normalizedImages[0];
    
    if (!firstImage) return "/placeholder-image.png";
    
    const imageUrl = firstImage.url || firstImage.public_id || firstImage;
    
    if (typeof imageUrl === "string") {
      if (imageUrl.startsWith("http")) return imageUrl;
      return imageUrl.startsWith("/") ? `http://localhost:5000${imageUrl}` : `http://localhost:5000/uploads/${imageUrl}`;
    }
    
    return "/placeholder-image.png";
  };

  // Enhanced cart with proper image format
  const enhancedCart = cart?.map(item => ({
    _id: item._id || item.id,
    shopId: item.shopId || item.shop?._id,
    qty: parseInt(item.qty || item.quantity) || 1,
    price: parseFloat(item.originalPrice || item.price) || 0,
    discountPrice: parseFloat(item.discountPrice || item.price) || 0,
    name: item.name || "Product",
    images: normalizeImages(item.images), 
    category: item.category,
    description: item.description,
  })) || [];

  const subtotal = enhancedCart.reduce((total, item) => 
    total + (item.discountPrice || item.price) * item.qty, 0
  );

  const discount = appliedCoupon ? (subtotal * (appliedCoupon.value || 0)) / 100 : 0;
  const totalAmount = Math.max(0, subtotal - discount);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!user) dispatch(loadUser());
    
    if (cart?.length > 0) {
      const shopIds = [...new Set(cart.map(item => item.shopId || item.shop?._id).filter(Boolean))];
      shopIds.forEach(shopId => dispatch(getAllCoupons(shopId)));
    }
  }, [dispatch, user, cart]);

  const handleUseDefaultAddress = () => {
    if (user?.addresses?.[0]) {
      const addr = user.addresses[0];
      setShippingData({
        address: addr.address || "",
        city: addr.city || "",
        state: addr.state || "",
        country: addr.country || "",
        zipCode: addr.zipCode || "",
        phoneNumber: user.phoneNumber || "",
      });
    }
  };

  const handleApplyCoupon = () => {
    setCouponError("");
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }

    const foundCoupon = coupons?.find(c => c.name.toLowerCase() === couponCode.toLowerCase());
    
    if (foundCoupon) {
      if (foundCoupon.minAmount && subtotal < foundCoupon.minAmount) {
        setCouponError(`Minimum order amount should be $${foundCoupon.minAmount}`);
        return;
      }
      setAppliedCoupon(foundCoupon);
      toast.success("Coupon applied successfully!");
    } else {
      setCouponError("Invalid or expired coupon code");
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
    toast.success("Coupon removed");
  };

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    if (!shippingData.address || !shippingData.city || !shippingData.zipCode) {
      toast.error("Please fill in all required shipping fields");
      return;
    }
    setCurrentStep("payment");
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();

    if (paymentData.paymentMethod === "card") {
      const { cardNumber, expiryDate, cvv, cardHolderName } = paymentData;
      if (!cardNumber || !expiryDate || !cvv || !cardHolderName) {
        toast.error("Please fill in all required payment fields");
        return;
      }

      const cleanCardNumber = cardNumber.replace(/\s/g, "");
      if (cleanCardNumber.length < 13 || !/^\d+$/.test(cleanCardNumber)) {
        toast.error("Please enter a valid card number");
        return;
      }

      if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
        toast.error("Please enter expiry date in MM/YY format");
        return;
      }

      if (!/^\d{3,4}$/.test(cvv)) {
        toast.error("Please enter a valid CVV");
        return;
      }
    }

    const orderPayload = {
      user: user._id || user.id,
      items: enhancedCart,
      shippingAddress: shippingData,
      totalAmount,
      paymentInfo: {
        paymentMethod: paymentData.paymentMethod,
        paymentStatus: "pending",
        ...(paymentData.paymentMethod === "card" && {
          cardHolderName: paymentData.cardHolderName,
          lastFourDigits: paymentData.cardNumber.slice(-4)
        }),
      },
      coupon: appliedCoupon ? {
        code: appliedCoupon.name,
        discount,
        discountPercent: appliedCoupon.discountPercent,
      } : null,
    };

    try {
      const result = await dispatch(createOrder(orderPayload));
      
      const stockUpdatePromises = enhancedCart.map(item => 
        dispatch(updateProductStock({
          productId: item._id,
          quantityToReduce: item.qty,
        }))
      );
      
      await Promise.all(stockUpdatePromises);

      setCurrentStep("success");
      toast.success("Order placed successfully!");
      
      if (result?.payload?.success) {
        setOrderData(result.payload.orders);
      }
    } catch (error) {
      console.error("Order error:", error);
      const errorMessage = error.response?.data?.message || error.message || "Order submission failed";
      toast.error(errorMessage);
    }
  };

  const FormInput = ({ label, value, onChange, required = false, type = "text", ...props }) => (
    <div>
      <label className="block text-sm font-medium mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        {...props}
      />
    </div>
  );

  const OrderSummary = () => (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h4 className="font-semibold mb-3">Order Summary</h4>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        {appliedCoupon && (
          <div className="flex justify-between text-green-600">
            <span>Discount ({appliedCoupon.discountPercent}%):</span>
            <span>-${discount.toFixed(2)}</span>
          </div>
        )}
        <div className="border-t pt-2">
          <div className="flex justify-between font-bold text-lg">
            <span>Total:</span>
            <span>${totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const CartItems = () => (
    <div className="mb-6">
      <h4 className="text-lg font-medium mb-4">Order Items ({enhancedCart.length})</h4>
      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        {enhancedCart.map((item, index) => (
          <div key={`${item._id}-${index}`} className="flex justify-between items-center py-2 border-b last:border-b-0">
            <div className="flex items-center space-x-3">
              <img
                src={getImageUrl(item)}
                alt={item.name}
                className="w-12 h-12 object-cover rounded"
                onError={(e) => { e.target.src = "/placeholder-image.png"; }}
              />
              <div>
                <p className="font-medium text-sm">{item.name}</p>
                <p className="text-gray-600 text-xs">
                  Qty: {item.qty} × ${(item.discountPrice || item.price).toFixed(2)}
                </p>
              </div>
            </div>
            <p className="font-medium">${((item.discountPrice || item.price) * item.qty).toFixed(2)}</p>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) return <Loader />;

  if (!enhancedCart.length) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-yellow-800 mb-2">Cart is Empty</h3>
          <p className="text-yellow-700 mb-4">Add items to your cart before checkout.</p>
          <button
            onClick={() => window.location.href = "/"}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-center mb-8">
        <div className="flex items-center space-x-4">
          {["shipping", "payment", "success"].map((step, idx) => (
            <React.Fragment key={step}>
              <div
                className={`flex items-center cursor-pointer transition-colors ${
                  currentStep === step ? "text-blue-600" : "text-gray-500"
                }`}
                onClick={() => {
                  if (step === "shipping" || (step === "payment" && currentStep !== "shipping")) {
                    setCurrentStep(step);
                  }
                }}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  currentStep === step ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-600"
                }`}>
                  {idx + 1}
                </div>
                <span className="ml-2 font-medium capitalize">{step}</span>
              </div>
              {idx < 2 && <div className="w-12 h-1 bg-gray-300"></div>}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Shipping Step */}
        {currentStep === "shipping" && (
          <div className="text-black">
            <h3 className="text-2xl font-semibold mb-6">Shipping Information</h3>
            
            <CartItems />

            {user?.addresses?.length > 0 && (
              <button
                type="button"
                onClick={handleUseDefaultAddress}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-4 transition-colors"
              >
                Use Default Address
              </button>
            )}

            <form onSubmit={handleShippingSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={shippingData.address}
                    onChange={(e) => setShippingData(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    rows="3"
                    required
                    placeholder="Enter your full address"
                  />
                </div>
                <FormInput
                  label="Phone Number"
                  type="tel"
                  value={shippingData.phoneNumber}
                  onChange={(e) => setShippingData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  placeholder="Enter phone number"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  label="City"
                  value={shippingData.city}
                  onChange={(e) => setShippingData(prev => ({ ...prev, city: e.target.value }))}
                  required
                  placeholder="Enter city"
                />
                <FormInput
                  label="State"
                  value={shippingData.state}
                  onChange={(e) => setShippingData(prev => ({ ...prev, state: e.target.value }))}
                  placeholder="Enter state"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  label="Country"
                  value={shippingData.country}
                  onChange={(e) => setShippingData(prev => ({ ...prev, country: e.target.value }))}
                  placeholder="Enter country"
                />
                <FormInput
                  label="Zip Code"
                  value={shippingData.zipCode}
                  onChange={(e) => setShippingData(prev => ({ ...prev, zipCode: e.target.value }))}
                  required
                  placeholder="Enter zip code"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 font-medium transition-colors"
              >
                Continue to Payment
              </button>
            </form>
          </div>
        )}

        {/* Payment Step */}
        {currentStep === "payment" && (
          <div className="text-black">
            <h3 className="text-2xl font-semibold mb-6">Payment Information</h3>

            {/* Coupon Section */}
            <div className="mb-6">
              <h4 className="text-lg font-medium mb-4">Apply Coupon</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                {!appliedCoupon ? (
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Enter coupon code"
                      className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-green-600 font-medium">
                        Coupon Applied: {appliedCoupon.name}
                      </span>
                      <p className="text-sm text-gray-600">
                        {appliedCoupon.value}% discount
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-red-500 hover:text-red-700 text-sm transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                )}
                {couponError && <p className="text-red-500 text-sm mt-2">{couponError}</p>}
              </div>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Payment Method</label>
                <select
                  value={paymentData.paymentMethod}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                  <option value="card">Credit/Debit Card</option>
                  <option value="cod">Cash on Delivery</option>
                </select>
              </div>

              {paymentData.paymentMethod === "card" && (
                <>
                  <FormInput
                    label="Card Holder Name"
                    value={paymentData.cardHolderName}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, cardHolderName: e.target.value }))}
                    required
                    placeholder="Enter cardholder name"
                  />
                  <FormInput
                    label="Card Number"
                    value={paymentData.cardNumber}
                    onChange={(e) => {
                      // Format card number with spaces
                      const value = e.target.value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
                      setPaymentData(prev => ({ ...prev, cardNumber: value }));
                    }}
                    required
                    placeholder="1234 5678 9012 3456"
                    maxLength="19"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormInput
                      label="Expiry Date"
                      value={paymentData.expiryDate}
                      onChange={(e) => {
                        // Format expiry date MM/YY
                        let value = e.target.value.replace(/\D/g, '');
                        if (value.length >= 2) {
                          value = value.substring(0, 2) + '/' + value.substring(2, 4);
                        }
                        setPaymentData(prev => ({ ...prev, expiryDate: value }));
                      }}
                      required
                      placeholder="MM/YY"
                      maxLength="5"
                    />
                    <FormInput
                      label="CVV"
                      value={paymentData.cvv}
                      onChange={(e) => setPaymentData(prev => ({ ...prev, cvv: e.target.value.replace(/\D/g, '') }))}
                      required
                      placeholder="123"
                      maxLength="4"
                    />
                  </div>
                </>
              )}

              <OrderSummary />

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep("shipping")}
                  className="flex-1 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 font-medium transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 font-medium transition-colors"
                >
                  Place Order
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Success Step */}
        {currentStep === "success" && (
          <div className="text-center text-black">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-green-600 mb-2">Order Placed Successfully!</h3>
            <p className="text-gray-600 mb-6">Thank you for your purchase. You will receive a confirmation email shortly.</p>

            <div className="bg-gray-50 p-6 rounded-lg mb-6 text-left">
              <h4 className="font-semibold mb-4">Order Details</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Order Number:</span>
                  <span className="font-medium">
                    {orderData?.[0]?._id || `#ORD${Date.now().toString().slice(-6)}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Items:</span>
                  <span className="font-medium">{enhancedCart.length} items</span>
                </div>
                <div className="flex justify-between">
                  <span>Total:</span>
                  <span className="font-medium">${totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment:</span>
                  <span className="font-medium capitalize">{paymentData.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="font-medium text-orange-600">Processing</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
                  setCurrentStep("shipping");
                  setShippingData({ address: "", city: "", state: "", country: "", zipCode: "", phoneNumber: "" });
                  setPaymentData({ paymentMethod: "card", cardNumber: "", expiryDate: "", cvv: "", cardHolderName: "" });
                  setAppliedCoupon(null);
                  setCouponCode("");
                  setOrderData(null);
                }}
                className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 font-medium transition-colors"
              >
                Place Another Order
              </button>
              <button
                onClick={() => window.location.href = "/"}
                className="w-full bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 font-medium transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckOut;