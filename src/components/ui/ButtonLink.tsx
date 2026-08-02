import Link from "next/link";

import {
  buttonClassName,
  type ButtonClassOptions,
} from "@/lib/design/button";

type ButtonLinkProps = React.ComponentProps<typeof Link> & ButtonClassOptions;

/**
 * Next.js `<Link>` styled as a button — for landing CTAs that must stay navigable links.
 */
export function ButtonLink({
  className,
  surface = "mat-key",
  variant = "primary",
  shape = "pill",
  size = "lg",
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={buttonClassName({ surface, variant, shape, size, className })}
      {...props}
    />
  );
}
