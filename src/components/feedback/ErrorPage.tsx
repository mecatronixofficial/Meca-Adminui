import { ArrowLeft, House, RefreshCw, TriangleAlert } from "lucide-react";
import { useEffect } from "react";
import { isRouteErrorResponse, Link, useRouteError } from "react-router-dom";
import { buttonClass } from "../ui/button-class";

type ErrorPageProps = {
  statusCode?: number;
  title?: string;
  message?: string;
};

/** Route-level error and 404 screen. */
const ErrorPage = ({ statusCode, title, message }: ErrorPageProps) => {
  const routeError = useRouteError();
  const routeStatus = isRouteErrorResponse(routeError) ? routeError.status : undefined;
  const status = statusCode ?? routeStatus ?? 500;
  const isNotFound = status === 404;

  const heading = title ?? (isNotFound ? "Page not found" : "Something went wrong");
  const description =
    message ??
    (isNotFound
      ? "The admin page you requested doesn't exist or may have moved."
      : "This page couldn't finish loading. Your data hasn't been changed.");

  useEffect(() => {
    document.title = `${heading} · Mecatronix Admin`;
    if (routeError && !isNotFound) console.error(routeError);
  }, [heading, routeError, isNotFound]);

  return (
    <main className="relative isolate flex min-h-dvh items-center justify-center overflow-hidden bg-paper px-4 py-12">
      <div
        aria-hidden
        className="bg-grid-light pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]"
      />
      <section className="w-full max-w-lg rounded-2xl border border-line bg-white p-8 text-center shadow-lift sm:p-10">
        <div className="mx-auto mb-6 flex size-14 items-center justify-center rounded-2xl bg-accent-soft text-accent ring-1 ring-accent/15 ring-inset">
          <TriangleAlert className="size-6" aria-hidden />
        </div>
        <p className="text-label text-accent-ink">Error {status}</p>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink">{heading}</h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted-ink">{description}</p>

        <div className="mt-8 flex flex-col justify-center gap-2 sm:flex-row">
          {!isNotFound && (
            <button type="button" onClick={() => window.location.reload()} className={buttonClass("primary")}>
              <RefreshCw className="size-4" /> Retry
            </button>
          )}
          <button type="button" onClick={() => window.history.back()} className={buttonClass("secondary")}>
            <ArrowLeft className="size-4" /> Go back
          </button>
          <Link to="/mec-admin" className={buttonClass(isNotFound ? "primary" : "secondary")}>
            <House className="size-4" /> Dashboard
          </Link>
        </div>
      </section>
    </main>
  );
};

export default ErrorPage;
