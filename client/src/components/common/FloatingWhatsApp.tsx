import React, { useState } from "react";

interface FloatingWhatsAppProps {
  phoneNumber?: string;
  defaultMessage?: string;
}

export const FloatingWhatsApp: React.FC<FloatingWhatsAppProps> = ({
  phoneNumber = "254743849304",
  defaultMessage = "Hello StockGrid Support, I would like to make an inquiry about StockGrid POS & Retail Platform.",
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const cleanNumber = phoneNumber.replace(/[^0-9]/g, "");
  const encodedMsg = encodeURIComponent(defaultMessage);
  const waUrl = `https://wa.me/${cleanNumber}?text=${encodedMsg}`;

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Tooltip Badge */}
      <div
        className={`bg-slate-900 text-white text-xs font-semibold py-1.5 px-3 rounded-full shadow-lg transition-all duration-200 pointer-events-none hidden sm:flex items-center gap-1.5 ${
          isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2"
        }`}
      >
        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>Chat with us 24/7 on WhatsApp</span>
      </div>

      {/* Floating Action Button */}
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp 24/7 at 0743849304"
        className="relative flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-xl hover:shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 group"
      >
        {/* Ripple / Ping Effect */}
        <span className="absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-30 animate-ping group-hover:opacity-0 transition-opacity" />

        {/* WhatsApp Icon */}
        <svg
          className="w-7 h-7 fill-current relative z-10 drop-shadow-xs"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M17.472 14.382c-.301-.15-1.78-.879-2.056-.98-.276-.1-.477-.15-.678.15-.2.301-.778.98-.954 1.181-.176.2-.352.226-.653.075-.301-.15-1.272-.469-2.423-1.496-.896-.799-1.501-1.787-1.677-2.088-.176-.301-.019-.464.132-.614.136-.135.301-.352.452-.528.15-.176.2-.301.301-.502.101-.201.05-.377-.025-.528-.075-.15-.678-1.633-.929-2.236-.245-.588-.494-.508-.678-.518-.176-.01-.377-.01-.578-.01-.201 0-.528.075-.804.377-.276.301-1.055 1.03-1.055 2.512 0 1.482 1.08 2.912 1.23 3.113.15.201 2.125 3.245 5.148 4.551.719.311 1.28.497 1.718.636.722.23 1.379.197 1.898.12.578-.087 1.78-.728 2.031-1.431.251-.703.251-1.305.176-1.431-.076-.126-.277-.201-.578-.352zm-5.452 7.618c-2.181 0-4.218-.621-5.945-1.698l-.426-.254-4.423 1.16 1.18-4.312-.278-.442c-1.181-1.879-1.808-4.062-1.808-6.302 0-6.627 5.373-12 12-12s12 5.373 12 12-5.373 12-12 12zm0-22c-5.523 0-10 4.477-10 10 0 1.942.557 3.754 1.517 5.289l-1.517 5.545 5.688-1.492c1.478.887 3.208 1.398 5.062 1.398 5.523 0 10-4.477 10-10s-4.477-10-10-10z" />
        </svg>

        {/* Online Indicator Badge */}
        <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full" />
      </a>
    </div>
  );
};
