import React, { useCallback } from 'react';
import { brandingData, categoriesData } from '../../static/data';
import { useNavigate } from 'react-router-dom';

const Categories = () => {
  const navigate = useNavigate();

  const handleCategoryClick = useCallback((title) => {
    const slug = title.toLowerCase().replace(/\s+/g, '-');
    navigate(`/product/${slug}`);
  }, [navigate]);

  return (
    <div className="w-full py-20 px-4 md:px-10 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-10">
        {/* Header Section */}
        <div className="mb-20 text-center">
          <div className="inline-block">
            <p className="text-sm font-medium text-gray-500 tracking-[0.15em] uppercase mb-4 font-mono">
              Discover Excellence
            </p>
            <h1 className="text-2xl md:text-4xl font-light text-gray-900 leading-[0.9] mb-6">
              Categories
            </h1>
            <div className="w-20 h-[1px] bg-gray-900 mx-auto"></div>
          </div>
          <p className="text-gray-600 mt-8 max-w-2xl mx-auto text-lg leading-relaxed font-light">
            Experience premium quality and service through our curated offerings
          </p>
        </div>

        {/* Branding Section */}
        <div className="mb-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {brandingData.map((item, index) => (
              <div
                key={index}
                className="group text-center"
              >
                <div className="mb-6 flex justify-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-3xl text-gray-700 group-hover:bg-gray-100 transition-colors duration-300">
                    {item.icon}
                  </div>
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-3 tracking-wide">
                  {item.title}
                </h3>
                <p className="text-gray-600 font-light leading-relaxed">
                  {item.Description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Categories Section */}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {categoriesData.map((item) => (
            <div
              key={item.id}
              className="group cursor-pointer bg-white border border-gray-100 hover:border-gray-200 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              onClick={() => handleCategoryClick(item.title)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleCategoryClick(item.title);
                }
              }}
            >
              <div className="p-6 text-center">
                <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center bg-gray-50 rounded-full group-hover:bg-gray-100 transition-colors duration-300">
                  <img
                    src={item.image_Url}
                    alt={`${item.title} category`}
                    className="w-12 h-12 object-contain opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                    loading="lazy"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div 
                    className="hidden w-12 h-12 bg-gray-200 rounded-full items-center justify-center text-gray-400 text-xs"
                    aria-label={`${item.title} category placeholder`}
                  >
                    ?
                  </div>
                </div>
                
                <h5 className="font-medium text-gray-900 mb-2 text-sm tracking-wide line-clamp-2 group-hover:text-gray-700 transition-colors duration-300">
                  {item.title}
                </h5>
                
                {item.count && (
                  <span className="text-xs text-gray-500 font-light tracking-wider">
                    {item.count} items
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Categories;