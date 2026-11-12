/* eslint-disable react-refresh/only-export-components */
import { lazy, Suspense, type ReactNode } from "react";
import { createBrowserRouter, Navigate, useParams } from "react-router-dom";
import ErrorPage from "../components/feedback/ErrorPage";
import { Spinner } from "../components/ui/ui";

const AdminShell = lazy(() => import("../components/layout/AdminShell"));
const Auth = lazy(() => import("../components/auth/Auth"));
const ForgotPassword = lazy(() => import("../components/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("../components/auth/ResetPassword"));
const Dash = lazy(() => import("../pages/dash/Dash"));
const Enquiries = lazy(() => import("../pages/enquiries/Enquiries"));
const Previews = lazy(() => import("../pages/previews/Previews"));
const Reviews = lazy(() => import("../pages/reviews/Reviews"));
const Subscribers = lazy(() => import("../pages/subscribers/Subscribers"));
const Banners = lazy(() => import("../pages/banners/Banners"));
const Team = lazy(() => import("../pages/team/Team"));
const Blogs = lazy(() => import("../pages/blogs/Blogs"));
const Work = lazy(() => import("../pages/work/Work"));
const Projects = lazy(() => import("../pages/projects/Projects"));
const Clients = lazy(() => import("../pages/clients/Clients"));
const ContactSettings = lazy(() => import("../pages/contact/ContactSettings"));
const Invoice = lazy(() => import("../pages/invoice/Invoice"));
const InvoiceView = lazy(() => import("../pages/invoice/InvoiceView"));
const Quotation = lazy(() => import("../pages/quotation/Quotation"));
const Voucher = lazy(() => import("../pages/voucher/Voucher"));
const Admins = lazy(() => import("../pages/admins/Admins"));
const Account = lazy(() => import("../pages/account/Account"));

const RouteLoader = () => <Spinner className="min-h-dvh bg-paper" />;

/** Full-page routes (sign-in flow and the shell itself) wait with a full-page loader. */
const deferred = (element: ReactNode) => <Suspense fallback={<RouteLoader />}>{element}</Suspense>;

/** Old enquiry detail URLs open the enquiry in the list's viewer. */
function EnquiryRedirect() {
  const { id = "" } = useParams();
  return <Navigate to={`/mec-admin/enquiries?open=${encodeURIComponent(id)}`} replace />;
}

const router = createBrowserRouter([
  { path: "/", element: deferred(<Auth />), errorElement: <ErrorPage /> },
  // Server emails link to `${ADMIN_URL}/login`; keep one canonical sign-in URL.
  { path: "/login", element: <Navigate to="/" replace /> },
  { path: "/forgot-password", element: deferred(<ForgotPassword />), errorElement: <ErrorPage /> },
  { path: "/reset-password/:token", element: deferred(<ResetPassword />), errorElement: <ErrorPage /> },
  {
    path: "/mec-admin",
    // AdminShell checks the session and renders pages (lazy, inside its own Suspense) in <Outlet />
    element: deferred(<AdminShell />),
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Dash /> },
      { path: "enquiries", element: <Enquiries /> },
      { path: "enquiries/:id", element: <EnquiryRedirect /> },
      { path: "previews", element: <Previews /> },
      { path: "reviews", element: <Reviews /> },
      { path: "subscribers", element: <Subscribers /> },
      { path: "banners", element: <Banners /> },
      { path: "team", element: <Team /> },
      { path: "blogs", element: <Blogs /> },
      { path: "work", element: <Work /> },
      { path: "project", element: <Projects /> },
      { path: "clients", element: <Clients /> },
      { path: "contact", element: <ContactSettings /> },
      { path: "invoice", element: <Invoice /> },
      { path: "invoice/:id", element: <InvoiceView /> },
      { path: "quotation", element: <Quotation /> },
      { path: "voucher", element: <Voucher /> },
      { path: "admin", element: <Admins /> },
      { path: "account", element: <Account /> },
      { path: "*", element: <ErrorPage statusCode={404} /> },
    ],
  },
  { path: "*", element: <ErrorPage statusCode={404} /> },
]);

export default router;
