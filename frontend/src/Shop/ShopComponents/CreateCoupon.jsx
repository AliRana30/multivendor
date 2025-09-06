import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { categoriesData, productData } from "../../../static/data";
import { createCoupon } from "../../../redux/actions/coupon";

const CreateCoupon = () => {
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [category, setCategory] = useState("");
  const dispatch = useDispatch();
  const { seller } = useSelector((state) => state.seller);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !value || !selectedProduct) {
      return toast.error("Please fill required fields: Name, Value, Product");
    }

    const couponData = {
      name,
      value: Number(value),
      minAmount: Number(minAmount),
      maxAmount: Number(maxAmount),
      shopId: seller._id,
      selectedProduct,
      category,
    };

    dispatch(createCoupon(couponData))
      .then(() => {
        toast.success("Coupon created successfully");
        setName("");
        setValue("");
        setMinAmount("");
        setMaxAmount("");
        setSelectedProduct("");
        setCategory("");
      })
      .catch(() => {
        toast("Something went wrong while creating coupon");
      });
  };

  return (
    <div className="w-full min-h-screen p-4 lg:p-6">
      <div className="w-full max-w-6xl mx-auto">
      <div className="bg-white shadow-lg rounded-lg max-h-[80vh] overflow-y-auto">
  <div className="p-6 lg:p-8">
            <h1 className="text-2xl lg:text-3xl font-semibold mb-8 text-center">Create Coupon</h1>
            
            <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-6">
              {/* Coupon Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Coupon Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. OFF20"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Value and Min Amount Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Value (%) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="10"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Amount
                  </label>
                  <input
                    type="number"
                    value={minAmount}
                    onChange={(e) => setMinAmount(e.target.value)}
                    placeholder="100"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Max Amount and Product Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Amount
                  </label>
                  <input
                    type="number"
                    value={maxAmount}
                    onChange={(e) => setMaxAmount(e.target.value)}
                    placeholder="500"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Product <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Product</option>
                    {productData.map((item) => (
                      <option key={item.id} value={item.name}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Category</option>
                  {categoriesData.map((cat) => (
                    <option key={cat.id} value={cat.title}>
                      {cat.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  className="w-full sm:w-auto px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  Create Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCoupon;