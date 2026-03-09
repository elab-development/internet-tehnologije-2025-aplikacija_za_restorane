import SwaggerClient from "./SwaggerClient";
import { swaggerSpec } from "@/lib/swagger";

export default function ApiDocsPage() {
  return (
    <main style={{ padding: 20 }}>
      <h1 style={{ fontSize: 32, fontWeight: "bold", marginBottom: 20 }}>
        API dokumentacija
      </h1>

      <SwaggerClient spec={swaggerSpec} />
    </main>
  );
}