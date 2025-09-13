import Header from "../Layout/Header";
import Navbar from "../Layout/Navbar";
import HeroSection from "../components/HeroSection";
import Categories from "../components/Categories";
import BestDeals from "../components/BestDeals";
import FeaturedSection from "../components/FeaturedSection";
import Events from "../components/Events";
import Sponsored from "../components/Sponsored";
import Footer from "../Layout/Footer";
import BestSelling from "./BestSelling";

const Home = () => {
  return (
    <div className="flex flex-col w-full overflow-x-hidden bg-gray-100">
      <HeroSection />
      <Categories/>
      <BestSelling/>
      <FeaturedSection/>
      <Events/>
      <Sponsored/>
    </div>
  );
};

export default Home;
