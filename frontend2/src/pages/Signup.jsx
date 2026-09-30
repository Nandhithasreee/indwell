import { faEye, faEyeSlash, faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";

import AuthShell from "../components/AuthShell.jsx";
import { IMAGES } from "../constants/images.js";
import { useAuth } from "../contexts/AuthContext.jsx";

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", email: "", password: "", confirmPassword: "" });
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords don't match.");
      return;
    }
    setSubmitting(true);
    try {
      await signup(form.fullName, form.email, form.password);
      toast.success("Account created. Let's design something.");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't create your account.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Get started"
      title="Create your InDwell account"
      subtitle="Ten free AI generations a day, no card required."
      photo={IMAGES.officeDesk}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted">Full name</label>
          <input
            required
            placeholder="Ananya Rao"
            className="input-field"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted">Email</label>
          <input
            type="email"
            required
            placeholder="name@company.com"
            className="input-field"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              placeholder="At least 8 characters"
              className="input-field pr-10"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              title={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((v) => !v)}
              className="absolute inset-y-0 right-3 flex items-center text-muted hover:text-brass"
            >
              <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} className="text-sm" />
            </button>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted">Confirm password</label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              required
              placeholder="Re-enter your password"
              className="input-field pr-10"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            />
            <button
              type="button"
              aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              title={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              onClick={() => setShowConfirmPassword((v) => !v)}
              className="absolute inset-y-0 right-3 flex items-center text-muted hover:text-brass"
            >
              <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} className="text-sm" />
            </button>
          </div>
        </div>

        <button type="submit" disabled={submitting} className="btn-primary w-full disabled:opacity-60">
          <FontAwesomeIcon icon={faUserPlus} className="text-xs" />
          {submitting ? "Creating account..." : "Create Account"}
        </button>
      </form>

      <p className="mt-6 text-sm text-muted">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-brass hover:underline">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
