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
            lineHeight: 1,
            marginTop: 8,
          }}
        >
          N
        </div>
        <div
          style={{
            position: "absolute",
            top: 30,
            right: 36,
            width: 32,
            height: 16,
            background: "#22c55e",
            borderRadius: "50%",
            transform: "rotate(-35deg)",
          }}
        />
      </div>
    ),
    { width: 192, height: 192 }
  );
}
