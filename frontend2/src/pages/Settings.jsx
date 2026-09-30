import { faKey, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { motion } from "framer-motion";
import React, { useState } from "react";
import toast from "react-hot-toast";

import DimLabel from "../components/DimLabel.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import DashboardLayout from "../layouts/DashboardLayout.jsx";
import { authService } from "../services/authService.js";

export default function Settings() {
  const { user, updateProfile } = useAuth();
  const [profileForm, setProfileForm] = useState({
    username: user?.username || "",
    phone_number: user?.phone_number || "",
    preferences: {
      preferred_style: user?.preferences?.preferred_style || "",
      preferred_palette: user?.preferences?.preferred_palette || "",
      currency: user?.preferences?.currency || "INR",
      measurement_unit: user?.preferences?.measurement_unit || "ft",
    },
  });
  const [passwordForm, setPasswordForm] = useState({ old_password: "", new_password: "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateProfile(profileForm);
      toast.success("Profile updated.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setSavingPassword(true);
    try {
      await authService.changePassword(passwordForm);
      setPasswordForm({ old_password: "", new_password: "" });
      toast.success("Password changed.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't change password.");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <DashboardLayout>
      <DimLabel>Account</DimLabel>
      <h1 className="mt-2 font-display text-3xl font-medium text-linen light:text-deep">Settings</h1>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <motion.form
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleProfileSubmit}
          className="glass-card space-y-4 p-6"
        >
          <h2 className="flex items-center gap-2 font-display text-lg text-linen light:text-deep">
            <FontAwesomeIcon icon={faUser} className="text-brass" /> Profile
          </h2>

          <Field label="Username">
            <input
              className="input-field"
              value={profileForm.username}
              onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
            />
          </Field>

          <Field label="Phone number">
            <input
              className="input-field"
              value={profileForm.phone_number}
              onChange={(e) => setProfileForm({ ...profileForm, phone_number: e.target.value })}
            />
          </Field>

          <Field label="Preferred style">
            <input
              className="input-field"
              placeholder="e.g. Scandinavian"
              value={profileForm.preferences.preferred_style}
              onChange={(e) =>
                setProfileForm({
                  ...profileForm,
                  preferences: { ...profileForm.preferences, preferred_style: e.target.value },
                })
              }
            />
          </Field>

          <Field label="Preferred palette">
            <input
              className="input-field"
              placeholder="e.g. warm neutrals"
              value={profileForm.preferences.preferred_palette}
              onChange={(e) =>
                setProfileForm({
                  ...profileForm,
                  preferences: { ...profileForm.preferences, preferred_palette: e.target.value },
                })
              }
            />
          </Field>

          <button type="submit" disabled={savingProfile} className="btn-primary disabled:opacity-60">
            {savingProfile ? "Saving..." : "Save changes"}
          </button>
        </motion.form>

        <motion.form
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handlePasswordSubmit}
          className="glass-card space-y-4 p-6"
        >
          <h2 className="flex items-center gap-2 font-display text-lg text-linen light:text-deep">
            <FontAwesomeIcon icon={faKey} className="text-brass" /> Change password
          </h2>

          <Field label="Current password">
            <input
              type="password"
              required
              className="input-field"
              value={passwordForm.old_password}
              onChange={(e) => setPasswordForm({ ...passwordForm, old_password: e.target.value })}
            />
          </Field>

          <Field label="New password">
            <input
              type="password"
              required
              className="input-field"
              value={passwordForm.new_password}
              onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
            />
          </Field>

          <button type="submit" disabled={savingPassword} className="btn-primary disabled:opacity-60">
            {savingPassword ? "Updating..." : "Update password"}
          </button>
        </motion.form>
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
