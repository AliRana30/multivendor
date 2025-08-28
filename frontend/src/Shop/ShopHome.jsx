import { useSelector } from 'react-redux';
import { useState } from 'react';
import ShopInfo from './ShopInfo';
import ShopProfileData from './ShopProfileData';
import Loader from '../components/Loader';
import { Menu, X } from 'lucide-react';

const ShopHome = () => {
  const { loading } = useSelector((state) => state.seller);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobileMenu}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-white rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        aria-label="Toggle shop info menu"
      >
        {isMobileMenuOpen ? (
          <X className="w-6 h-6 text-gray-700" />
        ) : (
          <Menu className="w-6 h-6 text-gray-700" />
        )}
      </button>

      <div className="flex flex-row max-w-7xl mx-auto">
        {/* Desktop Sidebar - Shop Info */}
        <div className="hidden lg:block w-80 min-h-screen flex-shrink-0">
          <div className="bg-white m-6 rounded-lg shadow-sm border sticky top-6">
            <ShopInfo isOwner={true} />
          </div>
        </div>

        {/* Mobile Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={toggleMobileMenu}
          />
        )}

        {/* Mobile Slide-out Menu */}
        <div className={`lg:hidden fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="p-4 h-full overflow-y-auto pt-16">
            <ShopInfo isOwner={true} />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-h-screen lg:pl-0 pt-16 lg:pt-0">
          <div className="p-2 sm:p-4 lg:p-0">
            <ShopProfileData isOwner={true} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopHome;