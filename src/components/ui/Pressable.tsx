"use client";

import { tapLight } from "@/lib/interaction/haptic";
import { cn } from "@/lib/cn";

type PressableProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  haptic?: boolean;
};

/**
 * Button wrapper that fires a light haptic on pointer down (mat-key feel on device).
 */
export function Pressable({
  className,
  haptic = true,
  onPointerDown,
  children,
  ...props
}: PressableProps) {
  return (
    <button
      type="button"
      className={className}
      onPointerDown={(e) => {
        if (haptic && !props.disabled) tapLight();
        onPointerDown?.(e);
      }}
      {...props}
    >
      {children}
    </button>
  );
}

/** className helper for mat-key + press surfaces that need haptic on pointer down. */
export function useMatKeyPress() {
  return {
    onPointerDown: () => tapLight(),
    className: cn("mat-key press"),
  };
}
