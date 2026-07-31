import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

// Seed Data
const initialCompanyDetails = {
  name: "Apex Enterprises India Pvt. Ltd.",
  code: "APEX-IN",
  cin: "U72200MH2018PTC309182",
  pan: "AAACA1234F",
  tan: "MUMA12345B",
  epfoEstCode: "MH/BAN/0049281/000",
  esicEstCode: "31000492810001001",
  headquarters: "BKC Office Tower, Bandra Kurla Complex, Mumbai, Maharashtra 400051",
  branches: [
    { code: "MUM-HQ", name: "Mumbai Headquarters", city: "Mumbai", state: "Maharashtra", employeesCount: 78, status: "Active" },
    { code: "BLR-TECH", name: "Bengaluru Tech Hub", city: "Bengaluru", state: "Karnataka", employeesCount: 42, status: "Active" },
    { code: "DEL-NORTH", name: "Delhi NCR Regional Office", city: "Gurugram", state: "Haryana", employeesCount: 22, status: "Active" },
  ],
  departments: [
    "Engineering",
    "Product & Design",
    "Human Resources",
    "Finance & Accounts",
    "Sales & Business Dev",
    "Customer Success",
  ]
};

let dbSalaryComponents = [
  { id: "SC-01", name: "Basic Salary", category: "Earning", type: "Fixed", isStatutory: true, statutoryType: "PF", taxExempt: false },
  { id: "SC-02", name: "House Rent Allowance (HRA)", category: "Earning", type: "Formula", formula: "50% of Basic", isStatutory: false, taxExempt: true },
  { id: "SC-03", name: "Special Allowance", category: "Earning", type: "Variable", isStatutory: false, taxExempt: false },
  { id: "SC-04", name: "Overtime Allowance", category: "Earning", type: "Variable", formula: "1.5x Hourly Rate", isStatutory: false, taxExempt: false },
  { id: "SC-05", name: "Employee Provident Fund (EPF)", category: "Deduction", type: "Formula", formula: "12% of PF Basic", isStatutory: true, statutoryType: "PF", taxExempt: true },
  { id: "SC-06", name: "Employee State Insurance (ESIC)", category: "Deduction", type: "Formula", formula: "0.75% of Gross", isStatutory: true, statutoryType: "ESIC", taxExempt: false },
  { id: "SC-07", name: "Professional Tax (PT)", category: "Deduction", type: "Fixed", isStatutory: true, statutoryType: "PT", taxExempt: false },
  { id: "SC-08", name: "Income Tax (TDS)", category: "Deduction", type: "Variable", isStatutory: true, statutoryType: "TDS", taxExempt: false },
];

let dbEmployeeCustomComponents: Record<string, Record<string, number>> = {
  "EMP-00101": { "SC-01": 45000, "SC-02": 22500, "SC-03": 27500, "SC-05": 1800, "SC-07": 200, "SC-08": 7500 },
  "EMP-00102": { "SC-01": 38000, "SC-02": 19000, "SC-03": 21000, "SC-05": 1800, "SC-07": 200, "SC-08": 4500 },
  "EMP-00103": { "SC-01": 55000, "SC-02": 27500, "SC-03": 27500, "SC-05": 1800, "SC-07": 200, "SC-08": 9200 },
  "EMP-00104": { "SC-01": 28000, "SC-02": 14000, "SC-03": 16000, "SC-05": 1800, "SC-06": 435, "SC-07": 200, "SC-08": 2100 },
  "EMP-00105": { "SC-01": 32000, "SC-02": 16000, "SC-03": 20000, "SC-05": 1800, "SC-07": 200, "SC-08": 3200 }
};

let dbEmployees = [
  {
    id: "EMP-00101",
    fullName: "Rahul Sharma",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    designation: "Lead Systems Architect",
    department: "Engineering",
    branch: "Mumbai Headquarters",
    email: "rahul.sharma@apexenterprises.in",
    phone: "+91 98201 12345",
    doj: "2021-04-15",
    status: "Active",
    employmentType: "Full-Time",
    gender: "Male",
    managerName: "Vikramaditya Rao",
    costCenter: "ENG-MUM-01",
    panNumber: "ABCPS1234F",
    aadhaarNumber: "7821-4920-1123",
    uanNumber: "100912345678",
    esicNumber: "3100123456001",
    bankAccount: "1002938481",
    bankIfsc: "HDFC0000123",
    bankName: "HDFC Bank",
    basicSalary: 45000,
    grossSalary: 95000,
    ctc: 1250000,
    noticePeriodDays: 60,
    leaveBalance: { casual: 5, sick: 4, privilege: 12, compOff: 2 },
    attendanceSummaryMtd: { present: 22, absent: 0, halfDay: 0, lateComing: 1, otHours: 4 }
  },
  {
    id: "EMP-00102",
    fullName: "Priya Patel",
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    designation: "Senior Product Designer",
    department: "Product & Design",
    branch: "Bengaluru Tech Hub",
    email: "priya.patel@apexenterprises.in",
    phone: "+91 98450 67890",
    doj: "2022-08-01",
    status: "Active",
    employmentType: "Full-Time",
    gender: "Female",
    managerName: "Ananya Deshmukh",
    costCenter: "PROD-BLR-02",
    panNumber: "XYZPP9876K",
    aadhaarNumber: "6543-2109-8765",
    uanNumber: "100987654321",
    esicNumber: "3100987654002",
    bankAccount: "2003948192",
    bankIfsc: "ICIC0000102",
    bankName: "ICICI Bank",
    basicSalary: 38000,
    grossSalary: 78000,
    ctc: 1020000,
    noticePeriodDays: 30,
    leaveBalance: { casual: 3, sick: 6, privilege: 8, compOff: 1 },
    attendanceSummaryMtd: { present: 21, absent: 1, halfDay: 0, lateComing: 0, otHours: 2 }
  },
  {
    id: "EMP-00103",
    fullName: "Amit Verma",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    designation: "Finance Operations Manager",
    department: "Finance & Accounts",
    branch: "Mumbai Headquarters",
    email: "amit.verma@apexenterprises.in",
    phone: "+91 97110 54321",
    doj: "2020-01-10",
    status: "Active",
    employmentType: "Full-Time",
    gender: "Male",
    managerName: "Rajesh Kulkarni",
    costCenter: "FIN-MUM-01",
    panNumber: "AQWPV5432L",
    aadhaarNumber: "1234-5678-9012",
    uanNumber: "100955566677",
    bankAccount: "3004819201",
    bankIfsc: "SBIN0001234",
    bankName: "State Bank of India",
    basicSalary: 55000,
    grossSalary: 110000,
    ctc: 1480000,
    noticePeriodDays: 60,
    leaveBalance: { casual: 6, sick: 2, privilege: 15, compOff: 0 },
    attendanceSummaryMtd: { present: 23, absent: 0, halfDay: 0, lateComing: 2, otHours: 6 }
  },
  {
    id: "EMP-00104",
    fullName: "Sneha Deshmukh",
    avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    designation: "HR Generalist & Talent Specialist",
    department: "Human Resources",
    branch: "Mumbai Headquarters",
    email: "sneha.d@apexenterprises.in",
    phone: "+91 99300 88776",
    doj: "2023-02-14",
    status: "Active",
    employmentType: "Full-Time",
    gender: "Female",
    managerName: "Kavita Nair",
    costCenter: "HR-MUM-01",
    panNumber: "BNSDS8899M",
    aadhaarNumber: "9988-7766-5544",
    uanNumber: "100933344411",
    esicNumber: "3100333444003",
    bankAccount: "4005928173",
    bankIfsc: "KKBK0000456",
    bankName: "Kotak Mahindra Bank",
    basicSalary: 28000,
    grossSalary: 58000,
    ctc: 750000,
    noticePeriodDays: 30,
    leaveBalance: { casual: 4, sick: 5, privilege: 6, compOff: 3 },
    attendanceSummaryMtd: { present: 20, absent: 2, halfDay: 1, lateComing: 1, otHours: 0 }
  },
  {
    id: "EMP-00105",
    fullName: "Karan Mehta",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    designation: "Full Stack Developer",
    department: "Engineering",
    branch: "Bengaluru Tech Hub",
    email: "karan.mehta@apexenterprises.in",
    phone: "+91 98860 11223",
    doj: "2026-02-01",
    status: "Probation",
    employmentType: "Probation",
    gender: "Male",
    probationEndDate: "2026-08-01",
    managerName: "Rahul Sharma",
    costCenter: "ENG-BLR-02",
    panNumber: "KMNKM7766P",
    aadhaarNumber: "4455-6677-8899",
    uanNumber: "100922233344",
    bankAccount: "5006819284",
    bankIfsc: "HDFC0000123",
    bankName: "HDFC Bank",
    basicSalary: 32000,
    grossSalary: 68000,
    ctc: 880000,
    noticePeriodDays: 30,
    leaveBalance: { casual: 2, sick: 2, privilege: 0, compOff: 0 },
    attendanceSummaryMtd: { present: 22, absent: 0, halfDay: 0, lateComing: 0, otHours: 1 }
  }
];

