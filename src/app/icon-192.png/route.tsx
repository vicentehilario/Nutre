import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 192,
          height: 192,
          background: "#16a34a",
          borderRadius: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            fontSize: 96,
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
    { width: 192, height: 192 }
  );
}
