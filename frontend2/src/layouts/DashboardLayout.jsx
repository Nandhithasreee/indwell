import {
  faGauge,
  faClockRotateLeft,
  faPlus,
  faRightFromBracket,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AnimatePresence, motion } from "framer-motion";
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import BackButton from "../components/BackButton.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";

const NAV_ITEMS = [
  { label: "Dashboard", icon: faGauge, path: "/dashboard" },
  { label: "Generate design", icon: faPlus, path: "/generate" },
  { label: "History", icon: faClockRotateLeft, path: "/history" },
];

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen bg-deep light:bg-surface-light">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-white/5 px-5 py-8 lg:flex light:border-hairline-light">
        <Link to="/dashboard" className="mb-10 px-2 font-display text-xl font-semibold text-linen light:text-deep">
          In<span className="text-brass">Dwell</span>
        </Link>

        <nav className="flex flex-1 flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const active = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors ${
                  active
                    ? "bg-brass/10 text-brass"
                    : "text-muted hover:bg-white/5 hover:text-linen light:text-muted-light light:hover:bg-black/5 light:hover:text-deep"
                }`}
              >
                <FontAwesomeIcon icon={item.icon} className="w-4" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-muted transition-colors hover:bg-white/5 hover:text-red-400 light:text-muted-light"
        >
          <FontAwesomeIcon icon={faRightFromBracket} className="w-4" />
          Log out
        </button>
      </aside>

      {/* Main column */}
      <div className="flex min-h-screen flex-1 flex-col">
        {/* Topbar */}
        <header className="flex items-center justify-between border-b border-white/5 px-6 py-4 light:border-hairline-light">
          <div className="flex items-center gap-4">
            <BackButton fallback="/dashboard" />
            <button
              onClick={() => navigate("/dashboard")}
              className="font-display text-lg font-semibold text-linen lg:hidden light:text-deep"
            >
              In<span className="text-brass">Dwell</span>
            </button>
            <div className="hidden text-sm text-muted lg:block light:text-muted-light">
              {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />

            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full border border-white/10 py-1.5 pl-1.5 pr-3 light:border-hairline-light"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brass/20 text-brass">
                  <FontAwesomeIcon icon={faUser} className="text-xs" />
                </span>
                <span className="hidden text-sm text-linen sm:block light:text-deep">
                  {user?.username}
                </span>
              </button>

              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="glass-card absolute right-0 top-12 w-48 overflow-hidden !rounded-xl p-1.5"
                  >
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        navigate("/settings");
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-linen hover:bg-white/5 light:text-deep"
                    >
                      <FontAwesomeIcon icon={faUser} className="w-4 text-muted" /> Profile
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-400 hover:bg-white/5"
                    >
                      <FontAwesomeIcon icon={faRightFromBracket} className="w-4" /> Log out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Mobile bottom nav */}
        <nav className="fixed inset-x-0 bottom-0 z-40 flex justify-around border-t border-white/5 bg-deep/95 py-2 backdrop-blur lg:hidden light:border-hairline-light light:bg-surface-light/95">
          {NAV_ITEMS.slice(0, 5).map((item) => {
            const active = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center gap-1 px-2 py-1 text-[10px] ${
                  active ? "text-brass" : "text-muted light:text-muted-light"
                }`}
              >
                <FontAwesomeIcon icon={item.icon} />
                {item.label.split(" ")[0]}
              </button>
            );
          })}
        </nav>

        <main className="flex-1 px-6 pb-24 pt-8 lg:px-10 lg:pb-8">{children}</main>
      </div>
    </div>
  );
}
