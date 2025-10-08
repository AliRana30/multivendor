import React from "react";
import {
  AiFillFacebook,
  AiFillInstagram,
  AiFillYoutube,
  AiOutlineTwitter,
} from "react-icons/ai";
import { Link } from "react-router-dom";
import {
  footercompanyLinks,
  footerProductLinks,
  footerSupportLinks,
} from "../../static/data";

const Footer = () => {
  return (
    <div className="bg-[#000] text-white">
      {/* Main Footer Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-6 sm:px-8 px-5 py-16">
        {/* Logo & Social */}
        <ul className="px-5 flex flex-col items-center sm:items-start text-center sm:text-start">
          <img
            src="./MultiMart.png"
            alt="MultiMart"
            style={{ filter: "brightness(0) invert(1)", width: "150px" }}
          />
          <p className="mt-4 text-sm text-gray-300">The home and elements needed to create beautiful products.</p>
          <div className="flex items-center mt-4 gap-4">
            <AiFillFacebook size={25} className="cursor-pointer hover:text-[#56d879]" />
            <AiOutlineTwitter size={25} className="cursor-pointer hover:text-[#56d879]" />
            <AiFillInstagram size={25} className="cursor-pointer hover:text-[#56d879]" />
            <AiFillYoutube size={25} className="cursor-pointer hover:text-[#56d879]" />
          </div>
        </ul>

        {/* Company Links */}
        <ul className="text-center sm:text-start">
          <h1 className="mb-2 font-semibold text-white">Company</h1>
          {footerProductLinks.map((link, index) => (
            <li key={index}>
              <Link
                className="text-gray-400 hover:text-teal-400 duration-300 text-sm leading-6"
                to={link.link}
              >
                {link.name}
              </Link>
            </li>
          ))}
        </ul>

        {/* Shop Links */}
        <ul className="text-center sm:text-start">
          <h1 className="mb-2 font-semibold text-white">Shop</h1>
          {footercompanyLinks.map((link, index) => (
            <li key={index}>
              <Link
                className="text-gray-400 hover:text-teal-400 duration-300 text-sm leading-6"
                to={link.link}
              >
                {link.name}
              </Link>
            </li>
          ))}
        </ul>

        {/* Support Links */}
        <ul className="text-center sm:text-start">
          <h1 className="mb-2 font-semibold text-white">Support</h1>
          {footerSupportLinks.map((link, index) => (
            <li key={index}>
              <Link
                className="text-gray-400 hover:text-teal-400 duration-300 text-sm leading-6"
                to={link.link}
              >
                {link.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Bottom Footer */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-center text-gray-400 text-sm pb-8 px-4">
        <span>© 2025 MultiMart. All rights reserved.</span>
        <span>Terms · Privacy Policy</span>
        <div className="flex items-center justify-center w-full">
          <img
            src="https://hamart-shop.vercel.app/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Ffooter-payment.a37c49ac.png&w=640&q=75"
            alt="Payment Methods"
            className="mx-auto max-w-[200px]"
          />
        </div>
      </div>
    </div>
  );
};

export default Footer;

