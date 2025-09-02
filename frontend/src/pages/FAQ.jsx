import React, { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";


const faqs = [
  {
    question: "What is your return policy?",
    answer: "We offer a 7-day return policy from the date of delivery for all eligible items.",
  },
  {
    question: "How long does shipping take?",
    answer: "Shipping typically takes 3-5 business days within major cities.",
  },
  {
    question: "Do you ship internationally?",
    answer: "Currently, we only ship within Pakistan.",
  },
  {
    question: "Can I track my order?",
    answer: "Yes, you will receive a tracking link once your order has been dispatched.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept Cash on Delivery, JazzCash, Easypaisa, and Bank Transfers.",
  },
  {
    question: "How do I contact support?",
    answer: "You can contact our support team via email at support@example.com.",
  },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="p-4 w-full overflow-x-hidden bg-gray-100" style={{margin : 0 , padding : 0}}>
   
      <h2 className="text-3xl font-bold mb-6 text-gray-800 m-10">Frequently Asked Questions</h2>
      <div className="space-y-4 m-10">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="border border-gray-300 rounded-lg p-4 bg-white shadow-sm"
          >
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => toggleFAQ(index)}
            >
              <h3 className="text-lg font-semibold text-gray-900">{faq.question}</h3>
              {openIndex === index ? (
                <FaChevronUp className="text-gray-600" />
              ) : (
                <FaChevronDown className="text-gray-600" />
              )}
            </div>
            {openIndex === index && (
              <p className="mt-3 text-gray-700 transition duration-200 ease-in-out">
                {faq.answer}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;
