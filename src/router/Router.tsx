/* eslint-disable react-refresh/only-export-components */
import { lazy, Suspense, useEffect, useState, type ReactNode } from "react";
import { createBrowserRouter, Navigate, Outlet, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { checkLoginStatus } from "../api/api";
import { isLoginSuccess } from "../redux/slices/authSlice";
import ErrorPage from "../components/feedback/ErrorPage";

const Adminlayout = lazy(() => import("../components/layout/Adminlayout"));
const Auth = lazy(() => import("../components/auth/Auth"));
const ForgotPassword = lazy(() => import("../components/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("../components/auth/ResetPassword"));
const Admin = lazy(() => import("../components/admin/Admin"));
const Dash = lazy(() => import("../pages/dash/Dash"));
const Blogs = lazy(() => import("../pages/blogs/Blogs"));
const Banners = lazy(() => import("../pages/banners/Banners"));
const Clients = lazy(() => import("../pages/clients/Clients"));
const Enquiries = lazy(() => import("../pages/enquiries/Enquiries"));
const SingleEnquiry = lazy(() => import("../pages/enquiries/Singleenquirie"));
const Reviews = lazy(() => import("../pages/reviews/Reviews"));
const Subscribers = lazy(() => import("../pages/subscribers/Subscribers"));
const Voucher = lazy(() => import("../pages/voucher/Voucher"));
const Invoice = lazy(() => import("../pages/invoice/Invoice"));
const Quotation = lazy(() => import("../pages/quotation/Quotation"));
const Projects = lazy(() => import("../pages/projects/Projects"));
const Work = lazy(() => import("../pages/work/Work"));

const RouteLoader = () => (
  <div className="flex min-h-screen items-center justify-center" role="status" aria-label="Loading page">
    <div className="h-10 w-10 animate-spin rounded-full border-2 border-gray-200 border-t-red-500" />
  </div>
);

const deferred = (element: ReactNode) => <Suspense fallback={<RouteLoader />}>{element}</Suspense>;

const PrivateRoute = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    let active = true;
    const verifySession = async () => {
      try {
        const response = await checkLoginStatus();
        if (!active) return;
        if (response?.success) {
          const data = response.data ?? {};
          dispatch(isLoginSuccess({
            _id: data._id || data.id,
            name: data.name,
            email: data.email,
            role: data.role,
            phone: data.phone,
            img: data.img,
          }));
          setIsAuthenticated(true);
        } else {
          navigate("/", { replace: true });
        }
      } catch {
        if (active) navigate("/", { replace: true });
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void verifySession();
    return () => { active = false; };
  }, [dispatch, navigate]);

  if (isLoading) return <RouteLoader />;
  return isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
};

const router = createBrowserRouter([
  { path: "/", element: deferred(<Auth />), errorElement: <ErrorPage /> },
  { path: "/forgot-password", element: deferred(<ForgotPassword />), errorElement: <ErrorPage /> },
  { path: "/reset-password/:token", element: deferred(<ResetPassword />), errorElement: <ErrorPage /> },
  {
    element: <PrivateRoute />,
    children: [{
      path: "/mec-admin",
      element: deferred(<Adminlayout />),
      errorElement: <ErrorPage />,
      children: [
        { index: true, element: deferred(<Dash />) },
        { path: "blogs", element: deferred(<Blogs />) },
        { path: "banners", element: deferred(<Banners />) },
        { path: "clients", element: deferred(<Clients />) },
        { path: "enquiries", element: deferred(<Enquiries />) },
        { path: "enquiries/:id", element: deferred(<SingleEnquiry />) },
        { path: "reviews", element: deferred(<Reviews />) },
        { path: "subscribers", element: deferred(<Subscribers />) },
        { path: "voucher", element: deferred(<Voucher />) },
        { path: "invoice", element: deferred(<Invoice />) },
        { path: "quotation", element: deferred(<Quotation />) },
        { path: "project", element: deferred(<Projects />) },
        { path: "work", element: deferred(<Work />) },
        { path: "admin", element: deferred(<Admin />) },
      ],
    }],
  },
  { path: "*", element: <ErrorPage statusCode={404} /> },
]);

export default router;
