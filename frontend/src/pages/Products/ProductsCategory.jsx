import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllProducts } from '../../../redux/actions/product';
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { FiEye, FiStar } from "react-icons/fi";
import { BsCartPlus } from "react-icons/bs";
import { HiOutlineBadgeCheck } from "react-icons/hi";
import { addToCart } from '../../../redux/actions/cart';
import { addToWishlist, removeFromWishlist } from "../../../redux/actions/wishlist";
import { toast } from 'react-hot-toast';
import ProductDetailsCard from '../../Cards/ProductDetailsCard';

const ProductsCategory = () => {
  const { category } = useParams();
  const dispatch = useDispatch();
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  const { allProducts: products, allProductsLoading: isLoading, allProductsError: error } = useSelector((state) => state.product);
  const { cart } = useSelector((state) => state.cart);
  const { wishlist } = useSelector((state) => state.wishlist);
  const { isAuthenticated } = useSelector((state) => state.user);
  const { seller } = useSelector((state) => state.seller);

  useEffect(() => {
    window.scrollTo(0, 0); 
    dispatch(getAllProducts()); 
  }, [dispatch]);

  useEffect(() => {
   
    
    if (!category || !products || products.length === 0) {
      console.log('Early return: missing category or products');
      setFilteredProducts([]);
      return;
    }
    
    const formattedCategory = category
      .replace(/-/g, " ") 
      .toLowerCase()
      .trim();
    
    console.log('Formatted category for filtering:', formattedCategory);
    
    const uniqueCategories = [...new Set(products.map(p => p.category?.toLowerCase()).filter(Boolean))];
    
    products.slice(0, 5).forEach((product, index) => {
      console.log(`${index + 1}. "${product.name}" - Category: "${product.category}"`);
    });
    
    const filtered = products.filter((product) => {
      if (!product || !product.category) {
        console.log('Product missing category:', product?.name);
        return false;
      }
      
      const productCategory = product.category.toLowerCase().trim();
      
      const exactMatch = productCategory === formattedCategory;
      const partialMatch = productCategory.includes(formattedCategory) || formattedCategory.includes(productCategory);
      const wordsMatch = productCategory.split(' ').some(word => 
        formattedCategory.split(' ').includes(word)
      );
      
      const matches = exactMatch || partialMatch || wordsMatch;
      
      if (matches) {
        console.log('✓ Category match found:', product.name, '- Product category:', product.category, '- Search category:', formattedCategory);
      }
      
      return matches;
    });
    
    
    setFilteredProducts(filtered);
  }, [category, products]);

  // Image URL helper function
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

  // Create product slug for URL
  const createProductSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-') 
      .replace(/-+/g, '-') 
      .trim();
  };

  // Get discount percentage
  const getDiscountPercentage = (product) => {
    if (!product.originalPrice || !product.discountPrice) return 0;
    return Math.floor(((product.originalPrice - product.discountPrice) / product.originalPrice) * 100);
  };

  // Check if item is in wishlist
  const isInWishlist = (productId) => {
    return wishlist && wishlist.some(item => item._id === productId);
  };

  // Add to cart handler
  const addToCartHandler = (product) => {
    if (!isAuthenticated) {
      toast.error("Please login to add items to cart");
      return;
    }

    const isItemExists = cart && cart.find(item => item._id === product._id);
    if (isItemExists) {
      toast.error("Product already in cart");
      return;
    }

    if (product.stock <= 0) {
      toast.error("Product is out of stock");
      return;
    }

    const cartData = { ...product, quantity: 1 };
    dispatch(addToCart(cartData));
    toast.success("Item added to cart successfully!");
  };

  // Handle wishlist toggle
  const handleWishlistToggle = (product) => {
    if (!isAuthenticated) {
      toast.error("Please login to add items to wishlist");
      return;
    }

    if (isInWishlist(product._id)) {
      dispatch(removeFromWishlist(product._id));
      toast.success("Removed from wishlist");
    } else {
      dispatch(addToWishlist({...product}));
      toast.success("Added to wishlist");
    }
  };

  // Handle product details view
  const handleViewDetails = (product) => {
    setSelectedProduct(product);
    setShowDetails(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500 mb-4">Error loading products: {error}</p>
        <button 
          onClick={() => dispatch(getAllProducts())}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="p-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold capitalize">
            {category?.replace(/-/g, " ")} Products
          </h1>
          <p className="text-gray-600">
            {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
          </p>
          
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => {
              const discountPercentage = getDiscountPercentage(product);
              const productNameSlug = createProductSlug(product.name);

              return (
                <div
                  key={product._id || product.id}
                  className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 h-[450px]"
                >
                  
                  {/* Discount Badge */}
                  {discountPercentage > 0 && (
                    <div className="absolute top-3 left-3 z-10 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                      -{discountPercentage}%
                    </div>
                  )}

                  {/* Best Seller Badge */}
                  {product.sold_out > 50 && (
                    <div className="absolute bottom-3 left-3 z-10 bg-gradient-to-r from-orange-500 to-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                      <span>🔥</span>
                      <span>Best Selling</span>
                    </div>
                  )}

                  {/* Image Container */}
                  <div className="relative overflow-hidden bg-gray-50 dark:bg-gray-700 h-48">
                    <Link to={`/products/${productNameSlug}`} state={{ productId: product._id }}>
                      <img
                        src={getImageUrl(product)}
                        alt={product.name}
                        className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          console.error('Product image failed to load:', getImageUrl(product));
                          e.target.src = '/placeholder-image.png';
                        }}
                      />
                    </Link>
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>

                  {/* Action Icons */}
                  <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                    <button 
                      onClick={() => handleWishlistToggle(product)}
                      className="bg-white dark:bg-gray-800 p-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
                    >
                      {isInWishlist(product._id) ? (
                        <AiFillHeart className="text-red-500 text-lg" />
                      ) : (
                        <AiOutlineHeart className="text-gray-600 dark:text-gray-300 text-lg hover:text-red-500 transition-colors" />
                      )}
                    </button>
                    
                    <button 
                      onClick={() => handleViewDetails(product)}
                      className="bg-white dark:bg-gray-800 p-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
                    >
                      <FiEye className="text-gray-600 dark:text-gray-300 text-lg hover:text-blue-500 transition-colors" />
                    </button>
                    
                    <button 
                      onClick={() => addToCartHandler(product)}
                      disabled={product.stock === 0}
                      className={`bg-white dark:bg-gray-800 p-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 ${
                        product.stock === 0 ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <BsCartPlus className={`text-lg transition-colors ${
                        product.stock === 0 
                          ? 'text-gray-400' 
                          : 'text-gray-600 dark:text-gray-300 hover:text-green-500'
                      }`} />
                    </button>
                  </div>

                  {/* Product Info */}
                  <div className="p-4 space-y-3">
                    <Link to={`/products/${productNameSlug}`} state={{ productId: product._id }}>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">
                        {product.name}
                      </h3>
                    </Link>

                    {/* Category Display */}
                    <p className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full inline-block">
                      {product.category}
                    </p>

                    {/* Rating */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <FiStar
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(product.rating || 0)
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        ({product.rating || "0"})
                      </span>
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <span>•</span>
                        <span className="ml-1">{product.sold_out || 0} sold</span>
                      </div>
                    </div>

                    {/* Price Section */}
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-gray-900 dark:text-white">
                            ${product.discountPrice || product.originalPrice || 0}
                          </span>
                          {product.originalPrice && product.discountPrice && product.originalPrice !== product.discountPrice && (
                            <span className="text-sm text-gray-500 line-through">
                              ${product.originalPrice}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center text-xs text-green-600 dark:text-green-400">
                          <HiOutlineBadgeCheck className="w-3 h-3 mr-1" />
                          <span>Free shipping</span>
                        </div>
                      </div>
                    </div>

                    {/* Stock Info */}
                    {product.stock !== undefined && (
                      <div className="text-xs">
                        {product.stock > 10 ? (
                          <span className="text-green-600">✓ In Stock ({product.stock} available)</span>
                        ) : product.stock > 0 ? (
                          <span className="text-orange-600">⚠ Only {product.stock} left</span>
                        ) : (
                          <span className="text-red-600">✗ Out of Stock</span>
                        )}
                      </div>
                    )}


                    {/* Add to Cart Button */}
                    <button 
                      disabled={product.stock === 0}
                      className={`w-60 h-8 font-semibold py-3 rounded-md transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg flex items-center justify-center gap-2 absolute bottom-2 ${
                        product.stock === 0
                          ? 'bg-gray-400 text-white cursor-not-allowed opacity-60'
                          : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                      }`}
                      onClick={() => addToCartHandler(product)}
                    >
                      <BsCartPlus className="text-sm" />
                      <span>{product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📦</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No products found
              </h3>
              <p className="text-gray-500">
                No products available in the "{category?.replace(/-/g, " ")}" category.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Product Details Modal */}
      {showDetails && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Product Details</h2>
                <button 
                  onClick={() => setShowDetails(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
                >
                  ×
                </button>
              </div>
              <ProductDetailsCard product={selectedProduct} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductsCategory;