import { forwardRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode } from "react";
import { CircleAlert, CircleCheck, Info, LoaderCircle } from "lucide-react";
import { Link, type LinkProps } from "react-router-dom";
import { cn } from "../../lib/cn";

/* Form primitives for the sign-in flow, matching Meca-UI's admin controls. */

export function AuthHeading({ eyebrow, title, description }: { eyebrow?: string; title: string; description?: ReactNode }) {
  return (
    <header className="mb-7">
      {eyebrow && (
        <p className="text-label mb-4 flex items-center gap-2.5 text-accent-ink">
          <span aria-hidden className="h-px w-6 bg-accent" />
          {eyebrow}
        </p>
      )}
      <h1 className="font-display text-[1.85rem] leading-[1.1] font-semibold tracking-[-0.03em] text-ink sm:text-[2.1rem]">{title}</h1>
      {description && <p className="mt-2.5 text-[15px] leading-relaxed text-muted-ink">{description}</p>}
    </header>
  );
}

export function Field({
  label,
  htmlFor,
  error,
  hint,
  action,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={htmlFor} className="text-[13px] font-medium text-ink">
          {label}
        </label>
        {action}
      </div>
      {children}
      {error ? (
        <p id={`${htmlFor}-message`} className="flex animate-rise items-center gap-1.5 text-xs text-danger">
          <CircleAlert aria-hidden className="size-3.5 shrink-0" />
          {error}
        </p>
      ) : hint ? (
        <p id={`${htmlFor}-message`} className="text-xs text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

type TextInputProps = InputHTMLAttributes<HTMLInputElement> & {
  icon?: ReactNode;
  trailing?: ReactNode;
  invalid?: boolean;
  /** Points aria-describedby at the Field's error/hint line. */
  described?: boolean;
};

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
  { icon, trailing, invalid, described, className, id, ...props },
  ref,
) {
  return (
    <div className="group relative">
      {icon && (
        <span
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted transition-colors group-focus-within:text-accent [&>svg]:size-[18px]"
        >
          {icon}
        </span>
      )}
      <input
        ref={ref}
        id={id}
        aria-invalid={invalid || undefined}
        aria-describedby={described ? `${id}-message` : undefined}
        className={cn(
          "h-12 w-full rounded-xl border border-line-strong bg-white text-[15px] text-ink shadow-[0_1px_2px_rgb(11_13_18/0.04)] transition-[border-color,box-shadow] duration-200",
          "placeholder:text-muted/70 hover:border-ink/25 focus:border-accent focus:ring-4 focus:ring-accent/10 focus:outline-none",
          "disabled:cursor-not-allowed disabled:bg-paper disabled:text-muted",
          "aria-[invalid=true]:border-danger aria-[invalid=true]:focus:ring-danger/10",
          icon ? "pl-11" : "pl-4",
          trailing ? "pr-12" : "pr-4",
          className,
        )}
        {...props}
      />
      {trailing && <span className="absolute top-1/2 right-1.5 -translate-y-1/2">{trailing}</span>}
    </div>
  );
});

type ButtonVariant = "primary" | "secondary";

const buttonVariants: Record<ButtonVariant, string> = {
  primary: "btn-shine bg-accent-strong text-white shadow-glow hover:bg-accent-ink hover:shadow-glow-lg",
  secondary: "border border-line-strong bg-white text-ink hover:border-ink/30 hover:bg-paper",
};

export function Button({
  variant = "primary",
  loading,
  icon,
  className,
  children,
  disabled,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; loading?: boolean; icon?: ReactNode }) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        "group inline-flex h-12 items-center justify-center gap-2 rounded-xl px-5 text-[15px] font-semibold whitespace-nowrap",
        "transition-[background-color,border-color,box-shadow,transform] duration-200 active:scale-[0.985]",
        "focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent",
        "disabled:cursor-not-allowed disabled:opacity-65 disabled:active:scale-100",
        buttonVariants[variant],
        className,
      )}
      {...props}
    >
      {loading && <LoaderCircle aria-hidden className="size-4 animate-spin" />}
      {children}
      {!loading && icon && (
        <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5 [&>svg]:size-4">
          {icon}
        </span>
      )}
    </button>
  );
}

const alertTones = {
  danger: { className: "bg-danger-soft text-danger ring-danger/20", Icon: CircleAlert },
  success: { className: "bg-success-soft text-success ring-success/20", Icon: CircleCheck },
  info: { className: "bg-paper text-muted-ink ring-line-strong", Icon: Info },
} as const;

export function Alert({ tone = "danger", children }: { tone?: keyof typeof alertTones; children: ReactNode }) {
  const { className, Icon } = alertTones[tone];
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={cn("flex animate-rise items-start gap-2.5 rounded-xl px-3.5 py-3 text-sm leading-snug ring-1 ring-inset", className)}
    >
      <Icon aria-hidden className="mt-px size-4 shrink-0" />
      <span className="min-w-0 flex-1">{children}</span>
    </div>
  );
}

/** Large icon tile for status screens (link sent, link expired, done). */
export function StatusIcon({ tone = "accent", children }: { tone?: "accent" | "success" | "danger"; children: ReactNode }) {
  const tones = {
    accent: "bg-accent-soft text-accent ring-accent/15",
    success: "bg-success-soft text-success ring-success/15",
    danger: "bg-danger-soft text-danger ring-danger/15",
  };
  return (
    <span className={cn("mb-6 flex size-14 items-center justify-center rounded-2xl ring-1 ring-inset [&>svg]:size-6", tones[tone])}>
      {children}
    </span>
  );
}

const linkClass =
  "rounded-md font-medium text-accent-ink underline-offset-4 transition-colors hover:text-accent hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:text-muted disabled:no-underline";

export function TextLink({ className, ...props }: LinkProps) {
  return <Link className={cn(linkClass, className)} {...props} />;
}

export function TextButton({ className, type = "button", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type={type} className={cn(linkClass, className)} {...props} />;
}
