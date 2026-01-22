import React from 'react';

const SuggestionChips = ({ onSelect, suggestions }) => {
  // Fallback if no suggestions provided
  const items = suggestions || ["Ration Card", "Pension Issue", "Water Problem"];

  return (
    <div className="w-full overflow-x-auto pb-4 pt-2 no-scrollbar">
      <div className="flex gap-3 px-4">
        {items.map((text, i) => (
          <button
            key={i}
            onClick={() => onSelect(text)}
            className="whitespace-nowrap px-4 py-2 bg-white border border-orange-100 rounded-full text-sm text-gray-700 shadow-sm active:bg-orange-50 active:scale-95 transition-all"
          >
            {text}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SuggestionChips;