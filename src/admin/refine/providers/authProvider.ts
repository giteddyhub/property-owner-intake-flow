import { AuthBindings } from "@refinedev/core";

// Minimal auth provider that integrates with existing AdminAuth localStorage session
// Expects localStorage key "admin_session" with shape { admin: { id, email, full_name }, session: { token, expires_at } }
// Redirects to /admin/login when not authenticated.
export const adminAuthProvider: AuthBindings = {
  async check() {
    try {
      const raw = localStorage.getItem("admin_session");
      if (!raw) {
        return { authenticated: false, redirectTo: "/admin/login" };
      }
      const stored = JSON.parse(raw);
      const session = stored?.session;
      if (!session?.token) {
        localStorage.removeItem("admin_session");
        return { authenticated: false, redirectTo: "/admin/login" };
      }
      // Expiry check
      if (session?.expires_at) {
        const expires = new Date(session.expires_at).getTime();
        if (Date.now() > expires) {
          localStorage.removeItem("admin_session");
          return { authenticated: false, redirectTo: "/admin/login" };
        }
      }
      return { authenticated: true };
    } catch {
      return { authenticated: false, redirectTo: "/admin/login" };
    }
  },
  async getIdentity() {
    try {
      const raw = localStorage.getItem("admin_session");
      const stored = raw ? JSON.parse(raw) : null;
      const admin = stored?.admin;
      if (!admin) return { id: "anonymous" } as any;
      return {
        id: admin.id,
        name: admin.full_name || admin.email || "Administrator",
        email: admin.email,
      } as any;
    } catch {
      return { id: "anonymous" } as any;
    }
  },
  async onError() {
    return { error: new Error("Auth error") };
  },
  async login() {
    return { success: false, redirectTo: "/admin/login" };
  },
  async logout() {
    localStorage.removeItem("admin_session");
    return { success: true, redirectTo: "/admin/login" };
  },
  async register() {
    return { success: false };
  },
  async forgotPassword() {
    return { success: false };
  },
  async updatePassword() {
    return { success: false };
  },
};
