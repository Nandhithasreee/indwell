import {
  faArrowsRotate,
  faCube,
  faDownload,
  faFloppyDisk,
  faWandMagicSparkles,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { motion } from "framer-motion";
import jsPDF from "jspdf";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import DimLabel from "../components/DimLabel.jsx";
import { imageForRoomType } from "../constants/images.js";
import DashboardLayout from "../layouts/DashboardLayout.jsx";
import { designService } from "../services/designService.js";

const ROOM_TYPES = ["Bedroom", "Living room", "Kitchen", "Home office", "Kids room", "Dining room"];
const STYLES = ["Scandinavian", "Modern minimalist", "Industrial", "Bohemian", "Japandi", "Mid-century"];

const INITIAL_FORM = {
  room_type: "Bedroom",
  length_ft: 12,
  width_ft: 15,
  interior_style: "Scandinavian",
  color_palette: "",
  prompt: "",
};

export default function GenerateDesign() {
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // { design, presentation }

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const data = await designService.generate(form);
      setResult({ design: data.design, presentation: data.presentation });
      toast.success("Your room is ready.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Generation failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    if (!result) return;
    setLoading(true);
    try {
      const data = await designService.regenerate(result.design.id);
      setResult({ design: data.design, presentation: data.presentation });
      toast.success("Regenerated a fresh version.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't regenerate.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!result) return;
    try {
      await designService.toggleSave(result.design.id);
      toast.success("Saved to your designs.");
    } catch {
      toast.error("Couldn't save the design.");
    }
  };

  const handleDownloadPdf = () => {
    if (!result) return;
    const { design, presentation } = result;
    const doc = new jsPDF();
    let y = 18;
    doc.setFontSize(18);
    doc.text("InDwell — Design Summary", 14, y);
    y += 10;
    doc.setFontSize(11);
    doc.text(`${design.room_type} · ${design.interior_style} · ${design.length_ft}ft x ${design.width_ft}ft`, 14, y);
    y += 10;
    doc.setFontSize(13);
    doc.text("Enhanced Prompt", 14, y);
    y += 7;
    doc.setFontSize(10);
    const promptLines = doc.splitTextToSize(presentation.enhanced_prompt || "", 180);
    doc.text(promptLines, 14, y);
    y += promptLines.length * 5 + 8;

    doc.setFontSize(13);
    doc.text("Summary", 14, y);
    y += 7;
    doc.setFontSize(10);
    const summaryLines = doc.splitTextToSize(presentation.summary || "", 180);
    doc.text(summaryLines, 14, y);

    doc.save(`indwell-${design.room_type.toLowerCase().replace(/\s+/g, "-")}.pdf`);
  };

  return (
    <DashboardLayout>
      <DimLabel>Generate design</DimLabel>
      <h1 className="mt-2 font-display text-3xl font-medium text-linen light:text-deep">
        Tell InDwell about your room
      </h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[380px_1fr]">
        {/* Form */}
        <form onSubmit={handleGenerate} className="glass-card space-y-4 overflow-hidden p-6">
          <div className="relative -m-6 mb-2 h-32 overflow-hidden">
            <motion.img
              key={form.room_type}
              src={imageForRoomType(form.room_type)}
              alt={form.room_type}
              initial={{ opacity: 0, scale: 1.08 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent" />
            <span className="absolute bottom-3 left-4 font-mono text-[10px] uppercase tracking-widest text-brass">
              {form.room_type} · live preview
            </span>
          </div>

          <Field label="Room type">
            <select className="input-field" value={form.room_type} onChange={update("room_type")}>
              {ROOM_TYPES.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Length (ft)">
              <input type="number" min="4" className="input-field" value={form.length_ft} onChange={update("length_ft")} />
            </Field>
            <Field label="Width (ft)">
              <input type="number" min="4" className="input-field" value={form.width_ft} onChange={update("width_ft")} />
            </Field>
          </div>

          <Field label="Interior style">
            <select className="input-field" value={form.interior_style} onChange={update("interior_style")}>
              {STYLES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>

          <Field label="Preferred color palette">
            <input
              placeholder="e.g. warm neutrals, sage green"
              className="input-field"
              value={form.color_palette}
              onChange={update("color_palette")}
            />
          </Field>

          <Field label="Prompt your room">
            <textarea
              rows={4}
              placeholder="Describe your room ."
              className="input-field resize-none"
              value={form.prompt}
              onChange={update("prompt")}
            />
          </Field>

          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
            <FontAwesomeIcon icon={faWandMagicSparkles} className="text-xs" />
            {loading ? "Designing your room..." : "Generate design"}
          </button>
        </form>

        {/* Results */}
        <div>
          {loading && <LoadingState />}

          {!loading && !result && (
            <div className="glass-card relative flex h-full min-h-[420px] flex-col items-center justify-center gap-3 overflow-hidden p-12 text-center">
              <img src={imageForRoomType(form.room_type)} alt="" className="absolute inset-0 h-full w-full object-cover opacity-15" />
              <FontAwesomeIcon icon={faCube} className="relative text-3xl text-brass/60" />
              <p className="relative text-sm text-muted light:text-muted-light">
                Fill in the brief and generate to see your AI design summary here.
              </p>
            </div>
          )}

          {!loading && result && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="glass-card overflow-hidden">
                <div className="relative h-64 sm:h-80">
                  <img
                    src={result.design.image_url || imageForRoomType(result.design.room_type)}
                    alt="AI-generated interior"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/30 to-transparent" />
                </div>
                <div className="p-6 pt-0 -mt-12 relative">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <DimLabel>{result.design.room_type} · {result.design.interior_style}</DimLabel>
                    <div className="flex flex-wrap gap-2">
                      <ActionButton icon={faCube} label="View 3D" onClick={() => navigate(`/room/${result.design.id}`)} primary />
                      <ActionButton icon={faFloppyDisk} label="Save" onClick={handleSave} />
                      <ActionButton icon={faDownload} label="PDF" onClick={handleDownloadPdf} />
                      <ActionButton icon={faArrowsRotate} label="Regenerate" onClick={handleRegenerate} />
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-linen light:text-deep">
                    {result.presentation.enhanced_prompt}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-muted light:text-muted-light">{label}</label>
      {children}
    </div>
  );
}

function ActionButton({ icon, label, onClick, primary }) {
  return (
    <button
      onClick={onClick}
      className={
        primary
          ? "btn-primary !py-2 !px-4 text-xs"
          : "btn-ghost !py-2 !px-4 text-xs"
      }
    >
      <FontAwesomeIcon icon={icon} className="text-[11px]" /> {label}
    </button>
  );
}

function LoadingState() {
  const steps = ["Reading your brief", "Prompting Gemini", "Validating room schema", "Placing furniture"];
  return (
    <div className="glass-card flex h-full min-h-[420px] flex-col items-center justify-center gap-6 p-12 text-center">
      <div className="h-12 w-12 animate-spin rounded-full border-2 border-brass/25 border-t-brass" />
      <div className="space-y-2">
        {steps.map((s, i) => (
          <motion.p
            key={s}
            initial={{ opacity: 0.3 }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.3 }}
            className="font-mono text-xs uppercase tracking-wide text-muted"
          >
            {s}
          </motion.p>
        ))}
      </div>
    </div>
  );
}