let dbLeaveRequests = [
  {
    id: "LV-2026-089",
    employeeId: "EMP-00102",
    employeeName: "Priya Patel",
    leaveType: "Casual Leave (CL)",
    fromDate: "2026-07-28",
    toDate: "2026-07-29",
    totalDays: 2,
    reason: "Family personal event & domestic travel to Ahmedabad",
    status: "Pending HR Approval",
    appliedOn: "2026-07-25"
  },
  {
    id: "LV-2026-090",
    employeeId: "EMP-00104",
    employeeName: "Sneha Deshmukh",
    leaveType: "Sick Leave (SL)",
    fromDate: "2026-07-27",
    toDate: "2026-07-27",
    totalDays: 1,
    reason: "Doctor appointment and viral fever recovery",
    status: "Pending Manager Approval",
    appliedOn: "2026-07-26"
  },
  {
    id: "LV-2026-085",
    employeeId: "EMP-00101",
    employeeName: "Rahul Sharma",
    leaveType: "Privilege Leave (PL)",
    fromDate: "2026-08-10",
    toDate: "2026-08-14",
    totalDays: 5,
    reason: "Annual vacation with family",
    status: "Approved",
    appliedOn: "2026-07-20"
  }
];

let dbComplianceItems = [
  {
    id: "COMP-PF-007",
    title: "EPFO Monthly ECR Return Filing",
    category: "PF ECR",
    dueDate: "2026-08-15",
    amountDue: 412800,
    status: "Pending",
    frequency: "Monthly",
    description: "EPF 12% EE + ER contribution ECR text file submission on EPFO Unified Employer Portal."
  },
  {
    id: "COMP-ESIC-007",
    title: "ESIC Monthly Contribution Return",
    category: "ESIC Return",
    dueDate: "2026-08-15",
    amountDue: 84200,
    status: "Pending",
    frequency: "Monthly",
    description: "ESIC 0.75% EE + 3.25% ER portal return filing for covered employees grossing ≤ ₹21,000."
  },
  {
    id: "COMP-PT-007",
    title: "Maharashtra Professional Tax Return (Form III-A)",
    category: "Professional Tax (PT)",
    dueDate: "2026-07-31",
    amountDue: 35500,
    status: "Pending",
    frequency: "Monthly",
    description: "State PT deduction return filing for Mumbai HQ staff (₹200 / ₹250 slab)."
  },
  {
    id: "COMP-TDS-Q1",
    title: "Quarterly TDS Return Filing (Form 24Q - Q1)",
    category: "TDS Form 24Q",
    dueDate: "2026-07-31",
    amountDue: 620000,
    status: "Pending",
    frequency: "Quarterly",
    description: "Section 192 Income Tax salary deduction deposit & quarterly FVU validation report."
  }
];

let dbPayrollBatches = [
  {
    id: "BATCH-2026-07",
    month: "July 2026",
    year: 2026,
    monthIndex: 7,
    totalEmployees: 142,
    totalGrossPay: 8450000,
    totalNetPay: 7120000,
    totalDeductions: 1330000,
    totalPF: 412800,
    totalESIC: 84200,
    totalTDS: 620000,
    status: "Draft",
    bankFileGenerated: false
  }
];

let dbTenants = [
  {
    id: "t-001",
    name: "Apex Enterprises Pvt. Ltd.",
    domain: "localhost:3000/?tenant=apex",
    plan: "Enterprise Scale",
    region: "local-dev-mumbai",
    activeEmployees: 142,
    maxEmployees: 500,
    monthlyCostINR: 28400,
    status: "Active",
    version: "v15.2.0-local-dev",
    lastBackup: "2026-07-28 03:00 AM",
    dbCluster: "local-sqlite-cluster-01"
  }
];

let dbIntegrations = [
  { id: "int-01", name: "Matrix Biometric Punch Machine", category: "Hardware & Attendance", status: "Connected", syncInterval: "Real-time Push API", lastSync: "2 mins ago" },
  { id: "int-02", name: "EPFO Unified Employer Portal", category: "Government Statutory", status: "Connected", syncInterval: "On-demand ECR Export", lastSync: "Yesterday 05:30 PM" },
  { id: "int-03", name: "HDFC Direct Corporate Banking API", category: "Banking & Disbursal", status: "Connected", syncInterval: "Batch Payout Direct", lastSync: "25th July 2026" },
  { id: "int-04", name: "Slack Workforce Assistant", category: "Communication & Bot", status: "Connected", syncInterval: "Real-time Event Webhook", lastSync: "Live Webhook Active" }
];

let dbCompanySettings = {
  companyName: "Apex Enterprises India Pvt. Ltd.",
  workDaysPerMonth: 26,
  pfWageCap: 15000,
  defaultOtMultiplier: 1.5,
  sandwichPolicyEnabled: true,
  taxRegimeDefault: "New Tax Regime (Sec 115BAC)",
  biometricAutoSync: true,
  emailNotifications: true
};

// STATUTORY REGISTERS MASTER FORMAT METADATA
const STATUTORY_REGISTERS = [
  { key: "pay_slip", label: "Pay Slips — Form IV B [Rule 26(2)]", period: "month", orientation: "Portrait" },
  { key: "pay_register", label: "Pay Register — Equal Remuneration & Contract Labour", period: "month", orientation: "Landscape" },
  { key: "muster_roll", label: "Muster Roll — Form XVI [Rule 78(2)(a)]", period: "month", orientation: "Landscape" },
  { key: "pf_statement", label: "P.F. Challan Statement", period: "month", orientation: "Portrait" },
  { key: "esi_statement", label: "ESI Challan Statement — Form 7", period: "month", orientation: "Portrait" },
  { key: "pt_statement", label: "P.T. Statement", period: "month", orientation: "Portrait" },
  { key: "bonus_register", label: "Bonus Register — Form C [Payment of Bonus]", period: "year", orientation: "Landscape" },
  { key: "leave_register", label: "Earn Leave Register", period: "year", orientation: "Portrait" }
];

