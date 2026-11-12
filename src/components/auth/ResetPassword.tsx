// ============================================
// 🔑 Mecatronix Admin: Set a new password
// ============================================

import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, CircleCheck, Eye, EyeOff, KeyRound, LoaderCircle, LockKeyhole, TriangleAlert } from "lucide-react";
import { api, ApiError } from "../../api/api";
import { describeAuthError, passwordRules, passwordScore } from "../../lib/auth";
import { cn } from "../../lib/cn";
import AuthShell from "./AuthShell";
import { Alert, AuthHeading, Button, Field, StatusIcon, TextInput, TextLink } from "./AuthUi";

/** Length is mandatory (server minimum); plus any two of upper / number / symbol. */
const MIN_SCORE = 3;

const schema = z
  .object({
    password: z
      .string()
      .min(8, "Use at least 8 characters")
      .refine((value) => passwordScore(value) >= MIN_SCORE, "Add two of: an uppercase letter, a number, a symbol"),
    confirm: z.string().min(1, "Re-enter the new password"),
  })
  .refine((values) => values.password === values.confirm, { path: ["confirm"], message: "Passwords don't match" });

type Values = z.infer<typeof schema>;

const strengthLevels = [
  { label: "Too weak", bar: "bg-danger", text: "text-danger" },
  { label: "Too weak", bar: "bg-danger", text: "text-danger" },
  { label: "Fair", bar: "bg-warning", text: "text-warning" },
  { label: "Good", bar: "bg-success", text: "text-success" },
  { label: "Strong", bar: "bg-success", text: "text-success" },
];

function StrengthMeter({ value }: { value: string }) {
  const score = passwordScore(value);
  const level = strengthLevels[score];
  return (
    <div className="mt-1 flex flex-col gap-3 rounded-xl border border-line bg-paper/70 p-3.5">
      <div className="flex items-center gap-3">
        <div className="grid flex-1 grid-cols-4 gap-1.5" aria-hidden>
          {[1, 2, 3, 4].map((step) => (
            <span key={step} className={cn("h-1.5 rounded-full transition-colors duration-300", value && score >= step ? level.bar : "bg-line-strong")} />
          ))}
        </div>
        <span className={cn("w-14 text-right font-mono text-[11px] tracking-wide uppercase", value ? level.text : "text-muted")} aria-live="polite">
          {value ? level.label : "—"}
        </span>
      </div>
      <ul className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
        {passwordRules.map((rule) => {
          const met = rule.test(value);
          return (
            <li key={rule.id} className={cn("flex items-center gap-1.5 transition-colors", met ? "text-success" : "text-muted")}>
              <span
                className={cn(
                  "flex size-3.5 shrink-0 items-center justify-center rounded-full transition-colors",
                  met ? "bg-success text-white" : "ring-1 ring-line-strong ring-inset",
                )}
              >
                {met && <Check aria-hidden className="size-2.5" strokeWidth={3} />}
              </span>
              {rule.label}
              <span className="sr-only">{met ? "(met)" : "(not met)"}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

type Stage = "verifying" | "invalid" | "form" | "done";

const ResetPassword = () => {
  const { token = "" } = useParams();
  const navigate = useNavigate();
  const [stage, setStage] = useState<Stage>(token ? "verifying" : "invalid");
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema), mode: "onTouched", defaultValues: { password: "", confirm: "" } });

  const password = useWatch({ control, name: "password" });

  useEffect(() => {
    if (!token) return;
    let active = true;
    api("auth/verifyresettoken", { body: { token } }).then(
      () => active && setStage("form"),
      () => active && setStage("invalid"),
    );
    return () => {
      active = false;
    };
  }, [token]);

  useEffect(() => {
    if (stage === "form") setFocus("password");
  }, [stage, setFocus]);

  const onSubmit = async ({ password: newPassword }: Values) => {
    setServerError(null);
    try {
      await api("auth/reset_password", { body: { token, newPassword } });
      setStage("done");
    } catch (err) {
      if (err instanceof ApiError && err.status === 400 && /reset link/i.test(err.message)) {
        // Token expired or was already used while the form was open
        setStage("invalid");
        return;
      }
      setServerError(describeAuthError(err, "We couldn't reset your password. Please try again."));
    }
  };

  if (stage === "verifying") {
    return (
      <AuthShell title="Verifying link">
        <div role="status" className="flex flex-col items-center gap-4 py-10 text-center">
          <LoaderCircle aria-hidden className="size-7 animate-spin text-accent" />
          <p className="text-sm text-muted-ink">Checking your reset link…</p>
        </div>
      </AuthShell>
    );
  }

  if (stage === "invalid") {
    return (
      <AuthShell title="Link expired">
        <StatusIcon tone="danger">
          <TriangleAlert />
        </StatusIcon>
        <AuthHeading
          title="This link has expired"
          description="Reset links work once and only for 10 minutes. Request a fresh one and use it straight away."
        />
        <Button onClick={() => navigate("/forgot-password")} icon={<ArrowRight />} className="w-full">
          Request a new link
        </Button>
        <TextLink to="/" className="mt-8 inline-flex items-center gap-1.5 text-sm">
          <ArrowLeft aria-hidden className="size-4" />
          Back to sign in
        </TextLink>
      </AuthShell>
    );
  }

  if (stage === "done") {
    return (
      <AuthShell title="Password updated">
        <StatusIcon tone="success">
          <CircleCheck />
        </StatusIcon>
        <AuthHeading title="Password updated" description="Your new password is set. Sign in with it to get back to the console." />
        <Button onClick={() => navigate("/", { replace: true })} icon={<ArrowRight />} className="w-full">
          Continue to sign in
        </Button>
      </AuthShell>
    );
  }

  const visibilityToggle = (
    <button
      type="button"
      onClick={() => setShowPassword((value) => !value)}
      aria-label={showPassword ? "Hide passwords" : "Show passwords"}
      aria-pressed={showPassword}
      className="flex size-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-paper hover:text-ink focus-visible:outline-2 focus-visible:outline-accent"
    >
      {showPassword ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
    </button>
  );

  return (
    <AuthShell title="Set a new password">
      <AuthHeading eyebrow="Account recovery" title="Set a new password" description="Choose a strong password you don't use anywhere else." />

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
        {serverError && <Alert>{serverError}</Alert>}

        <Field label="New password" htmlFor="password" error={errors.password?.message}>
          <TextInput
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Create a password"
            icon={<KeyRound />}
            trailing={visibilityToggle}
            invalid={Boolean(errors.password)}
            described={Boolean(errors.password)}
            {...register("password", { onChange: () => setServerError(null) })}
          />
          <StrengthMeter value={password} />
        </Field>

        <Field label="Confirm password" htmlFor="confirm" error={errors.confirm?.message}>
          <TextInput
            id="confirm"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Re-enter the password"
            icon={<LockKeyhole />}
            invalid={Boolean(errors.confirm)}
            described={Boolean(errors.confirm)}
            {...register("confirm")}
          />
        </Field>

        <Button type="submit" loading={isSubmitting} icon={<ArrowRight />} className="mt-1 w-full">
          {isSubmitting ? "Saving…" : "Update password"}
        </Button>
      </form>

      <TextLink to="/" className="mt-8 inline-flex items-center gap-1.5 text-sm">
        <ArrowLeft aria-hidden className="size-4" />
        Back to sign in
      </TextLink>
    </AuthShell>
  );
};

export default ResetPassword;
