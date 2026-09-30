/**
 * Real backend implementation of the design + feedback APIs. Exports the
 * exact same function names and return shapes as the mock they replace,
 * so no page or component needs to change:
 *   - generate/regenerate/get/stats -> return the response body as-is
 *   - list/history -> return a plain array (backend returns unpaginated
 *     arrays for these two endpoints specifically, to match)
 *   - toggleSave/remove -> return {success, message, ...}
 */
import api from "./api.js";

export const designService = {
  async generate(formData) {
    const { data } = await api.post("/ai/generate/", formData);
    return data;
  },

  async regenerate(id) {
    const { data } = await api.post(`/ai/regenerate/${id}/`);
    return data;
  },

  async list(savedOnly = false) {
    const { data } = await api.get("/designs/", { params: savedOnly ? { saved: "true" } : {} });
    return data;
  },

  async get(id) {
    const { data } = await api.get(`/designs/${id}/`);
    return data;
  },

  async toggleSave(id) {
    const { data } = await api.post(`/designs/${id}/toggle-save/`);
    return data;
  },

  async remove(id) {
    const { data } = await api.delete(`/designs/${id}/`);
    return data;
  },

  async history() {
    const { data } = await api.get("/designs/history/");
    return data;
  },

  async stats() {
    const { data } = await api.get("/designs/stats/");
    return data;
  },
};

export const feedbackService = {
  async submit(payload) {
    const { data } = await api.post("/feedback/", payload);
    return data;
  },

  async list() {
    const { data } = await api.get("/feedback/");
    return data;
  },
};
