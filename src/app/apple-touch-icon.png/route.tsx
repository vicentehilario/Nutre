import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          background: "#16a34a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            fontSize: 90,
            fontWeight: 900,
            color: "white",
            fontFamily: "sans-serif",
            lineHeight: 1,
            letterSpacing: -4,
          }}
        >
          N
        </div>
      </div>
    ),
    { width: 180, height: 180 }
  );
}
