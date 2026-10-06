import React from 'react';
import { Globe2 } from 'lucide-react';
import { CountryDiscoveryItem } from '../../types';

interface CountryDiscoveryBarProps {
  countries: CountryDiscoveryItem[];
  selectedCountry: string | null;
  onSelectCountry: (countryName: string | null) => void;
  isLoading?: boolean;
}

export const CountryDiscoveryBar: React.FC<CountryDiscoveryBarProps> = ({
  countries,
  selectedCountry,
  onSelectCountry,
  isLoading = false,
}) => {
  return (
    <div className="w-full text-left space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-700">
            <Globe2 className="w-4 h-4 text-stone-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-stone-900 tracking-tight">Explore by Country</h3>
            <p className="text-[11px] text-stone-500">Only showing regions with verified adult singles</p>
          </div>
        </div>

        {selectedCountry && (
          <button
            onClick={() => onSelectCountry(null)}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 cursor-pointer underline underline-offset-2"
          >
            Show All Countries
          </button>
        )}
      </div>

      {/* Horizontal Scrolling Chips on mobile / Wrapped on desktop */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none select-none">
        {/* All Countries Pill */}
        <button
          onClick={() => onSelectCountry(null)}
          className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
            selectedCountry === null
              ? 'bg-stone-900 text-white shadow-xs'
              : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
          }`}
        >
          <span>🌍</span>
          <span>Worldwide</span>
        </button>

        {/* Dynamic Country Buttons */}
        {countries.map((c) => {
          const isSelected = selectedCountry?.toLowerCase() === c.country.toLowerCase();
          return (
            <button
              key={c.country}
              onClick={() => onSelectCountry(isSelected ? null : c.country)}
              className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 cursor-pointer ${
                isSelected
                  ? 'bg-rose-600 text-white font-semibold shadow-xs'
                  : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 hover:border-stone-300'
              }`}
            >
              <span className="text-base leading-none">{c.flag}</span>
              <span>{c.country}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  isSelected
                    ? 'bg-white/20 text-white'
                    : 'bg-stone-100 text-stone-500'
                }`}
              >
                {c.verifiedCount}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
