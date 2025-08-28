import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createProduct } from "../../../redux/actions/product";
import toast from "react-hot-toast";
import { categoriesData } from "../../../static/data";

const CreateProduct = () => {
  const { seller } = useSelector((state) => state.seller);
  const { success, error } = useSelector((state) => state.product);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [images, setImages] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [stock, setStock] = useState("");

  const handleAddImages = (e) => {
    const files = Array.from(e.target.files);
    setImages((prev) => [...prev, ...files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const newForm = new FormData();

      images.forEach((image) => {
        newForm.append("images", image);
      });
      newForm.append("name", name);
      newForm.append("description", description);
      newForm.append("category", category);
      newForm.append("tags", tags);
      newForm.append("originalPrice", originalPrice);
      newForm.append("discountPrice", discountPrice);
      newForm.append("stock", stock);
      newForm.append("shopId", seller._id);

      for (let i = 0; i < images.length; i++) {
        newForm.append("images", images[i]);
      }
      dispatch(createProduct(newForm));
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (error) {
      toast(error);
    }
    if (success) {
      navigate("/shop-dashboard");
      toast("Product Created Successfully");
      window.location.reload(true)
    }
  }, [dispatch, error, success]);

  return (
    <div className="p-6 max-w-3xl mr-60 h-full mx-auto bg-white rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">Create New Product</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Product Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="">Choose a category</option>
          {categoriesData.map((item) => (
            <option key={item.title} value={item.title}>
              {item.title}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Tags (comma separated)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <input
          type="number"
          placeholder="Original Price"
          value={originalPrice}
          onChange={(e) => setOriginalPrice(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <input
          type="number"
          placeholder="Discount Price"
          value={discountPrice}
          onChange={(e) => setDiscountPrice(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <input
          type="number"
          placeholder="Stock"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          className="w-full p-2 border rounded"
        />

        <div>
          <label className="inline-block mb-2 font-medium">
            Product Images
          </label>
          <div className="flex flex-wrap items-center gap-2">
            {images.map((img, idx) => (
              <div
                key={idx}
                className="w-20 h-20 bg-gray-200 rounded overflow-hidden"
              >
                <img
                  src={URL.createObjectURL(img)}
                  alt="preview"
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
            <label className="w-20 h-20 flex items-center justify-center bg-blue-100 text-blue-700 border border-blue-400 rounded cursor-pointer hover:bg-blue-200">
              +
              <input
                type="file"
                multiple
                onChange={handleAddImages}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={handleSubmit}
        >
          Create Product
        </button>
      </form>
    </div>
  );
};

export default CreateProduct;
