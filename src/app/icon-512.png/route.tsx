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
        {/* N */}
        <div
          style={{
            fontSize: 320,
            fontWeight: 900,
            color: "white",
            fontFamily: "sans-serif",
            lineHeight: 1,
            letterSpacing: -16,
            marginTop: 20,
          }}
        >
          N
        </div>
        {/* Leaf */}
        <div
          style={{
            position: "absolute",
            top: 88,
            right: 108,
            width: 90,
            height: 46,
            background: "#22c55e",
            borderRadius: "50% 50% 50% 0",
            transform: "rotate(-35deg)",
          }}
        />
      </div>
    ),
    { width: 512, height: 512 }
  );
}
