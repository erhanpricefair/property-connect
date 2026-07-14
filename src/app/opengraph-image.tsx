import { ImageResponse } from "next/og";

export const alt = "ReferWise — Melbourne property introductions";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#F3EFE6",
        }}
      >
        <div style={{ display: "flex", fontSize: 96, fontWeight: 700, color: "#16201B" }}>
          Refer
          <span style={{ color: "#B08A4E" }}>Wise</span>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 24,
            fontSize: 32,
            color: "#16201B",
            opacity: 0.7,
          }}
        >
          The right property introduction, made fast.
        </div>
        <div
          style={{
            display: "flex",
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            height: 16,
            backgroundColor: "#1F4A3C",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
