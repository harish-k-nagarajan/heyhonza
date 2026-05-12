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
          background: "#f5f2ee",
        }}
      >
        <div
          style={{
            width: 200,
            height: 200,
            borderRadius: 24,
            background: "#e8432d",
            boxShadow: "0 8px 32px rgba(232, 67, 45, 0.25)",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
