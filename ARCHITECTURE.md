# ARCHITECTURE.md — System Architecture & Design Specification

## System Architecture Diagram

```
┌───────────────────────────────────────────────────────────┐
│               Payroll Pro React 18 SPA (Vite)              │
│  - Modern Design System (Tailwind CSS, Lucide, Recharts)  │
│  - Centralized Policy Manager & Impersonated SaaS UI      │
└─────────────────────────────┬─────────────────────────────┘
                              │ REST / JSON API (JWT + Tenant Headers)
┌─────────────────────────────▼─────────────────────────────┐
│                 Express Node API Gateway                  │
│  - Session & Authentication Guardrails                    │
│  - Tenant Boundary Security Middleware                    │
└─────────────────────────────┬─────────────────────────────┘
                              │
┌─────────────────────────────▼─────────────────────────────┐
│               Bhavik HRMS Python Backend                  │
│  - Dynamic Indian Statutory Payroll Engine (EPF/ESIC/PT)  │
│  - Attendance, Leave Accrual & Geofence Validation        │
│  - Multi-tenant Control & Provisioning Engine            │
└─────────────────────────────┬─────────────────────────────┘
                              │
┌─────────────────────────────▼─────────────────────────────┐
│              MariaDB / SQLite Storage Engine              │
│  - Multi-tenant Database Isolation                        │
└───────────────────────────────────────────────────────────┘
```

## Key Architectural Principles
1. **Frontend-Backend Separation**: Clean API boundaries separate the presentation layer from the Python backend logic.
2. **Statutory Integrity**: Indian tax laws (EPF ceiling ₹15,000 / ₹1,800 max, ESIC 0.75% / 3.25%, State PT slabs, TDS tax slabs) are computed purely server-side.
3. **Multi-Tenant SaaS Boundary**: Super Admin impersonation generates scoped JWT tokens. Cross-tenant reads or writes are strictly blocked at the gateway level.
4. **Policy-Driven Operations**: Attendance grace periods, late mark penalties, overtime multipliers, and leave carry-forwards are driven dynamically by the Centralized Policy Engine without hardcoded rules.
