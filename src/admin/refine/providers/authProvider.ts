import { AuthBindings } from "@refinedev/core";

// Minimal auth provider that integrates with existing AdminAuth localStorage session
// Expects localStorage key "admin_session" with shape { token: string, expiresAt?: string }
// Redirects to /admin/login when not authenticated.
export const adminAuthProvider: AuthBindings = {
  async check() {
    try {
      const raw = localStorage.getItem("admin_session");
      if (!raw) {
        return { authenticated: false, redirectTo: "/admin/login" };
      }
      const session = JSON.parse(raw);
      // Optional expiry check
      if (session?.expiresAt) {
        const expires = new Date(session.expiresAt).getTime();
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
      const session = raw ? JSON.parse(raw) : null;
      if (!session) return { id: "anonymous" } as any;
      return {
        id: session?.admin?.id ?? "admin",
        name: session?.admin?.full_name ?? session?.admin?.email ?? "Administrator",
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
