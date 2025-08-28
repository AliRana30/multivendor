import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Loader from '../../components/Loader';
import { getAllProducts } from '../../../redux/actions/product';
import ProductDetailsCard from '../../Cards/ProductDetailsCard';

const ProductDetails = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id: urlParam } = useParams(); 
  const location = useLocation();
  const dispatch = useDispatch();
  
  const { products } = useSelector((state) => state.product);
  const { seller } = useSelector((state) => state.seller);

  useEffect(() => {
    if ((!products || products.length === 0) && seller?._id) {
      dispatch(getAllProducts(seller._id));
    }
  }, [dispatch, products, seller]);

  useEffect(() => {
    if (products && products.length > 0) {
      let foundProduct = null;

      if (location.state?.productId) {
        foundProduct = products.find((item) => item._id === location.state.productId);
      }

      if (!foundProduct && urlParam) {
        const searchName = urlParam.replace(/-/g, ' ');
        foundProduct = products.find((item) => 
          item.name.toLowerCase() === searchName.toLowerCase()
        );
      }

      if (!foundProduct && urlParam) {
        const searchName = urlParam.replace(/-/g, ' ');
        foundProduct = products.find((item) => 
          item.name.toLowerCase().includes(searchName.toLowerCase()) ||
          searchName.toLowerCase().includes(item.name.toLowerCase())
        );
      }

      if (!foundProduct && urlParam) {
        foundProduct = products.find((item) => item._id === urlParam);
      }
       scrollTo(0, 0);
      setData(foundProduct);
      setLoading(false);
    } else if (products && products.length === 0) {
      setLoading(false);
    }
  }, [urlParam, products, location.state]);

  if (loading) {
    return <Loader />;
  }

  if (!data) {
    return (
      <div className="text-black m-10 text-center py-20">
        <div className="text-6xl mb-4">😞</div>
        <h2 className="text-2xl font-semibold mb-2">Product Not Found</h2>
        <p className="text-gray-600 mb-4">Sorry, we couldn't find the product you're looking for.</p>
        <button 
          onClick={() => window.history.back()}
          className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <a href="/" className="hover:text-blue-600">Home</a>
          <span>/</span>
          <a href="/products" className="hover:text-blue-600">Products</a>
          <span>/</span>
          <span className="text-gray-900 font-medium">{data.name}</span>
        </nav>

        {/* Product Details Card */}
        <ProductDetailsCard product={data} />
      </div>
    </div>
  );
};

export default ProductDetails;