import { useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import ProductCard from "../Cards/ProductCard";
import { getAllProducts } from '../../redux/actions/product';

const FeaturedSection = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
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
      const getFeaturedProducts = () => {
       
        
        const featured = products
          .filter(product => product.stock > 0) 
          .sort((b, a) => {
            const aScore =  a.sold_out;
            const bScore = b.sold_out * b.ratings;
            return bScore - aScore;
          })
          .slice(0, 3); 
        
        setFeaturedProducts(featured);
      };

      getFeaturedProducts();
    }
  }, [products]);

  if (loading) {
    return (
      <div className="p-4 flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading featured products...</p>
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