// ============================================
// 🔐 Mecatronix Admin: Forgot password
// ============================================

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Mail, MailCheck, Send } from "lucide-react";
import { api } from "../../api/api";
import { describeAuthError, rememberedEmail } from "../../lib/auth";
import AuthShell from "./AuthShell";
import { Alert, AuthHeading, Button, Field, StatusIcon, TextButton, TextInput, TextLink } from "./AuthUi";

const RESEND_COOLDOWN_S = 30;

const schema = z.object({
  email: z.string().trim().min(1, "Enter your email address").email("Enter a valid email address"),
});

type Values = z.infer<typeof schema>;

const BackToSignIn = () => (
  <TextLink to="/" className="mt-8 inline-flex items-center gap-1.5 text-sm">
    <ArrowLeft aria-hidden className="size-4" />
    Back to sign in
  </TextLink>
);

const ForgotPassword = () => {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [resending, setResending] = useState(false);

  const {
    register,
    handleSubmit,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: { email: rememberedEmail.get() },
  });

  useEffect(() => {
    if (!sentTo) setFocus("email");
  }, [sentTo, setFocus]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = window.setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
  }, [cooldown]);

  const send = async (email: string) => {
    const { message } = await api("auth/forgot_password", { body: { email } });
    setNotice(message || "If the account exists, a password reset email has been sent.");
    setSentTo(email);
    setCooldown(RESEND_COOLDOWN_S);
  };

  const onSubmit = async ({ email }: Values) => {
    setServerError(null);
    try {
      await send(email);
    } catch (err) {
      setServerError(describeAuthError(err, "We couldn't send the reset link. Please try again."));
    }
  };

  const resend = async () => {
    if (!sentTo || cooldown > 0) return;
    setServerError(null);
    setResending(true);
    try {
      await send(sentTo);
    } catch (err) {
      setServerError(describeAuthError(err, "We couldn't resend the link. Please try again."));
    } finally {
      setResending(false);
    }
  };

  if (sentTo) {
    return (
      <AuthShell title="Check your inbox">
        <StatusIcon>
          <MailCheck />
        </StatusIcon>
        <AuthHeading
          title="Check your inbox"
          description={
            <>
              If <span className="font-medium text-ink">{sentTo}</span> belongs to an admin account, a reset link is on its way. It
              expires in 10 minutes.
            </>
          }
        />

        <div className="flex flex-col gap-4">
          {serverError ? <Alert>{serverError}</Alert> : notice && <Alert tone="info">{notice}</Alert>}

          <p className="text-sm text-muted-ink">
            Didn&apos;t get it? Check your spam folder, or{" "}
            <TextButton onClick={resend} disabled={cooldown > 0 || resending}>
              {resending ? "sending…" : cooldown > 0 ? `resend in ${cooldown}s` : "send it again"}
            </TextButton>
            .
          </p>

          <TextButton
            className="w-fit text-sm"
            onClick={() => {
              setSentTo(null);
              setNotice(null);
              setServerError(null);
            }}
          >
            Use a different email
          </TextButton>
        </div>

        <BackToSignIn />
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Reset password">
      <AuthHeading
        eyebrow="Account recovery"
        title="Forgot your password?"
        description="Enter the email on your admin account and we'll send you a secure link to set a new one."
      />

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

        <Button type="submit" loading={isSubmitting} icon={<Send />} className="mt-1 w-full">
          {isSubmitting ? "Sending link…" : "Send reset link"}
        </Button>
      </form>

      <BackToSignIn />
    </AuthShell>
  );
};

export default ForgotPassword;
