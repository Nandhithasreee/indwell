import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { motion } from "framer-motion";
import React from "react";
import { useNavigate } from "react-router-dom";

/**
 * Consistent "Back" affordance for every internal page (everything except
 * the landing page). Navigates to the previous history entry, falling back
 * to `fallback` if there's nowhere to go back to (e.g. direct link visit).
 */
export default function BackButton({ fallback = "/dashboard", label = "Back", className = "" }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate(fallback);
    }
  };

  return (
    <motion.button
      onClick={handleClick}
      whileHover={{ x: -3 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={`inline-flex items-center gap-2 text-xs font-medium text-muted transition-colors hover:text-brass light:text-muted-light ${className}`}
    >
      <FontAwesomeIcon icon={faArrowLeft} className="text-[11px]" />
      {label}
    </motion.button>
  );
}
