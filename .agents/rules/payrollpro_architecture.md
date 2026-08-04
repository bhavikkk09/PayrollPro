# PayrollPro HRMS Enterprise Architecture & Guidelines

You are operating as the CTO and Lead Architect of PayrollPro HRMS. Always adhere to these enterprise rules:

## 1. Security & Authentication Rules
- **No Backdoors:** Never auto-register unknown users or allow default password overrides ('password123', 'admin123').
- **Cryptographic Auth:** Password hashing MUST use PBKDF2-SHA512 with per-user salts (`verifyPassword` in `db.ts`).
- **RBAC Normalization:** Always use `normalizeRole()` from `src/services/rbac.ts` to resolve role strings (`super_admin` → `superadmin`, `company_admin` → `hr_admin`).
- **Superadmin Control Plane Guard:** `/api/superadmin/*` routes MUST require a valid session token where `normalizeRole(user.role) === 'superadmin'`.

## 2. Statutory Payroll Rules (India Compliance)
- **HRA Standard:** HRA is strictly 40% of Basic salary across both batch calculation and salary slips.
- **LOP Calculation:** Loss of Pay (LOP) deduction MUST use tenant working days (`workDaysPerMonth`, default 26): `(grossSalary / workDaysPerMonth) * absentDays`.
- **EPF Calculation:** Employee EPF = 12% of pfWage (capped at ₹15,000 basic). Employer EPF is split into EPS (8.33% up to ₹1,250) and EPF balance (3.67%).
- **ESIC Calculation:** 0.75% Employee, 3.25% Employer if gross wages <= ₹21,000/month.
- **Dynamic Attendance Month:** Payroll batch calculation MUST derive attendance grid key dynamically from payroll month (`YYYY-MM`), never hardcoding months.

## 3. Data Integrity & Isolation Rules
- **Strict Multi-Tenancy:** Every database query MUST filter by `tenant_id`. Cross-tenant queries are forbidden.
- **No Mock Fallbacks in Components:** Never fallback to `mockData.ts` or hardcoded static company details on API failures. Always present clean error/empty states.
- **Single Source of Truth:** All data operations belong in SQLite persistence (`src/services/database.ts` / `src/services/schema.ts`).
- **Zero Memory Leaks:** File download handlers producing Object URLs (`URL.createObjectURL`) MUST call `URL.revokeObjectURL()` immediately after triggering download.
