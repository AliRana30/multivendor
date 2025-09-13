import React, { useEffect, useState } from "react";
import ProductCard from "../../Cards/ProductCard";
import { productData } from "../../../static/data";

const SuggestedProducts = ({ data }) => {
  const [products, setproducts] = useState(null);

  const getSuggested = () => {
    const d =
      productData && productData.filter((i) => i.category === data.category);
    setproducts(d);
  };

  useEffect(() => {
    getSuggested();
  }, []);

  return (
    <div >
        <h1 className="font-bold text-2xl">Related Products</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-10">
      {products &&
        products.map((i, index) => (
            <ProductCard product={i} key={i._id || index} />
        ))}
        </div>
    </div>
  );
};

export default SuggestedProducts;
