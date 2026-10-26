import { toast, type ToastOptions } from "react-toastify";

type ApiErrorShape = {
  message?: unknown;
  response?: {
    data?: {
      message?: unknown;
      error?: unknown;
    };
  };
};

const defaults: ToastOptions = {
  position: "top-right",
  pauseOnHover: true,
  draggable: true,
  closeOnClick: true,
  theme: "dark",
};

const asMessage = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim() ? value.trim() : undefined;

export const getErrorMessage = (
  error: unknown,
  fallback = "Something went wrong. Please try again.",
) => {
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message || fallback;

  const candidate = error as ApiErrorShape | null | undefined;
  return (
    asMessage(candidate?.response?.data?.message) ??
    asMessage(candidate?.response?.data?.error) ??
    asMessage(candidate?.message) ??
    fallback
  );
};

export const errorNotification = (error: unknown, fallback?: string) => {
  const message = getErrorMessage(error, fallback);
  return toast.error(message, {
    ...defaults,
    autoClose: 4500,
    toastId: `error:${message}`,
  });
};

export const successNotification = (response: unknown) => {
  const candidate = response as { data?: { message?: unknown }; message?: unknown } | null;
  const message =
    asMessage(candidate?.data?.message) ??
    asMessage(candidate?.message) ??
    asMessage(response) ??
    "Completed successfully.";

  return toast.success(message, {
    ...defaults,
    autoClose: 2800,
    toastId: `success:${message}`,
  });
};

export const customWarning = (message = "Please check your input.") =>
  toast.warning(message, {
    ...defaults,
    autoClose: 3500,
    toastId: `warning:${message}`,
  });

export const customUploadError = (fileType = "file") =>
  customWarning(`Please upload a valid ${fileType} image.`);
