import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

type ButtonBaseProps = {
  children: ReactNode;
  className?: string;
};

type LinkButtonProps = ButtonBaseProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
  };

type NativeButtonProps = ButtonBaseProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined;
  };

type ButtonProps = LinkButtonProps | NativeButtonProps;

const buttonClasses =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-green px-6 py-3 text-base font-semibold text-white transition hover:bg-[#284f32] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green";

export function Button({ className, children, ...props }: ButtonProps) {
  const classes = cn(buttonClasses, className);

  if (typeof props.href === "string") {
    const { href, ...linkProps } = props;

    return (
      <Link href={href} className={classes} {...linkProps}>
        {children}
      </Link>
    );
  }

  const { href, type = "button", ...buttonProps } = props;

  return (
    <button className={classes} type={type} {...buttonProps}>
      {children}
    </button>
  );
}
