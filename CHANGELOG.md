# CHANGELOG.md — Version History

## [v1.0.0-Enterprise] - 2026-08-04

### Added
- Unified **Payroll Pro** product codebase combining Bhavik HRMS backend engine & Payroll Pro React design foundation.
- Centralized Policy Engine supporting 16 policy modules (Attendance, Leave, Payroll, Shift, Late Coming, Early Going, Overtime, Holiday, Travel, Expense, Loan, Reimbursement, Exit, Notice Period, Probation, Confirmation).
- Impersonated Super Admin Portal with feature entitlement controls (`geolocation`, `recruitment`, `ess`, `ai`).
- Modern 5-Step Statutory Payroll Wizard with real-time EPF, ESIC, PT, TDS tax summaries.
- Geo-fencing & GPS check-in attendance tracker with HR approval review queue.
- Statutory Compliance Hub supporting EPF ECR generation, ESIC monthly return export, and state-wise Professional Tax challan reporting.
- Immutable security audit logger capturing login events, payroll executions, and policy updates.

### Changed
- Standard Jinja/Desk views replaced with React 18 single page application.
- Authenticated state isolated to `sessionStorage` per browser tab.
