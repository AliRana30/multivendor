import React from "react";
import { RxCross1 } from "react-icons/rx";
import { HiMinus, HiPlus } from "react-icons/hi";
import { useDispatch } from "react-redux";
import { removeFromCart, updateCartQuantity } from "../../redux/actions/cart";
import {toast} from "react-toastify";

const CartItem = ({ data }) => {
  const dispatch = useDispatch();

  const getImageUrl = (product) => {
    if (product.images && product.images.length > 0) {
      const firstImage = product.images[0];
      
      if (typeof firstImage === 'string' && (firstImage.startsWith('http://') || firstImage.startsWith('https://'))) {
        return firstImage;
      }
      
      if (typeof firstImage === 'object' && firstImage.url) {
        return firstImage.url.startsWith('http') ? firstImage.url : `http://localhost:5000${firstImage.url}`;
      }
      
      if (typeof firstImage === 'string') {
        if (firstImage.startsWith('/')) {
          return `http://localhost:5000${firstImage}`;
        }
        return `http://localhost:5000/uploads/${firstImage}`;
      }
    }
    
    return '/placeholder-image.png';
  };

  const removeFromCartHandler = () => {
    dispatch(removeFromCart(data._id));
  };

  const quantityIncreaseHandler = () => {
    const newQty = data.quantity + 1;
    if(newQty > data.stock){
      toast(`${data.name} is out of stock!`);
    }
    dispatch(updateCartQuantity(data._id, newQty));
  };

  const quantityDecreaseHandler = () => {
    const newQty = data.quantity === 1 ? 1 : data.quantity - 1;
    dispatch(updateCartQuantity(data._id, newQty));
  };

  return (
    <div className="border-b border-gray-200 pb-4 mb-4 text-black">
      <div className="flex items-center justify-between">
        {/* Product Image and Info */}
        <div className="flex items-center space-x-3">
          <img
            src={getImageUrl(data)}
            alt={data.name}
            className="w-16 h-16 object-cover rounded-lg border border-gray-200"
            onError={(e) => {
              e.target.src = '/placeholder-image.png';
            }}
          />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
              {data.name}
            </h3>
            <p className="text-lg font-semibold text-blue-600">
              ${data.discountPrice || data.originalPrice}
            </p>
          </div>
        </div>

        {/* Remove Button */}
        <button
          onClick={removeFromCartHandler}
          className="text-red-500 hover:text-red-700 p-1"
        >
          <RxCross1 size={16} />
        </button>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center space-x-3">
          <button
            onClick={quantityDecreaseHandler}
            className="bg-gray-100 p-1 rounded-full hover:bg-gray-200 transition-colors"
          >
            <HiMinus size={14} />
          </button>
          <span className="text-sm font-medium px-3 py-1 bg-gray-50 rounded-lg">
            {data.quantity}
          </span>
          <button
            onClick={quantityIncreaseHandler}
            className="bg-gray-100 p-1 rounded-full hover:bg-gray-200 transition-colors"
            disabled={data.quantity >= data.stock}
          >
            <HiPlus size={14} />
          </button>
        </div>
        <div className="text-sm font-semibold text-gray-900">
          ${((data.discountPrice || data.originalPrice) * data.quantity).toFixed(2)}
        </div>
      </div>
    </div>
  );
};

export default CartItem;