import type { Express } from "express";
import { authStorage } from "./storage";
import { isAuthenticated } from "./replitAuth";
import bcrypt from "bcryptjs";
import { z } from "zod";

const CUSTOMER_ROLES = ["customer"];
const ADMIN_ROLES = ["admin"];
const STAFF_ROLES = [
  "airline_supplier", "country_manager", "hotel_manager",
  "transport_manager", "guide_manager", "sights_manager",
];

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
  portal: z.enum(["customer", "admin", "staff"]).optional(),
});

export function registerAuthRoutes(app: Express): void {
  app.post("/api/auth/login", async (req, res) => {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Username and password required" });

      const { username, password, portal } = parsed.data;
      const user = await authStorage.getUserByUsername(username);
      if (!user || !user.passwordHash) {
        return res.status(401).json({ message: "Invalid username or password" });
      }

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        return res.status(401).json({ message: "Invalid username or password" });
      }

      const profile = await authStorage.getProfileByUserId(user.id);
      const role = profile?.role || "customer";

      if (portal === "admin" && !ADMIN_ROLES.includes(role)) {
        return res.status(403).json({ message: "This account does not have admin access" });
      }
      if (portal === "staff" && !STAFF_ROLES.includes(role)) {
        return res.status(403).json({ message: "This account does not have staff access" });
      }
      if (portal === "customer" && !CUSTOMER_ROLES.includes(role) && !ADMIN_ROLES.includes(role)) {
        return res.status(403).json({ message: "This account does not have customer access" });
      }

      req.session.userId = user.id;
      req.session.userRole = role;

      res.json({ id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role });
    } catch (error: any) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.get("/api/auth/user", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const user = await authStorage.getUser(userId);
      if (!user) return res.status(404).json({ message: "User not found" });
      const { passwordHash, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.clearCookie("connect.sid");
      res.json({ success: true });
    });
  });

  app.get("/api/logout", (req, res) => {
    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      res.redirect("/");
    });
  });
}
