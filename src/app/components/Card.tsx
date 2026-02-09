import React from "react";

type CardProps = {
  title: string;
  description: string;
  imageUrl?: string;
  children?: React.ReactNode;
};

export default function Card({ title, description, imageUrl, children }: CardProps) {
  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: 12,
        padding: 16,
        width: 360,
        overflow: "hidden",
      }}
    >
      {imageUrl && (
        <img
          src={imageUrl}
          alt={title}
          style={{
            width: "100%",
            height: 200,
            objectFit: "cover",
            borderRadius: 10,
            display: "block",
          }}
        />
      )}

      <h3 style={{ marginTop: 12 }}>{title}</h3>
      <p style={{ marginTop: 8, color: "#444" }}>{description}</p>

      {children && <div style={{ marginTop: 12 }}>{children}</div>}
    </div>
  );
}
