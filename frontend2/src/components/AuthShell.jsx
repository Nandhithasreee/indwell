import { motion } from "framer-motion";
import React from "react";
import { Link } from "react-router-dom";

import BackButton from "./BackButton.jsx";
import { IMAGES } from "../constants/images.js";
import DimLabel from "./DimLabel.jsx";

export default function AuthShell({ eyebrow, title, subtitle, children, photo = IMAGES.bedroomCozy }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col justify-center bg-deep px-6 py-12 sm:px-12 lg:px-20">
        <div className="mb-10 flex items-center justify-between">
          <Link to="/" className="font-display text-2xl font-semibold text-linen">
            In<span className="text-brass">Dwell</span>
          </Link>
          <BackButton fallback="/" />
        </div>
        <DimLabel>{eyebrow}</DimLabel>
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-4 font-display text-3xl font-medium text-linen sm:text-4xl"
        >
          {title}
        </motion.h1>
        {subtitle && <p className="mt-3 text-sm text-muted">{subtitle}</p>}

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-10 max-w-sm"
        >
          {children}
        </motion.div>
      </div>

      <div className="relative hidden overflow-hidden bg-surface lg:block">
        <motion.img
          src={photo}
          alt=""
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 8, ease: "easeOut" }}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-deep via-deep/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-l from-deep/60 via-transparent to-transparent" />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="absolute bottom-12 left-12 right-12 rounded-2xl border border-white/10 bg-black/30 p-6 backdrop-blur"
        >
          <p className="font-display text-lg italic text-linen">
            "It felt like walking through the room before it existed."
          </p>
          <p className="mt-3 dim-label !justify-start">Generated with InDwell</p>
        </motion.div>
      </div>
    </div>
  );
}
