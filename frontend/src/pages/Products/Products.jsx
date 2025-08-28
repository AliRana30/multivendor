import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllProducts, getAllProductsFromAllSellers } from "../../../redux/actions/product";
import ProductCard from "../../Cards/ProductCard";

const Products = ({ showAllProducts = true }) => {
  const dispatch = useDispatch();
  
  // Select the correct state based on showAllProducts flag
  const { 
    products, 
    loading, 
    error,
    allProducts,
    allProductsLoading,
    allProductsError 
  } = useSelector((state) => state.product);
  
  const { seller } = useSelector((state) => state.seller);
  const [data, setData] = useState([]);

  useEffect(() => {
    if (showAllProducts) {
      // Get all products from all sellers
      dispatch(getAllProductsFromAllSellers());
    } else if (seller?._id) {
      // Get products from specific seller
      dispatch(getAllProducts(seller._id));
    }
  }, [dispatch, seller?._id, showAllProducts]);

  useEffect(() => {
    const currentProducts = showAllProducts ? allProducts : products;
    
    if (currentProducts && currentProducts.length > 0) {
      const sortedProducts = [...currentProducts].sort((a, b) => {
        const aSold = a.total_sell || a.sold_out || 0;
        const bSold = b.total_sell || b.sold_out || 0;
        return bSold - aSold;
      });
      setData(sortedProducts);
    } else {
      setData([]);
    }
  }, [products, allProducts, showAllProducts]);

  const currentLoading = showAllProducts ? allProductsLoading : loading;
  const currentError = showAllProducts ? allProductsError : error;

  if (currentLoading) {
    return (
      <div className="p-4 w-full overflow-x-hidden bg-gray-100 flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {showAllProducts ? "Loading all products..." : "Loading seller products..."}
          </p>
        </div>
      </div>
    );
  }

  if (currentError) {
    return (
      <div className="p-4 w-full overflow-x-hidden bg-gray-100">
        <div className="text-center text-red-500 py-10">
          <p className="text-lg">Error loading products</p>
          <p className="text-sm">{currentError}</p>
          <button 
            onClick={() => {
              if (showAllProducts) {
                dispatch(getAllProductsFromAllSellers());
              } else if (seller?._id) {
                dispatch(getAllProducts(seller._id));
              }
            }}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!showAllProducts && !seller?._id) {
    return (
      <div className="p-4 w-full overflow-x-hidden bg-gray-100">
        <div className="text-center text-yellow-600 py-10">
          <div className="text-6xl mb-4">🔐</div>
          <p className="text-lg mb-2">Please log in as a seller</p>
          <p className="text-sm">You need to be logged in as a seller to view your products</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 w-full overflow-x-hidden bg-gray-100">
      <div className="m-10">
        <h1 className="text-3xl font-bold text-black dark:text-white text-center">
          {showAllProducts ? "All Products" : `${seller?.name || 'Seller'}'s Products`}
        </h1>
        {showAllProducts && (
          <p className="text-center text-gray-600 mt-2">
            Discover products from all our amazing sellers
          </p>
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 m-10">
        {data && data.length > 0 ? (
          data.map((item, index) => (
            <ProductCard product={item} key={item._id || index} />
          ))
        ) : (
          <div className="col-span-full text-center text-gray-500 py-10">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-lg mb-2">
              {showAllProducts ? "No products available" : "No products found for this seller"}
            </p>
            <p className="text-sm">
              {showAllProducts 
                ? "Check back later for new products!" 
                : "Add some products to get started!"
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;