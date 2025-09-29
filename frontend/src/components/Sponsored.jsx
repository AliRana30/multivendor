const brandLogos = [
  "https://logos-world.net/wp-content/uploads/2020/04/Sony-Logo.png",
  "https://logos-world.net/wp-content/uploads/2020/08/Dell-Logo-1989-2016.png",
  "https://s.yimg.com/fz/api/res/1.2/.9XQiCV77OrqWsquSzVjCA--~C/YXBwaWQ9c3JjaGRkO2ZpPWZpbGw7aD00MTI7cHhvZmY9NTA7cHlvZmY9MTAwO3E9ODA7c3M9MTt3PTM4OA--/https://i.pinimg.com/736x/a8/5d/91/a85d91d6c7be00d65712fc20f1a479e6.jpg",
  "https://tse1.mm.bing.net/th/id/OIP.L1qMVdbzQJT-RLfZEl7gdAHaD6?pid=Api&P=0&h=220",
  "https://tse4.mm.bing.net/th/id/OIP.qbsTDbB9qKP6pBQ0Rl9bpQHaEK?pid=Api&P=0&h=220"
];

const Sponsored = () => {
  return (
    <div className="w-full py-20 px-4 md:px-10 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 md:px-10">
        {/* Header Section */}
        <div className="mb-16 text-center">
          <div className="inline-block">
            <p className="text-sm font-medium text-gray-500 tracking-[0.15em] uppercase mb-4 font-mono">
              Trusted Partners
            </p>
            <h1 className="text-4xl md:text-5xl font-light text-gray-900 leading-[0.9] mb-6">
              Sponsored Brands
            </h1>
            <div className="w-16 h-[1px] bg-gray-900 mx-auto"></div>
          </div>
          <p className="text-gray-600 mt-8 max-w-xl mx-auto text-lg leading-relaxed font-light">
            Partnering with world-class brands to bring you exceptional quality
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative w-full overflow-hidden">
          <div className="absolute left-0 top-0 w-20 h-full bg-gradient-to-r from-gray-50 to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 w-20 h-full bg-gradient-to-l from-gray-50 to-transparent z-10 pointer-events-none"></div>
          
          <div className="flex animate-scroll whitespace-nowrap py-8">
            {[...brandLogos, ...brandLogos].map((logo, index) => (
              <div
                key={index}
                className="flex items-center justify-center px-12"
                style={{ minWidth: "200px" }}
              >
                <div className="w-32 h-16 flex items-center justify-center bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                  <img
                    src={logo}
                    alt={`Brand ${index}`}
                    className="max-w-24 max-h-12 object-contain filter grayscale hover:grayscale-0 transition-all duration-500 opacity-70 hover:opacity-100"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom text */}
        <div className="text-center mt-12">
          <p className="text-gray-500 font-light text-sm tracking-wide">
            And many more trusted brands in our network
          </p>
        </div>
      </div>

      {/* Tailwind animation */}
      <style>
        {`
          @keyframes scroll {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-50%); }
          }
          .animate-scroll {
            animation: scroll 30s linear infinite;
          }
          .animate-scroll:hover {
            animation-play-state: paused;
          }
        `}
      </style>
    </div>
  );
};

export default Sponsored;