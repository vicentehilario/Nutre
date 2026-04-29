import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ size: string }> }
) {
  const { size: sizeStr } = await params;
  const size = Math.min(512, Math.max(16, parseInt(sizeStr) || 192));
  const innerSize = Math.round(size * 0.72);

  return new ImageResponse(
    (
      <div
        style={{
          background: "#1a3a20",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg
          width={innerSize}
          height={innerSize}
          viewBox="0 0 100 100"
          fill="none"
        >
          <path
            d="M 18,18 L 31,18 L 68,82 L 82,82 L 82,18 L 69,18 L 32,82 L 18,82 Z"
            fill="white"
          />
        </svg>
      </div>
    ),
    { width: size, height: size }
  );
}
