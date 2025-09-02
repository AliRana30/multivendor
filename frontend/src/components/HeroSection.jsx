import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const HeroSection = () => {
  const navigate = useNavigate();
  const [displayText, setDisplayText] = useState("");
  const fullText = "Discover Products from Multiple Vendors";
  const typingSpeed = 30; 

  useEffect(() => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setDisplayText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, typingSpeed);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-[500px] mt-0">
      <img
        src="./home.jpg"
        alt="Hero"
        className="w-full h-full object-cover"
      />
      <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center text-white bg-black bg-opacity-40">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 min-h-[1.2em]">
          {displayText}
          <span className="animate-pulse">|</span>
        </h1>
        <button
          onClick={() => navigate("/products")}
          className="bg-black text-white px-6 py-2 rounded-md text-lg hover:bg-gray-800 hover:text-gray-200 transition-all duration-300 transform hover:scale-105"
        >
          Shop Now
        </button>
      </div>
    </div>
  );
};

export default HeroSection;