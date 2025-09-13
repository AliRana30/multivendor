import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Loader from '../../components/Loader';
import ProductDetailsCard from '../../Cards/ProductDetailsCard';
import { getAllProducts, getAllProductsFromAllSellers } from '../../../redux/actions/product';

const ProductDetails = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const { name } = useParams();
  const location = useLocation();
  const dispatch = useDispatch();

  const { products, allProducts, product } = useSelector((state) => state.product);

  useEffect(() => {
    if (product?._id) {
      dispatch(getAllProducts(product._id));
    } else {
      dispatch(getAllProductsFromAllSellers());
    }
  }, [dispatch, product?._id]);

  useEffect(() => {
    const productList = product?._id ? products : allProducts;

    if (productList && productList.length > 0) {
      let found = null;

      if (location.state?.productId) {
        found = productList.find((p) => p._id === location.state.productId);
      }

      if (!found && name) {
        const searchName = decodeURIComponent(name).replace(/-/g, ' ').toLowerCase();

        found = productList.find((p) => p.name.toLowerCase() === searchName);

        if (!found) {
          found = productList.find(
            (p) =>
              p.name.toLowerCase().includes(searchName) ||
              searchName.includes(p.name.toLowerCase())
          );
        }
      }

      if (!found && name) {
        found = productList.find((p) => p._id === name);
      }

      scrollTo(0, 0);
      setData(found);
      setLoading(false);
    } else if (productList && productList.length === 0) {
      setLoading(false);
    }
  }, [name, products, allProducts, location.state, product?._id]);

  if (loading) return <Loader />;

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
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link to="/" className="hover:text-blue-600">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-blue-600">Products</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{data.name}</span>
        </nav>
        <ProductDetailsCard product={data} />
      </div>
    </div>
  );
};

export default ProductDetails;
