import { cn } from "../../lib/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

const buttonVariants: Record<ButtonVariant, string> = {
  primary: "bg-accent-strong text-white shadow-[0_6px_18px_-8px_rgb(225_6_0/0.6)] hover:bg-accent-ink",
  secondary: "border border-line-strong bg-white text-ink hover:border-ink/30 hover:bg-paper",
  ghost: "text-muted-ink hover:bg-paper hover:text-ink",
  danger: "bg-danger text-white hover:bg-[#912018]",
};

/** Button styles, also used for links that look like buttons. */
export const buttonClass = (variant: ButtonVariant = "primary", size: "sm" | "md" = "md", className?: string) =>
  cn(
    "inline-flex shrink-0 items-center justify-center gap-2 rounded-xl font-medium whitespace-nowrap transition-colors duration-150",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-55",
    size === "sm" ? "h-8 px-3 text-[13px]" : "h-10 px-4 text-sm",
    buttonVariants[variant],
    className,
  );
