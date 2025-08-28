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
  const {seller} = useSelector((state) => state.seller);

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
    <div className="w-100 p-5 bg-white rounded-md shadow-md mr-40">
      <h1 className="text-xl font-semibold mb-4">Create Coupon</h1>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="mb-4">
          <label className="block text-gray-700">Coupon Code *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. OFF20"
            className="w-full mt-1 p-2 border border-gray-300 rounded"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700">Value (%) *</label>
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="10"
              className="w-full mt-1 p-2 border border-gray-300 rounded"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700">Min Amount</label>
            <input
              type="number"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
              placeholder="100"
              className="w-full mt-1 p-2 border border-gray-300 rounded"
            />
          </div>
          <div>
            <label className="block text-gray-700">Max Amount</label>
            <input
              type="number"
              value={maxAmount}
              onChange={(e) => setMaxAmount(e.target.value)}
              placeholder="500"
              className="w-full mt-1 p-2 border border-gray-300 rounded"
            />
          </div>
          <div>
            <label className="block text-gray-700">Select Product *</label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full mt-1 p-2 border border-gray-300 rounded"
              required
            >
              <option value="">Select</option>
              {productData.map((item) => (
                <option key={item.id} value={item.name}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-gray-700">Select Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full mt-1 p-2 border border-gray-300 rounded"
          >
            <option value="">Select</option>
            {categoriesData.map((cat) => (
              <option key={cat.id} value={cat.title}>
                {cat.title}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Create Coupon
        </button>
      </form>
    </div>
  );
};

export default CreateCoupon;
