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
            fontSize: 110,
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
            top: 28,
            right: 34,
            width: 30,
            height: 15,
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
