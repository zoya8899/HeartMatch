import React from 'react';

interface TronQrCodeProps {
  address: string;
  size?: number;
}

/**
 * Clean SVG QR Code representation for Tron TRC20 deposit address
 */
export const TronQrCode: React.FC<TronQrCodeProps> = ({ address, size = 180 }) => {
  return (
    <div className="flex flex-col items-center justify-center p-3 bg-white rounded-2xl border-2 border-stone-200 shadow-sm relative group">
      {/* QR Code Container */}
      <div className="relative">
        <svg
          width={size}
          height={size}
          viewBox="0 0 160 160"
          className="rounded-lg"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Background */}
          <rect width="160" height="160" fill="white" />

          {/* Finder Patterns (Top-Left, Top-Right, Bottom-Left) */}
          {/* Top-Left */}
          <rect x="10" y="10" width="40" height="40" fill="#1c1917" rx="6" />
          <rect x="18" y="18" width="24" height="24" fill="white" rx="3" />
          <rect x="24" y="24" width="12" height="12" fill="#e11d48" rx="2" />

          {/* Top-Right */}
          <rect x="110" y="10" width="40" height="40" fill="#1c1917" rx="6" />
          <rect x="118" y="18" width="24" height="24" fill="white" rx="3" />
          <rect x="124" y="24" width="12" height="12" fill="#e11d48" rx="2" />

          {/* Bottom-Left */}
          <rect x="10" y="110" width="40" height="40" fill="#1c1917" rx="6" />
          <rect x="18" y="118" width="24" height="24" fill="white" rx="3" />
          <rect x="24" y="124" width="12" height="12" fill="#e11d48" rx="2" />

          {/* Timing Patterns */}
          <rect x="56" y="26" width="6" height="6" fill="#1c1917" />
          <rect x="68" y="26" width="6" height="6" fill="#1c1917" />
          <rect x="80" y="26" width="6" height="6" fill="#1c1917" />
          <rect x="92" y="26" width="6" height="6" fill="#1c1917" />

          <rect x="26" y="56" width="6" height="6" fill="#1c1917" />
          <rect x="26" y="68" width="6" height="6" fill="#1c1917" />
          <rect x="26" y="80" width="6" height="6" fill="#1c1917" />
          <rect x="26" y="92" width="6" height="6" fill="#1c1917" />

          {/* Data Modules Matrix Grid simulation for TRC20 address */}
          <rect x="58" y="58" width="8" height="8" fill="#1c1917" rx="1" />
          <rect x="72" y="58" width="8" height="8" fill="#1c1917" rx="1" />
          <rect x="86" y="58" width="8" height="8" fill="#1c1917" rx="1" />
          <rect x="100" y="58" width="8" height="8" fill="#1c1917" rx="1" />
          <rect x="120" y="58" width="8" height="8" fill="#1c1917" rx="1" />

          <rect x="58" y="72" width="8" height="8" fill="#1c1917" rx="1" />
          <rect x="86" y="72" width="8" height="8" fill="#1c1917" rx="1" />
          <rect x="114" y="72" width="8" height="8" fill="#1c1917" rx="1" />
          <rect x="134" y="72" width="8" height="8" fill="#1c1917" rx="1" />

          {/* Center USDT / TRON Icon Badge */}
          <circle cx="80" cy="80" r="16" fill="#26A17B" />
          <path
            d="M74 74h12v3h-4.5v10h-3V77H74v-3z"
            fill="white"
            fontWeight="bold"
          />

          <rect x="58" y="86" width="8" height="8" fill="#1c1917" rx="1" />
          <rect x="100" y="86" width="8" height="8" fill="#1c1917" rx="1" />
          <rect x="128" y="86" width="8" height="8" fill="#1c1917" rx="1" />

          <rect x="58" y="100" width="8" height="8" fill="#1c1917" rx="1" />
          <rect x="72" y="100" width="8" height="8" fill="#1c1917" rx="1" />
          <rect x="86" y="100" width="8" height="8" fill="#1c1917" rx="1" />
          <rect x="114" y="100" width="8" height="8" fill="#1c1917" rx="1" />
          <rect x="134" y="100" width="8" height="8" fill="#1c1917" rx="1" />

          <rect x="58" y="114" width="8" height="8" fill="#1c1917" rx="1" />
          <rect x="80" y="114" width="8" height="8" fill="#1c1917" rx="1" />
          <rect x="100" y="114" width="8" height="8" fill="#1c1917" rx="1" />
          <rect x="120" y="114" width="8" height="8" fill="#1c1917" rx="1" />

          <rect x="72" y="128" width="8" height="8" fill="#1c1917" rx="1" />
          <rect x="92" y="128" width="8" height="8" fill="#1c1917" rx="1" />
          <rect x="114" y="128" width="8" height="8" fill="#1c1917" rx="1" />
          <rect x="134" y="128" width="8" height="8" fill="#1c1917" rx="1" />
        </svg>

        {/* Binance / Tron Badge */}
        <div className="absolute -bottom-2 inset-x-0 flex justify-center">
          <span className="bg-stone-900 text-amber-400 text-[9px] font-bold px-2 py-0.5 rounded-full shadow-xs border border-stone-700">
            Binance TRC20
          </span>
        </div>
      </div>
      <span className="text-[10px] text-stone-500 font-medium mt-3">Scan in Binance or Trust Wallet</span>
    </div>
  );
};
