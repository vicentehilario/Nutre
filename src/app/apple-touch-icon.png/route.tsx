import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          background: "linear-gradient(135deg, #1c2b1e, #0d1a0f)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <svg width="95" height="110" viewBox="0 0 95 110" fill="none">
          <path
            d="M8 8 L8 102 L26 102 L26 38 L69 102 L87 102 L87 8 L69 8 L69 72 L26 8 Z"
            fill="white"
          />
        </svg>
        <div
          style={{
            position: "absolute",
            top: 26,
            right: 32,
            width: 28,
            height: 14,
            background: "#22c55e",
            borderRadius: "50%",
            transform: "rotate(-35deg)",
          }}
        />
      </div>
    ),
    { width: 180, height: 180 }
  );
}
