"use client";

type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary";
};

export default function Button({
  children,
  onClick,
  variant = "primary",
}: ButtonProps) {
  const className =
    variant === "primary"
      ? "px-4 py-2 bg-blue-600 text-white rounded"
      : "px-4 py-2 bg-gray-300 text-black rounded";

  return (
    <button onClick={onClick} className={className}>
      {children}
    </button>
  );
}
