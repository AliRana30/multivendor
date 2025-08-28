import { useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import ProductCard from "../Cards/ProductCard";
import { getAllProducts } from '../../redux/actions/product';

const BestSelling = () => {
  const [data, setData] = useState([]);
  const dispatch = useDispatch();
  
  const { products, loading } = useSelector((state) => state.product);
  const { seller } = useSelector((state) => state.seller);

  useEffect(() => {
    if ((!products || products.length === 0) && seller?._id) {
      dispatch(getAllProducts(seller._id));
    }
  }, [dispatch, products, seller]);

  useEffect(() => {
    if (products && products.length > 0) {
      const bestselling = () => {
        const sorted = [...products].sort((a, b) => (b.sold_out || 0) - (a.sold_out || 0));
        const topSix = sorted.slice(0, 3);
        setData(topSix);
      };

      bestselling();
    }
  }, [products]);

  if (loading) {
    return (
      <div className="w-full py-8 px-4 md:px-10 overflow-x-hidden bg-gray-100 flex justify-center items-center min-h-[400px]" style={{margin: 0, padding: 0}}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading best selling products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-4 mt-10 md:px-10 overflow-x-hidden bg-gray-100" style={{margin: 0, padding: 0}}>
      <div className="mb-6 mt-10">
        <h1 className="text-3xl font-bold text-black dark:text-white text-center">Best Selling</h1>
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