import {
  faArrowsRotate,
  faClockRotateLeft,
  faDownload,
  faFloppyDisk,
  faTrash,
  faWandMagicSparkles,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";

import DimLabel from "../components/DimLabel.jsx";
import DashboardLayout from "../layouts/DashboardLayout.jsx";
import { designService } from "../services/designService.js";

const ACTION_META = {
  generated: { icon: faWandMagicSparkles, label: "Generated a design", color: "text-brass" },
  saved: { icon: faFloppyDisk, label: "Saved a design", color: "text-sage" },
  regenerated: { icon: faArrowsRotate, label: "Regenerated a design", color: "text-brass" },
  deleted: { icon: faTrash, label: "Deleted a design", color: "text-red-400" },
  downloaded_pdf: { icon: faDownload, label: "Downloaded PDF", color: "text-sage" },
};

export default function History() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    designService.history().then(setLogs).finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <DimLabel>Activity</DimLabel>
      <h1 className="mt-2 font-display text-3xl font-medium text-linen light:text-deep">History</h1>

      <div className="mt-8 glass-card p-2">
        {loading ? (
          <div className="space-y-2 p-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded-xl bg-surface-2/60" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center gap-3 p-12 text-center">
            <FontAwesomeIcon icon={faClockRotateLeft} className="text-2xl text-brass/60" />
            <p className="text-sm text-muted light:text-muted-light">No activity yet.</p>
          </div>
        ) : (
          <ul className="divide-y divide-white/5 light:divide-hairline-light">
            {logs.map((log) => {
              const meta = ACTION_META[log.action] || ACTION_META.generated;
              return (
                <li key={log.id} className="flex items-center gap-4 p-4">
                  <span className={`flex h-10 w-10 items-center justify-center rounded-full bg-white/5 ${meta.color} light:bg-black/5`}>
                    <FontAwesomeIcon icon={meta.icon} />
                  </span>
                  <div className="flex-1">
                    <p className="text-sm text-linen light:text-deep">
                      {meta.label}
                      {log.design_room_type ? ` — ${log.design_room_type}` : ""}
                    </p>
                    <p className="text-xs text-muted light:text-muted-light">
                      {new Date(log.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </DashboardLayout>
  );
}
