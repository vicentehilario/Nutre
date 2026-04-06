import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 512,
          height: 512,
          background: "linear-gradient(135deg, #1c2b1e, #0d1a0f)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="380" height="380" viewBox="0 0 100 100" fill="none">
          <path
            d="M 13,14 L 30,14 L 73,86 L 88,86 L 88,14 L 71,14 L 28,86 L 12,86 Z"
            fill="white"
          />
        </svg>
      </div>
    ),
    { width: 512, height: 512 }
  );
}
