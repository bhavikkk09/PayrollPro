import { sqliteDb } from './database.js';

export function initializeSchema() {
  sqliteDb.exec(`
    -- Tenants table
    CREATE TABLE IF NOT EXISTS tenants (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT UNIQUE NOT NULL,
      plan TEXT DEFAULT 'starter',
      status TEXT DEFAULT 'active',
      region TEXT DEFAULT 'India',
      max_employees INTEGER DEFAULT 50,
      pf_code TEXT,
      esic_code TEXT,
      pt_reg_no TEXT,
      company_pan TEXT,
      company_tan TEXT,
      company_gstin TEXT,
      company_address TEXT,
      company_city TEXT,
      company_state TEXT,
      work_days_per_month INTEGER DEFAULT 26,
      pf_wage_cap INTEGER DEFAULT 15000,
      features_json TEXT DEFAULT '{"recruitment":true,"ess":true,"ai":true,"geolocation":true}',
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- Flagged Geofence Checkins table
    CREATE TABLE IF NOT EXISTS flagged_checkins (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      employee_id TEXT NOT NULL,
      employee_name TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      distance_m REAL NOT NULL,
      radius_m REAL NOT NULL,
      branch_name TEXT,
      status TEXT DEFAULT 'Pending',
      reviewed_by TEXT,
      reviewed_at TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (tenant_id) REFERENCES tenants(id)
    );

    -- Users table (authentication)
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      email TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('superadmin','hr_admin','manager','employee')),
      employee_id TEXT,
      is_active INTEGER DEFAULT 1,
      last_login TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (tenant_id) REFERENCES tenants(id),
      UNIQUE(tenant_id, email)
    );

    -- Branches
    CREATE TABLE IF NOT EXISTS branches (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      name TEXT NOT NULL,
      address TEXT,
      city TEXT,
      state TEXT,
      pincode TEXT,
      phone TEXT,
      email TEXT,
      geo_lat REAL,
      geo_lng REAL,
      geo_radius_m INTEGER DEFAULT 200,
      is_active INTEGER DEFAULT 1,
      FOREIGN KEY (tenant_id) REFERENCES tenants(id)
    );

    -- Departments
    CREATE TABLE IF NOT EXISTS departments (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      name TEXT NOT NULL,
      parent_dept_id TEXT,
      hod_employee_id TEXT,
      cost_center TEXT,
      is_active INTEGER DEFAULT 1,
      FOREIGN KEY (tenant_id) REFERENCES tenants(id)
    );

    -- Designations
    CREATE TABLE IF NOT EXISTS designations (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      name TEXT NOT NULL,
      level INTEGER DEFAULT 1,
      grade TEXT,
      is_active INTEGER DEFAULT 1,
      FOREIGN KEY (tenant_id) REFERENCES tenants(id)
    );

    -- Shift Types
    CREATE TABLE IF NOT EXISTS shift_types (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      name TEXT NOT NULL,
      start_time TEXT DEFAULT '09:00',
      end_time TEXT DEFAULT '18:00',
      grace_period_mins INTEGER DEFAULT 15,
      is_night_shift INTEGER DEFAULT 0,
      FOREIGN KEY (tenant_id) REFERENCES tenants(id)
    );

    -- Employees (core entity - clean fields only)
    CREATE TABLE IF NOT EXISTS employees (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      full_name TEXT NOT NULL,
      gender TEXT,
      dob TEXT,
      blood_group TEXT,
      designation TEXT,
      designation_id TEXT,
      department TEXT,
      department_id TEXT,
      branch TEXT,
      branch_id TEXT,
      manager_employee_id TEXT,
      manager_name TEXT,
      email TEXT,
      phone TEXT,
      emergency_contact_name TEXT,
      emergency_contact_phone TEXT,
      permanent_address TEXT,
      current_address TEXT,
      doj TEXT,
      dol TEXT,
      status TEXT DEFAULT 'Active',
      employment_type TEXT DEFAULT 'Full-Time',
      probation_end_date TEXT,
      shift_type_id TEXT,
      notice_period_days INTEGER DEFAULT 30,
      cost_center TEXT,
      pan_number TEXT,
      aadhaar_number TEXT,
      uan_number TEXT,
      pf_number TEXT,
      esic_number TEXT,
      bank_name TEXT,
      bank_account TEXT,
      bank_ifsc TEXT,
      bank_branch TEXT,
      salary_mode TEXT DEFAULT 'Bank Transfer',
      is_pf_applicable INTEGER DEFAULT 1,
      is_esi_applicable INTEGER DEFAULT 0,
      is_pt_applicable INTEGER DEFAULT 1,
      avatar_url TEXT,
      basic_salary REAL DEFAULT 0,
      gross_salary REAL DEFAULT 0,
      ctc REAL DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (tenant_id) REFERENCES tenants(id)
    );

    -- Salary Components Master
    CREATE TABLE IF NOT EXISTS salary_components (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('earnings','deductions')),
      value_type TEXT DEFAULT 'percentage',
      value REAL DEFAULT 0,
      is_statutory INTEGER DEFAULT 0,
      statutory_type TEXT,
      is_active INTEGER DEFAULT 1,
      FOREIGN KEY (tenant_id) REFERENCES tenants(id)
    );

    -- Salary Structure Assignments (Employee <-> Salary)
    CREATE TABLE IF NOT EXISTS salary_assignments (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      employee_id TEXT NOT NULL,
      basic_salary REAL NOT NULL,
      gross_salary REAL NOT NULL,
      ctc REAL NOT NULL,
      from_date TEXT NOT NULL,
      to_date TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (tenant_id) REFERENCES tenants(id),
      FOREIGN KEY (employee_id) REFERENCES employees(id)
    );

    -- Salary Slips (Monthly payroll records per employee)
    CREATE TABLE IF NOT EXISTS salary_slips (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      employee_id TEXT NOT NULL,
      month INTEGER NOT NULL,
      year INTEGER NOT NULL,
      payment_days INTEGER DEFAULT 26,
      total_working_days INTEGER DEFAULT 26,
      lop_days INTEGER DEFAULT 0,
      present_days INTEGER DEFAULT 26,
      basic_salary REAL DEFAULT 0,
      gross_pay REAL DEFAULT 0,
      total_deductions REAL DEFAULT 0,
      net_pay REAL DEFAULT 0,
      epf_employee REAL DEFAULT 0,
      epf_employer REAL DEFAULT 0,
      esic_employee REAL DEFAULT 0,
      esic_employer REAL DEFAULT 0,
      pt REAL DEFAULT 0,
      tds REAL DEFAULT 0,
      earnings_json TEXT DEFAULT '[]',
      deductions_json TEXT DEFAULT '[]',
      status TEXT DEFAULT 'Draft',
      approved_by TEXT,
      paid_at TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (tenant_id) REFERENCES tenants(id),
      FOREIGN KEY (employee_id) REFERENCES employees(id),
      UNIQUE(tenant_id, employee_id, month, year)
    );

    -- Leave Types Master
    CREATE TABLE IF NOT EXISTS leave_types (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      name TEXT NOT NULL,
      max_allowed INTEGER DEFAULT 12,
      is_carry_forward INTEGER DEFAULT 0,
      is_paid INTEGER DEFAULT 1,
      FOREIGN KEY (tenant_id) REFERENCES tenants(id)
    );

    -- Leave Allocations (per employee per year)
    CREATE TABLE IF NOT EXISTS leave_allocations (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      employee_id TEXT NOT NULL,
      leave_type_id TEXT NOT NULL,
      leave_type_name TEXT NOT NULL,
      year INTEGER NOT NULL,
      total_leaves INTEGER DEFAULT 0,
      used_leaves INTEGER DEFAULT 0,
      FOREIGN KEY (tenant_id) REFERENCES tenants(id),
      FOREIGN KEY (employee_id) REFERENCES employees(id),
      UNIQUE(tenant_id, employee_id, leave_type_id, year)
    );

    -- Leave Applications
    CREATE TABLE IF NOT EXISTS leave_applications (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      employee_id TEXT NOT NULL,
      employee_name TEXT,
      leave_type_id TEXT NOT NULL,
      leave_type_name TEXT NOT NULL,
      from_date TEXT NOT NULL,
      to_date TEXT NOT NULL,
      total_days INTEGER NOT NULL,
      reason TEXT,
      status TEXT DEFAULT 'Pending',
      approved_by_id TEXT,
      approved_at TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (tenant_id) REFERENCES tenants(id),
      FOREIGN KEY (employee_id) REFERENCES employees(id)
    );

    -- Attendance Records (one row per employee per day)
    CREATE TABLE IF NOT EXISTS attendance_records (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      employee_id TEXT NOT NULL,
      date TEXT NOT NULL,
      status TEXT DEFAULT 'Present',
      in_time TEXT,
      out_time TEXT,
      total_hours REAL DEFAULT 0,
      ot_hours REAL DEFAULT 0,
      work_mode TEXT DEFAULT 'Office',
      is_late_entry INTEGER DEFAULT 0,
      is_early_exit INTEGER DEFAULT 0,
      remarks TEXT,
      FOREIGN KEY (tenant_id) REFERENCES tenants(id),
      FOREIGN KEY (employee_id) REFERENCES employees(id),
      UNIQUE(tenant_id, employee_id, date)
    );

    -- Payroll Batches
    CREATE TABLE IF NOT EXISTS payroll_batches (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      month INTEGER NOT NULL,
      year INTEGER NOT NULL,
      total_employees INTEGER DEFAULT 0,
      total_gross REAL DEFAULT 0,
      total_deductions REAL DEFAULT 0,
      total_net REAL DEFAULT 0,
      total_pf REAL DEFAULT 0,
      total_esic REAL DEFAULT 0,
      total_pt REAL DEFAULT 0,
      total_tds REAL DEFAULT 0,
      status TEXT DEFAULT 'Draft',
      hr_approved_by TEXT,
      hr_approved_at TEXT,
      finance_approved_by TEXT,
      finance_approved_at TEXT,
      director_approved_by TEXT,
      director_approved_at TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(tenant_id, month, year)
    );

    -- Audit Logs
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      user_id TEXT,
      user_name TEXT,
      action TEXT NOT NULL,
      entity TEXT,
      details TEXT,
      ip_address TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- Tenant Settings
    CREATE TABLE IF NOT EXISTS tenant_settings (
      tenant_id TEXT PRIMARY KEY,
      settings_json TEXT DEFAULT '{}',
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (tenant_id) REFERENCES tenants(id)
    );

    -- Create indexes for common queries
    CREATE INDEX IF NOT EXISTS idx_employees_tenant ON employees(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_employees_dept ON employees(tenant_id, department);
    CREATE INDEX IF NOT EXISTS idx_employees_branch ON employees(tenant_id, branch);
    CREATE INDEX IF NOT EXISTS idx_attendance_tenant_date ON attendance_records(tenant_id, date);
    CREATE INDEX IF NOT EXISTS idx_attendance_emp ON attendance_records(tenant_id, employee_id);
    CREATE INDEX IF NOT EXISTS idx_leave_apps_tenant ON leave_applications(tenant_id, status);
    CREATE INDEX IF NOT EXISTS idx_salary_slips_emp ON salary_slips(tenant_id, employee_id);
    CREATE INDEX IF NOT EXISTS idx_audit_tenant ON audit_logs(tenant_id, created_at);
  `);

  try {
    sqliteDb.exec(`ALTER TABLE tenants ADD COLUMN features_json TEXT DEFAULT '{"recruitment":true,"ess":true,"ai":true,"geolocation":true}'`);
  } catch {}

  console.log('✅ SQLite schema initialized');
}
