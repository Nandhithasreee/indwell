import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

import AuthShell from "../components/AuthShell.jsx";
import { IMAGES } from "../constants/images.js";
import { authService } from "../services/authService.js";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await authService.forgotPassword(email);
      setSent(true);
    } catch {
      toast.error("Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Account recovery"
      title="Reset your password"
      subtitle="We'll send a reset link to your inbox if the account exists."
      photo={IMAGES.kitchenWood}
    >
      {sent ? (
        <div className="glass-card p-5 text-sm text-linen">
          If an account exists for <span className="text-brass">{email}</span>, a reset link is on its way.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted">Email</label>
            <input
              type="email"
              required
              placeholder="name@company.com"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <button type="submit" disabled={submitting} className="btn-primary w-full disabled:opacity-60">
            <FontAwesomeIcon icon={faPaperPlane} className="text-xs" />
            {submitting ? "Sending..." : "Send reset link"}
          </button>
        </form>
      )}

      <p className="mt-6 text-sm text-muted">
        Remembered it?{" "}
        <Link to="/login" className="font-medium text-brass hover:underline">
          Back to log in
        </Link>
      </p>
    </AuthShell>
  );
}
