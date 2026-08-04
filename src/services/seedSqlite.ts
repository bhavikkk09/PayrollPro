import { sqliteDb } from './database.js';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export function seedSqliteData() {
  const check = sqliteDb.prepare('SELECT COUNT(*) as count FROM tenants').get() as { count: number };
  if (check.count > 0) {
    console.log('SQLite database already seeded.');
    return;
  }

  console.log('Seeding SQLite database...');
  const insertTenant = sqliteDb.prepare('INSERT INTO tenants (id, name, code, plan, status, region, max_employees) VALUES (?, ?, ?, ?, ?, ?, ?)');
  const insertBranch = sqliteDb.prepare('INSERT INTO branches (id, tenant_id, name) VALUES (?, ?, ?)');
  const insertDept = sqliteDb.prepare('INSERT INTO departments (id, tenant_id, name) VALUES (?, ?, ?)');
  const insertDesignation = sqliteDb.prepare('INSERT INTO designations (id, tenant_id, name) VALUES (?, ?, ?)');
  const insertEmployee = sqliteDb.prepare(`
    INSERT INTO employees (
      id, tenant_id, full_name, email, phone, doj, status, employment_type, manager_name,
      department, branch, designation, cost_center, pan_number, aadhaar_number,
      uan_number, esic_number, bank_account, bank_ifsc, bank_name,
      basic_salary, gross_salary, ctc, is_pf_applicable, is_esi_applicable, is_pt_applicable, notice_period_days
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertSalaryAssignment = sqliteDb.prepare(`
    INSERT INTO salary_assignments (id, tenant_id, employee_id, basic_salary, gross_salary, ctc, from_date)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  
  const tenants = [
    { id: 'apex', name: 'Apex Enterprises Pvt. Ltd.', code: 'apex', plan: 'Enterprise Scale', status: 'active', region: 'local-dev-mumbai', max: 500 },
    { id: 'smit', name: 'Smit Infotech', code: 'smit', plan: 'Growth Plan', status: 'active', region: 'local-dev-mumbai', max: 100 },
    { id: 'abc_mfg', name: 'ABC Manufacturing Pvt. Ltd.', code: 'abc_mfg', plan: 'Enterprise Scale', status: 'active', region: 'local-dev-mumbai', max: 500 }
  ];

  const transaction = sqliteDb.transaction(() => {
    // Seed Tenants
    for (const t of tenants) {
      insertTenant.run(t.id, t.name, t.code, t.plan, t.status, t.region, t.max);
    }

    // Seed ABC Mfg Data
    let qaEmployees: any[] = [];
    try {
      const dbContent = fs.readFileSync(path.join(process.cwd(), 'src/services/db.ts'), 'utf-8');
      const start = dbContent.indexOf('const qaEmployees = [');
      if (start > -1) {
        let end = dbContent.indexOf('];\n\n      qaEmployees.forEach', start);
        if(end === -1) end = dbContent.indexOf('];', start + 10000);
        
        let jsonStr = dbContent.substring(start + 20, end + 1);
        // A very naive eval-like fix since it's an object literal string, not strict JSON.
        // For safety, we will just use regex to parse if possible, or eval it safely.
        // A better approach is to read data/payrollpro_db.json if it exists.
      }
      
      const jsonFile = path.join(process.cwd(), 'data/payrollpro_db.json');
      if (fs.existsSync(jsonFile)) {
         const data = JSON.parse(fs.readFileSync(jsonFile, 'utf-8'));
         qaEmployees = data.employees.filter((e: any) => e.tenantId === 'abc_mfg');
      }
    } catch(e) {
      console.warn("Could not load employees from db.json", e);
    }

    // Insert branches, depts, designations for abc_mfg based on employees
    const depts = new Set<string>();
    const branches = new Set<string>();
    const desigs = new Set<string>();

    for (const emp of qaEmployees) {
      depts.add(emp.department);
      branches.add(emp.branch);
      desigs.add(emp.designation);
    }

    depts.forEach(d => { if (d) insertDept.run(d.toLowerCase().replace(/ /g, '-'), 'abc_mfg', d); });
    branches.forEach(b => { if (b) insertBranch.run(b.toLowerCase().replace(/ /g, '-'), 'abc_mfg', b); });
    desigs.forEach(d => { if (d) insertDesignation.run(d.toLowerCase().replace(/ /g, '-'), 'abc_mfg', d); });

    for (const emp of qaEmployees) {
      insertEmployee.run(
        emp.id, emp.tenantId, emp.fullName, emp.email, emp.phone, emp.doj, emp.status, emp.employmentType, emp.managerName,
        emp.department, emp.branch, emp.designation, emp.costCenter, emp.panNumber, emp.aadhaarNumber,
        emp.uanNumber, emp.esicNumber, emp.bankAccount, emp.bankIfsc, emp.bankName,
        emp.basicSalary, emp.grossSalary, emp.ctc, emp.isPfApplicable ? 1 : 0, emp.isEsiApplicable ? 1 : 0, emp.isPtApplicable ? 1 : 0, emp.noticePeriodDays
      );

      insertSalaryAssignment.run(
        uuidv4(), emp.tenantId, emp.id, emp.basicSalary, emp.grossSalary, emp.ctc, emp.doj
      );
    }
  });

  transaction();
  console.log('✅ SQLite database seeded');
}
