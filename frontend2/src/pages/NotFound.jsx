import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { Link } from "react-router-dom";

import DimLabel from "../components/DimLabel.jsx";
import BackButton from "../components/BackButton.jsx";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-deep px-6 text-center light:bg-surface-light">
      <div className="absolute left-6 top-6"><BackButton fallback="/" /></div>
      <DimLabel>Room not found</DimLabel>
      <h1 className="mt-4 font-display text-6xl font-medium text-brass">404</h1>
      <p className="mt-4 max-w-sm text-muted light:text-muted-light">
        This blueprint doesn't lead anywhere. The page you're looking for doesn't exist.
      </p>
      <Link to="/" className="btn-primary mt-8">
        <FontAwesomeIcon icon={faArrowLeft} className="text-xs" /> Back home
      </Link>
    </div>
  );
}
