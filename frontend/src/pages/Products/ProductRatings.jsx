import React, { useState } from 'react';
import { useSelector } from 'react-redux';

const ProductRatings = ({ data }) => {
  const [activeTab, setActiveTab] = useState('details');

  const {seller} = useSelector((state) => state.seller);

  return (
    <div className="p-4 max-w-3xl mx-auto">
      {/* Tab Header Box */}
      <div className="flex justify-around border border-gray-200 rounded-md shadow-sm overflow-hidden">
        <button
          onClick={() => setActiveTab('details')}
          className={`flex-1 py-3 text-center font-medium transition-all ${
            activeTab === 'details' ? 'border-b-2 border-red-500 text-red-500' : 'text-gray-600'
          }`}
        >
          Product Details
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`flex-1 py-3 text-center font-medium transition-all ${
            activeTab === 'reviews' ? 'border-b-2 border-red-500 text-red-500' : 'text-gray-600'
          }`}
        >
          Product Reviews
        </button>
        <button
          onClick={() => setActiveTab('seller')}
          className={`flex-1 py-3 text-center font-medium transition-all ${
            activeTab === 'seller' ? 'border-b-2 border-red-500 text-red-500' : 'text-gray-600'
          }`}
        >
          Seller Information
        </button>
      </div>

      {/* Content Section */}
      <div className="mt-6">
        {activeTab === 'details' && (
          <div>
            <h2 className="text-xl font-semibold mb-2">Product Description</h2>
            <p className="text-gray-700">{data?.description || 'No product description available.'}</p>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div>
            <h2 className="text-xl font-semibold mb-2">Customer Reviews</h2>
            {data ? (
                <div className="mb-4 border-b pb-2">
                  <p className="text-sm font-semibold">{data.review || 'No Reviews'}</p>
                  {/* <p className="text-gray-600">{review.comment}</p> */}
                </div>
            ) : (
              <p className="text-gray-500">No reviews available.</p>
            )}
          </div>
        )}

        {activeTab === 'seller' && (
          <div>
            <h2 className="text-xl font-semibold mb-2">Seller Information</h2>
            <p className="text-gray-700">Name: {seller?.name || 'Not provided'}</p>
            <p className="text-gray-700">Email: {seller?.email || 'Not provided'}</p>
            <p className="text-gray-700">Rating: {seller?.ratings || 'Not rated yet'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductRatings;
