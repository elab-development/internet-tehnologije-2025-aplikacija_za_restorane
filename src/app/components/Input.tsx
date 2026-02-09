"use client";

type InputProps = {
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function Input({
  type = "text",
  placeholder,
  value,
  onChange,
}: InputProps) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      style={{
        display: "block",
        width: "100%",
        padding: 8,
        marginTop: 12,
        border: "1px solid #ccc",
        borderRadius: 4,
      }}
    />
  );
}
