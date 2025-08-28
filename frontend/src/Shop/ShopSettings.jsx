import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSelector, useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import api from '../components/axiosCongif';

const ShopSettings = ({ isOpen, onClose }) => {
  const { seller, updating } = useSelector((state) => state.seller);
  const dispatch = useDispatch();
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    phoneNumber: '',
    zipCode: ''
  });

  useEffect(() => {
    if (seller && isOpen) {
      setFormData({
        name: seller.name || '',
        email: seller.email || '',
        address: seller.address || '',
        phoneNumber: seller.phoneNumber || '',
        zipCode: seller.zipCode || ''
      });
      // Set current avatar as preview
      if (seller.avatar?.url) {
        setImagePreview(`http://localhost:5000/${seller.avatar.url}`);
      }
    }
  }, [seller, isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size should be less than 2MB');
        return;
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Only JPG, PNG, GIF and WebP images are allowed');
        return;
      }

      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(seller?.avatar?.url ? `http://localhost:5000/${seller.avatar.url}` : null);
    const fileInput = document.getElementById('avatar-upload');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    dispatch({ type: "UpdateShopRequest" });

    try {
      const submitData = new FormData();
      
      Object.keys(formData).forEach(key => {
        submitData.append(key, formData[key]);
      });

      if (selectedImage) {
        submitData.append('avatar', selectedImage);
      }

      const response = await api.put(`/update-shop/${seller._id}`, submitData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        dispatch({
          type: "UpdateShopSuccess",
          payload: response.data.shop
        });
        
        toast.success('Shop updated successfully!');
        onClose();
      } else {
        dispatch({
          type: "UpdateShopFail",
          payload: response.data.message || 'Failed to update shop'
        });
        toast.error(response.data.message || 'Failed to update shop');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update shop';
      
      dispatch({
        type: "UpdateShopFail",
        payload: errorMessage
      });
      
      toast.error(errorMessage);
    }
  };

  const handleClose = () => {
    if (!updating) {
      setSelectedImage(null);
      if (seller?.avatar?.url) {
        setImagePreview(`http://localhost:5000/${seller.avatar.url}`);
      } else {
        setImagePreview(null);
      }
      
      dispatch({ type: "clearErrors" });
      onClose();
    }
  };

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !updating) {
      handleClose();
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen && !updating) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, updating]);

  if (!isOpen) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 text-black"
      style={{ 
        zIndex: 999999,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }}
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[95vh] overflow-y-auto animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        style={{ transform: 'translateZ(0)' }}
      >
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Edit Shop Settings</h2>
            <button
              onClick={handleClose}
              disabled={updating}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed p-2 rounded-full hover:bg-gray-100 transition-all duration-200"
              title="Close modal"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="px-6 py-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Upload Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Shop Avatar
              </label>
              <div className="flex items-center space-x-4">
                {/* Avatar Preview */}
                <div className="relative">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Shop Avatar Preview"
                      className="w-16 h-16 rounded-full object-cover border-2 border-gray-300 shadow-sm"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-300">
                      <svg
                        className="w-6 h-6 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0v-3.28a1 1 0 01.684-.948l1.923-.641M7 21V5a2 2 0 012-2h2a2 2 0 012 2v16"
                        />
                      </svg>
                    </div>
                  )}
                  {selectedImage && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow-sm">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Upload Controls */}
                <div className="flex-1">
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleImageChange}
                    disabled={updating}
                    className="hidden"
                  />
                  <div className="flex space-x-2">
                    <label
                      htmlFor="avatar-upload"
                      className={`cursor-pointer bg-blue-50 text-blue-600 px-3 py-2 rounded-lg text-sm hover:bg-blue-100 transition-colors font-medium ${
                        updating ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      Choose Image
                    </label>
                    {selectedImage && (
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        disabled={updating}
                        className="bg-gray-50 text-gray-600 px-3 py-2 rounded-lg text-sm hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    JPG, PNG, GIF or WebP (max. 2MB)
                  </p>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shop Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  disabled={updating}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                  placeholder="Enter shop name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  disabled={updating}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  disabled={updating}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed resize-none transition-colors"
                  placeholder="Enter shop address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  required
                  disabled={updating}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zip Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  required
                  disabled={updating}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                  placeholder="Enter zip code"
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="sticky bottom-0 bg-white pt-4 pb-2">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={updating}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {updating ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating...
                    </div>
                  ) : (
                    'Update Shop'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ShopSettings;