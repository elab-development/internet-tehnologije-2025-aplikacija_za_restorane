"use client";

import React from "react";

type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "success";
  type?: "button" | "submit";
};

export default function Button({
  children,
  onClick,
  variant = "primary",
  type = "button",
}: ButtonProps) {
  const className =
    variant === "primary"
      ? "px-4 py-2 bg-blue-600 text-white rounded"
      : variant === "secondary"
      ? "px-4 py-2 bg-gray-300 text-black rounded"
      : "px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded";

  return (
    <button type={type} onClick={onClick} className={className}>
      {children}
    </button>
  );
}

