import { useState } from "react";

export default function FAQAccordion({ faq, index: _index = 0 }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-neutral-200 last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-5 text-left"
        aria-expanded={isOpen}
      >
        <span className="text-sm font-medium text-neutral-900 pr-4">
          {faq.question}
        </span>
        <svg
          className={`w-5 h-5 text-neutral-400 flex-shrink-0 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {isOpen && (
          <div className="overflow-hidden">
            <p className="text-sm text-neutral-600 leading-relaxed pb-5 -mt-2">
              {faq.answer}
            </p>
          </div>
        )}
    </div>
  );
}

