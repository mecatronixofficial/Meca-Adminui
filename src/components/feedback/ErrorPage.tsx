import { AlertTriangle, ArrowLeft, House, RefreshCw } from "lucide-react";
import { isRouteErrorResponse, Link, useRouteError } from "react-router-dom";

type ErrorPageProps = {
  statusCode?: number;
  title?: string;
  message?: string;
};

const ErrorPage = ({ statusCode, title, message }: ErrorPageProps) => {
  const routeError = useRouteError();
  const routeStatus = isRouteErrorResponse(routeError) ? routeError.status : undefined;
  const status = statusCode ?? routeStatus ?? 500;
  const isNotFound = status === 404;

  const heading = title ?? (isNotFound ? "Page not found" : "Something went wrong");
  const description = message ?? (
    isNotFound
      ? "The admin page you requested does not exist or may have moved."
      : "The dashboard could not finish loading this page. Your data has not been changed."
  );

  return (
    <main className="flex min-h-[70vh] items-center justify-center px-4 py-12 text-zinc-100">
      <section className="w-full max-w-xl rounded-3xl border border-zinc-800 bg-zinc-900/80 p-8 text-center shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-12">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-400 ring-1 ring-red-500/20">
          <AlertTriangle className="h-8 w-8" aria-hidden="true" />
        </div>
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-red-400">Error {status}</p>
        <h1 className="text-3xl font-bold text-white sm:text-4xl">{heading}</h1>
        <p className="mx-auto mt-4 max-w-md leading-7 text-zinc-400">{description}</p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          {!isNotFound && (
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-orange-500 px-5 py-3 font-semibold text-white transition hover:brightness-110"
            >
              <RefreshCw className="h-4 w-4" /> Retry
            </button>
          )}
          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800 px-5 py-3 font-semibold text-zinc-200 transition hover:bg-zinc-700"
          >
            <ArrowLeft className="h-4 w-4" /> Go back
          </button>
          <Link
            to="/mec-admin"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-700 px-5 py-3 font-semibold text-zinc-200 transition hover:bg-zinc-800"
          >
            <House className="h-4 w-4" /> Dashboard
          </Link>
        </div>
      </section>
    </main>
  );
};

export default ErrorPage;
