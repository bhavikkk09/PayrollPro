# API_REFERENCE.md — REST API Documentation

## Authentication & Session
* `POST /api/auth/login`
  * Body: `{ "email", "password", "tenantCode" }`
  * Returns: `{ "success": true, "token": "JWT...", "user": { "id", "email", "role", "tenantId" } }`

* `POST /api/superadmin/impersonate`
  * Body: `{ "targetTenant": "abc_mfg" }`
  * Headers: `Authorization: Bearer <superadmin_token>`
  * Returns: `{ "success": true, "token": "IMPERSONATED_JWT...", "tenantId": "abc_mfg" }`

## Employee Master
* `GET /api/employees?tenant={tenantId}`
  * Returns list of employees for specified tenant.
* `POST /api/employees`
  * Body: Employee creation payload.

## Payroll Engine & Wizard
* `GET /api/payroll/batches`
  * Fetches historical and active payroll batches.
* `POST /api/payroll/process`
  * Triggers statutory payroll calculation run for specified month and branch.
* `GET /api/payroll/slips/{employeeId}`
  * Fetches detailed salary slips with EPF, ESIC, PT, TDS itemized lines.

## Attendance & Geofencing
* `POST /api/attendance/checkin`
  * Body: `{ "latitude": 18.5204, "longitude": 73.8567 }`
  * Calculates Haversine distance from branch coordinates. Auto-flags out-of-fence punches.
* `GET /api/attendance/flagged-checkins`
  * Fetches HR review queue for out-of-bounds punch approvals.

## Compliance Hub
* `GET /api/compliance/items`
  * Fetches compliance status for EPFO, ESIC, Professional Tax, TDS.
* `GET /api/reports/pf-summary`
  * Generates PF ECR return statements.
