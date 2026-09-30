/**
 * Real backend implementation of the auth API. Exports the exact same
 * function names and return shapes as the mock it replaces (see git
 * history / README) so AuthContext.jsx and every page work unchanged.
 * JWT tokens are managed entirely inside this file and api.js -- nothing
 * else in the app needs to know they exist.
 */
import api from "./api.js";

function saveTokens(tokens) {
  localStorage.setItem("indwell_access", tokens.access);
  localStorage.setItem("indwell_refresh", tokens.refresh);
}

function clearTokens() {
  localStorage.removeItem("indwell_access");
  localStorage.removeItem("indwell_refresh");
}

export const authService = {
  async signup(username, email, password) {
    const { data } = await api.post("/auth/register/", { username, email, password });
    saveTokens(data.tokens);
    return { user: data.user };
  },

  async login(email, password) {
    const { data } = await api.post("/auth/login/", { email, password });
    saveTokens(data.tokens);
    return { user: data.user };
  },

  async logout() {
    const refresh = localStorage.getItem("indwell_refresh");
    try {
      await api.post("/auth/logout/", { refresh });
    } catch {
      // best-effort; clear local session regardless
    }
    clearTokens();
    return { success: true };
  },

  async getProfile() {
    const { data } = await api.get("/auth/profile/");
    return { user: data.user };
  },

  async updateProfile(patch) {
    const { data } = await api.patch("/auth/profile/", patch);
    return { user: data.user };
  },

  async changePassword(passwords) {
    const { data } = await api.post("/auth/change-password/", passwords);
    return data;
  },

  async forgotPassword(email) {
    const { data } = await api.post("/auth/forgot-password/", { email });
    return data;
  },
};
