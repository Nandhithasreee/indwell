import {
  faArrowRight,
  faClockRotateLeft,
  faPlus,
  faSprayCan,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import DimLabel from "../components/DimLabel.jsx";
import { imageForRoomType, IMAGES } from "../constants/images.js";
import { useAuth } from "../contexts/AuthContext.jsx";
import DashboardLayout from "../layouts/DashboardLayout.jsx";
import { designService } from "../services/designService.js";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    designService
      .stats()
      .then((data) => {
        setRecent(data.recent_designs);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      {/* Welcome banner with real photography */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mb-8 overflow-hidden rounded-2xl border border-white/10"
      >
        <img src={IMAGES.livingRoomFireplace} alt="" className="h-48 w-full object-cover sm:h-56" />
        <div className="absolute inset-0 bg-gradient-to-r from-deep via-deep/70 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-10">
          <DimLabel>Welcome back</DimLabel>
          <h1 className="mt-2 font-display text-3xl font-medium text-linen sm:text-4xl">
            Hi {user?.username}, ready to design?
          </h1>
          <button onClick={() => navigate("/generate")} className="btn-primary mt-5 w-fit">
            <FontAwesomeIcon icon={faPlus} className="text-xs" /> Generate design
          </button>
        </div>
      </motion.div>

      <div className="mt-10 flex items-center justify-between">
        <h2 className="font-display text-xl text-linen light:text-deep">Recent designs</h2>
      </div>

      {loading ? (
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-56 animate-pulse rounded-2xl bg-surface-2/60" />
          ))}
        </div>
      ) : recent.length === 0 ? (
        <EmptyState onHistory={() => navigate("/history")} />
      ) : (
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {recent.map((design, i) => (
            <motion.button
              key={design.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => navigate(`/room/${design.id}`)}
              className="glass-card group overflow-hidden text-left"
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
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-brass opacity-0 transition-opacity group-hover:opacity-100">
                  View in 3D <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
                </span>
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}

function EmptyState({ onHistory }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card relative mt-5 flex flex-col items-center justify-center gap-4 overflow-hidden p-12 text-center"
    >
      <img src={IMAGES.livingRoomWhite} alt="" className="absolute inset-0 h-full w-full object-cover opacity-10" />
      <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-brass/10 text-brass">
        <FontAwesomeIcon icon={faSprayCan} className="text-2xl" />
      </span>
      <div className="relative">
        <h3 className="font-display text-lg text-linen light:text-deep">No designs yet</h3>
        <p className="mt-1 max-w-sm text-sm text-muted light:text-muted-light">
          You haven't created any designs yet. Start your first design to see it here.
        </p>
      </div>
      <button onClick={onHistory} className="btn-primary relative">
        <FontAwesomeIcon icon={faClockRotateLeft} className="text-xs" /> History
      </button>
    </motion.div>
  );
}
