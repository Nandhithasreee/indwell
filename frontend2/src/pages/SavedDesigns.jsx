import { faCube, faLayerGroup, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import DimLabel from "../components/DimLabel.jsx";
import { imageForRoomType } from "../constants/images.js";
import DashboardLayout from "../layouts/DashboardLayout.jsx";
import { designService } from "../services/designService.js";

export default function SavedDesigns() {
  const navigate = useNavigate();
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSavedOnly, setShowSavedOnly] = useState(true);

  const load = () => {
    setLoading(true);
    designService
      .list(showSavedOnly)
      .then(setDesigns)
      .finally(() => setLoading(false));
  };

  useEffect(load, [showSavedOnly]);

  const handleDelete = async (id) => {
    try {
      await designService.remove(id);
      setDesigns((d) => d.filter((x) => x.id !== id));
      toast.success("Design deleted.");
    } catch {
      toast.error("Couldn't delete design.");
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <DimLabel>Your library</DimLabel>
          <h1 className="mt-2 font-display text-3xl font-medium text-linen light:text-deep">
            {showSavedOnly ? "Saved designs" : "All designs"}
          </h1>
        </div>
        <div className="flex gap-2 rounded-full border border-white/10 p-1 light:border-hairline-light">
          <ToggleTab active={showSavedOnly} onClick={() => setShowSavedOnly(true)}>Saved</ToggleTab>
          <ToggleTab active={!showSavedOnly} onClick={() => setShowSavedOnly(false)}>All</ToggleTab>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-56 animate-pulse rounded-2xl bg-surface-2/60" />
          ))}
        </div>
      ) : designs.length === 0 ? (
        <div className="glass-card flex flex-col items-center gap-3 p-12 text-center">
          <FontAwesomeIcon icon={faLayerGroup} className="text-2xl text-brass/60" />
          <p className="text-sm text-muted light:text-muted-light">Nothing here yet.</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {designs.map((design, i) => (
            <motion.div
              key={design.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card group overflow-hidden"
            >
              <div className="relative h-36 overflow-hidden">
                <img
                  src={imageForRoomType(design.room_type)}
                  alt={design.room_type}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <span className="absolute left-3 top-3 rounded-full bg-black/50 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-brass backdrop-blur">
                  {design.interior_style}
                </span>
              </div>
              <div className="p-5">
                <h3 className="font-display text-lg text-linen light:text-deep">{design.room_type}</h3>
                <p className="mt-1 text-xs text-muted light:text-muted-light">
                  {design.length_ft}ft × {design.width_ft}ft · ₹{Number(design.budget).toLocaleString("en-IN")}
                </p>
                <div className="mt-4 flex gap-2">
                  <button onClick={() => navigate(`/room/${design.id}`)} className="btn-primary !py-2 !px-3 text-xs">
                    <FontAwesomeIcon icon={faCube} className="text-[11px]" /> View 3D
                  </button>
                  <button onClick={() => handleDelete(design.id)} className="btn-ghost !py-2 !px-3 text-xs text-red-400">
                    <FontAwesomeIcon icon={faTrash} className="text-[11px]" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}

function ToggleTab({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
        active ? "bg-brass text-deep" : "text-muted hover:text-brass"
      }`}
    >
      {children}
    </button>
  );
}
