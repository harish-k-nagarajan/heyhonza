"use client";

import { tapLight, tapMedium } from "@/lib/interaction/haptic";
import {
  buttonClassName,
  type ButtonClassOptions,
  type ButtonHaptic,
} from "@/lib/design/button";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  ButtonClassOptions & {
    haptic?: ButtonHaptic;
  };

export function Button({
  className,
  variant = "primary",
  surface = "flat",
  shape,
  size = "md",
  haptic,
  onPointerDown,
  ...props
}: ButtonProps) {
  const resolvedHaptic: ButtonHaptic =
    haptic ?? (surface === "mat-key" ? "light" : "none");

  return (
    <button
      className={buttonClassName({ surface, variant, shape, size, className })}
      onPointerDown={(e) => {
        if (resolvedHaptic !== "none" && !props.disabled) {
          if (resolvedHaptic === "medium") tapMedium();
          else tapLight();
        }
        onPointerDown?.(e);
      }}
      {...props}
    />
  );
}

/** Re-export for link CTAs and one-off class composition. */
export { buttonClassName, BUTTON_FOCUS } from "@/lib/design/button";
export type {
  ButtonSurface,
  ButtonVariant,
  ButtonShape,
  ButtonSize,
  ButtonHaptic,
} from "@/lib/design/button";
