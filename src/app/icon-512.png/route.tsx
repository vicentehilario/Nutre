import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 512,
          height: 512,
          background: "#16a34a",
          borderRadius: 108,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            fontSize: 260,
            fontWeight: 900,
            color: "white",
            fontFamily: "sans-serif",
            lineHeight: 1,
            letterSpacing: -12,
          }}
        >
          N
        </div>
      </div>
    ),
    { width: 512, height: 512 }
  );
}
