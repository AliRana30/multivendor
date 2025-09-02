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
    <div className="w-full px-4 md:px-12 py-8 space-y-12">
      <div className="flex flex-wrap justify-center gap-8 sm:gap-12 md:gap-16 lg:gap-20">
        {brandingData.map((item, index) => (
          <div
            key={index}
            className="flex flex-col items-center w-24 sm:w-28 text-center text-black"
          >
            <div className="text-3xl sm:text-4xl mb-2">{item.icon}</div>
            <h3 className="font-semibold text-sm sm:text-base">{item.title}</h3>
            <p className="text-xs sm:text-sm text-gray-600">{item.Description}</p>
          </div>
        ))}
      </div>

      {/* Categories */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
        {categoriesData.map((item) => (
          <div
            key={item.id}
            className="cursor-pointer flex flex-col items-center bg-white text-center border border-gray-200 p-4 rounded-lg hover:shadow-lg hover:border-gray-300 transition-all duration-200 transform hover:scale-105"
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
            <div className="w-16 h-16 sm:w-20 sm:h-20 mb-3 flex items-center justify-center">
              <img
                src={item.image_Url}
                alt={`${item.title} category`}
                className="w-full h-full object-contain"
                loading="lazy"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div 
                className="hidden w-full h-full bg-gray-100 rounded items-center justify-center text-gray-400 text-xs"
                aria-label={`${item.title} category placeholder`}
              >
                No Image
              </div>
            </div>
            <h5 className="font-medium text-sm sm:text-base text-gray-800 line-clamp-2">
              {item.title}
            </h5>
            {item.count && (
              <span className="text-xs text-gray-500 mt-1">
                {item.count} items
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Categories;