"use client";

import { Button } from "@/components/ui/Button";

type PressableProps = React.ComponentProps<typeof Button>;

/**
 * Thin alias for mat-key `<Button>` with light haptic on pointer down.
 * Prefer `<Button surface="mat-key" />` directly in new code.
 */
export function Pressable({ surface = "mat-key", haptic = "light", ...props }: PressableProps) {
  return <Button surface={surface} haptic={haptic} {...props} />;
}
