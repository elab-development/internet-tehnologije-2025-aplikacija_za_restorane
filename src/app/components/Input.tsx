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
        padding: 10,
        marginTop: 12,
        border: "1px solid #d4d4d8",
        borderRadius: 10,
        backgroundColor: "#ffffff",
        color: "#18181b",
        outline: "none",
      }}
    />
  );
}