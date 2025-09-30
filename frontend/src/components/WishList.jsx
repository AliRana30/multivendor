import { IoMdClose } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { removeFromWishlist } from "../../redux/actions/wishlist";

const WishList = ({ openWishList, setOpenWishList }) => {
  const { wishlist } = useSelector((state) => state.wishlist);
  const dispatch = useDispatch();

  const handleRemoveFromWishlist = (id) => {
    dispatch(removeFromWishlist(id));
  };

  // Helper function to get image URL
  const getImageUrl = (product) => {
    if (product.images && product.images.length > 0) {
      const firstImage = product.images[0];
      
      if (typeof firstImage === 'string' && (firstImage.startsWith('http://') || firstImage.startsWith('https://'))) {
        return firstImage;
      }
      
      if (typeof firstImage === 'object' && firstImage.url) {
        return firstImage.url.startsWith('http') ? firstImage.url : `https://multivendors-7cy2.onrender.com${firstImage.url}`;
      }
      
      if (typeof firstImage === 'string') {
        if (firstImage.startsWith('/')) {
          return `https://multivendors-7cy2.onrender.com${firstImage}`;
        }
        return `https://multivendors-7cy2.onrender.com/uploads/${firstImage}`;
      }
    }
    
    return '/placeholder-image.png';
  };

  return (
    <>
      <div
        onClick={() => setOpenWishList(false)}
        className={`fixed inset-0 bg-black bg-opacity-30 z-40 transition-opacity duration-300 ${
          openWishList ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      ></div>

      <div
        className={`fixed top-0 right-0 h-full w-[350px] bg-white z-50 shadow-lg transition-transform duration-300 ${
          openWishList ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">My Wishlist</h2>
          <IoMdClose
            size={25}
            className="cursor-pointer text-gray-700 hover:text-red-500 transition-colors"
            onClick={() => setOpenWishList(false)}
          />
        </div>

        {/* Wishlist Content */}
        <div className="px-4 py-4 h-[calc(100vh-80px)] overflow-y-auto">
          {wishlist && wishlist.length > 0 ? (
            <div className="space-y-4">
              {wishlist.map((item) => (
                <div key={item._id} className="flex items-start gap-3 p-3 border rounded-lg hover:shadow-sm transition-shadow">
                  <img 
                    src={getImageUrl(item)} 
                    alt={item.name} 
                    className="w-16 h-16 object-contain bg-gray-50 rounded-md flex-shrink-0"
                    onError={(e) => {
                      e.target.src = '/placeholder-image.png';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1">
                      {item.name}
                    </h3>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg font-bold text-gray-900">
                        ${item.discountPrice || item.originalPrice || 0}
                      </span>
                      {item.originalPrice && item.discountPrice && item.originalPrice !== item.discountPrice && (
                        <span className="text-sm text-gray-500 line-through">
                          ${item.originalPrice}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        item.stock > 0 
                          ? 'text-green-700 bg-green-100' 
                          : 'text-red-700 bg-red-100'
                      }`}>
                        {item.stock > 0 ? 'In Stock' : 'Out of Stock'}
                      </span>
                      <button 
                        className="text-black text-sm font-medium transition-colors"
                        onClick={() => handleRemoveFromWishlist(item._id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">💝</div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Your wishlist is empty</h3>
              <p className="text-gray-500 text-sm">Add items you love to your wishlist</p>
            </div>
          )}
        </div>

        {/* Footer with item count */}
        {wishlist && wishlist.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 bg-gray-50 px-4 py-3 border-t">
            <p className="text-sm text-gray-600 text-center">
              {wishlist.length} item{wishlist.length !== 1 ? 's' : ''} in wishlist
            </p>
          </div>
        )}
      </div>
    </>
  );
};


export default WishList;
