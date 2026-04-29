import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ size: string }> }
) {
  const { size: sizeStr } = await params;
  const size = Math.min(512, Math.max(16, parseInt(sizeStr) || 192));

  const fontSize = Math.round(size * 0.68);
  const leafW = Math.round(size * 0.14);
  const leafH = Math.round(size * 0.20);
  const leafTop = Math.round(size * 0.10);
  const leafRight = Math.round(size * 0.16);

  return new ImageResponse(
    (
      <div
        style={{
          background: "#152318",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {/* N bold */}
        <span
          style={{
            color: "white",
            fontSize,
            fontWeight: 900,
            fontFamily: "sans-serif",
            lineHeight: 1,
            letterSpacing: "-0.03em",
            marginTop: Math.round(size * 0.04),
          }}
        >
          N
        </span>

        {/* Folha verde */}
        <div
          style={{
            position: "absolute",
            top: leafTop,
            right: leafRight,
            width: leafW,
            height: leafH,
            background: "#22c55e",
            borderRadius: "50% 50% 50% 0",
            transform: "rotate(35deg)",
          }}
        />
      </div>
    ),
    { width: size, height: size }
  );
}
