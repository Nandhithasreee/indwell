import { faPaperPlane, faStar } from "@fortawesome/free-solid-svg-icons";
import { faStar as faStarOutline } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import toast from "react-hot-toast";

import DimLabel from "../components/DimLabel.jsx";
import DashboardLayout from "../layouts/DashboardLayout.jsx";
import { feedbackService } from "../services/designService.js";

const CATEGORIES = [
  { value: "bug", label: "Bug report" },
  { value: "feature", label: "Feature request" },
  { value: "design", label: "Design feedback" },
  { value: "other", label: "Other" },
];

export default function Feedback() {
  const [category, setCategory] = useState("other");
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await feedbackService.submit({ category, rating, message });
      setMessage("");
      toast.success("Thanks for the feedback!");
    } catch {
      toast.error("Couldn't send feedback.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <DimLabel>We're listening</DimLabel>
      <h1 className="mt-2 font-display text-3xl font-medium text-linen light:text-deep">Share feedback</h1>

      <form onSubmit={handleSubmit} className="glass-card mt-8 max-w-xl space-y-5 p-6">
        <div>
          <label className="mb-2 block text-xs font-medium text-muted light:text-muted-light">How would you rate InDwell?</label>
          <div className="flex gap-1 text-xl">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" onClick={() => setRating(n)} className="text-brass">
                <FontAwesomeIcon icon={n <= rating ? faStar : faStarOutline} />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-xs font-medium text-muted light:text-muted-light">Category</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setCategory(c.value)}
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                  category === c.value ? "bg-brass text-deep" : "border border-white/10 text-muted light:border-hairline-light"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-xs font-medium text-muted light:text-muted-light">Your message</label>
          <textarea
            required
            rows={5}
            className="input-field resize-none"
            placeholder="Tell us what worked, what didn't, or what you'd love to see next."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>

        <button type="submit" disabled={submitting} className="btn-primary disabled:opacity-60">
          <FontAwesomeIcon icon={faPaperPlane} className="text-xs" />
          {submitting ? "Sending..." : "Send feedback"}
        </button>
      </form>
    </DashboardLayout>
  );
}
