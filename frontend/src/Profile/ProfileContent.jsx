import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  updateUserInfo,
  updateUserAvatar,
  deleteUserAddress,
  addUserAddress,
} from "../../redux/actions/user";
import { createProductReview } from "../../redux/actions/product";
import toast from "react-hot-toast";
import { Country, State, City } from "country-state-city";
import Loader from "../components/Loader";
import api from "../components/axiosCongif";
import { getUserOrders } from "../../redux/actions/order";

const ProfileContent = ({ option }) => {
  const { user, error } = useSelector((state) => state.user);
  const { loading: productLoading } = useSelector((state) => state.product);

  const fileInputRef = useRef(null);
  const dispatch = useDispatch();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState(
    user?.phoneNumber?.toString() || ""
  );
  const [zipCode, setZipCode] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");

  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [confirmOldPassword, setConfirmOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [addressType, setAddressType] = useState("home");
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);

  // Review modal states
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [currentReviewProduct, setCurrentReviewProduct] = useState(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [isReviewed, setIsReviewed] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  const countries = Country.getAllCountries();

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setPhoneNumber(user.phoneNumber?.toString() || "");
    }
  }, [user?.name, user?.email, user?.phoneNumber]);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setPhoneNumber(user.phoneNumber?.toString() || "");
    }

    if (user?.addresses && user.addresses.length > 0) {
      const userAddress = user.addresses[0];

      setAddress1(userAddress.address1 || userAddress.address || "");
      setZipCode(userAddress.zipCode?.toString() || "");
      setAddressType(userAddress.addressType || "home");

      if (userAddress.country) {
        const countryObj = countries.find(
          (c) =>
            c.name === userAddress.country ||
            c.isoCode === userAddress.countryCode
        );
        if (countryObj) {
          setCountry(countryObj.isoCode);

          if (userAddress.state) {
            const stateObjs = State.getStatesOfCountry(countryObj.isoCode);
            const stateObj = stateObjs.find(
              (s) =>
                s.name === userAddress.state ||
                s.isoCode === userAddress.stateCode
            );
            if (stateObj) {
              setState(stateObj.isoCode);

              if (userAddress.city) {
                const cityObjs = City.getCitiesOfState(
                  countryObj.isoCode,
                  stateObj.isoCode
                );
                const cityObj = cityObjs.find(
                  (c) => c.name === userAddress.city
                );
                if (cityObj) {
                  setCity(cityObj.name);
                } else {
                  setCity(userAddress.city);
                }
              }
            }
          }
        }
      }
    }
  }, [user, countries]);

  const handleCountryChange = (countryCode) => {
    setCountry(countryCode);
    setState("");
    setCity("");
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB");
      return;
    }

    setIsUpdatingAvatar(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const result = await dispatch(updateUserAvatar(formData));

      if (result.success) {
        toast.success("Avatar updated successfully!");
      } else {
        toast.error(result.error || "Failed to update avatar");
      }
    } catch (error) {
      toast.error("Failed to update avatar");
    } finally {
      setIsUpdatingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  //update profile
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password.trim()) {
      toast.error("Password is required to update profile");
      return;
    }

    const updateData = {
      name: name.trim(),
      email: email.trim(),
      password: password,
    };

    if (phoneNumber && !isNaN(phoneNumber)) {
      updateData.phoneNumber = Number(phoneNumber);
    }

    if (
      address1.trim() ||
      address2.trim() ||
      zipCode.trim() ||
      country ||
      city
    ) {
      const addressData = {};

      if (country) {
        const selectedCountry = countries.find((c) => c.isoCode === country);
        addressData.country = selectedCountry ? selectedCountry.name : country;
      }

      if (city.trim()) {
        addressData.city = city.trim();
      }

      if (address1.trim()) addressData.address1 = address1.trim();
      if (address2.trim()) addressData.address2 = address2.trim();

      // Set address field for backward compatibility
      if (address1.trim()) addressData.address = address1.trim();

      if (zipCode.trim() && !isNaN(zipCode)) {
        addressData.zipCode = Number(zipCode);
      }
      if (addressType) addressData.addressType = addressType;

      if (Object.keys(addressData).length > 0) {
        updateData.addresses = [addressData];
      }
    }

    console.log(JSON.stringify(updateData, null, 2));

    try {
      const result = await dispatch(updateUserInfo(updateData));

      if (result?.success) {
        toast.success("Profile updated successfully!");
        setPassword("");
      } else {
        toast.error(result?.error || "Failed to update profile");
      }
    } catch (err) {
      toast.error("Failed to update profile");
    }
  };

  // handle password change
  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (!oldPassword.trim()) {
      toast.error("Please enter your old password");
      return;
    }

    if (!newPassword.trim()) {
      toast.error("Please enter a new password");
      return;
    }

    if (!confirmNewPassword.trim()) {
      toast.error("Please confirm your new password");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast.error("New password and confirmation do not match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }

    if (oldPassword === newPassword) {
      toast.error("New password must be different from old password");
      return;
    }

    setIsChangingPassword(true);

    try {
      await api.put(
        "/update-password",
        {
          oldPassword,
          confirmOldPassword,
          newPassword,
          confirmNewPassword,
        },
        {
          withCredentials: true,
        }
      );

      toast.success("Password changed successfully!");

      // Clear all password fields after successful change
      setOldPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to change password";
      toast.error(errorMessage);
    } finally {
      setIsChangingPassword(false);
    }
  };

 const RefundHandler = async (orderId, orderStatus) => {
  try {
    const response = await api.put(
      `/order-refund/${orderId}`,
      { orderId, orderStatus },
      { withCredentials: true }
    );
    
    if (response?.data?.success) {
      toast.success("Refund request submitted successfully!");
      // Refresh orders to show updated status
      dispatch(getUserOrders(user._id));
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to submit refund request";
    toast.error(errorMessage);
  }
};
  // Star Rating Component
  const StarRating = ({
    rating,
    onRatingChange,
    hover,
    onHover,
    size = 24,
  }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange && onRatingChange(star)}
            onMouseEnter={() => onHover && onHover(star)}
            onMouseLeave={() => onHover && onHover(0)}
            className={`transition-colors ${
              onRatingChange ? "cursor-pointer" : "cursor-default"
            }`}
          >
            <svg
              width={size}
              height={size}
              viewBox="0 0 24 24"
              fill={star <= (hover || rating) ? "#fbbf24" : "#e5e7eb"}
              stroke={star <= (hover || rating) ? "#fbbf24" : "#d1d5db"}
              strokeWidth="1"
            >
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
            </svg>
          </button>
        ))}
      </div>
    );
  };

  // Review Modal Component
  const ReviewModal = ({ isOpen, onClose, product, onSubmit }) => {
    if (!isOpen) return null;

    const handleSubmit = (e) => {
      e.preventDefault();
      if (reviewRating === 0) {
        toast.error("Please select a rating");
        return;
      }
      onSubmit();
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Write a Review</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-black"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {product && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-sm mb-1">Product:</h4>
              <p className="text-sm text-gray-700">{product.name}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Rating <span className="text-red-500">*</span>
              </label>
              <StarRating
                rating={reviewRating}
                onRatingChange={setReviewRating}
                hover={hoverRating}
                onHover={setHoverRating}
                size={32}
              />
              <p className="text-xs text-gray-500 mt-1">
                {reviewRating > 0 && (
                  <>
                    {reviewRating === 1 && "Poor"}
                    {reviewRating === 2 && "Fair"}
                    {reviewRating === 3 && "Good"}
                    {reviewRating === 4 && "Very Good"}
                    {reviewRating === 5 && "Excellent"}
                  </>
                )}
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Comment (Optional)
              </label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Share your experience with this product..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={4}
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">
                {reviewComment.length}/500 characters
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={productLoading || reviewRating === 0}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {productLoading ? (
                  <div className="flex items-center justify-center">
                    <Loader />
                  </div>
                ) : (
                  "Submit Review"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Handle review submission
  const handleReviewSubmit = async () => {
    if (!currentReviewProduct || reviewRating === 0) {
      toast.error("Please select a rating");
      return;
    }
    try {
      const productId =
        currentReviewProduct.product?._id || currentReviewProduct._id;
      if (!productId) {
        toast.error("Product ID not found");
        return;
      }

      const reviewData = {
        user: user._id,
        rating: reviewRating,
        comment: reviewComment.trim(),
        id: productId,
      };

      const result = await dispatch(createProductReview(reviewData));

      if (result?.success) {
        toast.success("Review submitted successfully!");
        setShowReviewModal(false);
        setCurrentReviewProduct(null);
        setReviewRating(0);
        setReviewComment("");
        setHoverRating(0);
        setIsReviewed(true);
      } else {
        toast.error(result?.error || "Failed to submit review");
      }
    } catch (error) {
      toast.error("Failed to submit review");
    }
  };
  // Handle write review 
  const handleWriteReview = (item) => {
    setCurrentReviewProduct(item);
    setReviewRating(0);
    setReviewComment("");
    setHoverRating(0);
    setShowReviewModal(true);
  };

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  useEffect(() => {
    if (user?._id) {
      dispatch(getUserOrders(user._id));
    }
  }, [dispatch, user?._id]);

  // all orders
  const AllOrders = () => {
    const { orders, loading } = useSelector((state) => state.order);

    if (loading) {
      return (
        <div className="bg-white p-6 rounded-lg shadow-md text-black">
          <div className="flex justify-center items-center py-8">
            <Loader />
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white p-6 rounded-lg shadow-md text-black">
        <h2 className="text-xl font-bold mb-4">
          Your Orders ({orders?.length || 0})
        </h2>
        {orders?.length === 0 || !orders ? (
          <div className="text-center py-8 text-gray-500">
            <p>No orders found</p>
            <p className="text-sm mt-2">Orders you place will appear here</p>
          </div>
        ) : (
          orders.map((order) => (
            <div
              key={order._id}
              className="border border-gray-300 p-4 mb-4 rounded-md hover:shadow-md transition-shadow"
            >
              {/* Basic Order Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                <p>
                  <strong>Order ID:</strong> #
                  {order._id.slice(-8).toUpperCase()}
                </p>
                <p>
                  <strong>Shop:</strong> {order.shop?.name || "Unknown Shop"}
                </p>
                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(order.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <p>
                  <strong>Status:</strong>
                  <span
                    className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                      order.orderStatus === "delivered"
                        ? "bg-green-100 text-green-800"
                        : order.orderStatus === "cancelled"
                        ? "bg-red-100 text-red-800"
                        : order.orderStatus === "processing"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {order.orderStatus}
                  </span>
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3 text-sm">
                <p>
                  <strong>Payment:</strong>{" "}
                  {order.paymentInfo?.paymentMethod?.toUpperCase() || "N/A"}
                </p>
                <p>
                  <strong>Payment Status:</strong>
                  <span
                    className={`ml-1 ${
                      order.paymentInfo?.paymentStatus === "paid"
                        ? "text-green-600"
                        : order.paymentInfo?.paymentStatus === "failed"
                        ? "text-red-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {order.paymentInfo?.paymentStatus || "N/A"}
                  </span>
                </p>
                <p>
                  <strong>Total:</strong>{" "}
                  <span className="font-semibold text-green-600">
                    ${order.totalPrice?.toFixed(2) || "0.00"}
                  </span>
                </p>
              </div>

              {/* Items with Review Buttons */}
              <div className="mb-3">
                <p>
                  <strong>Items:</strong>
                </p>
                <div className="ml-4 text-sm space-y-2">
                  {order.items?.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center border-b border-gray-100 pb-2"
                    >
                      <span>
                        {item.name} (×{item.quantity})
                        {item.price && (
                          <span className="text-gray-600 ml-2">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        )}
                      </span>
                      {order.orderStatus === "delivered" && !order.isReviewed && (
                        <button
                          onClick={() => handleWriteReview(item)}
                          className="bg-blue-600 text-white text-xs px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                        >
                          Write Review
                        </button>
                      )}

                      {order.orderStatus === "delivered" && (
                         <button onClick={() => RefundHandler(order._id, order.orderStatus)} className="bg-blue-600 p-1  rounded-md text-white">Request Refund</button>
                      )}
                    </div>
                  )) || "No items"}
                </div>
              </div>

              {/* Shipping Address */}
              <div className="mb-3 text-sm">
                <p>
                  <strong>Shipping Address:</strong>
                </p>
                <div className="ml-4">
                  {order.shippingAddress ? (
                    <>
                      <p>{order.shippingAddress.address}</p>
                      <p>
                        {order.shippingAddress.city},{" "}
                        {order.shippingAddress.state}{" "}
                        {order.shippingAddress.zipCode}
                      </p>
                      {order.shippingAddress.phoneNumber && (
                        <p>📞 {order.shippingAddress.phoneNumber}</p>
                      )}
                    </>
                  ) : (
                    "N/A"
                  )}
                </div>
              </div>

              {/* Additional Info */}
              {(order.coupon?.code ||
                order.deliveredAt ||
                order.cancelledAt) && (
                <div className="border-t pt-3 text-sm">
                  {order.coupon?.code && (
                    <p>
                      <strong>Coupon:</strong> {order.coupon.code} (
                      {order.coupon.discountPercent}% off)
                    </p>
                  )}
                  {order.deliveredAt && (
                    <p>
                      <strong>Delivered:</strong>{" "}
                      {new Date(order.deliveredAt).toLocaleDateString()}
                    </p>
                  )}
                  {order.cancelledAt && (
                    <p>
                      <strong>Cancelled:</strong>{" "}
                      {new Date(order.cancelledAt).toLocaleDateString()}
                    </p>
                  )}
                  {order.cancellationReason && (
                    <p>
                      <strong>Reason:</strong> {order.cancellationReason}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))
        )}

        {/* Review Modal */}
        <ReviewModal
          isOpen={showReviewModal}
          onClose={() => {
            setShowReviewModal(false);
            setCurrentReviewProduct(null);
            setReviewRating(0);
            setReviewComment("");
            setHoverRating(0);
          }}
          product={currentReviewProduct}
          onSubmit={handleReviewSubmit}
        />
      </div>
    );
  };

//refunds
const Refunds = () => {
  const { orders, loading } = useSelector((state) => state.order);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md text-black">
        <div className="flex justify-center items-center py-8">
          <Loader />
        </div>
      </div>
    );
  }

  const refundOrders = orders?.filter(order => 
    order.orderStatus === "refunded" || 
    order.orderStatus === "Processing Refund" ||
    order.orderStatus === "refund request"
  ) || [];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md text-black">
      <h2 className="text-xl font-bold mb-4">
        Refund Requests ({refundOrders.length})
      </h2>
      
      {refundOrders.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <p>No refund requests found</p>
          <p className="text-sm mt-2">Refund requests will appear here when you request them</p>
        </div>
      ) : (
        <div className="space-y-4">
          {refundOrders.map((order) => (
            <div
              key={order._id}
              className="border border-gray-300 p-4 rounded-md hover:shadow-md transition-shadow"
            >
              {/* Order Header */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                <p>
                  <strong>Order ID:</strong> #{order._id.slice(-8).toUpperCase()}
                </p>
                <p>
                  <strong>Shop:</strong> {order.shop?.name || "Unknown Shop"}
                </p>
                <p>
                  <strong>Order Date:</strong>{" "}
                  {new Date(order.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <p>
                  <strong>Refund Status:</strong>
                  <span
                    className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                      order.orderStatus === "refunded"
                        ? "bg-green-100 text-green-800"
                        : order.orderStatus === "Processing Refund"
                        ? "bg-yellow-100 text-yellow-800"
                        : order.orderStatus === "refund request"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {order.orderStatus === "refund request" 
                      ? "Refund Requested"
                      : order.orderStatus === "Processing Refund"
                      ? "Processing Refund"
                      : order.orderStatus === "refunded"
                      ? "Refunded"
                      : order.orderStatus}
                  </span>
                </p>
              </div>

              {/* Refund Amount and Dates */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3 text-sm">
                <p>
                  <strong>Refund Amount:</strong>{" "}
                  <span className="font-semibold text-green-600">
                    ${order.totalPrice?.toFixed(2) || "0.00"}
                  </span>
                </p>
                {order.refundRequestedAt && (
                  <p>
                    <strong>Requested On:</strong>{" "}
                    {new Date(order.refundRequestedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                )}
                {order.refundedAt && (
                  <p>
                    <strong>Refunded Date:</strong>{" "}
                    {new Date(order.refundedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                )}
                <p>
                  <strong>Payment Method:</strong>{" "}
                  {order.paymentInfo?.paymentMethod?.toUpperCase() || "N/A"}
                </p>
              </div>

              {/* Items */}
              <div className="mb-3">
                <p><strong>Items:</strong></p>
                <div className="ml-4 text-sm space-y-1">
                  {order.items?.map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span>
                        {item.name} (×{item.quantity})
                      </span>
                      <span className="text-gray-600">
                        ${(item.discountPrice * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  )) || "No items"}
                </div>
              </div>

              {/* Refund Status Message */}
              <div className="border-t pt-3">
                {order.orderStatus === "refunded" && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-green-800 text-sm">
                      <strong>Refund Completed:</strong> Your refund has been processed successfully. 
                      The amount will reflect in your original payment method within 3-7 business days.
                    </p>
                  </div>
                )}
                
                {order.orderStatus === "Processing Refund" && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-yellow-800 text-sm">
                      <strong>Refund Processing:</strong> Your refund request is being processed. 
                      You will be notified once the refund is completed.
                    </p>
                  </div>
                )}

                {order.orderStatus === "refund request" && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-blue-800 text-sm">
                      <strong>Refund Requested:</strong> Your refund request has been submitted and 
                      is under review by our team. You will be notified once it's processed.
                    </p>
                  </div>
                )}
              </div>

              {/* Additional Info */}
              {order.refundReason && (
                <div className="mt-3 text-sm">
                  <p><strong>Refund Reason:</strong> {order.refundReason}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


const TrackOrders = () => {
  const { orders } = useSelector((state) => state.order);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md text-black">
      <h2 className="text-xl font-bold mb-6">Track Orders</h2>

      {!orders?.length ? (
        <div className="text-center py-8 text-gray-500">
          <p>No orders found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="border border-gray-200 p-4 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Order ID</p>
                  <p className="font-medium">#{order._id.slice(-8).toUpperCase()}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)}`}>
                    {order.orderStatus}
                  </span>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Items Qty</p>
                  <p className="font-medium">{order.items?.reduce((total, item) => total + item.quantity, 0) || 0}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="font-medium text-green-600">${order.totalPrice?.toFixed(2) || '0.00'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

  const ChangePassword = () => (
    <div className="bg-white p-6 rounded-lg shadow-md text-black">
      <h2 className="text-xl font-bold mb-6">Change Password</h2>

      <div className="max-w-md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Enter Your Old Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              required
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Enter your current password"
              disabled={isChangingPassword}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Enter New Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Enter your new password"
              disabled={isChangingPassword}
              minLength={6}
            />
            <p className="text-xs text-gray-500 mt-1">
              Password must be at least 6 characters long
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Confirm New Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              required
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Confirm your new password"
              disabled={isChangingPassword}
            />
          </div>

          <button
            type="button"
            onClick={handlePasswordChange}
            disabled={
              isChangingPassword ||
              !oldPassword ||
              !newPassword ||
              !confirmNewPassword
            }
            className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isChangingPassword ? <Loader /> : "Change Password"}
          </button>
        </div>
      </div>
    </div>
  );

  // address
  const AddressContent = () => {
    const { user } = useSelector((state) => state.user);
    const [showAddForm, setShowAddForm] = useState(false);

    const [newAddress, setNewAddress] = useState({
      country: "",
      state: "",
      city: "",
      address1: "",
      address2: "",
      zipCode: "",
      addressType: "home",
    });

    const countries = Country.getAllCountries();
    const states = newAddress.country
      ? State.getStatesOfCountry(newAddress.country)
      : [];

    const handleCountryChange = (countryCode) => {
      setNewAddress((prev) => ({
        ...prev,
        country: countryCode,
        state: "",
        city: "",
      }));
    };

    // Reset city when state changes
    const handleStateChange = (stateCode) => {
      setNewAddress((prev) => ({
        ...prev,
        state: stateCode,
        city: "",
      }));
    };

    const handleInputChange = (field, value) => {
      setNewAddress((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

    const handleAddAddress = async (e) => {
      e.preventDefault();

      // Validate required fields
      if (!newAddress.country || !newAddress.city || !newAddress.address1) {
        toast.error(
          "Please fill in all required fields (Country, City, Address)"
        );
        return;
      }

      const addressData = { ...newAddress };

      if (addressData.country) {
        const selectedCountry = countries.find(
          (c) => c.isoCode === addressData.country
        );
        addressData.country = selectedCountry
          ? selectedCountry.name
          : addressData.country;
      }

      if (addressData.state) {
        const selectedState = states.find(
          (s) => s.isoCode === addressData.state
        );
        addressData.state = selectedState
          ? selectedState.name
          : addressData.state;
      }

      if (addressData.zipCode && !isNaN(addressData.zipCode)) {
        addressData.zipCode = Number(addressData.zipCode);
      }

      addressData.address = addressData.address1;

      try {
        const result = await dispatch(addUserAddress(addressData));

        if (result?.success) {
          toast.success("Address added successfully!");
          setNewAddress({
            country: "",
            state: "",
            city: "",
            address1: "",
            address2: "",
            zipCode: "",
            addressType: "home",
          });
          setShowAddForm(false);
        } else {
          toast.error(result?.error || "Failed to add address");
        }
      } catch (err) {
        toast.error("Failed to add address");
      }
    };

    const handleDeleteAddress = async (addressId) => {
      if (!addressId) {
        toast.error("Invalid address ID");
        return;
      }
      try {
        const result = await dispatch(deleteUserAddress(addressId));

        if (result?.success) {
          toast.success("Address deleted successfully!");
        } else {
          toast.error(result?.error || "Failed to delete address");
        }
      } catch (err) {
        toast.error("Failed to delete address");
      }
    };

    return (
      <div className="bg-white p-6 rounded-lg shadow-md text-black">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Manage Addresses</h2>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
          >
            {showAddForm ? "Cancel" : "Add New Address"}
          </button>
        </div>

        {/* Add Address Form */}
        {showAddForm && (
          <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <h3 className="text-lg font-semibold mb-4">Add New Address</h3>
            <form
              onSubmit={handleAddAddress}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div>
                <label className="block text-sm font-medium mb-1">
                  Country <span className="text-red-500">*</span>
                </label>
                <select
                  value={newAddress.country}
                  onChange={(e) => handleCountryChange(e.target.value)}
                  className="border p-2 rounded w-full"
                  required
                >
                  <option value="">Select Country</option>
                  {countries.map((countryItem) => (
                    <option
                      key={countryItem.isoCode}
                      value={countryItem.isoCode}
                    >
                      {countryItem.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">State</label>
                <select
                  value={newAddress.state}
                  onChange={(e) => handleStateChange(e.target.value)}
                  className="border p-2 rounded w-full"
                  disabled={!newAddress.country}
                >
                  <option value="">Select State</option>
                  {states.map((stateItem) => (
                    <option key={stateItem.isoCode} value={stateItem.isoCode}>
                      {stateItem.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newAddress.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  placeholder="Enter city name"
                  className="border p-2 rounded w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Zip Code
                </label>
                <input
                  type="text"
                  value={newAddress.zipCode}
                  onChange={(e) => handleInputChange("zipCode", e.target.value)}
                  placeholder="Zip Code"
                  className="border p-2 rounded w-full"
                />
              </div>

              <div className="col-span-full">
                <label className="block text-sm font-medium mb-1">
                  Street Address 1 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newAddress.address1}
                  onChange={(e) =>
                    handleInputChange("address1", e.target.value)
                  }
                  placeholder="Street Address 1"
                  className="border p-2 rounded w-full"
                  required
                />
              </div>

              <div className="col-span-full">
                <label className="block text-sm font-medium mb-1">
                  Street Address 2
                </label>
                <input
                  type="text"
                  value={newAddress.address2}
                  onChange={(e) =>
                    handleInputChange("address2", e.target.value)
                  }
                  placeholder="Street Address 2 (Optional)"
                  className="border p-2 rounded w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Address Type
                </label>
                <select
                  value={newAddress.addressType}
                  onChange={(e) =>
                    handleInputChange("addressType", e.target.value)
                  }
                  className="border p-2 rounded w-full"
                >
                  <option value="home">Home</option>
                  <option value="work">Work</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="col-span-full">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition-colors"
                >
                  Add Address
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Display Existing Addresses */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Your Addresses</h3>
          {user?.addresses && user.addresses.length > 0 ? (
            <div className="grid gap-4">
              {user.addresses.map((address, index) => (
                <div
                  key={address._id || index}
                  className="border border-gray-200 rounded-lg p-4 bg-white"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                          {address.addressType?.charAt(0).toUpperCase() +
                            address.addressType?.slice(1) || "Home"}
                        </span>
                      </div>

                      <div className="text-sm text-gray-600 space-y-1">
                        <p className="font-medium text-black">
                          {address.address1 || address.address}
                        </p>
                        {address.address2 && <p>{address.address2}</p>}
                        <p>
                          {address.city}
                          {address.state && `, ${address.state}`}
                          {address.zipCode && ` ${address.zipCode}`}
                        </p>
                        <p className="font-medium">{address.country}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteAddress(address._id)}
                      className="ml-4 text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded transition-colors"
                      title="Delete Address"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <svg
                className="w-16 h-16 mx-auto mb-4 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <p>No addresses found</p>
              <p className="text-sm">
                Click "Add New Address" to add your first address
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };


  // profile page
  return (
    <div className="p-4 text-black">
      {option === "Profile" && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>

          <div className="flex justify-center mb-4">
            <div className="relative">
              <img
                key={user?.avatar?.url}   
                src={`http://localhost:5000/uploads/${user?.avatar?.url}`}
                alt="User Avatar"
                className="w-24 h-24 rounded-full border-2 border-gray-300 object-cover"
              />
              <button
                type="button"
                onClick={handleAvatarClick}
                disabled={isUpdatingAvatar}
                className="absolute bottom-0 right-0 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Change avatar"
              >
                {isUpdatingAvatar ? (
                  <svg
                    className="w-4 h-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      className="opacity-25"
                    />
                    <path
                      fill="currentColor"
                      d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      className="opacity-75"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                )}
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                accept="image/*"
                className="hidden"
              />
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                className="border p-2 rounded w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="border p-2 rounded w-full"
                required
              />
            </div>
            <div className="col-span-full">
              <label className="block text-sm font-medium mb-1">
                Current Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your current password to confirm changes"
                className="border p-2 rounded w-full"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Required to verify your identity before updating profile
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Phone Number"
                className="border p-2 rounded w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Country</label>
              <select
                value={country}
                onChange={(e) => handleCountryChange(e.target.value)}
                className="border p-2 rounded w-full"
              >
                <option value="">Select Country</option>
                {countries.map((countryItem) => (
                  <option key={countryItem.isoCode} value={countryItem.isoCode}>
                    {countryItem.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City"
                className="border p-2 rounded w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Zip Code</label>
              <input
                type="text"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                placeholder="Zip Code"
                className="border p-2 rounded w-full"
              />
            </div>
            <div className="col-span-full">
              <label className="block text-sm font-medium mb-1">
                Street Address 1
              </label>
              <input
                type="text"
                value={address1}
                onChange={(e) => setAddress1(e.target.value)}
                placeholder="Street Address 1"
                className="border p-2 rounded w-full"
              />
            </div>
            <div className="col-span-full">
              <label className="block text-sm font-medium mb-1">
                Street Address 2
              </label>
              <input
                type="text"
                value={address2}
                onChange={(e) => setAddress2(e.target.value)}
                placeholder="Street Address 2"
                className="border p-2 rounded w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Address Type
              </label>
              <select
                value={addressType}
                onChange={(e) => setAddressType(e.target.value)}
                className="border p-2 rounded w-full"
              >
                <option value="home">Home</option>
                <option value="work">Work</option>
                <option value="other">Other</option>
              </select>
            </div>
            <button
              type="submit"
              className="bg-red-600 text-white px-4 py-2 rounded mt-2 w-fit col-span-full"
            >
              Update Profile
            </button>
          </form>
        </div>
      )}

      {option === "Orders" && <AllOrders />}
      {option === "Refunds" && <Refunds />}
      {option === "Track Orders" && <TrackOrders />}
      {option === "Change Password" && <ChangePassword />}
      {option === "Address" && <AddressContent />}
    </div>
  );
};

export default ProfileContent;
