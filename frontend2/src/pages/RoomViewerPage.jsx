import { faArrowsRotate, faFloppyDisk } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";

import BackButton from "../components/BackButton.jsx";
import DimLabel from "../components/DimLabel.jsx";
import RoomViewer3D from "../components/RoomViewer3D.jsx";
import DashboardLayout from "../layouts/DashboardLayout.jsx";
import { designService } from "../services/designService.js";

export default function RoomViewerPage() {
  const { id } = useParams();
  const [design, setDesign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);

  const load = () => {
    setLoading(true);
    designService
      .get(id)
      .then((data) => setDesign(data.design))
      .catch(() => toast.error("Couldn't load that design."))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      const data = await designService.regenerate(id);
      setDesign(data.design);
      toast.success("Scene regenerated.");
    } catch {
      toast.error("Couldn't regenerate.");
    } finally {
      setRegenerating(false);
    }
  };

  const handleToggleSave = async () => {
    try {
      const data = await designService.toggleSave(id);
      setDesign((d) => ({ ...d, is_saved: data.is_saved }));
      toast.success(data.message);
    } catch {
      toast.error("Couldn't update save state.");
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <BackButton fallback="/saved" className="mb-2" />
          <DimLabel>{design ? `${design.room_type} · ${design.interior_style}` : "Loading..."}</DimLabel>
        </div>

        {design && (
          <div className="flex gap-2">
            <button onClick={handleToggleSave} className="btn-ghost !py-2 !px-4 text-xs">
              <FontAwesomeIcon icon={faFloppyDisk} className="text-[11px]" />
              {design.is_saved ? "Saved" : "Save"}
            </button>
            <button onClick={handleRegenerate} disabled={regenerating} className="btn-primary !py-2 !px-4 text-xs disabled:opacity-60">
              <FontAwesomeIcon icon={faArrowsRotate} className="text-[11px]" />
              {regenerating ? "Regenerating..." : "Regenerate"}
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="h-[520px] animate-pulse rounded-2xl bg-surface-2/60" />
      ) : design ? (
        <div className="h-[600px]">
          <RoomViewer3D scene={design.room_json} roomLabel={design.room_type} imageUrl={design.image_url} />
        </div>
      ) : (
        <p className="text-sm text-muted">Design not found.</p>
      )}

      {design && (
        <p className="mt-4 text-xs text-muted light:text-muted-light">
          Drag to look around, use WASD to walk. Use the controls in the bottom-right of the scene
          to reset the view, toggle day/night, screenshot, or go fullscreen.
        </p>
      )}
    </DashboardLayout>
  );
}
