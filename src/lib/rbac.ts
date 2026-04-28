/**
 * Role-Based Access Control definitions.
 *
 * Four portal roles for admin-portal users (CorporateManager):
 *   ADMIN     – full system access and configuration
 *   EXECUTIVE – read-only view of all operational data
 *   MANAGER   – operational management and approvals
 *   STAFF     – rank-and-file access to assigned modules only
 *
 * Employee portal users (HrEmployee) carry role="employee" and are
 * unaffected by this file.
 */

export type UserRole = "ADMIN" | "EXECUTIVE" | "MANAGER" | "STAFF";

export const ROLE_CONFIG: Record<
  UserRole,
  { label: string; description: string; badgeClass: string }
> = {
  ADMIN: {
    label: "Admin",
    description: "Full system access and configuration",
    badgeClass: "bg-blue-500 text-white",
  },
  EXECUTIVE: {
    label: "Executive",
    description: "Read-only view of all operational data",
    badgeClass: "bg-purple-500 text-white",
  },
  MANAGER: {
    label: "Manager",
    description: "Operational management and approvals",
    badgeClass: "bg-emerald-500 text-white",
  },
  STAFF: {
    label: "Staff",
    description: "Rank-and-file access to assigned modules only",
    badgeClass: "bg-slate-500 text-white",
  },
};

/**
 * Nav paths accessible per role.
 * If a path is not listed here it defaults to ADMIN-only.
 * Prefix matching: "/admin/departments" also covers "/admin/departments/...".
 */
const NAV_ACCESS: Record<string, UserRole[]> = {
  "/admin":                    ["ADMIN", "EXECUTIVE", "MANAGER", "STAFF"],
  "/admin/executive":          ["ADMIN", "EXECUTIVE"],
  "/admin/admin":              ["ADMIN", "MANAGER", "STAFF"],
  "/admin/accounting":         ["ADMIN", "EXECUTIVE", "MANAGER", "STAFF"],
  "/admin/hr":                 ["ADMIN", "EXECUTIVE", "MANAGER", "STAFF"],
  "/admin/operations":         ["ADMIN", "EXECUTIVE", "MANAGER", "STAFF"],
  "/admin/action-center":      ["ADMIN", "MANAGER", "STAFF"],
  "/admin/training-center":    ["ADMIN", "EXECUTIVE", "MANAGER", "STAFF"],
  "/admin/courses":            ["ADMIN", "MANAGER", "STAFF"],
  "/admin/students":           ["ADMIN", "MANAGER", "STAFF"],
  "/admin/trainers":           ["ADMIN"],
  "/admin/enrollees":          ["ADMIN"],
  "/admin/revenue":            ["ADMIN", "EXECUTIVE"],
  "/admin/hr/analytics":       ["ADMIN", "EXECUTIVE", "MANAGER", "STAFF"],
  "/admin/departments":        ["ADMIN", "EXECUTIVE", "MANAGER", "STAFF"],
  "/admin/work":               ["ADMIN", "MANAGER", "STAFF"],
  "/admin/admin/inventory":    ["ADMIN", "EXECUTIVE", "MANAGER", "STAFF"],
  "/admin/admin/procurement":  ["ADMIN", "MANAGER", "STAFF"],
  "/admin/admin/logistics":    ["ADMIN", "MANAGER", "STAFF"],
  "/admin/admin/requests":     ["ADMIN", "EXECUTIVE", "MANAGER", "STAFF"],
  "/admin/admin/vendors":      ["ADMIN", "EXECUTIVE", "MANAGER", "STAFF"],
  "/admin/admin/budget":       ["ADMIN", "EXECUTIVE", "MANAGER"],
  "/admin/admin/reports":      ["ADMIN", "EXECUTIVE", "MANAGER", "STAFF"],
  "/admin/finance":            ["ADMIN", "EXECUTIVE", "MANAGER", "STAFF"],
  "/admin/sales":              ["ADMIN", "EXECUTIVE", "MANAGER", "STAFF"],
  "/admin/sales/deals":        ["ADMIN", "EXECUTIVE", "MANAGER", "STAFF"],
  "/admin/sales/contacts":     ["ADMIN", "EXECUTIVE", "MANAGER", "STAFF"],
  "/admin/sales/campaigns":    ["ADMIN", "MANAGER", "STAFF"],
  "/admin/sales/activities":   ["ADMIN", "MANAGER", "STAFF"],
  "/admin/sales/tasks":        ["ADMIN", "MANAGER", "STAFF"],
  "/admin/it":                 ["ADMIN", "EXECUTIVE", "MANAGER", "STAFF"],
  "/admin/it/assets":          ["ADMIN", "MANAGER", "STAFF"],
  "/admin/it/requests":        ["ADMIN", "MANAGER", "STAFF"],
  "/admin/users-roles":        ["ADMIN", "EXECUTIVE", "MANAGER", "STAFF"],
  "/admin/settings":           ["ADMIN"],
};

/** Returns true when the given role is permitted to see a nav path. */
export function canAccessNav(userRole: UserRole | null | undefined, href: string): boolean {
  // Super-admins (no userRole) and ADMIN see everything
  if (!userRole || userRole === "ADMIN") return true;

  // Exact or prefix match — use the longest matching key
  let allowed: UserRole[] | undefined;
  let matchLen = -1;
  for (const [path, roles] of Object.entries(NAV_ACCESS)) {
    if (href === path || href.startsWith(path + "/")) {
      if (path.length > matchLen) {
        matchLen = path.length;
        allowed = roles;
      }
    }
  }
  if (!allowed) return false; // unlisted paths default to ADMIN-only; ADMIN already returned above
  return allowed.includes(userRole);
}

/** Returns the default landing page for a role after login. */
export function defaultLanding(userRole: UserRole | null | undefined): string {
  if (userRole === "EXECUTIVE") return "/admin/executive";
  return "/admin";
}
