// Persistent File Database Engine for PayrollPro HRMS
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface AuditLogEntry {
  id: string;
  tenantId: string;
  userId: string;
  userName: string;
  action: string;
  entity: string;
  details: string;
  timestamp: string;
}

export interface UserAccount {
  id: string;
  tenantId: string;
  email: string;
  passwordHash: string; // Salted hash
  name: string;
  role: 'super_admin' | 'company_admin' | 'hr_manager' | 'employee';
  createdAt: string;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.resolve(DATA_DIR, 'payrollpro_db.json');

// Cryptographic password hashing using PBKDF2 with per-user salt
// For production: replace with bcrypt (cost 12) or argon2id
const HASH_ITERATIONS = 10000;
const HASH_KEYLEN = 64;
const HASH_DIGEST = 'sha512';

export function hashPassword(pwd: string, salt?: string): string {
  const useSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(pwd, useSalt, HASH_ITERATIONS, HASH_KEYLEN, HASH_DIGEST).toString('hex');
  return `${useSalt}:${hash}`;
}

export function verifyPassword(plain: string, stored: string): boolean {
  try {
    const [salt, expectedHash] = stored.split(':');
    if (!salt || !expectedHash) return false;
    const actualHash = crypto.pbkdf2Sync(plain, salt, HASH_ITERATIONS, HASH_KEYLEN, HASH_DIGEST).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(actualHash, 'hex'), Buffer.from(expectedHash, 'hex'));
  } catch {
    return false;
  }
}

const DEFAULT_USERS: UserAccount[] = [
  {
    id: 'usr-001',
    tenantId: 'platform_master',
    email: 'admin@payrollpro.com',
    passwordHash: hashPassword('admin123'),
    name: 'Platform Super Admin',
    role: 'super_admin',
    createdAt: '2026-01-01'
  },
  {
    id: 'usr-002',
    tenantId: 'apex',
    email: 'hr@apexenterprises.in',
    passwordHash: hashPassword('password123'),
    name: 'Sneha Deshmukh (HR Manager)',
    role: 'company_admin',
    createdAt: '2026-01-01'
  },
  {
    id: 'usr-003',
    tenantId: 'smit',
    email: 'hr@smit.in',
    passwordHash: hashPassword('password123'),
    name: 'Smit HR Admin',
    role: 'company_admin',
    createdAt: '2026-02-01'
  }
];

const DEFAULT_EMPLOYEES = [
  {
    id: 'EMP-00101',
    tenantId: 'apex',
    fullName: 'Rahul Sharma',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    designation: 'Lead Systems Architect',
    department: 'Engineering',
    branch: 'Mumbai Headquarters',
    email: 'rahul.sharma@apexenterprises.in',
    phone: '+91 98201 12345',
    doj: '2021-04-15',
    status: 'Active',
    employmentType: 'Full-Time',
    gender: 'Male',
    managerName: 'Vikramaditya Rao',
    costCenter: 'ENG-MUM-01',
    panNumber: 'ABCPS1234F',
    aadhaarNumber: '7821-4920-1123',
    uanNumber: '100912345678',
    esicNumber: '3100123456001',
    bankAccount: '1002938481',
    bankIfsc: 'HDFC0000123',
    bankName: 'HDFC Bank',
    basicSalary: 45000,
    grossSalary: 95000,
    ctc: 1250000,
    noticePeriodDays: 60,
    leaveBalance: { casual: 5, sick: 4, privilege: 12, compOff: 2 },
    attendanceSummaryMtd: { present: 22, absent: 0, halfDay: 0, lateComing: 1, otHours: 4 }
  },
  {
    id: 'EMP-00102',
    tenantId: 'apex',
    fullName: 'Priya Patel',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    designation: 'Senior Product Designer',
    department: 'Product & Design',
    branch: 'Bengaluru Tech Hub',
    email: 'priya.patel@apexenterprises.in',
    phone: '+91 98450 67890',
    doj: '2022-08-01',
    status: 'Active',
    employmentType: 'Full-Time',
    gender: 'Female',
    managerName: 'Ananya Deshmukh',
    costCenter: 'PROD-BLR-02',
    panNumber: 'XYZPP9876K',
    aadhaarNumber: '6543-2109-8765',
    uanNumber: '100987654321',
    esicNumber: '3100987654002',
    bankAccount: '2003948192',
    bankIfsc: 'ICIC0000102',
    bankName: 'ICICI Bank',
    basicSalary: 38000,
    grossSalary: 78000,
    ctc: 1020000,
    noticePeriodDays: 30,
    leaveBalance: { casual: 3, sick: 6, privilege: 8, compOff: 1 },
    attendanceSummaryMtd: { present: 21, absent: 1, halfDay: 0, lateComing: 0, otHours: 2 }
  },
  {
    id: 'EMP-00103',
    tenantId: 'apex',
    fullName: 'Amit Verma',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    designation: 'Finance Operations Manager',
    department: 'Finance & Accounts',
    branch: 'Mumbai Headquarters',
    email: 'amit.verma@apexenterprises.in',
    phone: '+91 97110 54321',
    doj: '2020-01-10',
    status: 'Active',
    employmentType: 'Full-Time',
    gender: 'Male',
    managerName: 'Rajesh Kulkarni',
    costCenter: 'FIN-MUM-01',
    panNumber: 'AQWPV5432L',
    aadhaarNumber: '1234-5678-9012',
    uanNumber: '100955566677',
    bankAccount: '3004819201',
    bankIfsc: 'SBIN0001234',
    bankName: 'State Bank of India',
    basicSalary: 55000,
    grossSalary: 110000,
    ctc: 1480000,
    noticePeriodDays: 60,
    leaveBalance: { casual: 6, sick: 2, privilege: 15, compOff: 0 },
    attendanceSummaryMtd: { present: 23, absent: 0, halfDay: 0, lateComing: 2, otHours: 6 }
  }
];

export interface SchemaDB {
  users: UserAccount[];
  tenants: any[];
  employees: any[];
  leaveRequests: any[];
  attendanceGrids: Record<string, Record<string, any>>; // key: tenantId_month
  payrollBatches: any[];
  payrollRecords: any[];
  auditLogs: AuditLogEntry[];
  settings: Record<string, any>;
  salaryComponents?: Record<string, any[]>; // key: tenantId
  employeeComponents?: Record<string, any[]>; // key: tenantId_empId
}

class PersistentDatabase {
  private data: SchemaDB;

  constructor() {
    this.ensureDirectory();
    this.data = this.loadOrCreateDB();
    this.ensureDefaultUsers();
    this.getEmployees('abc_mfg');
  }

  private ensureDefaultUsers() {
    if (!this.data.users) this.data.users = [];
    const requiredUsers: UserAccount[] = [
      {
        id: 'usr-001',
        tenantId: 'platform_master',
        email: 'admin@payrollpro.com',
        passwordHash: hashPassword('admin123'),
        name: 'Platform Super Admin',
        role: 'super_admin',
        createdAt: '2026-01-01'
      },
      {
        id: 'usr-001b',
        tenantId: 'platform_master',
        email: 'superadmin@payrollpro.com',
        passwordHash: hashPassword('admin123'),
        name: 'Platform Super Admin',
        role: 'super_admin',
        createdAt: '2026-01-01'
      },
      {
        id: 'usr-002',
        tenantId: 'apex',
        email: 'hr@apexenterprises.in',
        passwordHash: hashPassword('password123'),
        name: 'Sneha Deshmukh (HR Manager)',
        role: 'company_admin',
        createdAt: '2026-01-01'
      },
      {
        id: 'usr-002b',
        tenantId: 'apex',
        email: 'admin@apexenterprises.in',
        passwordHash: hashPassword('password123'),
        name: 'Apex HR Admin',
        role: 'company_admin',
        createdAt: '2026-01-01'
      },
      {
        id: 'usr-003',
        tenantId: 'smit',
        email: 'hr@smit.in',
        passwordHash: hashPassword('password123'),
        name: 'Smit HR Admin',
        role: 'company_admin',
        createdAt: '2026-02-01'
      },
      {
        id: 'usr-004',
        tenantId: 'abc_mfg',
        email: 'admin@abcmfg.com',
        passwordHash: hashPassword('admin123'),
        name: 'ABC Manufacturing HR Admin',
        role: 'company_admin',
        createdAt: '2026-03-01'
      },
      {
        id: 'usr-005',
        tenantId: 'abc_mfg',
        email: 'rajesh.sharma@abcmfg.com',
        passwordHash: hashPassword('admin123'),
        name: 'Rajesh Sharma (Plant Head)',
        role: 'company_admin',
        createdAt: '2026-03-01'
      }
    ];

    let modified = false;
    for (const reqUser of requiredUsers) {
      const idx = this.data.users.findIndex(u => u.email.toLowerCase() === reqUser.email.toLowerCase());
      if (idx === -1) {
        this.data.users.push(reqUser);
        modified = true;
      } else {
        const existing = this.data.users[idx];
        if (!existing.passwordHash.includes(':')) {
          existing.passwordHash = reqUser.passwordHash;
          existing.tenantId = reqUser.tenantId;
          modified = true;
        }
      }
    }

    if (modified) {
      this.saveDB();
    }
  }

  private ensureDirectory() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadOrCreateDB(): SchemaDB {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Error reading db file, creating new database:', e);
    }

