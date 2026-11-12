// ============================================
// 🌐 Mecatronix Admin: Sign in
// ============================================

import { useEffect, useState, type KeyboardEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, TriangleAlert } from "lucide-react";
import { api } from "../../api/api";
import { describeAuthError, rememberedEmail, safeNext } from "../../lib/auth";
import type { Admin } from "../../lib/types";
import { useFeedback } from "../ui/feedback-context";
import AuthShell from "./AuthShell";
import { Alert, AuthHeading, Button, Field, TextInput, TextLink } from "./AuthUi";

const loginSchema = z.object({
  email: z.string().trim().min(1, "Enter your email address").email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
  remember: z.boolean(),
});

type LoginValues = z.infer<typeof loginSchema>;

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useFeedback();
  // Where to go after signing in (set when a session expired on another page)
  const next = safeNext(useSearchParams()[0].get("next"));
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setFocus,
    resetField,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
    defaultValues: (() => {
      const email = rememberedEmail.get();
      return { email, password: "", remember: Boolean(email) };
    })(),
  });

  // Already signed in (valid cookie): skip the form.
  useEffect(() => {
    let active = true;
    api("auth/check_login").then(
      () => active && navigate(next, { replace: true }),
      () => undefined,
    );
    return () => {
      active = false;
    };
  }, [navigate, next]);

  // Returning admins land straight on the password.
  useEffect(() => {
    setFocus(rememberedEmail.get() ? "password" : "email");
  }, [setFocus]);

  const onSubmit = async ({ email, password, remember }: LoginValues) => {
    setServerError(null);
    try {
      const { data } = await api<Admin>("auth/login", { body: { email, password } });
      rememberedEmail.set(remember ? email : null);
      toast.success(`Welcome back${data?.name ? `, ${data.name.split(" ")[0]}` : ""}!`);
      navigate(next, { replace: true });
    } catch (err) {
      setServerError(describeAuthError(err, "Sign in failed. Please check your details and try again."));
      resetField("password");
      setFocus("password");
    }
  };

  const trackCapsLock = (event: KeyboardEvent<HTMLInputElement>) => setCapsLock(event.getModifierState?.("CapsLock") ?? false);

  const passwordMessage = errors.password?.message;

  return (
    <AuthShell title="Sign in">
      <AuthHeading eyebrow="Secure sign in" title="Welcome back" description="Sign in with your Mecatronix admin account to continue." />

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
        {serverError && <Alert>{serverError}</Alert>}

        <Field label="Email address" htmlFor="email" error={errors.email?.message}>
          <TextInput
            id="email"
            type="email"
            inputMode="email"
            autoComplete="username"
            placeholder="you@mecatronix.com"
            icon={<Mail />}
            invalid={Boolean(errors.email)}
            described={Boolean(errors.email)}
            {...register("email", { onChange: () => setServerError(null) })}
          />
        </Field>

        <Field
          label="Password"
          htmlFor="password"
          error={passwordMessage}
          action={
            <TextLink to="/forgot-password" className="text-[13px]">
              Forgot password?
            </TextLink>
          }
        >
          <TextInput
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Enter your password"
            icon={<LockKeyhole />}
            invalid={Boolean(errors.password)}
            described={Boolean(errors.password)}
            onKeyDown={trackCapsLock}
            onKeyUp={trackCapsLock}
            trailing={
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                className="flex size-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-paper hover:text-ink focus-visible:outline-2 focus-visible:outline-accent"
              >
                {showPassword ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
              </button>
            }
            {...register("password", {
              onChange: () => setServerError(null),
              onBlur: () => setCapsLock(false),
            })}
          />
          {capsLock && !passwordMessage && (
            <p className="flex animate-rise items-center gap-1.5 text-xs text-warning">
              <TriangleAlert aria-hidden className="size-3.5" />
              Caps Lock is on
            </p>
          )}
        </Field>

        <label className="flex w-fit cursor-pointer items-center gap-2.5 text-sm text-muted-ink select-none">
          <input
            type="checkbox"
            className="size-4 cursor-pointer rounded border-line-strong accent-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            {...register("remember")}
          />
          Remember my email on this device
        </label>

        <Button type="submit" loading={isSubmitting} icon={<ArrowRight />} className="mt-1 w-full">
          {isSubmitting ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <p className="mt-8 border-t border-line pt-6 text-center text-[13px] leading-relaxed text-muted">
        Need access? Ask an existing Mecatronix administrator to create an account for you.
      </p>
    </AuthShell>
  );
};

export default Auth;
