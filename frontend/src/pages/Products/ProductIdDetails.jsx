import React, { useState, useEffect } from 'react';
import { IoIosCart } from 'react-icons/io';
import ProductRatings from './ProductRatings';
import SuggestedProducts from './SuggestedProducts';
import { useSelector } from 'react-redux';

const ProductIdDetails = ({ data }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const {seller} = useSelector((state) => state.seller);

  useEffect(() => {
    if (data?.image_Url?.[0]?.url) {
      setSelectedImage(data.image_Url[0].url);
    } else if (data?.images?.[0]?.url) {
      setSelectedImage(data.images[0].url);
    } else if (data?.images?.[0]) {
      const imageUrl = typeof data.images[0] === 'string' 
        ? data.images[0] 
        : data.images[0].url || data.images[0];
      setSelectedImage(imageUrl);
    }
  }, [data]);

  if (!data) {
    return (
      <div className="p-4 text-center text-gray-500">
        No data found for this product
      </div>
    );
  }

  const handleIncrement = () => setQuantity(prev => prev + 1);
  const handleDecrement = () => {
    if (quantity > 1) setQuantity(prev => prev - 1);
  };

  const getImageUrl = (imageObj) => {
    if (!imageObj) return '/placeholder-image.png';
    
    if (imageObj.url) {
      return imageObj.url;
    }
    
    if (typeof imageObj === 'string') {
      if (imageObj.startsWith('http://') || imageObj.startsWith('https://')) {
        return imageObj;
      }
      if (imageObj.startsWith('/')) {
        return `http://localhost:5000${imageObj}`;
      }
      return `http://localhost:5000/${imageObj}`;
    }
    
    return '/placeholder-image.png';
  };

  const imageArray = data.image_Url || data.images || [];
  
  const displayPrice = data.discountPrice || data.price || 0;

  return (
    <div className="p-4 max-w-7xl mx-auto">
      {/* Product Main Details */}
      <div className="flex flex-col lg:flex-row items-start gap-8">
        {/* Image Section */}
        <div className="w-full lg:w-1/2 border rounded-lg p-4 shadow-lg hover:shadow-xl transition">
          <div className="w-full h-[400px] overflow-hidden rounded-lg bg-gray-50">
            <img
              src={getImageUrl(data.images && data.images[0].url)}
              alt={data.name}
              className="w-full h-full object-contain p-4"
              onError={(e) => {
                e.target.src = '/placeholder-image.png';
              }}
            />
          </div>

          {/* Thumbnails */}
          {imageArray.length > 1 && (
            <div className="flex gap-3 flex-wrap mt-4 justify-center">
              {imageArray.map((img, index) => (
                <img
                  key={index}
                  src={getImageUrl(img)}
                  alt={`Thumbnail ${index + 1}`}
                  onClick={() => setSelectedImage(getImageUrl(img))}
                  onError={(e) => {
                    e.target.src = '/placeholder-image.png';
                  }}
                  className={`w-20 h-20 object-cover border-2 rounded-lg cursor-pointer transition-all duration-200 hover:scale-105 ${
                    selectedImage === getImageUrl(img) 
                      ? 'ring-2 ring-blue-500 border-blue-500' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="w-full lg:w-1/2 flex flex-col justify-start gap-4">
          <div className="border-b pb-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{data.name}</h1>
            <div className="flex items-center gap-4 mb-4">
              <span className="text-3xl font-bold text-blue-600">${displayPrice}</span>
              {data.originalPrice && data.originalPrice > displayPrice && (
                <>
                  <span className="text-xl text-gray-500 line-through">
                    ${data.originalPrice}
                  </span>
                  <span className="bg-red-100 text-red-800 text-sm font-medium px-2 py-1 rounded-full">
                    Save ${(data.originalPrice - displayPrice).toFixed(2)}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700 leading-relaxed">
                {data.description || 'No description available for this product.'}
              </p>
            </div>

            {/* Rating and Stock Info */}
            <div className="flex items-center gap-6 py-4 border-y border-gray-200">
              {data.rating && (
                <div className="flex items-center gap-2">
                  <span className="text-yellow-500">★</span>
                  <span className="font-medium">{seller.rating}</span>
                  <span className="text-gray-500">({data.reviews?.length || 0} reviews)</span>
                </div>
              )}
              
              {data.sold_out && (
                <div className="text-gray-600">
                  <span className="font-medium">{data.sold_out}</span> sold
                </div>
              )}

              {data.stock && (
                <div className={`font-medium ${data.stock < 10 ? 'text-red-600' : 'text-green-600'}`}>
                  {data.stock < 10 ? `Only ${data.stock} left!` : `${data.stock} in stock`}
                </div>
              )}
            </div>

            {/* Quantity Counter */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-lg font-medium">Quantity:</span>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={handleDecrement}
                    className="px-4 py-2 text-lg font-medium text-gray-600 hover:bg-gray-100 transition-colors rounded-l-lg"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="px-6 py-2 text-lg font-medium border-x border-gray-300">
                    {quantity}
                  </span>
                  <button
                    onClick={handleIncrement}
                    className="px-4 py-2 text-lg font-medium text-gray-600 hover:bg-gray-100 transition-colors rounded-r-lg"
                    disabled={data.stock && quantity >= data.stock}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg flex items-center justify-center gap-3 text-lg"
                disabled={data.stock === 0}
              >
                <IoIosCart size={24} />
                {data.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
            </div>

            {/* Seller Info */}
            {data.shop && (
              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold mb-4">Seller Information</h3>
                <div className="flex items-center gap-4">
                  {seller.avatar.url && (
                    <img
                      src={seller.avatar.url || '/placeholder-avatar.png'}
                      className="rounded-full w-16 h-16 border-2 border-gray-200"
                      alt="Seller Avatar"
                      onError={(e) => {
                        e.target.src = '/placeholder-avatar.png';
                      }}
                    />
                  )}
                  <div>
                    <h4 className="text-blue-600 font-semibold text-lg hover:text-blue-800 cursor-pointer">
                      {seller.name}
                    </h4>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                      <span>★ {seller.ratings || 0}</span>
                      <span>•</span>
                      <span>Seller Rating</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product Ratings Section */}
      <div className="mt-16">
        <ProductRatings data={data} />
      </div>

      {/* Suggested Products Section */}
      <div className="mt-16">
        <SuggestedProducts data={data} />
      </div>
    </div>
  );
};

export default ProductIdDetails;