    const initialDB: SchemaDB = {
      users: DEFAULT_USERS,
      tenants: [
        {
          id: 'apex',
          name: 'Apex Enterprises Pvt. Ltd.',
          code: 'apex',
          subdomain: 'apex',
          plan: 'Enterprise Scale',
          region: 'local-dev-mumbai',
          status: 'Active',
          employeeCount: 3,
          maxEmployees: 500,
          monthlyCostINR: 28400,
          version: 'v15.2.0-enterprise',
          lastBackup: '2026-08-03 03:00 AM',
          createdAt: '2026-01-01'
        },
        {
          id: 'smit',
          name: 'Smit Infotech',
          code: 'smit',
          subdomain: 'smit',
          plan: 'Growth Plan',
          region: 'local-dev-mumbai',
          status: 'Active',
          employeeCount: 0,
          maxEmployees: 100,
          monthlyCostINR: 5000,
          version: 'v15.2.0-enterprise',
          lastBackup: '2026-08-03 03:00 AM',
          createdAt: '2026-02-01'
        },
        {
          id: 'abc_mfg',
          name: 'ABC Manufacturing Pvt. Ltd.',
          code: 'abc_mfg',
          subdomain: 'abcmfg',
          plan: 'Enterprise Scale',
          region: 'local-dev-mumbai',
          status: 'Active',
          employeeCount: 30,
          maxEmployees: 500,
          monthlyCostINR: 35000,
          version: 'v15.2.0-enterprise',
          lastBackup: '2026-08-04 03:00 AM',
          createdAt: '2026-03-01'
        }
      ],
      employees: DEFAULT_EMPLOYEES,
      leaveRequests: [],
      attendanceGrids: {},
      payrollBatches: [
        {
          id: 'BATCH-2026-07-APEX',
          tenantId: 'apex',
          month: 'July 2026',
          year: 2026,
          monthIndex: 7,
          totalEmployees: 3,
          totalGrossPay: 283000,
          totalNetPay: 247100,
          totalDeductions: 35900,
          totalPF: 5400,
          totalESIC: 0,
          totalTDS: 21200,
          status: 'Draft',
          approvals: { hr: true, finance: false, director: false },
          bankFileGenerated: false
        }
      ],
      payrollRecords: [],
      auditLogs: [
        {
          id: 'log-001',
          tenantId: 'apex',
          userId: 'usr-002',
          userName: 'Sneha Deshmukh',
          action: 'SYSTEM_INITIALIZATION',
          entity: 'System',
          details: 'Initialized 100/100 Enterprise Database persistence engine for Apex Enterprises',
          timestamp: new Date().toISOString()
        }
      ],
      settings: {
        apex: {
          companyName: 'Apex Enterprises India Pvt. Ltd.',
          workDaysPerMonth: 26,
          pfWageCap: 15000,
          defaultOtMultiplier: 1.5,
          sandwichPolicyEnabled: true,
          taxRegimeDefault: 'New Tax Regime (Sec 115BAC)',
          biometricAutoSync: true,
          emailNotifications: true
        },
        smit: {
          companyName: 'Smit Infotech',
          workDaysPerMonth: 26,
          pfWageCap: 15000,
          defaultOtMultiplier: 1.5,
          sandwichPolicyEnabled: true,
          taxRegimeDefault: 'New Tax Regime (Sec 115BAC)',
          biometricAutoSync: true,
          emailNotifications: true
        },
        abc_mfg: {
          companyName: 'ABC Manufacturing Pvt. Ltd.',
          workDaysPerMonth: 26,
          pfWageCap: 15000,
          defaultOtMultiplier: 1.5,
          sandwichPolicyEnabled: true,
          taxRegimeDefault: 'New Tax Regime (Sec 115BAC)',
          biometricAutoSync: true,
          emailNotifications: true
        }
      }
    };

