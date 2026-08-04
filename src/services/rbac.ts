// Role-Based Access Control (RBAC) for PayrollPro HRMS
// BUG-006 FIX: Added role alias mapping to normalize legacy role strings from db.ts
// db.ts uses: 'super_admin', 'company_admin', 'hr_manager', 'employee'
// schema.ts / rbac canonical roles: 'superadmin', 'hr_admin', 'manager', 'employee'

export type Role = 'superadmin' | 'hr_admin' | 'manager' | 'employee';

export const ROLE_HIERARCHY: Record<Role, number> = {
  superadmin: 100,
  hr_admin: 50,
  manager: 30,
  employee: 10
};

/**
 * Normalize legacy role strings (from JSON store) to canonical RBAC roles.
 * This is a backwards-compatibility bridge until all role strings are unified.
 */
const ROLE_ALIASES: Record<string, Role> = {
  // Canonical forms (pass-through)
  superadmin: 'superadmin',
  hr_admin: 'hr_admin',
  manager: 'manager',
  employee: 'employee',
  // Legacy forms from db.ts DEFAULT_USERS
  super_admin: 'superadmin',
  company_admin: 'hr_admin',
  hr_manager: 'hr_admin',
};

export function normalizeRole(raw: string | undefined): Role | undefined {
  if (!raw) return undefined;
  return ROLE_ALIASES[raw.toLowerCase()] || ROLE_ALIASES[raw] || undefined;
}

export function hasRole(userRole: string | Role, requiredRole: Role): boolean {
  const resolved = normalizeRole(userRole as string);
  if (!resolved) return false;
  return ROLE_HIERARCHY[resolved] >= ROLE_HIERARCHY[requiredRole];
}

export function requireRole(userRole: string | Role | undefined, requiredRole: Role): void {
  if (!hasRole(userRole as string, requiredRole)) {
    const err = new Error(`Forbidden: requires ${requiredRole} role or higher`);
    (err as any).status = 403;
    throw err;
  }
}