// Helper functions for statutory HTML rendering
function buildStatutoryRegisterHTML(register: string, company: string, month: string, year: string, bonusPercent: number = 8.33) {
  const comp = initialCompanyDetails;
  const meta = STATUTORY_REGISTERS.find(r => r.key === register) || STATUTORY_REGISTERS[1];
  const isLandscape = meta.orientation === "Landscape";

  let bodyHTML = "";

  if (register === "pay_slip") {
    bodyHTML = dbEmployees.map((emp, i) => {
      const basic = emp.basicSalary;
      const hra = Math.round(basic * 0.5);
      const special = Math.max(0, emp.grossSalary - (basic + hra));
      const pf = Math.min(basic, 15000) * 0.12;
      const pt = 200;
      const tds = Math.round(emp.grossSalary * 0.08);
      const totalDedu = pf + pt + tds;
      const netPay = emp.grossSalary - totalDedu;

      return `
        <div style="border:1px solid #333; margin-bottom:20px; padding:16px; font-family:sans-serif; background:#fff; border-radius:8px;">
          <div style="display:flex; justify-content:space-between; border-b:1px solid #ccc; padding-bottom:8px; margin-bottom:12px;">
            <div>
              <h2 style="margin:0; font-size:16px; font-weight:800; color:#111;">${comp.name}</h2>
              <div style="font-size:11px; color:#555;">${comp.headquarters}</div>
            </div>
            <div style="text-align:right; font-size:11px;">
              <div><b>Form IV B [Rule 26(2)]</b></div>
              <div>PF Code: <b>${comp.epfoEstCode}</b> | ESI Code: <b>${comp.esicEstCode}</b></div>
            </div>
          </div>
          <div style="font-size:12px; margin-bottom:12px; display:grid; grid-template-columns: 1fr 1fr; gap:8px; background:#f9fafb; padding:10px; border-radius:6px;">
            <div><b>Employee Name:</b> ${emp.fullName} (${emp.id})</div>
            <div><b>Designation / Dept:</b> ${emp.designation} (${emp.department})</div>
            <div><b>Month:</b> ${month || "July 2026"}</div>
            <div><b>UAN / PF No:</b> ${emp.uanNumber || '100912345678'}</div>
            <div><b>Paid Days / Total:</b> 26 / 26</div>
            <div><b>Bank Account:</b> ${emp.bankName} - ${emp.bankAccount}</div>
          </div>
          <table style="width:100%; border-collapse:collapse; font-size:12px;" border="1">
            <thead>
              <tr style="background:#f3f4f6;">
                <th style="padding:6px; text-align:left;">EARNINGS</th>
                <th style="padding:6px; text-align:right;">AMOUNT (₹)</th>
                <th style="padding:6px; text-align:left;">DEDUCTIONS</th>
                <th style="padding:6px; text-align:right;">AMOUNT (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding:6px;">Basic Salary</td>
                <td style="padding:6px; text-align:right;">₹${basic.toLocaleString()}</td>
                <td style="padding:6px;">Provident Fund (EPF)</td>
                <td style="padding:6px; text-align:right; color:#c53030;">₹${pf.toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding:6px;">House Rent Allowance (HRA)</td>
                <td style="padding:6px; text-align:right;">₹${hra.toLocaleString()}</td>
                <td style="padding:6px;">Professional Tax (PT)</td>
                <td style="padding:6px; text-align:right; color:#c53030;">₹${pt.toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding:6px;">Special Allowance</td>
                <td style="padding:6px; text-align:right;">₹${special.toLocaleString()}</td>
                <td style="padding:6px;">Income Tax (TDS)</td>
                <td style="padding:6px; text-align:right; color:#c53030;">₹${tds.toLocaleString()}</td>
              </tr>
              <tr style="font-weight:bold; background:#f9fafb;">
                <td style="padding:6px;">GROSS EARNINGS</td>
                <td style="padding:6px; text-align:right; color:#2f855a;">₹${emp.grossSalary.toLocaleString()}</td>
                <td style="padding:6px;">TOTAL DEDUCTIONS</td>
                <td style="padding:6px; text-align:right; color:#c53030;">₹${totalDedu.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
          <div style="margin-top:12px; padding:10px; background:#ebf8ff; border:1px solid #bee3f8; font-weight:bold; font-size:13px; display:flex; justify-between; rounded:6px;">
            <span>NET PAYABLE AMOUNT: ₹${netPay.toLocaleString()}</span>
            <span style="font-size:11px; font-weight:normal; color:#4a5568;">This is a computer-generated statutory pay slip. Signature not required.</span>
          </div>
        </div>
      `;
    }).join("");
  } else if (register === "muster_roll") {
    const dayHeaders = Array.from({ length: 31 }, (_, i) => `<th style="padding:4px; text-align:center; font-size:10px; border:1px solid #ccc;">${i + 1}</th>`).join("");
    const rows = dbEmployees.map((emp, i) => {
      const days = Array.from({ length: 31 }, (_, d) => {
        const day = d + 1;
        if (day % 7 === 0 || day % 7 === 6) return `<td style="padding:4px; text-align:center; background:#e2e8f0; font-size:10px; border:1px solid #ccc;">WO</td>`;
        if (day === 14) return `<td style="padding:4px; text-align:center; background:#fed7d7; color:#9b2c2c; font-weight:bold; font-size:10px; border:1px solid #ccc;">A</td>`;
        if (day === 21) return `<td style="padding:4px; text-align:center; background:#feebc8; color:#9c4221; font-weight:bold; font-size:10px; border:1px solid #ccc;">L</td>`;
        return `<td style="padding:4px; text-align:center; background:#c6f6d5; color:#22543d; font-weight:bold; font-size:10px; border:1px solid #ccc;">P</td>`;
      }).join("");

      return `
        <tr>
          <td style="padding:6px; border:1px solid #ccc; font-weight:bold;">${i + 1}</td>
          <td style="padding:6px; border:1px solid #ccc; font-weight:bold;">${emp.fullName}<br><span style="font-size:10px; color:#666;">${emp.id}</span></td>
          <td style="padding:6px; border:1px solid #ccc;">${emp.gender || 'Male'}</td>
          ${days}
          <td style="padding:6px; border:1px solid #ccc; font-weight:bold; text-align:center; background:#e6fffa;">22</td>
        </tr>
      `;
    }).join("");

    bodyHTML = `
      <div style="font-family:sans-serif; background:#fff; padding:16px;">
        <h2 style="text-align:center; margin:0; font-size:16px; font-weight:800;">MUSTER ROLL — FORM XVI [Rule 78(2)(a)]</h2>
        <div style="text-align:center; font-size:12px; color:#555; margin-bottom:12px;">${comp.name} — ${month || "July 2026"}</div>
        <table style="width:100%; border-collapse:collapse; font-size:11px;" border="1">
          <thead>
            <tr style="background:#edf2f7;">
              <th style="padding:6px;">Sr</th>
              <th style="padding:6px; text-align:left;">Employee Name</th>
              <th style="padding:6px;">Sex</th>
              ${dayHeaders}
              <th style="padding:6px;">Total P</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <div style="margin-top:10px; font-size:11px; color:#4a5568;">P = Present, A = Absent, L = Late, WO = Weekly Off, HO = Holiday</div>
      </div>
    `;
  } else if (register === "pf_statement") {
    const rows = dbEmployees.map((emp, i) => {
      const qualifyingBasic = Math.min(emp.basicSalary, 15000);
      const ee12 = qualifyingBasic * 0.12;
      const er833 = Math.min(qualifyingBasic * 0.0833, 1250);
      const er367 = ee12 - er833;
      return `
        <tr>
          <td style="padding:6px; border:1px solid #ccc;">${i + 1}</td>
          <td style="padding:6px; border:1px solid #ccc; font-mono;">${emp.uanNumber || '100912345678'}</td>
          <td style="padding:6px; border:1px solid #ccc; font-weight:bold;">${emp.fullName}</td>
          <td style="padding:6px; border:1px solid #ccc; text-align:right;">₹${emp.grossSalary.toLocaleString()}</td>
          <td style="padding:6px; border:1px solid #ccc; text-align:right;">₹${qualifyingBasic.toLocaleString()}</td>
          <td style="padding:6px; border:1px solid #ccc; text-align:right; font-weight:bold; color:#2f855a;">₹${ee12.toLocaleString()}</td>
          <td style="padding:6px; border:1px solid #ccc; text-align:right;">₹${Math.round(er833).toLocaleString()}</td>
          <td style="padding:6px; border:1px solid #ccc; text-align:right;">₹${Math.round(er367).toLocaleString()}</td>
          <td style="padding:6px; border:1px solid #ccc; text-align:right; font-weight:bold; background:#f7fafc;">₹${(ee12 + Math.round(er833) + Math.round(er367)).toLocaleString()}</td>
        </tr>
      `;
    }).join("");

    bodyHTML = `
      <div style="font-family:sans-serif; background:#fff; padding:16px;">
        <h2 style="text-align:center; margin:0; font-size:16px; font-weight:800;">P.F. CHALLAN STATEMENT</h2>
        <div style="text-align:center; font-size:12px; color:#555; margin-bottom:12px;">${comp.name} — EPFO Code: ${comp.epfoEstCode} — Period: ${month || "July 2026"}</div>
        <table style="width:100%; border-collapse:collapse; font-size:11px;" border="1">
          <thead>
            <tr style="background:#edf2f7;">
              <th style="padding:6px;">Sr</th>
              <th style="padding:6px;">UAN Number</th>
              <th style="padding:6px; text-align:left;">Member Name</th>
              <th style="padding:6px; text-align:right;">Gross Wages</th>
              <th style="padding:6px; text-align:right;">PF Qualifying Basic</th>
              <th style="padding:6px; text-align:right;">EE Share (12%)</th>
              <th style="padding:6px; text-align:right;">ER EPS (8.33%)</th>
              <th style="padding:6px; text-align:right;">ER EPF (3.67%)</th>
              <th style="padding:6px; text-align:right;">Total Deposit</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;
  } else if (register === "esi_statement") {
    const rows = dbEmployees.map((emp, i) => {
      const isCovered = emp.grossSalary <= 21000 || emp.esicNumber;
      const ee075 = isCovered ? Math.round(emp.grossSalary * 0.0075) : 0;
      const er325 = isCovered ? Math.round(emp.grossSalary * 0.0325) : 0;
      return `
        <tr>
          <td style="padding:6px; border:1px solid #ccc;">${i + 1}</td>
          <td style="padding:6px; border:1px solid #ccc; font-mono;">${emp.esicNumber || '3100123456001'}</td>
          <td style="padding:6px; border:1px solid #ccc; font-weight:bold;">${emp.fullName}</td>
          <td style="padding:6px; border:1px solid #ccc; text-align:right;">₹${emp.grossSalary.toLocaleString()}</td>
          <td style="padding:6px; border:1px solid #ccc;">${isCovered ? 'Covered (≤ ₹21,000)' : 'Exempt'}</td>
          <td style="padding:6px; border:1px solid #ccc; text-align:right; font-weight:bold;">₹${ee075}</td>
          <td style="padding:6px; border:1px solid #ccc; text-align:right;">₹${er325}</td>
          <td style="padding:6px; border:1px solid #ccc; text-align:right; font-weight:bold; background:#f7fafc;">₹${ee075 + er325}</td>
        </tr>
      `;
    }).join("");

    bodyHTML = `
      <div style="font-family:sans-serif; background:#fff; padding:16px;">
        <h2 style="text-align:center; margin:0; font-size:16px; font-weight:800;">ESI CHALLAN STATEMENT — FORM 7</h2>
        <div style="text-align:center; font-size:12px; color:#555; margin-bottom:12px;">${comp.name} — ESIC Code: ${comp.esicEstCode} — Period: ${month || "July 2026"}</div>
        <table style="width:100%; border-collapse:collapse; font-size:11px;" border="1">
          <thead>
            <tr style="background:#edf2f7;">
              <th style="padding:6px;">Sr</th>
              <th style="padding:6px;">IP Number</th>
              <th style="padding:6px; text-align:left;">Insured Person Name</th>
              <th style="padding:6px; text-align:right;">Gross Wages</th>
              <th style="padding:6px;">Coverage</th>
              <th style="padding:6px; text-align:right;">EE Share (0.75%)</th>
              <th style="padding:6px; text-align:right;">ER Share (3.25%)</th>
              <th style="padding:6px; text-align:right;">Total Deposit</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;
  } else if (register === "bonus_register") {
    const rows = dbEmployees.map((emp, i) => {
      const annualGross = emp.grossSalary * 12;
      const bonusAmt = Math.round(annualGross * (bonusPercent / 100));
      return `
        <tr>
          <td style="padding:6px; border:1px solid #ccc;">${i + 1}</td>
          <td style="padding:6px; border:1px solid #ccc; font-weight:bold;">${emp.fullName}<br><span style="font-size:10px; color:#666;">${emp.id}</span></td>
          <td style="padding:6px; border:1px solid #ccc;">${emp.designation}</td>
          <td style="padding:6px; border:1px solid #ccc; text-align:right;">₹${annualGross.toLocaleString()}</td>
          <td style="padding:6px; border:1px solid #ccc; text-align:center;">${bonusPercent}%</td>
          <td style="padding:6px; border:1px solid #ccc; text-align:right; font-weight:bold; color:#2b6cb0;">₹${bonusAmt.toLocaleString()}</td>
          <td style="padding:6px; border:1px solid #ccc; text-align:center; color:#2f855a;">Paid Disbursed</td>
        </tr>
      `;
    }).join("");

    bodyHTML = `
      <div style="font-family:sans-serif; background:#fff; padding:16px;">
        <h2 style="text-align:center; margin:0; font-size:16px; font-weight:800;">BONUS REGISTER — FORM C [Rule 4(c), Payment of Bonus Rules]</h2>
        <div style="text-align:center; font-size:12px; color:#555; margin-bottom:12px;">${comp.name} — Financial Year: ${year || "2026–27"} — Bonus Rate: ${bonusPercent}%</div>
        <table style="width:100%; border-collapse:collapse; font-size:11px;" border="1">
          <thead>
            <tr style="background:#edf2f7;">
              <th style="padding:6px;">Sr</th>
              <th style="padding:6px; text-align:left;">Employee Name</th>
              <th style="padding:6px; text-align:left;">Designation</th>
              <th style="padding:6px; text-align:right;">Annual Gross Earnings</th>
              <th style="padding:6px;">Bonus % Rate</th>
              <th style="padding:6px; text-align:right;">Bonus Amount Payable</th>
              <th style="padding:6px;">Disbursal Status</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;
  } else {
    // Default Pay Register / Leave Register
    const rows = dbEmployees.map((emp, i) => {
      const basic = emp.basicSalary;
      const hra = Math.round(basic * 0.5);
      const pf = Math.min(basic, 15000) * 0.12;
      const pt = 200;
      const net = emp.grossSalary - (pf + pt + Math.round(emp.grossSalary * 0.08));

      return `
        <tr>
          <td style="padding:6px; border:1px solid #ccc;">${i + 1}</td>
          <td style="padding:6px; border:1px solid #ccc; font-weight:bold;">${emp.fullName}</td>
          <td style="padding:6px; border:1px solid #ccc;">${emp.department}</td>
          <td style="padding:6px; border:1px solid #ccc; text-align:right;">₹${basic.toLocaleString()}</td>
          <td style="padding:6px; border:1px solid #ccc; text-align:right;">₹${hra.toLocaleString()}</td>
          <td style="padding:6px; border:1px solid #ccc; text-align:right; font-weight:bold; color:#2f855a;">₹${emp.grossSalary.toLocaleString()}</td>
          <td style="padding:6px; border:1px solid #ccc; text-align:right; color:#c53030;">₹${pf.toLocaleString()}</td>
          <td style="padding:6px; border:1px solid #ccc; text-align:right; color:#c53030;">₹${pt.toLocaleString()}</td>
          <td style="padding:6px; border:1px solid #ccc; text-align:right; font-weight:bold; color:#2b6cb0; background:#f7fafc;">₹${net.toLocaleString()}</td>
        </tr>
      `;
    }).join("");

    bodyHTML = `
      <div style="font-family:sans-serif; background:#fff; padding:16px;">
        <h2 style="text-align:center; margin:0; font-size:16px; font-weight:800;">${meta.label.toUpperCase()}</h2>
        <div style="text-align:center; font-size:12px; color:#555; margin-bottom:12px;">${comp.name} — ${month || year || "July 2026"}</div>
        <table style="width:100%; border-collapse:collapse; font-size:11px;" border="1">
          <thead>
            <tr style="background:#edf2f7;">
              <th style="padding:6px;">Sr</th>
              <th style="padding:6px; text-align:left;">Employee Name</th>
              <th style="padding:6px; text-align:left;">Department</th>
              <th style="padding:6px; text-align:right;">Basic Salary</th>
              <th style="padding:6px; text-align:right;">HRA</th>
              <th style="padding:6px; text-align:right;">Gross Pay</th>
              <th style="padding:6px; text-align:right;">EPF</th>
              <th style="padding:6px; text-align:right;">PT</th>
              <th style="padding:6px; text-align:right;">Net Salary</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;
  }

  return { html: bodyHTML, orientation: meta.orientation };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  let ai: GoogleGenAI | null = null;
  if (process.env.GEMINI_API_KEY) {
    try {
      ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    } catch (err) {
      console.error("Error initializing GoogleGenAI:", err);
    }
  }

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      app: "Frappe HRMS Modern Redesign Local Server",
      environment: "local",
      port: PORT,
      time: new Date().toISOString()
    });
  });

  // ==================== STATUTORY REGISTERS API ====================
  app.get("/api/registers/options", (_req, res) => {
    res.json({
      success: true,
      registers: STATUTORY_REGISTERS,
      companies: [initialCompanyDetails.name],
      defaultMonth: "2026-07",
      years: [2026, 2025, 2024]
    });
  });

  app.post("/api/registers/render", (req, res) => {
    const { register, company, month, year, bonusPercent } = req.body;
    const out = buildStatutoryRegisterHTML(register || "pay_register", company, month, year, Number(bonusPercent) || 8.33);
    res.json({ success: true, ...out });
  });

  // ==================== SALARY COMPONENTS CRUD API ====================
  app.get("/api/masters/components", (_req, res) => {
    res.json({ success: true, count: dbSalaryComponents.length, components: dbSalaryComponents });
  });

  app.post("/api/masters/components", (req, res) => {
    const comp = req.body;
    const newComp = {
      id: comp.id || `SC-0${dbSalaryComponents.length + 1}`,
      name: comp.name || "New Component",
      category: comp.category || "Earning",
      type: comp.type || "Fixed",
      formula: comp.formula || "",
      isStatutory: Boolean(comp.isStatutory),
      statutoryType: comp.statutoryType || undefined,
      taxExempt: Boolean(comp.taxExempt)
    };
    dbSalaryComponents.push(newComp);
    res.status(201).json({ success: true, message: "Salary Component created", component: newComp });
  });

  app.put("/api/masters/components/:id", (req, res) => {
    const idx = dbSalaryComponents.findIndex(c => c.id === req.params.id);
    if (idx === -1) return res.status(404).json({ success: false, error: "Salary Component not found" });

    dbSalaryComponents[idx] = { ...dbSalaryComponents[idx], ...req.body };
    res.json({ success: true, message: "Salary Component updated", component: dbSalaryComponents[idx] });
  });

  app.delete("/api/masters/components/:id", (req, res) => {
    const idx = dbSalaryComponents.findIndex(c => c.id === req.params.id);
    if (idx === -1) return res.status(404).json({ success: false, error: "Salary Component not found" });

    const removed = dbSalaryComponents.splice(idx, 1);
    res.json({ success: true, message: "Salary Component deleted", component: removed[0] });
  });

  // ==================== TENANT DATA ISOLATION ENGINE ====================
  interface TenantStore {
    companyName: string;
    employees: typeof dbEmployees;
    leaveRequests: typeof dbLeaveRequests;
    payrollBatches: typeof dbPayrollBatches;
    customComponents: typeof dbEmployeeCustomComponents;
    complianceItems: typeof dbComplianceItems;
  }

  const defaultDemoStore: TenantStore = {
    companyName: "Apex Enterprises India Pvt. Ltd.",
    employees: dbEmployees,
    leaveRequests: dbLeaveRequests,
    payrollBatches: dbPayrollBatches,
    customComponents: dbEmployeeCustomComponents,
    complianceItems: dbComplianceItems
  };

  const tenantStores: Record<string, TenantStore> = {
    apex: defaultDemoStore,
    "t-001": defaultDemoStore,
    apexlogistics: defaultDemoStore
  };

  function getTenantKey(req: any): string {
    let raw = (req.query?.tenant || req.headers?.["x-tenant-id"]) as string;
    if (!raw && req.originalUrl) {
      const urlPath = req.originalUrl.split("?")[0].replace(/^\/+|\/+$/g, "");
      if (urlPath && urlPath !== "admin" && urlPath !== "superadmin" && !urlPath.startsWith("api")) {
        raw = urlPath;
      }
    }
    const key = (raw || "apex").toLowerCase().replace(/[^a-z0-9-]/g, "");
    return key || "apex";
  }

  function getTenantStore(req: any): TenantStore {
    const key = getTenantKey(req);

    if (!tenantStores[key]) {
      // Find matching tenant in dbTenants array created from Super Admin
      const matched = dbTenants.find(t => 
        t.id.toLowerCase() === key || 
        t.domain.toLowerCase().includes(key) ||
        t.name.toLowerCase().replace(/[^a-z0-9-]/g, "").includes(key)
      );

      let formattedName = key.charAt(0).toUpperCase() + key.slice(1);
      if (!formattedName.toLowerCase().includes("pvt") && !formattedName.toLowerCase().includes("ltd")) {
        formattedName += " Pvt. Ltd.";
      }

      const companyName = matched ? matched.name : formattedName;

      tenantStores[key] = {
        companyName,
        employees: [],
        leaveRequests: [],
        payrollBatches: [],
        customComponents: {},
        complianceItems: []
      };
    }
    return tenantStores[key];
  }

  app.get("/api/tenant/info", (req, res) => {
    const store = getTenantStore(req);
    res.json({
      success: true,
      tenantKey: getTenantKey(req),
      companyName: store.companyName,
      employeesCount: store.employees.length
    });
  });

  // ==================== EMPLOYEES API ====================
  app.get("/api/employees", (req, res) => {
    const store = getTenantStore(req);
    const { branch, department, status, query } = req.query;
    let result = store.employees.map(e => ({
      ...e,
      customComponents: store.customComponents[e.id] || {}
    }));

    if (branch && branch !== "All Branches") result = result.filter(e => e.branch === branch);
    if (department && department !== "All Departments") result = result.filter(e => e.department === department);
    if (status && status !== "All Statuses") result = result.filter(e => e.status === status);
    if (query) {
      const q = (query as string).toLowerCase();
      result = result.filter(e =>
        e.fullName.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        e.id.toLowerCase().includes(q) ||
        e.designation.toLowerCase().includes(q)
      );
    }

    res.json({ success: true, count: result.length, employees: result });
  });

  app.post("/api/employees", (req, res) => {
    const store = getTenantStore(req);
    const newEmp = {
      id: req.body.id || `EMP-00${store.employees.length + 101}`,
      fullName: req.body.fullName || "New Employee",
      avatarUrl: req.body.avatarUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
      designation: req.body.designation || "Software Engineer",
      department: req.body.department || "Engineering",
      branch: req.body.branch || "Mumbai Head Office",
      email: req.body.email || "employee@company.com",
      phone: req.body.phone || "+91 98765 43210",
      doj: req.body.doj || new Date().toISOString().split("T")[0],
      status: req.body.status || "Active",
      employmentType: req.body.employmentType || "Full-Time",
      gender: req.body.gender || "Male",
      managerName: req.body.managerName || "Rahul Sharma",
      costCenter: req.body.costCenter || "ENG-MUM-01",
      panNumber: req.body.panNumber || "ABCPS1234F",
      aadhaarNumber: req.body.aadhaarNumber || "1234-5678-9012",
      uanNumber: req.body.uanNumber || "100912345678",
      esicNumber: req.body.esicNumber || "3100123456001",
      bankAccount: req.body.bankAccount || "1002938481",
      bankIfsc: req.body.bankIfsc || "HDFC0000123",
      bankName: req.body.bankName || "HDFC Bank",
      basicSalary: Number(req.body.basicSalary) || 25000,
      grossSalary: Number(req.body.grossSalary) || 50000,
      ctc: Number(req.body.ctc) || 650000,
      noticePeriodDays: 30,
      isPfApplicable: req.body.isPfApplicable !== false,
      isEsiApplicable: req.body.isEsiApplicable !== false,
      isPtApplicable: req.body.isPtApplicable !== false,
      leaveBalance: { casual: 6, sick: 6, privilege: 12, compOff: 0 },
      attendanceSummaryMtd: { present: 26, absent: 0, halfDay: 0, lateComing: 0, otHours: 0 }
    };

    store.employees.unshift(newEmp);
    res.status(201).json({ success: true, employee: newEmp });
  });

  app.delete("/api/employees/:id", (req, res) => {
    const store = getTenantStore(req);
    const index = store.employees.findIndex(e => e.id === req.params.id);
    if (index !== -1) {
      const removed = store.employees.splice(index, 1);
      return res.json({ success: true, employee: removed[0] });
    }
    res.status(404).json({ success: false, error: "Employee not found" });
  });

  app.get("/api/employees/:id", (req, res) => {
    const store = getTenantStore(req);
    const emp = store.employees.find(e => e.id === req.params.id);
    if (!emp) return res.status(404).json({ success: false, error: "Employee not found" });
    const fullEmp = {
      ...emp,
      customComponents: store.customComponents[emp.id] || {}
    };
    res.json({ success: true, employee: fullEmp });
  });

  app.put("/api/employees/:id", (req, res) => {
    const store = getTenantStore(req);
    const index = store.employees.findIndex(e => e.id === req.params.id);
    if (index === -1) return res.status(404).json({ success: false, error: "Employee not found" });

    const { customComponents, ...updates } = req.body;
    store.employees[index] = { ...store.employees[index], ...updates };

    if (customComponents) {
      store.customComponents[req.params.id] = {
        ...store.customComponents[req.params.id],
        ...customComponents
      };
      if (customComponents["SC-01"]) store.employees[index].basicSalary = Number(customComponents["SC-01"]);
      let calculatedGross = 0;
      Object.keys(store.customComponents[req.params.id]).forEach(cid => {
        const comp = dbSalaryComponents.find(c => c.id === cid);
        if (comp && comp.category === "Earning") {
          calculatedGross += Number(store.customComponents[req.params.id][cid]);
        }
      });
      if (calculatedGross > 0) store.employees[index].grossSalary = calculatedGross;
    }

    res.json({
      success: true,
      message: "Employee profile & salary components updated successfully",
      employee: {
        ...store.employees[index],
        customComponents: store.customComponents[req.params.id] || {}
      }
    });
  });

  // ==================== BULK ATTENDANCE IMPORT API ====================
  app.post("/api/attendance/bulk-import-month", (req, res) => {
    const { month, records } = req.body;
    let updatedCount = 0;

    if (Array.isArray(records)) {
      records.forEach((rec: any) => {
        const emp = dbEmployees.find(e => e.id === rec.employeeId);
        if (emp && rec.dayStatuses) {
          updatedCount++;
          let p = 0, a = 0, l = 0;
          Object.values(rec.dayStatuses).forEach((st: any) => {
            if (st === "P") p++;
            if (st === "A") a++;
            if (st === "L") l++;
          });
          emp.attendanceSummaryMtd.present = p;
          emp.attendanceSummaryMtd.absent = a;
        }
      });
    }

    res.json({
      success: true,
      message: `Successfully imported bulk monthly attendance for ${updatedCount || records?.length || 0} employees!`,
      month: month || "July 2026"
    });
  });

  // ==================== REPORTS & ANALYTICS APIs ====================
  // ==================== REPORTS & ANALYTICS APIs ====================
  app.get("/api/reports/pay-register", (req, res) => {
    const store = getTenantStore(req);
    const register = store.employees.map(emp => {
      const basic = emp.basicSalary;
      const hra = Math.round(basic * 0.5);
      const special = Math.max(0, emp.grossSalary - (basic + hra));
      const gross = emp.grossSalary;

      const isPf = (emp as any).isPfApplicable !== false;
      const isEsi = (emp as any).isEsiApplicable !== false;
      const isPt = (emp as any).isPtApplicable !== false;

      const pf = isPf ? Math.min(basic, 15000) * 0.12 : 0;
      const pt = isPt && gross > 10000 ? 200 : 0;
      const tds = Math.round(gross * 0.08);
      const deductions = pf + pt + tds;
      const netPay = gross - deductions;

      return {
        employeeId: emp.id,
        employeeName: emp.fullName,
        designation: emp.designation,
        department: emp.department,
        bankAccount: emp.bankAccount,
        bankIfsc: emp.bankIfsc,
        basic,
        hra,
        special,
        grossPay: gross,
        pfDeduction: pf,
        ptDeduction: pt,
        tdsDeduction: tds,
        totalDeductions: deductions,
        netPay
      };
    });

    res.json({ success: true, month: "July 2026", count: register.length, payRegister: register });
  });

  app.get("/api/reports/pf-summary", (req, res) => {
    const store = getTenantStore(req);
    const pfReport = store.employees.map(emp => {
      const isPf = (emp as any).isPfApplicable !== false;
      const qualifyingBasic = isPf ? Math.min(emp.basicSalary, 15000) : 0;
      const eeEPF = isPf ? qualifyingBasic * 0.12 : 0;
      const erEPS = isPf ? Math.min(qualifyingBasic * 0.0833, 1250) : 0;
      const erEPF = isPf ? eeEPF - erEPS : 0;

      return {
        employeeId: emp.id,
        employeeName: emp.fullName,
        uanNumber: isPf ? (emp.uanNumber || "100912345678") : "N/A (Exempt)",
        pfNumber: isPf ? ((emp as any).pfNumber || "MH/BAN/0049281/000/101") : "N/A (Exempt)",
        grossWages: emp.grossSalary,
        pfQualifyingWages: qualifyingBasic,
        eeContribution12: eeEPF,
        erEps833: Math.round(erEPS),
        erEpf367: Math.round(erEPF),
        totalPfDeposit: eeEPF + Math.round(erEPS) + Math.round(erEPF)
      };
    });

    res.json({ success: true, month: "July 2026", count: pfReport.length, pfSummary: pfReport });
  });

  app.get("/api/reports/esi-summary", (req, res) => {
    const store = getTenantStore(req);
    const esiReport = store.employees.map(emp => {
      const isEsi = (emp as any).isEsiApplicable !== false;
      const isCovered = isEsi && (emp.grossSalary <= 21000 || emp.esicNumber);
      const gross = emp.grossSalary;
      const eeShare = isCovered ? Math.round(gross * 0.0075) : 0;
      const erShare = isCovered ? Math.round(gross * 0.0325) : 0;

      return {
        employeeId: emp.id,
        employeeName: emp.fullName,
        esicNumber: isEsi ? (emp.esicNumber || "3100999888001") : "N/A (Exempt)",
        grossWages: gross,
        coverageStatus: isEsi ? (isCovered ? "Covered (≤ ₹21,000 Cap)" : "Exempt (> ₹21,000)") : "Exempt (Disabled)",
        eeContribution075: eeShare,
        erContribution325: erShare,
        totalEsiDeposit: eeShare + erShare
      };
    });

    res.json({ success: true, month: "July 2026", count: esiReport.length, esiSummary: esiReport });
  });

  app.get("/api/reports/pt-summary", (req, res) => {
    const store = getTenantStore(req);
    const ptReport = store.employees.map(emp => {
      const isPt = (emp as any).isPtApplicable !== false;
      const ptAmount = isPt && emp.grossSalary > 10000 ? 200 : 0;
      return {
        employeeId: emp.id,
        employeeName: emp.fullName,
        branch: emp.branch,
        state: "Maharashtra",
        grossSalary: emp.grossSalary,
        ptSlab: isPt ? "Gross > ₹10,000 (Slab ₹200/mo)" : "Exempt (Not Applicable)",
        ptDeduction: ptAmount
      };
    });

    res.json({ success: true, month: "July 2026", count: ptReport.length, ptSummary: ptReport });
  });

  // Attendance, Leave, Payroll, Masters, Settings, Integrations, AI
  app.get("/api/attendance", (req, res) => {
    const store = getTenantStore(req);
    res.json({
      success: true,
      month: "July 2026",
      totalWorkingDays: 26,
      employeesCount: store.employees.length,
      attendanceSummary: {
        avgPresentPercentage: store.employees.length > 0 ? 96.4 : 0,
        totalBiometricLogsToday: store.employees.length > 0 ? 138 : 0,
        pendingMissingPunches: 0,
        lateComingsToday: 0
      }
    });
  });

  app.post("/api/attendance/update-cell", (req, res) => {
    const store = getTenantStore(req);
    const { employeeId, day, status, otHours } = req.body;
    const emp = store.employees.find(e => e.id === employeeId);
    if (emp) {
      if (status === "A") emp.attendanceSummaryMtd.absent += 1;
      if (status === "P") emp.attendanceSummaryMtd.present += 1;
      if (otHours) emp.attendanceSummaryMtd.otHours += Number(otHours);
    }
    res.json({ success: true, message: `Updated Day ${day} to '${status}'` });
  });

  app.post("/api/attendance/bulk-import", (_req, res) => {
    res.json({ success: true, message: "Biometric attendance logs imported successfully." });
  });

  app.get("/api/leave/requests", (req, res) => {
    const store = getTenantStore(req);
    res.json({ success: true, count: store.leaveRequests.length, requests: store.leaveRequests });
  });

  app.post("/api/leave/request", (req, res) => {
    const store = getTenantStore(req);
    const newReq = {
      id: `LV-2026-0${Math.floor(100 + Math.random() * 900)}`,
      employeeId: req.body.employeeId || "EMP-00101",
      employeeName: req.body.employeeName || "Rahul Sharma",
      leaveType: req.body.leaveType || "Casual Leave (CL)",
      fromDate: req.body.fromDate || "2026-08-01",
      toDate: req.body.toDate || "2026-08-02",
      totalDays: Number(req.body.totalDays) || 1,
      reason: req.body.reason || "Personal",
      status: "Pending HR Approval",
      appliedOn: new Date().toISOString().split("T")[0]
    };
    store.leaveRequests.unshift(newReq);
    res.status(201).json({ success: true, request: newReq });
  });

  app.put("/api/leave/requests/:id/status", (req, res) => {
    const store = getTenantStore(req);
    const reqItem = store.leaveRequests.find(l => l.id === req.params.id);
    if (reqItem) reqItem.status = req.body.status;
    res.json({ success: true, request: reqItem });
  });

  app.get("/api/payroll/batches", (req, res) => {
    const store = getTenantStore(req);
    res.json({ success: true, batches: store.payrollBatches });
  });

  app.post("/api/payroll/process", (req, res) => {
    const store = getTenantStore(req);
    const batch = store.payrollBatches[0];
    if (batch) {
      if (req.body.step === 2) batch.status = "Attendance Locked";
      if (req.body.step === 4) batch.status = "Calculated";
      if (req.body.step === 6) batch.status = "Approved";
      if (req.body.step === 7) batch.status = "Disbursed";
    }
    res.json({ success: true, batch });
  });

  app.get("/api/payroll/slips/:employeeId", (req, res) => {
    const emp = dbEmployees.find(e => e.id === req.params.employeeId) || dbEmployees[0];
    const earnings = [
      { name: "Basic Salary", amount: emp.basicSalary },
      { name: "House Rent Allowance (HRA)", amount: Math.round(emp.basicSalary * 0.5) },
      { name: "Special Allowance", amount: Math.max(0, emp.grossSalary - (emp.basicSalary + Math.round(emp.basicSalary * 0.5))) }
    ];
    const pfDeduction = Math.min(emp.basicSalary, 15000) * 0.12;
    const ptDeduction = 200;
    const tdsDeduction = Math.round(emp.grossSalary * 0.08);
    const deductions = [
      { name: "Employee Provident Fund (EPF)", amount: pfDeduction },
      { name: "Professional Tax (PT)", amount: ptDeduction },
      { name: "Income Tax (TDS)", amount: tdsDeduction }
    ];
    res.json({
      success: true,
      salarySlip: {
        slipId: `SLIP-2026-07-${emp.id}`,
        employee: emp,
        month: "July 2026",
        workingDays: 26,
        paidDays: 26,
        earnings,
        deductions,
        totalEarnings: emp.grossSalary,
        totalDeductions: pfDeduction + ptDeduction + tdsDeduction,
        netPay: emp.grossSalary - (pfDeduction + ptDeduction + tdsDeduction)
      }
    });
  });

  app.get("/api/compliance/items", (_req, res) => {
    res.json({ success: true, items: dbComplianceItems });
  });

  app.post("/api/compliance/file-return", (req, res) => {
    const item = dbComplianceItems.find(i => i.id === req.body.itemId);
    if (item) item.status = "Filed";
    res.json({ success: true, item });
  });

  app.get("/api/masters", (req, res) => {
    const store = getTenantStore(req);
    res.json({
      success: true,
      company: {
        ...initialCompanyDetails,
        name: store.companyName
      },
      components: dbSalaryComponents
    });
  });

  app.post("/api/masters/branches", (req, res) => {
    const newBranch = {
      code: req.body.code || `BR-${Date.now().toString().slice(-4)}`,
      name: req.body.name || "New Office",
      city: req.body.city || "Mumbai",
      state: req.body.state || "Maharashtra",
      employeesCount: 0,
      status: "Active"
    };
    initialCompanyDetails.branches.push(newBranch);
    res.status(201).json({ success: true, branch: newBranch });
  });

  app.post("/api/masters/departments", (req, res) => {
    if (req.body.name && !initialCompanyDetails.departments.includes(req.body.name)) {
      initialCompanyDetails.departments.push(req.body.name);
    }
    res.status(201).json({ success: true, departments: initialCompanyDetails.departments });
  });

  app.get("/api/integrations", (_req, res) => {
    res.json({ success: true, integrations: dbIntegrations });
  });

  app.post("/api/integrations/toggle", (req, res) => {
    const item = dbIntegrations.find(i => i.id === req.body.id);
    if (item) item.status = item.status === "Connected" ? "Disconnected" : "Connected";
    res.json({ success: true, integration: item });
  });

  app.get("/api/settings", (_req, res) => {
    res.json({ success: true, settings: dbCompanySettings });
  });

  app.post("/api/settings/update", (req, res) => {
    dbCompanySettings = { ...dbCompanySettings, ...req.body };
    res.json({ success: true, settings: dbCompanySettings });
  });

  app.get("/api/superadmin/tenants", (_req, res) => {
    res.json({ success: true, tenants: dbTenants });
  });

  app.post("/api/superadmin/tenants", (req, res) => {
    const newTenant = {
      id: `t-00${dbTenants.length + 1}`,
      name: req.body.name || "New Client Enterprise",
      domain: req.body.domain || "localhost:3000/?tenant=client",
      plan: req.body.plan || "Enterprise Scale",
      region: req.body.region || "local-dev-mumbai",
      activeEmployees: 1,
      maxEmployees: Number(req.body.maxEmployees) || 250,
      monthlyCostINR: 15000,
      status: "Active",
      version: "v15.2.0-local-dev",
      lastBackup: new Date().toLocaleString(),
      dbCluster: "local-sqlite-cluster-01"
    };
    dbTenants.unshift(newTenant);
    res.status(201).json({ success: true, tenant: newTenant });
  });

  app.put("/api/superadmin/tenants/:id/status", (req, res) => {
    const tenant = dbTenants.find(t => t.id === req.params.id);
    if (tenant) tenant.status = req.body.status;
    res.json({ success: true, tenant });
  });

  app.get("/api/superadmin/metrics", (_req, res) => {
    res.json({
      success: true,
      metrics: {
        totalActiveTenants: dbTenants.length,
        totalManagedEmployees: 142,
        annualRecurringRevenueINR: 11425000,
        globalUptimePercentage: "99.99%",
        avgResponseMs: 42
      }
    });
  });

  app.get("/api/reports/analytics", (_req, res) => {
    res.json({
      success: true,
      analytics: {
        headcountByDepartment: [
          { department: "Engineering", count: 48, percentage: 33.8 },
          { department: "Product & Design", count: 24, percentage: 16.9 },
          { department: "Human Resources", count: 12, percentage: 8.5 },
          { department: "Finance & Accounts", count: 18, percentage: 12.7 },
          { department: "Sales & Business Dev", count: 28, percentage: 19.7 },
          { department: "Customer Success", count: 12, percentage: 8.5 }
        ],
        monthlyPayrollTrend: [
          { month: "Feb 2026", grossINR: 7800000 },
          { month: "Mar 2026", grossINR: 7950000 },
          { month: "Apr 2026", grossINR: 8100000 },
          { month: "May 2026", grossINR: 8250000 },
          { month: "Jun 2026", grossINR: 8380000 },
          { month: "Jul 2026", grossINR: 8450000 }
        ],
        attritionRate: "1.2%"
      }
    });
  });

  // AI Assistant
  app.post("/api/ai/assistant", async (req, res) => {
    try {
      const { prompt, context } = req.body;
      if (!prompt) return res.status(400).json({ error: "Prompt is required" });

      if (ai) {
        const response = await ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents: `Context: ${context || "General HRMS"}\nQuery: ${prompt}`,
          config: { temperature: 0.7 }
        });
        return res.json({ reply: response.text || "No response.", source: "gemini-3.6-flash" });
      }

      let smartFallback = `**[Frappe HR Copilot]**\n\nProcessed query: "${prompt}"\n\n`;
      smartFallback += `In ERPNext / Frappe HRMS, statutory registers and payroll run via standard DocTypes (Salary Slip, Attendance, Employee).`;
      return res.json({ reply: smartFallback, source: "system-fallback" });
    } catch (err: any) {
      res.status(500).json({ error: "AI Error", details: err?.message });
    }
  });

  // ==================== STATUTORY & BANK FILING FILE GENERATORS ====================

  // ==================== STATUTORY & BANK FILING FILE GENERATORS ====================

  // 1. EPFO Unified Employer Portal PF ECR Text File (#~# delimited)
  app.post("/api/compliance/generate-pf-ecr", (req, res) => {
    const store = getTenantStore(req);
    let content = "";
    store.employees.forEach(emp => {
      const isPf = (emp as any).isPfApplicable !== false;
      if (!isPf) return;

      const uan = emp.uanNumber || "100912345678";
      const name = emp.fullName.toUpperCase();
      const gross = emp.grossSalary;
      const pfWage = Math.min(emp.basicSalary, 15000);
      const epsWage = pfWage;
      const edliWage = pfWage;
      const eeEpf = Math.round(pfWage * 0.12);
      const erEps = Math.min(Math.round(pfWage * 0.0833), 1250);
      const erEpf = eeEpf - erEps;
      const ncpDays = emp.attendanceSummaryMtd?.absent || 0;
      const refundAdv = 0;

      content += `${uan}#~#${name}#~#${gross}#~#${pfWage}#~#${epsWage}#~#${edliWage}#~#${eeEpf}#~#${erEps}#~#${erEpf}#~#${ncpDays}#~#${refundAdv}\n`;
    });

    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Content-Disposition", `attachment; filename="PF_ECR_JULY_2026.txt"`);
    res.send(content);
  });

  // Legacy alias endpoint for PF ECR
  app.post("/api/compliance/generate-ecr", (req, res) => {
    res.redirect(307, "/api/compliance/generate-pf-ecr");
  });

  // 2. ESIC Monthly Contribution Return CSV File (esic.gov.in format)
  app.post("/api/compliance/generate-esic-return", (req, res) => {
    const store = getTenantStore(req);
    let csv = `IP Number,IP Name,No of Days Worked for which wages paid,Total Monthly Wages,Reason Code for Zero Working Days,Last Working Day\n`;
    store.employees.forEach(emp => {
      const isEsi = (emp as any).isEsiApplicable !== false;
      if (!isEsi) return;

      const ipNumber = emp.esicNumber || "3100123456001";
      const ipName = emp.fullName;
      const daysWorked = emp.attendanceSummaryMtd?.present || 26;
      const gross = emp.grossSalary;
      const reasonCode = daysWorked === 0 ? 1 : 0;
      const lastDay = "";

      csv += `"${ipNumber}","${ipName}",${daysWorked},${gross},${reasonCode},"${lastDay}"\n`;
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="ESIC_Monthly_Return_July_2026.csv"`);
    res.send(csv);
  });

  // 3. Maharashtra Professional Tax Form III-A Return CSV File (Mahagst / PTRC format)
  app.post("/api/compliance/generate-pt-return", (req, res) => {
    const store = getTenantStore(req);
    let csv = `Registration Certificate No,Period Code,Taxpayer Name,Gross Salary Slab,Employee Count,Tax Rate per Employee (INR),Total PT Amount (INR)\n`;
    
    let slab200Count = 0;
    let slabExemptCount = 0;

    store.employees.forEach(emp => {
      const isPt = (emp as any).isPtApplicable !== false;
      if (isPt && emp.grossSalary > 10000) {
        slab200Count++;
      } else {
        slabExemptCount++;
      }
    });

    const rcNo = "27123456789P";
    const period = "202607";
    const compName = store.companyName;

    csv += `"${rcNo}","${period}","${compName}","Gross Salary > RS 10000",${slab200Count},200,${slab200Count * 200}\n`;
    csv += `"${rcNo}","${period}","${compName}","Gross Salary <= RS 10000 / Exempt",${slabExemptCount},0,0\n`;

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="Maharashtra_PT_Form_III_A_July_2026.csv"`);
    res.send(csv);
  });

  // 4. Form 24Q Quarterly Income Tax TDS Return FVU Text File (NSDL format)
  app.post("/api/compliance/generate-tds-24q", (req, res) => {
    const store = getTenantStore(req);
    let txt = `FH#SL1#24Q#2026-07-31#1#P#MUMA12345B#AAACA1234F#Apex Enterprises India Pvt. Ltd.#Q1#2026-27\n`;
    txt += `BH#1#${store.employees.length}#Section 192#620000#0#0\n`;

    store.employees.forEach((emp, i) => {
      const tds = Math.round(emp.grossSalary * 0.08);
      txt += `CD#${i + 1}#1#${emp.id}#${emp.panNumber || 'ABCPS1234F'}#${emp.fullName.toUpperCase()}#${emp.grossSalary}#${tds}#0\n`;
    });

    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Content-Disposition", `attachment; filename="Form24Q_Q1_2026_27.txt"`);
    res.send(txt);
  });

  // 5. HDFC / ICICI / SBI / Corporate Bank Salary Disbursal Advice CSV File
  app.post("/api/payroll/generate-bank-file", (req, res) => {
    const store = getTenantStore(req);
    const bankFormat = req.body?.format || "HDFC";
    let csv = `Transaction Type,Beneficiary Account No,Amount,Beneficiary Name,Drawee Branch Code,Beneficiary Bank IFSC,Payment Date,Customer Reference No,Email ID\n`;

    store.employees.forEach((emp, i) => {
      const basic = emp.basicSalary;
      const isPf = (emp as any).isPfApplicable !== false;
      const isPt = (emp as any).isPtApplicable !== false;
      const pf = isPf ? Math.min(basic, 15000) * 0.12 : 0;
      const pt = isPt && emp.grossSalary > 10000 ? 200 : 0;
      const tds = Math.round(emp.grossSalary * 0.08);
      const netPay = emp.grossSalary - (pf + pt + tds);

      const refNo = `SAL-JUL26-00${i + 1}`;
      csv += `NEFT,"${emp.bankAccount}",${netPay},"${emp.fullName.toUpperCase()}","MUM-HQ","${emp.bankIfsc}","31/07/2026","${refNo}","${emp.email}"\n`;
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${bankFormat}_Corporate_Salary_Disbursal_July_2026.csv"`);
    res.send(csv);
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => res.sendFile(path.join(distPath, "index.html")));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`PayrollPro Dev Server listening on http://localhost:${PORT}`);
  });
}

startServer();
