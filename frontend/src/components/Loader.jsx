import React from "react";
import Lottie from "lottie-react";
import loaderAnimation from "../THr3lvsxGC.json"; 

const Loader = () => {
  return (
    <div className="flex justify-center items-center w-full h-screen ">
      <div className="w-64 h-64">
        <Lottie animationData={loaderAnimation} loop={true} />
      </div>
    </div>
  );
};

export default Loader;
