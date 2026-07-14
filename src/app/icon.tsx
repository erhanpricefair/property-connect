import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#1F4A3C",
        }}
      >
        <div style={{ display: "flex", fontSize: 240, fontWeight: 700, color: "#F3EFE6" }}>
          R<span style={{ color: "#B08A4E" }}>W</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
