import { IoMdClose } from "react-icons/io";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import CartItem from "./CartItem";

const Cart = ({ openCart, setOpenCart }) => {
  const { cart } = useSelector((state) => state.cart);

  const totalPrice = cart?.reduce((acc, item) => {
    return acc + (item.discountPrice ) * item.quantity;
  }, 0) || 0;

  const totalItems = cart?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  return (
    <>
      <div
        onClick={() => setOpenCart(false)}
        className={`fixed inset-0 bg-black bg-opacity-30 z-40 transition-opacity duration-300 text-black ${
          openCart ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      ></div>

      {/* Sidebar Cart */}
      <div
        className={`fixed top-0 right-0 h-full w-[400px] max-w-[90vw] bg-white z-50 shadow-2xl transition-transform duration-300 ${
          openCart ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Your Cart ({totalItems})
          </h2>
          <button
            onClick={() => setOpenCart(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <IoMdClose size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Cart Content */}
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto p-4">
            {cart && cart.length > 0 ? (
              cart.map((item, index) => (
                <CartItem key={`${item._id}-${index}`} data={item} />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <div className="text-6xl mb-4">🛒</div>
                <p className="text-lg font-medium">Your cart is empty</p>
                <p className="text-sm">Add some products to get started</p>
              </div>
            )}
          </div>

          {/* Footer with Total and Checkout */}
          {cart && cart.length > 0 && (
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              {/* Total */}
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-medium text-gray-900">Total:</span>
                <span className="text-xl font-bold text-blue-600">
                  ${totalPrice.toFixed(2)}
                </span>
              </div>

              {/* Checkout Button */}
              <Link to="/checkout">
                <button
                  onClick={() => setOpenCart(false)}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                >
                  Checkout
                </button>
              </Link>

              {/* Continue Shopping */}
              <button
                onClick={() => setOpenCart(false)}
                className="w-full mt-2 text-gray-600 py-2 text-sm hover:text-gray-800 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Cart;