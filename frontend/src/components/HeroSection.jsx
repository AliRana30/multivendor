import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <div className="relative w-full h-[500px] mt-0">
      <img
        src="./Hero.png"
        alt="Hero"
        className="w-full h-full object-cover"
      />
      <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center text-white bg-black bg-opacity-40">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">Discover Products from Multiple Vendors</h1>
        <button
          onClick={() => navigate("/products")}
          className="bg-white text-black px-6 py-2 rounded-md text-lg hover:bg-gray-200 transition"
        >
          Shop Now
        </button>
      </div>
    </div>
  );
};

export default HeroSection;
