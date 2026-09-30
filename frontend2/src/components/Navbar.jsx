import { faBars, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { motion } from "framer-motion";
import React, { useState } from "react";
import { Link } from "react-router-dom";

import BackButton from "./BackButton.jsx";

const NAV_LINKS = [
  { label: "Features", href: "/#features" },
  { label: "About", href: "/about" },
];

export default function Navbar({ showBack = false }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-deep/80 backdrop-blur-xl light:border-hairline-light light:bg-surface-light/80">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-display text-2xl font-semibold tracking-tight text-linen light:text-deep">
            In<span className="text-brass">Dwell</span>
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-muted transition-colors hover:text-brass"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}>
            <Link to="/login" className="btn-ghost !py-2.5 !px-5 text-sm">
              Sign In
            </Link>
          </motion.div>
          <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}>
            <Link to="/signup" className="btn-primary !py-2.5 !px-5 text-sm">
              Sign Up
            </Link>
          </motion.div>
          {showBack && (
            <>
              <span className="h-5 w-px bg-white/10 light:bg-hairline-light" />
              <BackButton fallback="/" />
            </>
          )}
        </div>

        <button
          className="text-linen md:hidden light:text-deep"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <FontAwesomeIcon icon={open ? faXmark : faBars} className="text-xl" />
        </button>
      </nav>

      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="border-t border-white/5 px-6 pb-6 md:hidden"
        >
          <div className="flex flex-col gap-4 pt-4">
            {showBack && <BackButton fallback="/" />}
            {NAV_LINKS.map((link) => (
              <a key={link.label} href={link.href} className="text-sm text-muted" onClick={() => setOpen(false)}>
                {link.label}
              </a>
            ))}
            <div className="flex items-center gap-3 pt-2">
              <Link to="/login" className="btn-ghost flex-1 text-sm">
                Sign In
              </Link>
              <Link to="/signup" className="btn-primary flex-1 text-sm">
                Sign Up
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </header>
  );
}
