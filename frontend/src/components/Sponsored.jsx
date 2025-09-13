
const brandLogos = [
  "https://logos-world.net/wp-content/uploads/2020/04/Sony-Logo.png",
  "https://logos-world.net/wp-content/uploads/2020/08/Dell-Logo-1989-2016.png",
  "https://s.yimg.com/fz/api/res/1.2/.9XQiCV77OrqWsquSzVjCA--~C/YXBwaWQ9c3JjaGRkO2ZpPWZpbGw7aD00MTI7cHhvZmY9NTA7cHlvZmY9MTAwO3E9ODA7c3M9MTt3PTM4OA--/https://i.pinimg.com/736x/a8/5d/91/a85d91d6c7be00d65712fc20f1a479e6.jpg",
  "https://tse1.mm.bing.net/th/id/OIP.L1qMVdbzQJT-RLfZEl7gdAHaD6?pid=Api&P=0&h=220",
  "https://tse4.mm.bing.net/th/id/OIP.qbsTDbB9qKP6pBQ0Rl9bpQHaEK?pid=Api&P=0&h=220"
];

const Sponsored = () => {
  return (
    <div className="w-full  py-10 px-5 mb-12 rounded-xl overflow-hidden mt-2">
      <h1 className="text-2xl font-semibold mb-6 text-center text-gray-800">
        Sponsored Brands
      </h1>

      {/* Carousel Container */}
      <div className="relative w-full overflow-hidden bg-white">
        <div className="flex animate-scroll whitespace-nowrap">
          {[...brandLogos, ...brandLogos].map((logo, index) => (
            <div
              key={index}
              className="flex items-center justify-center px-10 py-4"
              style={{ minWidth: "200px" }}
            >
              <img
                src={logo}
                alt={`Brand ${index}`}
                className="w-[150px] h-auto object-contain grayscale hover:grayscale-0 transition duration-300"
              />
            </div>
          ))}
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
            animation: scroll 25s linear infinite;
          }
        `}
      </style>
    </div>
  );
};

export default Sponsored;
