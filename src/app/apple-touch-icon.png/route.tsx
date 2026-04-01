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
        <div
          style={{
            fontSize: 112,
            fontWeight: 900,
            color: "white",
            fontFamily: "sans-serif",
            lineHeight: 1,
            letterSpacing: -6,
            marginTop: 8,
          }}
        >
          N
        </div>
        <div
          style={{
            position: "absolute",
            top: 30,
            right: 37,
            width: 32,
            height: 16,
            background: "#22c55e",
            borderRadius: "50% 50% 50% 0",
            transform: "rotate(-35deg)",
          }}
        />
      </div>
    ),
    { width: 180, height: 180 }
  );
}
