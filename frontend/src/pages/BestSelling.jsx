import { useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import ProductCard from "../Cards/ProductCard";
import { getAllProductsFromAllSellers } from '../../redux/actions/product';

const BestSelling = () => {
  const [data, setData] = useState([]);
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
      const bestselling = () => {
        const sorted = [...allProducts].sort((a, b) => (b.sold_out || 0) - (a.sold_out || 0));
        const topThree = sorted.slice(0, 5);
        setData(topThree);
      };

      bestselling();
    }
  }, [allProducts]);

  if (allProductsLoading) {
    return (
      <div className="w-full py-20 px-4 md:px-10 bg-gray-50 flex justify-center items-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
          <p className="text-gray-600 font-light tracking-wide">Loading best sellers</p>
        </div>
      </div>
    );
  }

  if (allProductsError) {
    return (
      <div className="w-full py-20 px-4 md:px-10 bg-gray-50">
        <div className="text-center max-w-md mx-auto">
          <div className="mb-6">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-8 h-8 bg-red-100 rounded-full"></div>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Something went wrong</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{allProductsError}</p>
          </div>
          <button 
            onClick={() => dispatch(getAllProductsFromAllSellers())}
            className="px-8 py-3 bg-gray-900 text-white hover:bg-gray-800 transition-colors duration-200 font-medium tracking-wide"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-20 px-4 md:px-10 bg-gray-50" style={{margin: 0, padding: 0}}>
      <div className="max-w-7xl mx-auto px-4 md:px-10 py-20">
        <div className="mb-16 text-center">
          <div className="inline-block">
            <p className="text-sm font-medium text-gray-500 tracking-[0.15em] uppercase mb-4 font-mono">
              Top Performers
            </p>
            <h1 className="text-3xl md:text-4xl font-light text-gray-900 leading-[0.9] mb-6">
              Best Selling
            </h1>
            <div className="w-20 h-[1px] bg-gray-900 mx-auto"></div>
          </div>
          <p className="text-gray-600 mt-8 max-w-2xl mx-auto text-lg leading-relaxed font-light">
            Discover the most loved products from our curated selection of trusted sellers
          </p>
        </div>
        
        {data && data.length > 0 ? (
          <div className="grid grid-cols-1 ml-4 mr-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-16">
            {data.map((item, index) => (
              <ProductCard product={item} key={item._id || index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
            </div>
            <h3 className="text-2xl font-light text-gray-900 mb-3">No products available</h3>
            <p className="text-gray-500 font-light text-lg">Check back later for popular items</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BestSelling;