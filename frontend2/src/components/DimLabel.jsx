import React from "react";

/**
 * Small blueprint-style annotation used throughout the app wherever we
 * label something with a measurement, id, or short tag — echoing how a
 * real floor plan calls out dimensions. This is InDwell's signature
 * structural device.
 */
export default function DimLabel({ children, className = "" }) {
  return <span className={`dim-label ${className}`}>{children}</span>;
}
