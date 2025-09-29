import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';

const HeroSection = () => {
  const navigate = useNavigate()
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
        className="w-full h-full object-cover blur-sm"
      />
      <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center text-white bg-black bg-opacity-40">
        <h1 className="text-3xl absolute left-7 top-40  md:text-6xl mb-4 min-h-[1.2em]  font-bold">
          {displayText}
          <span className="animate-pulse">|</span>
        </h1>
        <button
          onClick={() => navigate("/products")}
          className="mt-14 group relative px-6 top-20 py-2 bg-white text-black text-lg font-semibold tracking-wider transition-all duration-500 hover:bg-black hover:text-white border-2 border-white hover:border-white overflow-hidden"
        >
          <span className="relative z-10">Shop Now</span>
          <div className="absolute inset-0 bg-black transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
        </button>
      </div>
    </div>
  );
};

export default HeroSection;
