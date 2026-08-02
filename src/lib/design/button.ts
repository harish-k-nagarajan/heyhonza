import { cn } from "@/lib/cn";
import { TYPE } from "@/lib/design/typography";

export type ButtonSurface = "flat" | "mat-key";
export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonShape = "pill" | "card" | "circle";
export type ButtonSize = "sm" | "md" | "lg" | "call" | "icon" | "icon-md" | "icon-lg";
export type ButtonHaptic = "light" | "medium" | "none";

/** Keyboard focus ring — uses mood `--accent` via Tailwind `outline-accent`. */
export const BUTTON_FOCUS =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

const flatVariants: Record<Exclude<ButtonVariant, "danger">, string> = {
  primary: "bg-accent text-accent-foreground shadow-sm shadow-black/10",
  secondary: "border border-border bg-muted text-foreground hover:bg-muted/80",
  ghost: "text-muted-foreground hover:bg-muted hover:text-foreground",
};

const matKeyShapeSize: Record<
  ButtonShape,
  Partial<Record<ButtonSize, string>>
> = {
  pill: {
    sm: "shrink-0 rounded-full px-4 py-2",
    md: "w-full rounded-full py-3",
    lg: "w-full rounded-full py-3.5",
    call: "h-14 w-full max-w-[280px] rounded-full",
  },
  card: {
    md: "w-full rounded-[14px] py-2.5 disabled:opacity-40",
  },
  circle: {
    icon: "h-10 w-10 shrink-0 rounded-full",
    "icon-md": "h-[52px] w-[52px] shrink-0 rounded-full disabled:opacity-40",
    "icon-lg": "h-[60px] w-[60px] shrink-0 rounded-full disabled:opacity-40",
  },
};

export type ButtonClassOptions = {
  surface?: ButtonSurface;
  variant?: ButtonVariant;
  shape?: ButtonShape;
  size?: ButtonSize;
  className?: string;
};

/**
 * Shared class helper for `<Button>` and link-styled CTAs (`ButtonLink`).
 * `surface="flat"` preserves Classic accent-filled / bordered styles.
 * `surface="mat-key"` applies globals.css mechanical depth + press travel.
 */
export function buttonClassName({
  surface = "flat",
  variant = "primary",
  shape,
  size = "md",
  className,
}: ButtonClassOptions): string {
  if (surface === "flat") {
    const flatVariant = variant === "danger" ? flatVariants.primary : flatVariants[variant];
    return cn(
      "inline-flex min-h-11 items-center justify-center rounded-card px-4 transition active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40",
      BUTTON_FOCUS,
      TYPE.button,
      flatVariant,
      className,
    );
  }

  const shapeSize =
    shape != null ? matKeyShapeSize[shape][size] : matKeyShapeSize.pill[size];

  return cn(
    "mat-key press inline-flex items-center justify-center text-accent transition disabled:pointer-events-none disabled:opacity-40",
    BUTTON_FOCUS,
    TYPE.button,
    shapeSize,
    variant === "danger" && "text-white",
    className,
  );
}
