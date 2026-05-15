import React from "react";

function ProductColorDots({ colors = [] }) {
  if (!colors || colors.length === 0) return null;

  return (
    <div className="flex gap-1.5 mt-3">
      {colors.map((color, idx) => (
        <div
          key={idx}
          className="w-3 h-3 rounded-full border border-slate-200 shadow-sm transition-transform hover:scale-125 cursor-pointer"
          style={{ backgroundColor: color.hex || color }}
          title={color.name || color}
        />
      ))}
    </div>
  );
}

export default ProductColorDots;
