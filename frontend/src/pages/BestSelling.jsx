import { useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import ProductCard from "../Cards/ProductCard";
import { getAllProducts, getAllProductsFromAllSellers } from '../../redux/actions/product';

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
      <div className="w-full py-8 px-4 md:px-10 overflow-x-hidden bg-gray-100 flex justify-center items-center min-h-[400px]" style={{margin: 0, padding: 0}}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading best selling products...</p>
        </div>
      </div>
    );
  }

  if (allProductsError) {
    return (
      <div className="w-full py-8 px-4 md:px-10 overflow-x-hidden bg-gray-100" style={{margin: 0, padding: 0}}>
        <div className="text-center text-red-500 py-10">
          <p className="text-lg">Error loading best selling products</p>
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
    <div className="w-full p-4 mt-10 md:px-10 overflow-x-hidden bg-gray-100" style={{margin: 0, padding: 0}}>
      <div className="mb-6 mt-10">
        <h1 className="text-3xl font-bold text-black dark:text-white text-center">Best Selling</h1>
         <p className="text-center text-gray-600 mt-2">
            Discover Best Selling products from our sellers
          </p>
      </div>
      
      {data && data.length > 0 ? (
        <div className="grid grid-cols-1 ml-4 mr-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-16">
          {data.map((item, index) => (
            <ProductCard product={item} key={item._id || index} />
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-10">
          <p className="text-lg">No best selling products available</p>
          <p className="text-sm">Check back later for popular items!</p>
        </div>
      )}
    </div>
  );
};

export default BestSelling;