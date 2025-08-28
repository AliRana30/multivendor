import React, { useEffect, useState } from "react";
import { AiOutlinePlusCircle } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { createEvent } from "../../../redux/actions/event";
import Loader from "../../components/Loader";
import { categoriesData } from "../../../static/data";

const CreateEvent = () => {
  const { seller } = useSelector((state) => state.seller);
  const { success, error, loading } = useSelector((state) => state.event);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [images, setImages] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [originalPrice, setOriginalPrice] = useState();
  const [discountPrice, setDiscountPrice] = useState();
  const [stock, setStock] = useState();
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const today = new Date().toISOString().slice(0, 10);

  const minEndDate = startDate
    ? new Date(startDate.getTime() + 3 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10)
    : "";

  useEffect(() => {
    if (error) toast.error(error);
  }, [error, success, navigate]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
  };

  const handleStartDateChange = (e) => {
    const start = new Date(e.target.value);
    setStartDate(start);
    setEndDate(null);
  };

  const handleEndDateChange = (e) => {
    const end = new Date(e.target.value);
    setEndDate(end);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (images.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }

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
    newForm.append("start_Date", startDate?.toISOString());
    newForm.append("Finish_Date", endDate?.toISOString());

    dispatch(createEvent(newForm));
  };

  return loading ? (
    <Loader />
  ) : (
    <div className="w-[90%] 800px:w-[50%] bg-white shadow h-[80vh] rounded-[4px] p-3 overflow-y-scroll">
      <h5 className="text-[30px] font-Poppins text-center">Create Event</h5>
      <form onSubmit={handleSubmit}>
        <br />
        <div>
          <label className="pb-2">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            className="mt-2 block w-full px-3 h-[35px] border border-gray-300 rounded-[3px]"
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter event product name"
          />
        </div>
        <br />
        <div>
          <label className="pb-2">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            required
            rows="8"
            value={description}
            className="mt-2 block w-full pt-2 px-3 border border-gray-300 rounded-[3px]"
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter event product description"
          ></textarea>
        </div>
        <br />
        <div>
          <label className="pb-2">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            className="w-full mt-2 border h-[35px] rounded-[5px]"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="Choose a category">Choose a category</option>
            {categoriesData &&
              categoriesData.map((i) => (
                <option value={i.title} key={i.title}>
                  {i.title}
                </option>
              ))}
          </select>
        </div>
        <br />
        <div>
          <label className="pb-2">Tags</label>
          <input
            type="text"
            value={tags}
            className="mt-2 block w-full px-3 h-[35px] border border-gray-300 rounded-[3px]"
            onChange={(e) => setTags(e.target.value)}
            placeholder="Enter product tags"
          />
        </div>
        <br />
        <div>
          <label className="pb-2">Original Price</label>
          <input
            type="number"
            value={originalPrice}
            className="mt-2 block w-full px-3 h-[35px] border border-gray-300 rounded-[3px]"
            onChange={(e) => setOriginalPrice(e.target.value)}
            placeholder="Enter original price"
          />
        </div>
        <br />
        <div>
          <label className="pb-2">
            Price (With Discount) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={discountPrice}
            className="mt-2 block w-full px-3 h-[35px] border border-gray-300 rounded-[3px]"
            onChange={(e) => setDiscountPrice(e.target.value)}
            placeholder="Enter discount price"
          />
        </div>
        <br />
        <div>
          <label className="pb-2">
            Product Stock <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={stock}
            className="mt-2 block w-full px-3 h-[35px] border border-gray-300 rounded-[3px]"
            onChange={(e) => setStock(e.target.value)}
            placeholder="Enter product stock"
          />
        </div>
        <br />
        <div>
          <label className="pb-2">
            Event Start Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="start-date"
            value={startDate ? startDate.toISOString().slice(0, 10) : ""}
            className="mt-2 block w-full px-3 h-[35px] border border-gray-300 rounded-[3px]"
            onChange={handleStartDateChange}
            min={today}
          />
        </div>
        <br />
        <div>
          <label className="pb-2">
            Event End Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="end-date"
            value={endDate ? endDate.toISOString().slice(0, 10) : ""}
            className="mt-2 block w-full px-3 h-[35px] border border-gray-300 rounded-[3px]"
            onChange={handleEndDateChange}
            min={minEndDate}
          />
        </div>
        <br />
        <div>
          <label className="pb-2">
            Upload Images <span className="text-red-500">*</span>
          </label>
          <input
            type="file"
            id="upload"
            className="hidden"
            multiple
            onChange={handleImageChange}
          />
          <div className="w-full flex items-center flex-wrap">
            <label htmlFor="upload">
              <AiOutlinePlusCircle size={30} className="mt-3" color="#555" />
            </label>
            {images.map((file, index) => (
              <img
                src={URL.createObjectURL(file)}
                key={index}
                alt=""
                className="h-[120px] w-[120px] object-cover m-2"
              />
            ))}
          </div>
        </div>
        <br />
        <input
          type="submit"
          value="Create"
          className="mt-2 cursor-pointer block w-full px-3 h-[35px] border border-gray-300 rounded-[3px] bg-blue-500 text-white"
        />
      </form>
    </div>
  );
};

export default CreateEvent;
