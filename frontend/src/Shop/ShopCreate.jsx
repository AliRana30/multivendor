import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../components/axiosCongif';

const ShopCreate = () => {
  const [shopName, setShopName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState(null);
  const {isSeller ,seller} = useSelector((state) => state.seller)
  const navigate = useNavigate()

  const handleFileInputChange = (e) => {
    setAvatar(e.target.files[0]);
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!avatar || !shopName || !phoneNumber || !email || !password || !zipCode || !address) {
      toast.error("All fields including avatar are required.");
      return;
    }

    const formData = new FormData();
    formData.append("file", avatar);
    formData.append("name", shopName);
    formData.append("phoneNumber", phoneNumber);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("zipCode", zipCode);
    formData.append("address", address);

    try {
      await api.post("/create-shop", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setShopName("");
      setPhoneNumber("");
      setEmail("");
      setPassword("");
      setZipCode("");
      setAddress("");
      setAvatar(null);
      toast(`Shop created successfully. Check your ${email} to activate your account.`);
    } catch (err) {
      toast.error(err.response?.data || "Signup failed");
    }
  };


  useEffect(()=>{
     if(isSeller){
        navigate(`/shop/${seller._id}`)
     }
  },[])
  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-md rounded-lg text-black">
      <h2 className="text-2xl font-bold mb-6 text-center">Create A Shop</h2>
      <form onSubmit={handleSignup} encType="multipart/form-data">
        <input
          type="text"
          placeholder="Shop Name"
          className="w-full mb-4 p-2 border rounded"
          value={shopName}
          onChange={(e) => setShopName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Phone Number"
          className="w-full mb-4 p-2 border rounded"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full mb-4 p-2 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full mb-4 p-2 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          type="text"
          placeholder="Zip Code"
          className="w-full mb-4 p-2 border rounded"
          value={zipCode}
          onChange={(e) => setZipCode(e.target.value)}
        />
        <input
          type="text"
          placeholder="Address"
          className="w-full mb-4 p-2 border rounded"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        <input
          type="file"
          accept="image/*"
          className="w-full mb-4"
          onChange={handleFileInputChange}
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Create Shop
        </button>
      </form>
      <p className="text-center mt-4">
        Already have an account?{" "}
        <Link to="/shop-login" className="text-blue-600 underline">
          Login here
        </Link>
      </p>
    </div>
  );
};

export default ShopCreate;
