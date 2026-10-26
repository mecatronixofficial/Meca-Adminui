import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion as Motion } from "motion/react";
import { Outlet } from "react-router-dom";
import { X } from "lucide-react";
import Foot from "../foot/Foot";
import Sidenav from "../nav/Sidenav";
import Topnav from "../nav/Topnav";

const Adminlayout = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);

  const toggleSidebar = useCallback(() => {
    setMobileSidebarOpen((prev) => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setMobileSidebarOpen(false);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileSidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileSidebarOpen]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:72px_72px]" />
        <div className="absolute left-0 top-0 h-80 w-80 rounded-full bg-red-600/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-orange-500/10 blur-3xl" />
      </div>

      <aside className="fixed left-0 top-0 z-40 hidden h-screen md:block">
        <Sidenav onCollapseChange={setDesktopSidebarOpen} />
      </aside>

      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <Motion.button
              type="button"
              aria-label="Close sidebar"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm md:hidden"
              onClick={closeSidebar}
            />
            <Motion.aside
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", stiffness: 380, damping: 38 }}
              className="fixed left-0 top-0 z-[60] h-screen md:hidden"
            >
              <div className="relative h-full">
                <button
                  type="button"
                  onClick={closeSidebar}
                  aria-label="Close sidebar"
                  className="absolute right-3 top-3 z-10 rounded-xl border border-zinc-800 bg-zinc-950/90 p-2 text-zinc-300 shadow-lg"
                >
                  <X className="h-5 w-5" />
                </button>
                <Sidenav />
              </div>
            </Motion.aside>
          </>
        )}
      </AnimatePresence>

      <div
        className={`relative flex min-h-screen flex-col transition-[padding] duration-300 ${
          desktopSidebarOpen ? "md:pl-72" : "md:pl-24"
        }`}
      >
        <div className="sticky top-0 z-30">
          <Topnav onToggleSidebar={toggleSidebar} />
        </div>

        <main className="relative flex-1 px-4 py-5 sm:px-6 md:px-8 lg:px-10">
          <Motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="mx-auto w-full max-w-[1500px]"
          >
            <Outlet />
          </Motion.div>
        </main>

        <footer className="relative z-10 border-t border-zinc-800/70 bg-zinc-950/80">
          <Foot />
        </footer>
      </div>

      <style>{`
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default Adminlayout;
