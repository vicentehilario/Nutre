import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 192,
          height: 192,
          background: "linear-gradient(135deg, #1c2b1e, #0d1a0f)",
          borderRadius: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <div
          style={{
            fontSize: 120,
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
            top: 33,
            right: 40,
            width: 34,
            height: 17,
            background: "#22c55e",
            borderRadius: "50% 50% 50% 0",
            transform: "rotate(-35deg)",
          }}
        />
      </div>
    ),
    { width: 192, height: 192 }
  );
}
