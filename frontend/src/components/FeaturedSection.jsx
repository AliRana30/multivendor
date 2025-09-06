import { useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import ProductCard from "../Cards/ProductCard";
import { getAllProducts, getAllProductsFromAllSellers } from '../../redux/actions/product';

const FeaturedSection = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const dispatch = useDispatch();
  
  const { 
    allProducts, 
    allProductsLoading,
    allProductsError 
  } = useSelector((state) => state.product);

  useEffect(() => {
    if (!allProducts || allProducts.length === 0) {
      dispatch(getAllProductsFromAllSellers());
    }
  }, [dispatch, allProducts]);

  useEffect(() => {
    if (allProducts && allProducts.length > 0) {
      const getFeaturedProducts = () => {
        const featured = allProducts
          .filter(product => product.stock > 0) 
          .sort((a, b) => {
            const aScore = (a.sold_out || 0) * (a.ratings || 1);
            const bScore = (b.sold_out || 0) * (b.ratings || 1);
            return bScore - aScore;
          })
          .slice(0, 3); 
        
        setFeaturedProducts(featured);
      };

      getFeaturedProducts();
    }
  }, [allProducts]);

  if (allProductsLoading) {
    return (
      <div className="p-4 flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading featured products...</p>
        </div>
      </div>
    );
  }

  if (allProductsError) {
    return (
      <div className="p-4">
        <div className="text-center text-red-500 py-10">
          <p className="text-lg">Error loading featured products</p>
          <p className="text-sm">{allProductsError}</p>
          <button 
            onClick={() => dispatch(getAllProductsFromAllSellers())}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 mt-10">
      <div className="mb-4 ml-10">
        <h1 className="text-2xl font-bold text-center text-black mb-10">Featured Products</h1>
      </div>
      
      {featuredProducts && featuredProducts.length > 0 ? (
        <div className="grid grid-cols-1 ml-4 mr-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {featuredProducts.map((item, index) => (
            <ProductCard product={item} key={item._id || index} />
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-10">
          <p className="text-lg">No featured products available</p>
          <p className="text-sm">Check back later for featured items!</p>
        </div>
      )}
    </div>
  );
};

export default FeaturedSection;