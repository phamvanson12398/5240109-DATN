import React from "react";
import { Link } from "react-router-dom";

const sizeClass = {
  sm: "text-lg",
  md: "text-xl",
  lg: "text-2xl",
  xl: "text-3xl",
};

function BrandLogo({
  className = "",
  size = "md",
  to = "/",
  tone = "dark",
}) {
  const classes = [
    "inline-flex items-baseline font-black uppercase leading-none tracking-normal",
    sizeClass[size] || sizeClass.md,
    tone === "light" ? "text-white" : "text-[#111827]",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const logo = (
    <>
      <span className="text-[#000000]"> SÁCH</span><span className="text-[#E85D75]">ƠI</span>
    </>
  );

  if (!to) {
    return <span className={classes}>{logo}</span>;
  }

  return (
    <Link to={to} className={classes} aria-label="Trang chủ Sách Ơi">
      {logo}
    </Link>
  );
}

export default BrandLogo;