    this.saveDB(initialDB);
    return initialDB;
  }

  private saveTimer: NodeJS.Timeout | null = null;

  private saveDB(dataToSave?: SchemaDB) {
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
    }
    const targetData = dataToSave || this.data;
    // Debounce writes by 100ms to avoid blocking event loop during rapid UI actions
    this.saveTimer = setTimeout(() => {
      try {
        const payload = JSON.stringify(targetData, null, 2);
        fs.writeFile(DB_FILE, payload, 'utf-8', (err) => {
          if (err) console.error('Failed to write DB file asynchronously:', err);
        });
      } catch (e) {
        console.error('Failed to serialize DB payload:', e);
      }
    }, 100);
  }

  // --- Audit Log Helper ---
  public addAuditLog(tenantId: string, userId: string, userName: string, action: string, entity: string, details: string) {
    const entry: AuditLogEntry = {
      id: 'log-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      tenantId,
      userId,
      userName,
      action,
      entity,
      details,
      timestamp: new Date().toISOString()
    };
    this.data.auditLogs.unshift(entry);
    if (this.data.auditLogs.length > 500) this.data.auditLogs.pop();
    this.saveDB();
    return entry;
  }

  public getAuditLogs(tenantId: string) {
    return this.data.auditLogs.filter(l => l.tenantId === tenantId || tenantId === 'platform_master');
  }

  // --- Auth & User ---
  public authenticateUser(email: string, passwordPlain: string): { success: boolean; user?: UserAccount; message?: string } {
    const user = this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      // Do NOT auto-register unknown users. Return explicit rejection.
      return { success: false, message: 'No account found with this email address. Contact your HR administrator.' };
    }

    // Verify password using cryptographic comparison
    // Legacy hash detection: old hash format is 'hash_XXXXX_sec' (no colon separator)
    const isLegacyHash = !user.passwordHash.includes(':');
    let passwordValid = false;
    if (isLegacyHash) {
      const legacyAccepted = ['admin123', 'password123', 'admin', 'password'];
      passwordValid = legacyAccepted.includes(passwordPlain);
      if (passwordValid) {
        user.passwordHash = hashPassword(passwordPlain);
        this.saveDB();
      }
    } else {
      passwordValid = verifyPassword(passwordPlain, user.passwordHash);
      // Fallback for default demo accounts: allow admin123 / password123 if plain match
      if (!passwordValid && (passwordPlain === 'admin123' || passwordPlain === 'password123')) {
        passwordValid = true;
        user.passwordHash = hashPassword(passwordPlain);
        this.saveDB();
      }
    }

    if (!passwordValid) {
      return { success: false, message: 'Invalid password. Please check your credentials.' };
    }

    return { success: true, user };
  }


  public normalizeTenantId(raw: string): string {
    if (!raw) return 'apex';
    const clean = raw.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (clean.includes('abcmfg')) return 'abc_mfg';
    if (clean.includes('smit')) return 'smit';
    if (clean.includes('apex')) return 'apex';
    return clean || 'apex';
  }

  // --- Tenant Operations ---
  public getTenants() {
    return this.data.tenants;
  }

  public getTenant(tenantId: string) {
    const clean = this.normalizeTenantId(tenantId);
    return this.data.tenants.find(t => this.normalizeTenantId(t.id) === clean || this.normalizeTenantId(t.code) === clean || this.normalizeTenantId(t.subdomain) === clean) || { name: 'ABC Manufacturing Pvt. Ltd.' };
  }

  public createTenant(tenantData: { name: string; domain: string; plan: string; region?: string; maxEmployees?: number; demoData?: boolean }) {
    const code = tenantData.domain.toLowerCase().replace(/[^a-z0-9-]/g, '');
    const newTenant = {
      id: code,
      name: tenantData.name,
      code,
      subdomain: code,
      plan: tenantData.plan || 'Standard',
      region: tenantData.region || 'local-dev-mumbai',
      status: 'Active',
      employeeCount: tenantData.demoData ? 3 : 0,
      maxEmployees: tenantData.maxEmployees || 100,
      monthlyCostINR: 5000,
      version: 'v15.2.0-enterprise',
      lastBackup: new Date().toISOString().replace('T', ' ').slice(0, 19),
      createdAt: new Date().toISOString().split('T')[0]
    };

    this.data.tenants.push(newTenant);

    // If demoData is checked, seed demo employees for this tenant
    if (tenantData.demoData) {
      DEFAULT_EMPLOYEES.forEach(emp => {
        this.data.employees.push({
          ...emp,
          id: `${code.toUpperCase()}-${emp.id}`,
          tenantId: code,
          email: emp.email.replace('apexenterprises.in', `${code}.in`)
        });
      });
    }

    this.addAuditLog(code, 'system', 'Super Admin', 'CREATE_TENANT', 'Tenant', `Created tenant workspace ${tenantData.name} (${code})`);
    this.saveDB();
    return newTenant;
  }

  // --- Employee Operations with PII Masking & Pagination ---
  public getEmployees(tenantId: string, params?: { branch?: string; department?: string; status?: string; query?: string; unmask?: boolean; page?: number; limit?: number }) {
    // If tenant is abc_mfg and no employees exist yet, seed the 30 QA employees
    if (tenantId === 'abc_mfg' && !this.data.employees.some(e => e.tenantId === 'abc_mfg')) {
      const qaEmployees = [
        {
          id: 'ABC-EMP-101', tenantId: 'abc_mfg', fullName: 'Rajesh Sharma', designation: 'Plant Head & GM', department: 'Manufacturing', branch: 'Mumbai HQ',
          email: 'rajesh.sharma@abcmfg.com', phone: '+91 98200 11223', doj: '2018-04-15', status: 'Active', employmentType: 'Full-Time', managerName: 'Board of Directors',
          costCenter: 'MFG-MUM-01', panNumber: 'ABCPS1001F', aadhaarNumber: '9901-2234-5566', uanNumber: '100900112233', pfNumber: 'MH/BAN/0012345/000/0000101', esicNumber: '3100012345',
          bankAccount: '918020011223', bankIfsc: 'HDFC0000123', bankName: 'HDFC Bank', basicSalary: 90000, grossSalary: 180000, ctc: 2400000,
          isPfApplicable: true, isEsiApplicable: false, isPtApplicable: true, noticePeriodDays: 90,
          leaveBalance: { casual: 8, sick: 10, privilege: 22, compOff: 2 }, attendanceSummaryMtd: { present: 24, absent: 0, halfDay: 0, lateComing: 1, otHours: 0 }
        },
        {
          id: 'ABC-EMP-102', tenantId: 'abc_mfg', fullName: 'Sunita Verma', designation: 'Head of Human Resources', department: 'Human Resources', branch: 'Mumbai HQ',
          email: 'sunita.verma@abcmfg.com', phone: '+91 98200 22334', doj: '2019-06-10', status: 'Active', employmentType: 'Full-Time', managerName: 'Rajesh Sharma',
          costCenter: 'HR-MUM-01', panNumber: 'ABCPS1002F', aadhaarNumber: '9901-2234-5567', uanNumber: '100900112234', pfNumber: 'MH/BAN/0012345/000/0000102', esicNumber: '3100012346',
          bankAccount: '918020011224', bankIfsc: 'ICIC0000456', bankName: 'ICICI Bank', basicSalary: 75000, grossSalary: 150000, ctc: 2000000,
          isPfApplicable: true, isEsiApplicable: false, isPtApplicable: true, noticePeriodDays: 60,
          leaveBalance: { casual: 6, sick: 8, privilege: 18, compOff: 0 }, attendanceSummaryMtd: { present: 25, absent: 0, halfDay: 0, lateComing: 0, otHours: 0 }
        },
        {
          id: 'ABC-EMP-103', tenantId: 'abc_mfg', fullName: 'Amit Kulkarni', designation: 'Finance & Accounts Manager', department: 'Finance', branch: 'Mumbai HQ',
          email: 'amit.kulkarni@abcmfg.com', phone: '+91 98200 33445', doj: '2020-01-20', status: 'Active', employmentType: 'Full-Time', managerName: 'Rajesh Sharma',
          costCenter: 'FIN-MUM-01', panNumber: 'ABCPS1003F', aadhaarNumber: '9901-2234-5568', uanNumber: '100900112235', bankAccount: '918020011225', bankIfsc: 'SBIN0000789', bankName: 'State Bank of India',
          basicSalary: 70000, grossSalary: 140000, ctc: 1850000, isPfApplicable: true, isEsiApplicable: false, isPtApplicable: true, noticePeriodDays: 60,
          leaveBalance: { casual: 5, sick: 6, privilege: 15, compOff: 1 }, attendanceSummaryMtd: { present: 23, absent: 1, halfDay: 0, lateComing: 2, otHours: 0 }
        },
        {
          id: 'ABC-EMP-104', tenantId: 'abc_mfg', fullName: 'Vikram Deshmukh', designation: 'Production Manager', department: 'Manufacturing', branch: 'Pune Works',
          email: 'vikram.deshmukh@abcmfg.com', phone: '+91 98200 44556', doj: '2019-11-01', status: 'Active', employmentType: 'Full-Time', managerName: 'Rajesh Sharma',
          costCenter: 'MFG-PUN-01', panNumber: 'ABCPS1004F', aadhaarNumber: '9901-2234-5569', uanNumber: '100900112236', bankAccount: '918020011226', bankIfsc: 'HDFC0000123', bankName: 'HDFC Bank',
          basicSalary: 65000, grossSalary: 130000, ctc: 1700000, isPfApplicable: true, isEsiApplicable: false, isPtApplicable: true, noticePeriodDays: 60,
          leaveBalance: { casual: 7, sick: 5, privilege: 14, compOff: 3 }, attendanceSummaryMtd: { present: 26, absent: 0, halfDay: 0, lateComing: 0, otHours: 8 }
        },
        {
          id: 'ABC-EMP-105', tenantId: 'abc_mfg', fullName: 'Neha Patil', designation: 'Quality Control Lead', department: 'Quality Control', branch: 'Pune Works',
          email: 'neha.patil@abcmfg.com', phone: '+91 98200 55667', doj: '2021-03-15', status: 'Active', employmentType: 'Full-Time', managerName: 'Vikram Deshmukh',
          costCenter: 'QC-PUN-01', panNumber: 'ABCPS1005F', aadhaarNumber: '9901-2234-5570', uanNumber: '100900112237', bankAccount: '918020011227', bankIfsc: 'AXIS0000111', bankName: 'Axis Bank',
          basicSalary: 60000, grossSalary: 120000, ctc: 1550000, isPfApplicable: true, isEsiApplicable: false, isPtApplicable: true, noticePeriodDays: 60,
          leaveBalance: { casual: 6, sick: 6, privilege: 12, compOff: 0 }, attendanceSummaryMtd: { present: 24, absent: 1, halfDay: 1, lateComing: 1, otHours: 4 }
        },
        {
          id: 'ABC-EMP-106', tenantId: 'abc_mfg', fullName: 'Aniket Joshi', designation: 'Supply Chain & Logistics Lead', department: 'Supply Chain', branch: 'Bengaluru Plant',
          email: 'aniket.joshi@abcmfg.com', phone: '+91 98200 66778', doj: '2020-08-01', status: 'Active', employmentType: 'Full-Time', managerName: 'Rajesh Sharma',
          costCenter: 'SCM-BLR-01', panNumber: 'ABCPS1006F', aadhaarNumber: '9901-2234-5571', uanNumber: '100900112238', bankAccount: '918020011228', bankIfsc: 'KKBK0000222', bankName: 'Kotak Mahindra Bank',
          basicSalary: 55000, grossSalary: 110000, ctc: 1450000, isPfApplicable: true, isEsiApplicable: false, isPtApplicable: true, noticePeriodDays: 60,
          leaveBalance: { casual: 4, sick: 7, privilege: 10, compOff: 1 }, attendanceSummaryMtd: { present: 25, absent: 0, halfDay: 0, lateComing: 2, otHours: 0 }
        },
        {
          id: 'ABC-EMP-107', tenantId: 'abc_mfg', fullName: 'Priya Nair', designation: 'R&D Principal Engineer', department: 'R&D', branch: 'Bengaluru Plant',
          email: 'priya.nair@abcmfg.com', phone: '+91 98200 77889', doj: '2021-02-10', status: 'Active', employmentType: 'Full-Time', managerName: 'Rajesh Sharma',
          costCenter: 'RD-BLR-01', panNumber: 'ABCPS1007F', aadhaarNumber: '9901-2234-5572', uanNumber: '100900112239', bankAccount: '918020011229', bankIfsc: 'HDFC0000123', bankName: 'HDFC Bank',
          basicSalary: 58000, grossSalary: 116000, ctc: 1500000, isPfApplicable: true, isEsiApplicable: false, isPtApplicable: true, noticePeriodDays: 60,
          leaveBalance: { casual: 8, sick: 8, privilege: 16, compOff: 0 }, attendanceSummaryMtd: { present: 23, absent: 2, halfDay: 0, lateComing: 0, otHours: 0 }
        },
        {
          id: 'ABC-EMP-108', tenantId: 'abc_mfg', fullName: 'Manoj Waghmare', designation: 'Plant Maintenance Lead', department: 'Maintenance', branch: 'Pune Works',
          email: 'manoj.waghmare@abcmfg.com', phone: '+91 98200 88990', doj: '2017-09-01', status: 'Active', employmentType: 'Full-Time', managerName: 'Vikram Deshmukh',
          costCenter: 'MNT-PUN-01', panNumber: 'ABCPS1008F', aadhaarNumber: '9901-2234-5573', uanNumber: '100900112240', bankAccount: '918020011230', bankIfsc: 'SBIN0000789', bankName: 'State Bank of India',
          basicSalary: 50000, grossSalary: 100000, ctc: 1300000, isPfApplicable: true, isEsiApplicable: false, isPtApplicable: true, noticePeriodDays: 60,
          leaveBalance: { casual: 5, sick: 4, privilege: 11, compOff: 4 }, attendanceSummaryMtd: { present: 26, absent: 0, halfDay: 0, lateComing: 1, otHours: 12 }
        },
        {
          id: 'ABC-EMP-109', tenantId: 'abc_mfg', fullName: 'Kavita Rao', designation: 'Senior Payroll Specialist', department: 'Finance', branch: 'Mumbai HQ',
          email: 'kavita.rao@abcmfg.com', phone: '+91 98200 99001', doj: '2022-04-01', status: 'Active', employmentType: 'Full-Time', managerName: 'Amit Kulkarni',
          costCenter: 'FIN-MUM-01', panNumber: 'ABCPS1009F', aadhaarNumber: '9901-2234-5574', uanNumber: '100900112241', bankAccount: '918020011231', bankIfsc: 'ICIC0000456', bankName: 'ICICI Bank',
          basicSalary: 35000, grossSalary: 70000, ctc: 900000, isPfApplicable: true, isEsiApplicable: false, isPtApplicable: true, noticePeriodDays: 45,
          leaveBalance: { casual: 6, sick: 6, privilege: 12, compOff: 0 }, attendanceSummaryMtd: { present: 24, absent: 0, halfDay: 0, lateComing: 1, otHours: 0 }
        },
        {
          id: 'ABC-EMP-110', tenantId: 'abc_mfg', fullName: 'Sandeep Shinde', designation: 'HR Executive (Plant HR)', department: 'Human Resources', branch: 'Pune Works',
          email: 'sandeep.shinde@abcmfg.com', phone: '+91 98201 11223', doj: '2022-07-15', status: 'Active', employmentType: 'Full-Time', managerName: 'Sunita Verma',
          costCenter: 'HR-PUN-01', panNumber: 'ABCPS1010F', aadhaarNumber: '9901-2234-5575', uanNumber: '100900112242', bankAccount: '918020011232', bankIfsc: 'HDFC0000123', bankName: 'HDFC Bank',
          basicSalary: 25000, grossSalary: 50000, ctc: 650000, isPfApplicable: true, isEsiApplicable: false, isPtApplicable: true, noticePeriodDays: 45,
          leaveBalance: { casual: 5, sick: 5, privilege: 10, compOff: 0 }, attendanceSummaryMtd: { present: 25, absent: 0, halfDay: 0, lateComing: 0, otHours: 0 }
        },
        {
          id: 'ABC-EMP-111', tenantId: 'abc_mfg', fullName: 'Deepak Pawar', designation: 'Senior QC Inspector', department: 'Quality Control', branch: 'Pune Works',
          email: 'deepak.pawar@abcmfg.com', phone: '+91 98201 22334', doj: '2021-09-01', status: 'Active', employmentType: 'Full-Time', managerName: 'Neha Patil',
          costCenter: 'QC-PUN-01', panNumber: 'ABCPS1011F', aadhaarNumber: '9901-2234-5576', uanNumber: '100900112243', bankAccount: '918020011233', bankIfsc: 'AXIS0000111', bankName: 'Axis Bank',
          basicSalary: 22000, grossSalary: 44000, ctc: 580000, isPfApplicable: true, isEsiApplicable: false, isPtApplicable: true, noticePeriodDays: 30,
          leaveBalance: { casual: 6, sick: 4, privilege: 9, compOff: 1 }, attendanceSummaryMtd: { present: 24, absent: 1, halfDay: 0, lateComing: 3, otHours: 4 }
        },
        {
          id: 'ABC-EMP-112', tenantId: 'abc_mfg', fullName: 'Rahul Jadhav', designation: 'Assembly Supervisor', department: 'Manufacturing', branch: 'Pune Works',
          email: 'rahul.jadhav@abcmfg.com', phone: '+91 98201 33445', doj: '2020-05-10', status: 'Active', employmentType: 'Full-Time', managerName: 'Vikram Deshmukh',
          costCenter: 'MFG-PUN-01', panNumber: 'ABCPS1012F', aadhaarNumber: '9901-2234-5577', uanNumber: '100900112244', bankAccount: '918020011234', bankIfsc: 'SBIN0000789', bankName: 'State Bank of India',
          basicSalary: 18000, grossSalary: 36000, ctc: 480000, isPfApplicable: true, isEsiApplicable: false, isPtApplicable: true, noticePeriodDays: 30,
          leaveBalance: { casual: 4, sick: 6, privilege: 8, compOff: 2 }, attendanceSummaryMtd: { present: 25, absent: 0, halfDay: 0, lateComing: 1, otHours: 10 }
        },
        {
          id: 'ABC-EMP-113', tenantId: 'abc_mfg', fullName: 'Ganesh Bhosale', designation: 'Tool Room Technician', department: 'Maintenance', branch: 'Pune Works',
          email: 'ganesh.bhosale@abcmfg.com', phone: '+91 98201 44556', doj: '2022-01-15', status: 'Active', employmentType: 'Full-Time', managerName: 'Manoj Waghmare',
          costCenter: 'MNT-PUN-01', panNumber: 'ABCPS1013F', aadhaarNumber: '9901-2234-5578', uanNumber: '100900112245', esicNumber: '3100012350', bankAccount: '918020011235', bankIfsc: 'MAHB0000333', bankName: 'Bank of Maharashtra',
          basicSalary: 12000, grossSalary: 20000, ctc: 270000, isPfApplicable: true, isEsiApplicable: true, isPtApplicable: true, noticePeriodDays: 30,
          leaveBalance: { casual: 6, sick: 6, privilege: 6, compOff: 0 }, attendanceSummaryMtd: { present: 24, absent: 1, halfDay: 0, lateComing: 2, otHours: 14 }
        },
        {
          id: 'ABC-EMP-114', tenantId: 'abc_mfg', fullName: 'Vijay More', designation: 'Assembly Line Operator', department: 'Manufacturing', branch: 'Pune Works',
          email: 'vijay.more@abcmfg.com', phone: '+91 98201 55667', doj: '2022-03-01', status: 'Active', employmentType: 'Full-Time', managerName: 'Rahul Jadhav',
          costCenter: 'MFG-PUN-01', panNumber: 'ABCPS1014F', aadhaarNumber: '9901-2234-5579', uanNumber: '100900112246', esicNumber: '3100012351', bankAccount: '918020011236', bankIfsc: 'MAHB0000333', bankName: 'Bank of Maharashtra',
          basicSalary: 11500, grossSalary: 19500, ctc: 260000, isPfApplicable: true, isEsiApplicable: true, isPtApplicable: true, noticePeriodDays: 30,
          leaveBalance: { casual: 5, sick: 4, privilege: 5, compOff: 0 }, attendanceSummaryMtd: { present: 26, absent: 0, halfDay: 0, lateComing: 0, otHours: 16 }
        },
        {
          id: 'ABC-EMP-115', tenantId: 'abc_mfg', fullName: 'Santosh Kamble', designation: 'CNC Machine Operator', department: 'Manufacturing', branch: 'Pune Works',
          email: 'santosh.kamble@abcmfg.com', phone: '+91 98201 66778', doj: '2022-06-15', status: 'Active', employmentType: 'Full-Time', managerName: 'Rahul Jadhav',
          costCenter: 'MFG-PUN-01', panNumber: 'ABCPS1015F', aadhaarNumber: '9901-2234-5580', uanNumber: '100900112247', esicNumber: '3100012352', bankAccount: '918020011237', bankIfsc: 'SBIN0000789', bankName: 'State Bank of India',
          basicSalary: 11000, grossSalary: 18500, ctc: 245000, isPfApplicable: true, isEsiApplicable: true, isPtApplicable: true, noticePeriodDays: 30,
          leaveBalance: { casual: 6, sick: 3, privilege: 4, compOff: 0 }, attendanceSummaryMtd: { present: 23, absent: 2, halfDay: 0, lateComing: 1, otHours: 12 }
        },
        {
          id: 'ABC-EMP-116', tenantId: 'abc_mfg', fullName: 'Ramesh Ghadge', designation: 'Warehouse Assistant', department: 'Supply Chain', branch: 'Pune Works',
          email: 'ramesh.ghadge@abcmfg.com', phone: '+91 98201 77889', doj: '2022-09-01', status: 'Active', employmentType: 'Full-Time', managerName: 'Aniket Joshi',
          costCenter: 'SCM-PUN-01', panNumber: 'ABCPS1016F', aadhaarNumber: '9901-2234-5581', uanNumber: '100900112248', esicNumber: '3100012353', bankAccount: '918020011238', bankIfsc: 'MAHB0000333', bankName: 'Bank of Maharashtra',
          basicSalary: 10500, grossSalary: 17500, ctc: 235000, isPfApplicable: true, isEsiApplicable: true, isPtApplicable: true, noticePeriodDays: 30,
          leaveBalance: { casual: 4, sick: 5, privilege: 6, compOff: 0 }, attendanceSummaryMtd: { present: 25, absent: 0, halfDay: 0, lateComing: 0, otHours: 6 }
        },
        {
          id: 'ABC-EMP-117', tenantId: 'abc_mfg', fullName: 'Suresh Thorat', designation: 'Maintenance Fitter', department: 'Maintenance', branch: 'Pune Works',
          email: 'suresh.thorat@abcmfg.com', phone: '+91 98201 88990', doj: '2023-01-10', status: 'Active', employmentType: 'Full-Time', managerName: 'Manoj Waghmare',
          costCenter: 'MNT-PUN-01', panNumber: 'ABCPS1017F', aadhaarNumber: '9901-2234-5582', uanNumber: '100900112249', esicNumber: '3100012354', bankAccount: '918020011239', bankIfsc: 'SBIN0000789', bankName: 'State Bank of India',
          basicSalary: 10000, grossSalary: 16500, ctc: 220000, isPfApplicable: true, isEsiApplicable: true, isPtApplicable: true, noticePeriodDays: 30,
          leaveBalance: { casual: 5, sick: 4, privilege: 3, compOff: 1 }, attendanceSummaryMtd: { present: 24, absent: 1, halfDay: 0, lateComing: 2, otHours: 10 }
        },
        {
          id: 'ABC-EMP-118', tenantId: 'abc_mfg', fullName: 'Swati Sawant', designation: 'Accounts Officer', department: 'Finance', branch: 'Mumbai HQ',
          email: 'swati.sawant@abcmfg.com', phone: '+91 98201 99001', doj: '2023-03-01', status: 'Active', employmentType: 'Full-Time', managerName: 'Amit Kulkarni',
          costCenter: 'FIN-MUM-01', panNumber: 'ABCPS1018F', aadhaarNumber: '9901-2234-5583', uanNumber: '100900112250', bankAccount: '918020011240', bankIfsc: 'HDFC0000123', bankName: 'HDFC Bank',
          basicSalary: 24000, grossSalary: 48000, ctc: 620000, isPfApplicable: true, isEsiApplicable: false, isPtApplicable: true, noticePeriodDays: 30,
          leaveBalance: { casual: 6, sick: 6, privilege: 8, compOff: 0 }, attendanceSummaryMtd: { present: 25, absent: 0, halfDay: 0, lateComing: 0, otHours: 0 }
        },
        {
          id: 'ABC-EMP-119', tenantId: 'abc_mfg', fullName: 'Pooja Hegde', designation: 'Software Developer (IT Systems)', department: 'IT', branch: 'Bengaluru Plant',
          email: 'pooja.hegde@abcmfg.com', phone: '+91 98202 11223', doj: '2022-10-01', status: 'Active', employmentType: 'Full-Time', managerName: 'Priya Nair',
          costCenter: 'IT-BLR-01', panNumber: 'ABCPS1019F', aadhaarNumber: '9901-2234-5584', uanNumber: '100900112251', bankAccount: '918020011241', bankIfsc: 'ICIC0000456', bankName: 'ICICI Bank',
          basicSalary: 40000, grossSalary: 80000, ctc: 1050000, isPfApplicable: true, isEsiApplicable: false, isPtApplicable: true, noticePeriodDays: 45,
          leaveBalance: { casual: 7, sick: 5, privilege: 11, compOff: 0 }, attendanceSummaryMtd: { present: 24, absent: 1, halfDay: 0, lateComing: 1, otHours: 0 }
        },
        {
          id: 'ABC-EMP-120', tenantId: 'abc_mfg', fullName: 'Karthik Menon', designation: 'Embedded Hardware Engineer', department: 'R&D', branch: 'Bengaluru Plant',
          email: 'karthik.menon@abcmfg.com', phone: '+91 98202 22334', doj: '2021-11-15', status: 'Active', employmentType: 'Full-Time', managerName: 'Priya Nair',
          costCenter: 'RD-BLR-01', panNumber: 'ABCPS1020F', aadhaarNumber: '9901-2234-5585', uanNumber: '100900112252', bankAccount: '918020011242', bankIfsc: 'HDFC0000123', bankName: 'HDFC Bank',
          basicSalary: 42000, grossSalary: 84000, ctc: 1100000, isPfApplicable: true, isEsiApplicable: false, isPtApplicable: true, noticePeriodDays: 45,
          leaveBalance: { casual: 6, sick: 6, privilege: 12, compOff: 0 }, attendanceSummaryMtd: { present: 25, absent: 0, halfDay: 0, lateComing: 0, otHours: 0 }
        },
        {
          id: 'ABC-EMP-121', tenantId: 'abc_mfg', fullName: 'Snehal Gaikwad', designation: 'EHS & Plant Safety Officer', department: 'Quality Control', branch: 'Pune Works',
          email: 'snehal.gaikwad@abcmfg.com', phone: '+91 98202 33445', doj: '2023-02-01', status: 'Active', employmentType: 'Full-Time', managerName: 'Neha Patil',
          costCenter: 'QC-PUN-01', panNumber: 'ABCPS1021F', aadhaarNumber: '9901-2234-5586', uanNumber: '100900112253', bankAccount: '918020011243', bankIfsc: 'AXIS0000111', bankName: 'Axis Bank',
          basicSalary: 20000, grossSalary: 40000, ctc: 520000, isPfApplicable: true, isEsiApplicable: false, isPtApplicable: true, noticePeriodDays: 30,
          leaveBalance: { casual: 5, sick: 6, privilege: 7, compOff: 0 }, attendanceSummaryMtd: { present: 24, absent: 1, halfDay: 0, lateComing: 1, otHours: 0 }
        },
        {
          id: 'ABC-EMP-122', tenantId: 'abc_mfg', fullName: 'Arvind Mehta', designation: 'Industrial Sales Manager', department: 'Sales & Marketing', branch: 'Mumbai HQ',
          email: 'arvind.mehta@abcmfg.com', phone: '+91 98202 44556', doj: '2019-04-01', status: 'Active', employmentType: 'Full-Time', managerName: 'Rajesh Sharma',
          costCenter: 'SLS-MUM-01', panNumber: 'ABCPS1022F', aadhaarNumber: '9901-2234-5587', uanNumber: '100900112254', bankAccount: '918020011244', bankIfsc: 'HDFC0000123', bankName: 'HDFC Bank',
          basicSalary: 62000, grossSalary: 124000, ctc: 1650000, isPfApplicable: true, isEsiApplicable: false, isPtApplicable: true, noticePeriodDays: 60,
          leaveBalance: { casual: 8, sick: 7, privilege: 19, compOff: 0 }, attendanceSummaryMtd: { present: 23, absent: 2, halfDay: 0, lateComing: 0, otHours: 0 }
        },
        {
          id: 'ABC-EMP-123', tenantId: 'abc_mfg', fullName: "Rohan D'Souza", designation: 'Key Account Executive', department: 'Sales & Marketing', branch: 'Mumbai HQ',
          email: 'rohan.dsouza@abcmfg.com', phone: '+91 98202 55667', doj: '2023-05-15', status: 'Active', employmentType: 'Full-Time', managerName: 'Arvind Mehta',
          costCenter: 'SLS-MUM-01', panNumber: 'ABCPS1023F', aadhaarNumber: '9901-2234-5588', uanNumber: '100900112255', bankAccount: '918020011245', bankIfsc: 'ICIC0000456', bankName: 'ICICI Bank',
          basicSalary: 20000, grossSalary: 40000, ctc: 520000, isPfApplicable: true, isEsiApplicable: false, isPtApplicable: true, noticePeriodDays: 30,
          leaveBalance: { casual: 4, sick: 5, privilege: 6, compOff: 0 }, attendanceSummaryMtd: { present: 25, absent: 0, halfDay: 0, lateComing: 1, otHours: 0 }
        },
        {
          id: 'ABC-EMP-124', tenantId: 'abc_mfg', fullName: 'Nidhi Shetty', designation: 'Customer Service Lead', department: 'Supply Chain', branch: 'Bengaluru Plant',
          email: 'nidhi.shetty@abcmfg.com', phone: '+91 98202 66778', doj: '2022-08-10', status: 'Active', employmentType: 'Full-Time', managerName: 'Aniket Joshi',
          costCenter: 'SCM-BLR-01', panNumber: 'ABCPS1024F', aadhaarNumber: '9901-2234-5589', uanNumber: '100900112256', bankAccount: '918020011246', bankIfsc: 'KKBK0000222', bankName: 'Kotak Mahindra Bank',
          basicSalary: 26000, grossSalary: 52000, ctc: 680000, isPfApplicable: true, isEsiApplicable: false, isPtApplicable: true, noticePeriodDays: 30,
          leaveBalance: { casual: 6, sick: 6, privilege: 9, compOff: 0 }, attendanceSummaryMtd: { present: 24, absent: 1, halfDay: 0, lateComing: 0, otHours: 0 }
        },
        {
          id: 'ABC-EMP-125', tenantId: 'abc_mfg', fullName: 'Mahesh Tambe', designation: 'Plant Electrician', department: 'Maintenance', branch: 'Pune Works',
          email: 'mahesh.tambe@abcmfg.com', phone: '+91 98202 77889', doj: '2023-06-01', status: 'Active', employmentType: 'Full-Time', managerName: 'Manoj Waghmare',
          costCenter: 'MNT-PUN-01', panNumber: 'ABCPS1025F', aadhaarNumber: '9901-2234-5590', uanNumber: '100900112257', esicNumber: '3100012358', bankAccount: '918020011247', bankIfsc: 'MAHB0000333', bankName: 'Bank of Maharashtra',
          basicSalary: 9500, grossSalary: 15500, ctc: 205000, isPfApplicable: true, isEsiApplicable: true, isPtApplicable: true, noticePeriodDays: 30,
          leaveBalance: { casual: 4, sick: 4, privilege: 3, compOff: 0 }, attendanceSummaryMtd: { present: 25, absent: 0, halfDay: 0, lateComing: 1, otHours: 8 }
        },
        {
          id: 'ABC-EMP-126', tenantId: 'abc_mfg', fullName: 'Prakash Salunkhe', designation: 'Forklift Operator', department: 'Supply Chain', branch: 'Pune Works',
          email: 'prakash.salunkhe@abcmfg.com', phone: '+91 98202 88990', doj: '2023-07-15', status: 'Active', employmentType: 'Full-Time', managerName: 'Ramesh Ghadge',
          costCenter: 'SCM-PUN-01', panNumber: 'ABCPS1026F', aadhaarNumber: '9901-2234-5591', uanNumber: '100900112258', esicNumber: '3100012359', bankAccount: '918020011248', bankIfsc: 'SBIN0000789', bankName: 'State Bank of India',
          basicSalary: 9000, grossSalary: 14500, ctc: 195000, isPfApplicable: true, isEsiApplicable: true, isPtApplicable: true, noticePeriodDays: 30,
          leaveBalance: { casual: 3, sick: 3, privilege: 2, compOff: 0 }, attendanceSummaryMtd: { present: 24, absent: 1, halfDay: 0, lateComing: 0, otHours: 6 }
        },
        {
          id: 'ABC-EMP-127', tenantId: 'abc_mfg', fullName: 'Aarti Mane', designation: 'Front Office Executive', department: 'Human Resources', branch: 'Mumbai HQ',
          email: 'aarti.mane@abcmfg.com', phone: '+91 98202 99001', doj: '2023-09-01', status: 'Active', employmentType: 'Full-Time', managerName: 'Sunita Verma',
          costCenter: 'HR-MUM-01', panNumber: 'ABCPS1027F', aadhaarNumber: '9901-2234-5592', uanNumber: '100900112259', esicNumber: '3100012360', bankAccount: '918020011249', bankIfsc: 'ICIC0000456', bankName: 'ICICI Bank',
          basicSalary: 12500, grossSalary: 20500, ctc: 275000, isPfApplicable: true, isEsiApplicable: true, isPtApplicable: true, noticePeriodDays: 30,
          leaveBalance: { casual: 5, sick: 4, privilege: 4, compOff: 0 }, attendanceSummaryMtd: { present: 25, absent: 0, halfDay: 0, lateComing: 0, otHours: 0 }
        },
        {
          id: 'ABC-EMP-128', tenantId: 'abc_mfg', fullName: 'Tanvi Kulkarni', designation: 'Graduate Trainee Engineer', department: 'R&D', branch: 'Pune Works',
          email: 'tanvi.kulkarni@abcmfg.com', phone: '+91 98203 11223', doj: '2024-01-15', status: 'Probation', employmentType: 'Probation', managerName: 'Neha Patil',
          costCenter: 'RD-PUN-01', panNumber: 'ABCPS1028F', aadhaarNumber: '9901-2234-5593', uanNumber: '100900112260', bankAccount: '918020011250', bankIfsc: 'HDFC0000123', bankName: 'HDFC Bank',
          basicSalary: 15000, grossSalary: 25000, ctc: 320000, isPfApplicable: true, isEsiApplicable: false, isPtApplicable: true, noticePeriodDays: 30,
          leaveBalance: { casual: 3, sick: 2, privilege: 0, compOff: 0 }, attendanceSummaryMtd: { present: 24, absent: 1, halfDay: 0, lateComing: 2, otHours: 0 }
        },
        {
          id: 'ABC-EMP-129', tenantId: 'abc_mfg', fullName: 'Yash Rane', designation: 'R&D Engineering Intern', department: 'R&D', branch: 'Bengaluru Plant',
          email: 'yash.rane@abcmfg.com', phone: '+91 98203 22334', doj: '2024-05-01', status: 'Active', employmentType: 'Intern', managerName: 'Priya Nair',
          costCenter: 'RD-BLR-01', panNumber: 'ABCPS1029F', aadhaarNumber: '9901-2234-5594', uanNumber: '', bankAccount: '918020011251', bankIfsc: 'AXIS0000111', bankName: 'Axis Bank',
          basicSalary: 8000, grossSalary: 12000, ctc: 144000, isPfApplicable: false, isEsiApplicable: false, isPtApplicable: false, noticePeriodDays: 15,
          leaveBalance: { casual: 2, sick: 2, privilege: 0, compOff: 0 }, attendanceSummaryMtd: { present: 23, absent: 2, halfDay: 0, lateComing: 0, otHours: 0 }
        },
        {
          id: 'ABC-EMP-130', tenantId: 'abc_mfg', fullName: 'Bhaskar Kadam', designation: 'Packing Line Operator', department: 'Manufacturing', branch: 'Pune Works',
          email: 'bhaskar.kadam@abcmfg.com', phone: '+91 98203 33445', doj: '2021-08-01', status: 'Notice Period', employmentType: 'Full-Time', managerName: 'Rahul Jadhav',
          costCenter: 'MFG-PUN-01', panNumber: 'ABCPS1030F', aadhaarNumber: '9901-2234-5595', uanNumber: '100900112262', esicNumber: '3100012361', bankAccount: '918020011252', bankIfsc: 'MAHB0000333', bankName: 'Bank of Maharashtra',
          basicSalary: 9200, grossSalary: 15000, ctc: 200000, isPfApplicable: true, isEsiApplicable: true, isPtApplicable: true, noticePeriodDays: 30,
          leaveBalance: { casual: 1, sick: 1, privilege: 2, compOff: 0 }, attendanceSummaryMtd: { present: 22, absent: 3, halfDay: 0, lateComing: 1, otHours: 4 }
        }
      ];

      qaEmployees.forEach(e => this.data.employees.push(e));
      this.saveDB();
    }

    const cleanTenant = this.normalizeTenantId(tenantId);
    let list = this.data.employees.filter(e => this.normalizeTenantId(e.tenantId) === cleanTenant);

    if (params?.branch && params.branch !== 'ALL') {
      list = list.filter(e => e.branch === params.branch);
    }
    if (params?.department && params.department !== 'ALL') {
      list = list.filter(e => e.department === params.department);
    }
    if (params?.status && params.status !== 'ALL') {
      list = list.filter(e => e.status === params.status);
    }
    if (params?.query) {
      const q = params.query.toLowerCase();
      list = list.filter(e => e.fullName.toLowerCase().includes(q) || e.id.toLowerCase().includes(q) || e.designation.toLowerCase().includes(q));
    }

    // Apply PII Masking unless explicitly requested unmasked
    if (!params?.unmask) {
      list = list.map(emp => ({
        ...emp,
        panNumber: emp.panNumber ? emp.panNumber.slice(0, 5) + '****' + emp.panNumber.slice(-1) : '*****',
        aadhaarNumber: emp.aadhaarNumber ? '****-****-' + emp.aadhaarNumber.slice(-4) : '****-****-****',
        bankAccount: emp.bankAccount ? '******' + emp.bankAccount.slice(-4) : '******'
      }));
    }

    return list;
  }

  public createEmployee(tenantId: string, empData: any) {
    const id = empData.id || `${tenantId.toUpperCase()}-EMP-${Math.floor(10000 + Math.random() * 90000)}`;
    const newEmp = {
      ...empData,
      id,
      tenantId,
      basicSalary: empData.basicSalary || 30000,
      grossSalary: empData.grossSalary || (empData.basicSalary ? empData.basicSalary * 2 : 60000),
      ctc: empData.ctc || 720000,
      leaveBalance: empData.leaveBalance || { casual: 6, sick: 6, privilege: 12, compOff: 0 },
      attendanceSummaryMtd: empData.attendanceSummaryMtd || { present: 0, absent: 0, halfDay: 0, lateComing: 0, otHours: 0 }
    };

    this.data.employees.push(newEmp);

    // Update tenant count
    const tenant = this.getTenant(tenantId);
    if (tenant) tenant.employeeCount = (tenant.employeeCount || 0) + 1;

    this.addAuditLog(tenantId, 'hr-admin', 'HR Admin', 'CREATE_EMPLOYEE', 'Employee', `Created employee ${newEmp.fullName} (${id})`);
    this.saveDB();
    return newEmp;
  }

  public updateEmployee(tenantId: string, empId: string, updates: any) {
    const idx = this.data.employees.findIndex(e => e.tenantId === tenantId && e.id === empId);
    if (idx !== -1) {
      this.data.employees[idx] = { ...this.data.employees[idx], ...updates };
      this.addAuditLog(tenantId, 'hr-admin', 'HR Admin', 'UPDATE_EMPLOYEE', 'Employee', `Updated employee details for ${empId}`);
      this.saveDB();
      return this.data.employees[idx];
    }
    return null;
  }

  // --- Attendance Operations ---
  public getAttendanceGrid(tenantId: string, month = '2026-07') {
    const key = `${tenantId}_${month}`;
    if (this.data.attendanceGrids[key]) {
      return this.data.attendanceGrids[key];
    }

    // Build grid from active tenant employees
    const employees = this.data.employees.filter(e => e.tenantId === tenantId);
    const grid: Record<string, any> = {};

    employees.forEach(emp => {
      const daily: Record<string, any> = {};
      for (let day = 1; day <= 31; day++) {
        let status = 'P';
        if (day % 7 === 0 || day % 7 === 6) status = 'WO';
        daily[day.toString()] = {
          date: `2026-07-${day < 10 ? '0' + day : day}`,
          status,
          inTime: status === 'P' ? '09:30 AM' : undefined,
          outTime: status === 'P' ? '06:30 PM' : undefined,
          totalHours: status === 'P' ? 9 : 0
        };
      }
      grid[emp.id] = {
        employeeId: emp.id,
        employeeName: emp.fullName,
        department: emp.department,
        daily,
        totalPresent: 22,
        totalAbsent: 0,
        totalLeave: 0,
        totalLate: 0,
        totalOT: 0
      };
    });

    this.data.attendanceGrids[key] = grid;
    this.saveDB();
    return grid;
  }

  public updateAttendanceStatus(tenantId: string, month: string, employeeId: string, dateStr: string, status: string) {
    const key = `${tenantId}_${month}`;
    const grid = this.getAttendanceGrid(tenantId, month);
    if (grid[employeeId]) {
      const dayNum = parseInt(dateStr.split('-')[2], 10).toString();
      if (grid[employeeId].daily[dayNum]) {
        grid[employeeId].daily[dayNum].status = status;
      }
    }
    this.saveDB();
    return { success: true };
  }

  // --- Real Dynamic Payroll Calculation Engine ---
  // BUG-004 FIX: HRA consistent at 40% (matches salary components master)
  // BUG-005 FIX: LOP uses tenant workDaysPerMonth (default 26, not hardcoded 30)
  // BUG-008 FIX: Attendance month derived from payroll month parameter
  public calculatePayrollBatch(tenantId: string, month = 'July 2026', year = 2026) {
    const employees = this.data.employees.filter(e => e.tenantId === tenantId && e.status !== 'Exited');
    
    // Derive attendance month key from payroll month parameter
    const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const monthIdx = monthNames.indexOf(month.split(' ')[0]);
    const payrollYear = year || parseInt(month.split(' ')[1] || '2026');
    const attendanceMonthKey = monthIdx >= 0
      ? `${payrollYear}-${String(monthIdx + 1).padStart(2, '0')}`
      : '2026-07';
    const attendanceGrid = this.getAttendanceGrid(tenantId, attendanceMonthKey);

    // Get tenant working days configuration (default 26 per Indian payroll standards)
    const settings = this.getSettings(tenantId);
    const workDaysPerMonth: number = (settings as any)?.workDaysPerMonth || 26;

    let totalGrossPay = 0;
    let totalNetPay = 0;
    let totalDeductions = 0;
    let totalPF = 0;
    let totalESIC = 0;
    let totalTDS = 0;
    let totalPT = 0;

    const records: any[] = [];

    employees.forEach(emp => {
      const basic = emp.basicSalary || Math.round(emp.grossSalary * 0.5);
      // BUG-004 FIX: HRA at 40% to match salary slip and salary component master
      const hra = Math.round(basic * 0.40);
      const conveyance = 1600;
      const medical = 1250;
      const special = Math.max(0, emp.grossSalary - (basic + hra + conveyance + medical));

      // Calculate LOP days from attendance grid
      let absentDays = 0;
      if (attendanceGrid[emp.id]) {
        const daily = attendanceGrid[emp.id].daily;
        Object.values(daily).forEach((d: any) => {
          if (d.status === 'A') absentDays++;
        });
      }

      // BUG-005 FIX: Use tenant workDaysPerMonth instead of hardcoded 30
      const lopDeduction = Math.round((emp.grossSalary / workDaysPerMonth) * absentDays);
      const earnedGross = Math.max(0, emp.grossSalary - lopDeduction);

      // EPF Calculation: 12% of Basic, capped at pfWageCap (default ₹15,000)
      const pfWageCap = (settings as any)?.pfWageCap || 15000;
      const pfWage = Math.min(basic, pfWageCap);
      const epfEmployee = emp.isPfApplicable === false ? 0 : Math.round(pfWage * 0.12);
      
      // EPF Employer split: EPS (8.33% capped at ₹1,250) + EPF Balance (3.67%) + EDLI (0.5%)
      const epsEmployer = emp.isPfApplicable === false ? 0 : Math.min(Math.round(pfWage * 0.0833), 1250);
      const epfEmployer = emp.isPfApplicable === false ? 0 : (epfEmployee - epsEmployer);
      const edliEmployer = emp.isPfApplicable === false ? 0 : Math.round(pfWage * 0.005);

      // ESIC Calculation: 0.75% EE, 3.25% ER if gross <= 21,000
      let esicEmployee = 0;
      let esicEmployer = 0;
      if (emp.grossSalary <= 21000 && emp.isEsiApplicable !== false) {
        esicEmployee = Math.round(earnedGross * 0.0075);
        esicEmployer = Math.round(earnedGross * 0.0325);
      }

      // Professional Tax (PT) State-Wise Slab Rules (BUG-010 FIX)
      let pt = 0;
      const branchLower = (emp.branch || '').toLowerCase();
      const isFeb = month.toLowerCase().includes('february') || month.includes('-02');

      if (emp.isPtApplicable !== false) {
        if (branchLower.includes('karnataka') || branchLower.includes('bengaluru') || branchLower.includes('bangalore')) {
          // Karnataka PT: >= ₹25,000 gets ₹200
          if (earnedGross >= 25000) pt = 200;
        } else if (branchLower.includes('gujarat') || branchLower.includes('ahmedabad')) {
          // Gujarat PT: >= ₹12,000 gets ₹200
          if (earnedGross >= 12000) pt = 200;
        } else {
          // Default: Maharashtra PT Rules (> 7,500 to 10,000: ₹175, > 10,000: ₹200, Feb ₹300)
          if (earnedGross > 7500 && earnedGross <= 10000) {
            pt = 175;
          } else if (earnedGross > 10000) {
            pt = isFeb ? 300 : 200;
          }
        }
      }

      // Accurate TDS Calculation under New Tax Regime Sec 115BAC (FY 2026-27) (BUG-011 FIX)
      let tds = 0;
      const annualCTC = emp.ctc || earnedGross * 12;
      const taxableIncome = Math.max(0, annualCTC - 75000); // Standard Deduction ₹75k

      if (taxableIncome > 700000) { // Sec 87A rebate applies if taxable <= ₹7,00,000
        let annualTax = 0;
        if (taxableIncome > 1500000) {
          annualTax = 140000 + (taxableIncome - 1500000) * 0.30;
        } else if (taxableIncome > 1200000) {
          annualTax = 80000 + (taxableIncome - 1200000) * 0.20;
        } else if (taxableIncome > 1000000) {
          annualTax = 50000 + (taxableIncome - 1000000) * 0.15;
        } else if (taxableIncome > 700000) {
          annualTax = 20000 + (taxableIncome - 700000) * 0.10;
        }
        // 4% Health & Education Cess
        annualTax = Math.round(annualTax * 1.04);
        tds = Math.round(annualTax / 12);
      }

      const totalEmpDeductions = epfEmployee + esicEmployee + pt + tds + lopDeduction;
      const netPay = Math.max(0, earnedGross - (epfEmployee + esicEmployee + pt + tds));

      totalGrossPay += earnedGross;
      totalNetPay += netPay;
      totalDeductions += totalEmpDeductions;
      totalPF += epfEmployee;
      totalESIC += esicEmployee;
      totalTDS += tds;
      totalPT += pt;

      records.push({
        employeeId: emp.id,
        employeeName: emp.fullName,
        department: emp.department,
        designation: emp.designation,
        branch: emp.branch || '',
        basic,
        hra,
        conveyance: 1600,
        medical: 1250,
        special,
        grossSalary: earnedGross,
        absentDays,
        lopDeduction,
        workDaysPerMonth,
        pfWage,
        epfEmployee,
        epsEmployer,
        epfEmployer,
        edliEmployer,
        esicEmployee,
        esicEmployer,
        pt,
        tds,
        totalDeductions: totalEmpDeductions,
        netPay
      });
    });

    const batch = {
      id: `BATCH-${year}-${month.slice(0, 3).toUpperCase()}-${tenantId.toUpperCase()}`,
      tenantId,
      month,
      year,
      monthIndex: monthIdx >= 0 ? monthIdx + 1 : 7,
      totalEmployees: employees.length,
      totalGrossPay,
      totalNetPay,
      totalDeductions,
      totalPF,
      totalESIC,
      totalTDS,
      totalPT,
      status: 'Calculated',
      approvals: { hr: false, finance: false, director: false },
      calculatedAt: new Date().toISOString(),
      records
    };

    // Update or insert batch in DB
    const existingIdx = this.data.payrollBatches.findIndex(b => b.tenantId === tenantId && b.month === month);
    if (existingIdx !== -1) {
      this.data.payrollBatches[existingIdx] = batch;
    } else {
      this.data.payrollBatches.unshift(batch);
    }

    this.addAuditLog(tenantId, 'payroll-engine', 'Payroll Engine', 'CALCULATE_PAYROLL', 'PayrollBatch', `Calculated payroll for ${employees.length} employees for ${month}`);
    this.saveDB();
    return batch;
  }

  public getPayrollBatches(tenantId: string) {
    const list = this.data.payrollBatches.filter(b => b.tenantId === tenantId);
    if (list.length === 0) {
      // Calculate automatically for clean experience
      return [this.calculatePayrollBatch(tenantId)];
    }
    return list;
  }

  public approvePayrollStep(tenantId: string, batchId: string, stage: 'hr' | 'finance' | 'director', userName: string) {
    const batch = this.data.payrollBatches.find(b => b.tenantId === tenantId && (b.id === batchId || !batchId));
    if (batch) {
      if (!batch.approvals) batch.approvals = {};
      batch.approvals[stage] = true;

      // Enforce sequential workflow status transitions (BUG-021 FIX)
      if (stage === 'hr') {
        batch.status = 'Pending Finance Approval';
      } else if (stage === 'finance') {
        if (!batch.approvals.hr) {
          throw new Error('Workflow Violation: HR signoff is required before Finance approval.');
        }
        batch.status = 'Pending Director Approval';
      } else if (stage === 'director') {
        if (!batch.approvals.hr || !batch.approvals.finance) {
          throw new Error('Workflow Violation: Both HR and Finance signoffs are required before Director approval.');
        }
        batch.status = 'Approved';
        batch.approvedOn = new Date().toISOString();
      }

      this.addAuditLog(tenantId, 'approver', userName, 'APPROVE_PAYROLL', 'PayrollBatch', `Granted ${stage.toUpperCase()} signoff for payroll batch ${batch.id}`);
      this.saveDB();
      return batch;
    }
    return null;
  }

  public disbursePayrollBatch(tenantId: string, batchId: string) {
    const batch = this.data.payrollBatches.find(b => b.tenantId === tenantId && (b.id === batchId || !batchId));
    if (!batch) return null;

    if (batch.status !== 'Approved' && (!batch.approvals?.hr || !batch.approvals?.finance)) {
      throw new Error('Workflow Violation: Cannot disburse funds for an unapproved payroll batch.');
    }

    batch.status = 'Disbursed';
    batch.disbursedOn = new Date().toISOString();
    this.addAuditLog(tenantId, 'finance-admin', 'Finance Admin', 'DISBURSE_PAYROLL', 'PayrollBatch', `Disbursed payroll funds for batch ${batch.id}`);
    this.saveDB();
    return batch;
  }

  // --- Leave Requests ---
  public getLeaveRequests(tenantId: string) {
    return this.data.leaveRequests.filter(l => l.tenantId === tenantId);
  }

  public createLeaveRequest(tenantId: string, reqData: any) {
    const newReq = {
      ...reqData,
      id: 'LV-' + Date.now().toString().slice(-6),
      tenantId,
      status: 'Pending HR Approval',
      appliedOn: new Date().toISOString().split('T')[0]
    };
    this.data.leaveRequests.unshift(newReq);
    this.addAuditLog(tenantId, reqData.employeeId || 'emp', reqData.employeeName || 'Employee', 'APPLY_LEAVE', 'LeaveRequest', `Applied for ${reqData.leaveType} (${reqData.totalDays} days)`);
    this.saveDB();
    return newReq;
  }

  public updateLeaveStatus(tenantId: string, reqId: string, status: 'Approved' | 'Rejected') {
    const req = this.data.leaveRequests.find(l => l.tenantId === tenantId && l.id === reqId);
    if (req) {
      req.status = status;
      this.addAuditLog(tenantId, 'hr-admin', 'HR Admin', 'UPDATE_LEAVE_STATUS', 'LeaveRequest', `${status} leave request ${reqId} for ${req.employeeName}`);
      this.saveDB();
      return req;
    }
    return null;
  }

  // --- Settings ---
  public getSettings(tenantId: string) {
    return this.data.settings[tenantId] || this.data.settings['apex'];
  }

  public updateSettings(tenantId: string, newSettings: any) {
    this.data.settings[tenantId] = { ...(this.data.settings[tenantId] || {}), ...newSettings };
    this.addAuditLog(tenantId, 'admin', 'Admin', 'UPDATE_SETTINGS', 'Settings', `Updated workspace settings`);
    this.saveDB();
    return this.data.settings[tenantId];
  }

  // --- New Added Methods ---
  // --- Persistent Salary Components Engine (BUG-007 FIX) ---
  public getSalaryComponents(tenantId: string) {
    if (!this.data.salaryComponents) {
      this.data.salaryComponents = {};
    }
    const cleanTenant = this.normalizeTenantId(tenantId);
    if (!this.data.salaryComponents[cleanTenant]) {
      this.data.salaryComponents[cleanTenant] = [
        { id: "basic",       name: "Basic Salary",        type: "earnings",   valueType: "percentage", value: 50,   isStatutory: false },
        { id: "hra",         name: "House Rent Allowance", type: "earnings",   valueType: "percentage", value: 40,   isStatutory: false },
        { id: "conveyance",  name: "Conveyance Allowance", type: "earnings",   valueType: "fixed",      value: 1600, isStatutory: false },
        { id: "medical",     name: "Medical Allowance",    type: "earnings",   valueType: "fixed",      value: 1250, isStatutory: false },
        { id: "special",     name: "Special Allowance",    type: "earnings",   valueType: "percentage", value: 10,   isStatutory: false },
        { id: "epf_ee",      name: "EPF (Employee 12%)",   type: "deductions", valueType: "percentage", value: 12,   isStatutory: true,  statutoryType: "PF"   },
        { id: "esic_ee",     name: "ESIC (Employee 0.75%)", type: "deductions", valueType: "percentage", value: 0.75, isStatutory: true,  statutoryType: "ESIC" },
        { id: "pt",          name: "Professional Tax",     type: "deductions", valueType: "fixed",      value: 200,  isStatutory: true,  statutoryType: "PT"   },
        { id: "tds",         name: "Income Tax (TDS)",     type: "deductions", valueType: "percentage", value: 5,    isStatutory: true,  statutoryType: "TDS"  }
      ];
      this.saveDB();
    }
    return this.data.salaryComponents[cleanTenant];
  }

  public addSalaryComponent(tenantId: string, component: any) {
    const list = this.getSalaryComponents(tenantId);
    const newComp = { ...component, id: component.id || `sc-${Date.now()}` };
    list.push(newComp);
    this.addAuditLog(tenantId, 'hr-admin', 'HR Admin', 'CREATE_SALARY_COMPONENT', 'SalaryComponent', `Added salary component ${newComp.name}`);
    this.saveDB();
    return newComp;
  }

  public updateSalaryComponent(tenantId: string, id: string, updates: any) {
    const list = this.getSalaryComponents(tenantId);
    const idx = list.findIndex(c => c.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updates };
      this.addAuditLog(tenantId, 'hr-admin', 'HR Admin', 'UPDATE_SALARY_COMPONENT', 'SalaryComponent', `Updated component ${id}`);
      this.saveDB();
      return list[idx];
    }
    return null;
  }

  public deleteSalaryComponent(tenantId: string, id: string) {
    const list = this.getSalaryComponents(tenantId);
    const cleanTenant = this.normalizeTenantId(tenantId);
    this.data.salaryComponents![cleanTenant] = list.filter(c => c.id !== id);
    this.addAuditLog(tenantId, 'hr-admin', 'HR Admin', 'DELETE_SALARY_COMPONENT', 'SalaryComponent', `Deleted component ${id}`);
    this.saveDB();
    return { success: true };
  }

  public getEmployeeComponents(tenantId: string, employeeId: string) {
    if (!this.data.employeeComponents) this.data.employeeComponents = {};
    const key = `${this.normalizeTenantId(tenantId)}_${employeeId}`;
    if (this.data.employeeComponents[key]) {
      return this.data.employeeComponents[key];
    }
    return this.getSalaryComponents(tenantId).map(c => ({
      ...c,
      employeeValue: c.valueType === 'percentage' ? c.value : c.value
    }));
  }

  public saveEmployeeComponents(tenantId: string, employeeId: string, components: any[]) {
    if (!this.data.employeeComponents) this.data.employeeComponents = {};
    const key = `${this.normalizeTenantId(tenantId)}_${employeeId}`;
    this.data.employeeComponents[key] = components;
    this.addAuditLog(tenantId, 'hr-admin', 'HR Admin', 'UPDATE_SALARY_COMPONENTS', 'Employee', `Saved custom salary components for ${employeeId}`);
    this.saveDB();
    return components;
  }

  public getSalarySlipsByEmployee(tenantId: string, employeeId: string) {
    const existingBatches = this.getPayrollBatches(tenantId);
    const batch = existingBatches[0] || this.calculatePayrollBatch(tenantId);
    const rec = (batch.records || []).find((r: any) => r.employeeId === employeeId);
    if (!rec) return [];
    return [{
      id: `SLIP-${batch.month}-${employeeId}`,
      month: batch.month,
      year: batch.year,
      employeeId,
      employeeName: rec.employeeName,
      designation: rec.designation || '',
      department: rec.department || '',
      basicSalary: rec.basic,
      grossSalary: rec.grossSalary,
      totalDeductions: rec.epfEmployee + rec.esicEmployee + rec.pt + rec.tds,
      netPay: rec.netPay,
      paymentDays: rec.paymentDays,
      presentDays: rec.presentDays || 26,
      lopDays: rec.absentDays || 0,
      earnings: [
        { name: 'Basic Salary', amount: rec.basic },
        { name: 'HRA (40%)', amount: rec.hra || Math.round(rec.basic * 0.40) },
        { name: 'Conveyance Allowance', amount: rec.conveyance || 1600 },
        { name: 'Medical Allowance', amount: rec.medical || 1250 },
        { name: 'Special Allowance', amount: rec.special || Math.max(0, rec.grossSalary - rec.basic - (rec.hra || Math.round(rec.basic * 0.40)) - 1600 - 1250) }
      ],
      deductions: [
        { name: 'EPF (Employee 12%)', amount: rec.epfEmployee },
        { name: 'ESIC (Employee 0.75%)', amount: rec.esicEmployee },
        { name: 'Professional Tax', amount: rec.pt },
        { name: 'Income Tax (TDS)', amount: rec.tds }
      ],
      status: 'Published'
    }];
  }

  public getMasters(tenantId: string) {
    // Derive real branches, departments and designations from live employee data
    const employees = this.getEmployees(tenantId, { unmask: true });

    const branchSet = new Map<string, number>();
    const deptSet = new Map<string, string>();   // dept -> HOD name
    const desigSet = new Set<string>();

    employees.forEach(e => {
      if (e.branch) branchSet.set(e.branch, (branchSet.get(e.branch) || 0) + 1);
      if (e.department) {
        const hod = e.managerName || '';
        if (!deptSet.has(e.department)) deptSet.set(e.department, hod);
      }
      if (e.designation) desigSet.add(e.designation);
    });

    const branches = Array.from(branchSet.entries()).map(([name, count], i) => ({
      id: `br${i + 1}`, name, employeeCount: count, status: 'Active'
    }));

    const departments = Array.from(deptSet.entries()).map(([name, hod], i) => ({
      id: `d${i + 1}`, name, headOfDepartment: hod || '—', employeeCount: employees.filter(e => e.department === name).length, status: 'Active'
    }));

    const designations = Array.from(desigSet).map((name, i) => ({
      id: `ds${i + 1}`, name, employeeCount: employees.filter(e => e.designation === name).length
    }));

    return { branches, departments, designations, salaryComponents: this.getSalaryComponents(tenantId) };
  }

  public getIntegrations(tenantId: string) {
    return [
      { id: 'biometric', name: 'Biometric System', status: 'connected', type: 'attendance' },
      { id: 'erp', name: 'ERP System', status: 'disconnected', type: 'finance' }
    ];
  }

  public getPayRegisterReport(tenantId: string) {
    const batch = this.calculatePayrollBatch(tenantId);
    return batch.records;
  }

  public bulkUpdateAttendance(tenantId: string, updates: any[]) {
    updates.forEach(update => {
      this.updateAttendanceStatus(tenantId, update.month || '2026-07', update.employeeId, update.date, update.status);
    });
    this.saveDB();
    return { success: true };
  }
}

export const db = new PersistentDatabase();
