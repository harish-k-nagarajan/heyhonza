import type {CSSProperties, ImgHTMLAttributes} from "react";
import {staticFile} from "remotion";

type StaticImport = {src: string} | string;

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  src: StaticImport;
  alt: string;
  fill?: boolean;
  sizes?: string;
  quality?: number;
  priority?: boolean;
  placeholder?: string;
  blurDataURL?: string;
};

function resolveSrc(src: StaticImport): string {
  return typeof src === "string" ? src : src.src;
}

function isAppIcon(src: string) {
  return (
    src.includes("apple-touch-icon") ||
    /\/icons\/icon-\d+\.png/.test(src) ||
    src.endsWith("favicon.ico")
  );
}

/**
 * Favicon-sized assets from `public/` render as <img>.
 * Any other raster (including the landing lockscreen JPG) becomes a CSS wash.
 */
export default function NextImage({
  src,
  alt,
  fill,
  className,
  style,
  width,
  height,
}: Props) {
  const path = resolveSrc(src);
  const fillStyle: CSSProperties | undefined = fill
    ? {position: "absolute", inset: 0, width: "100%", height: "100%", ...style}
    : style;

  if (!isAppIcon(path)) {
    return (
      <div
        aria-hidden
        className={className}
        style={{
          ...fillStyle,
          background:
            "linear-gradient(180deg, #1a2740 0%, #3d4a62 36%, #c4b8a8 70%, #f5f2ee 100%)",
        }}
      />
    );
  }

  const file = path.startsWith("/") ? staticFile(path.replace(/^\//, "")) : path;

  return (
    <img
      src={file}
      alt={alt}
      width={width}
      height={height}
      className={className}
      style={
        fill
          ? {position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", ...style}
          : style
      }
      draggable={false}
    />
  );
}
