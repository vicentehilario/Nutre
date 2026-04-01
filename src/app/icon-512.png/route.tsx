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
        <div
          style={{
            fontSize: 320,
            fontWeight: 900,
            color: "white",
            lineHeight: 1,
            marginTop: 20,
          }}
        >
          N
        </div>
        <div
          style={{
            position: "absolute",
            top: 85,
            right: 100,
            width: 88,
            height: 44,
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
