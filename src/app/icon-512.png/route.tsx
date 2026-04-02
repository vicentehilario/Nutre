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
        }}
      >
        <svg width="380" height="380" viewBox="0 0 100 100" fill="none">
          {/* N */}
          <path
            d="M 13,14 L 30,14 L 73,86 L 88,86 L 88,14 L 71,14 L 28,86 L 12,86 Z"
            fill="white"
          />
          {/* Leaf */}
          <path
            d="M 87,14 C 90,20 82,30 76,27 C 74,21 82,12 87,14 Z"
            fill="#22c55e"
          />
          {/* Midrib */}
          <line
            x1="87" y1="14" x2="76" y2="27"
            stroke="#15803d"
            stroke-width="0.9"
            opacity="0.6"
          />
          {/* Stem */}
          <path
            d="M 76,27 Q 73,32 71,35"
            stroke="#16a34a"
            stroke-width="1.1"
            fill="none"
            opacity="0.7"
          />
        </svg>
      </div>
    ),
    { width: 512, height: 512 }
  );
}
