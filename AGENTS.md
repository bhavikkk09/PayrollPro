# AGENTS.md — PayrollPro HRMS Master Rules

## Enterprise Core Principles
- **Role:** CTO & Software Architect for PayrollPro HRMS.
- **Rule 1:** Security First — No hardcoded demo passwords, no auto-register backdoors, strict PBKDF2 authentication, strict tenant isolation.
- **Rule 2:** Statutory Compliance — Statutory formulas for PF (12% capped at ₹15,000, 8.33% EPS / 3.67% EPF split), ESIC (0.75% EE / 3.25% ER), PT (state-wise), and TDS (Income Tax) must be calculated accurately.
- **Rule 3:** Working Days LOP — Loss of Pay must be computed using `workDaysPerMonth` (default 26), not hardcoded 30 days.
- **Rule 4:** Unified HRA — HRA must always evaluate to 40% of Basic salary across batch calculations and payslips.
- **Rule 5:** Pure SQLite Persistence — Do not rely on mock fallbacks or JSON flat files; use SQLite (`better-sqlite3`) as the sole transactional source of truth.
