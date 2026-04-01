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
          borderRadius: 108,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <svg width="268" height="312" viewBox="0 0 95 110" fill="none">
          <path
            d="M8 8 L8 102 L26 102 L26 38 L69 102 L87 102 L87 8 L69 8 L69 72 L26 8 Z"
            fill="white"
          />
        </svg>
        <div
          style={{
            position: "absolute",
            top: 80,
            right: 95,
            width: 82,
            height: 41,
            background: "#22c55e",
            borderRadius: "50%",
            transform: "rotate(-35deg)",
          }}
        />
      </div>
    ),
    { width: 512, height: 512 }
  );
}
