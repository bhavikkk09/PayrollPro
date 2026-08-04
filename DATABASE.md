# DATABASE.md — Database Schema & Data Dictionary

## Core Entity Schemas

### 1. Employee (`employees`)
* `id` (VARCHAR PK): Unique employee ID (e.g. `EMP-00101`).
* `tenant_id` (VARCHAR FK): Tenant identifier (e.g. `apex`).
* `full_name` (VARCHAR): Employee name.
* `designation` (VARCHAR): Job title.
* `department` (VARCHAR): Department.
* `branch` (VARCHAR): Work location / branch.
* `pan_number` (VARCHAR): PII masked in UI.
* `aadhaar_number` (VARCHAR): PII masked in UI.
* `uan_number` (VARCHAR): Universal Account Number for EPF.
* `esic_number` (VARCHAR): ESIC Account number.
* `basic_salary` (DECIMAL): Monthly basic salary component.
* `gross_salary` (DECIMAL): Monthly total gross.
* `ctc` (DECIMAL): Annual Cost to Company.

### 2. Salary Batch & Slip (`payroll_batches`, `salary_slips`)
* `batch_id` (VARCHAR PK): Payroll batch reference.
* `employee_id` (VARCHAR FK): Target employee.
* `month_year` (VARCHAR): Pay cycle period.
* `gross_pay` (DECIMAL): Calculated gross salary.
* `epf_employee` (DECIMAL): 12% EPF employee deduction.
* `epf_employer` (DECIMAL): 12% EPF employer contribution.
* `esic_employee` (DECIMAL): 0.75% ESIC employee contribution.
* `esic_employer` (DECIMAL): 3.25% ESIC employer contribution.
* `professional_tax` (DECIMAL): State Professional Tax deduction.
* `income_tax_tds` (DECIMAL): Monthly TDS deduction.
* `net_pay` (DECIMAL): Final credited salary.

### 3. Audit Logs (`audit_logs`)
* `id` (VARCHAR PK): Auto-generated UUID.
* `tenant_id` (VARCHAR): Tenant code.
* `user_id` (VARCHAR): Performing user ID.
* `action` (VARCHAR): Event name (`LOGIN`, `PAYROLL_RUN`, `CHECKIN`, `POLICY_UPDATE`).
* `timestamp` (DATETIME): ISO 8601 timestamp.
