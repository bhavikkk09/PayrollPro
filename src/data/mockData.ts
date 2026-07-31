import { Employee, LeaveRequest, ComplianceDueItem, ActionItem, FrappeDocTypeMapping, SalaryComponent } from '../types';

export const companyDetails = {
  name: "Apex Enterprises India Pvt. Ltd.",
  code: "APEX-IN",
  cin: "U72200MH2018PTC309182",
  pan: "AAACA1234F",
  tan: "MUMA12345B",
  epfoEstCode: "MH/BAN/0049281/000",
  esicEstCode: "31000492810001001",
  headquarters: "BKC Office Tower, Bandra Kurla Complex, Mumbai, Maharashtra 400051",
  branches: [
    { code: "MUM-HQ", name: "Mumbai Headquarters", city: "Mumbai", state: "Maharashtra" },
    { code: "BLR-TECH", name: "Bengaluru Tech Hub", city: "Bengaluru", state: "Karnataka" },
    { code: "DEL-NORTH", name: "Delhi NCR Regional Office", city: "Gurugram", state: "Haryana" },
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

export const sampleEmployees: Employee[] = [
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
    managerName: "Vikramaditya Rao",
    costCenter: "ENG-MUM-01",
    panNumber: "ABCPS1234F",
    aadhaarNumber: "7821-4920-1123",
    isPfApplicable: true,
    isEsiApplicable: true,
    isPtApplicable: true,
    uanNumber: "100912345678",
    pfNumber: "MH/BAN/0049281/000/101",
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

export const sampleLeaveRequests: LeaveRequest[] = [
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

export const sampleComplianceItems: ComplianceDueItem[] = [
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

export const sampleActionItems: ActionItem[] = [
  {
    id: "ACT-001",
    title: "2 Leave Applications Pending",
    subtitle: "Priya Patel (2 days CL) and Sneha Deshmukh (1 day SL)",
    category: "Approval",
    urgency: "High",
    actionLabel: "Review & Approve",
    actionType: "GOTO_LEAVE"
  },
  {
    id: "ACT-002",
    title: "July 2026 Attendance Lock Due",
    subtitle: "3 Missing Punches pending resolution in Monthly Attendance Grid",
    category: "Payroll",
    urgency: "High",
    actionLabel: "Open Attendance Grid",
    actionType: "GOTO_ATTENDANCE"
  },
  {
    id: "ACT-003",
    title: "Probation Period Ending: Karan Mehta",
    subtitle: "Probation ends 01 Aug 2026. Evaluation form required.",
    category: "Probation",
    urgency: "Medium",
    actionLabel: "Confirm Probation",
    actionType: "GOTO_EMPLOYEES"
  },
  {
    id: "ACT-004",
    title: "Statutory PT & TDS Filing Due in 5 Days",
    subtitle: "Form III-A Maharashtra PT and Form 24Q Q1 TDS",
    category: "Compliance",
    urgency: "High",
    actionLabel: "Open Compliance Hub",
    actionType: "GOTO_COMPLIANCE"
  }
];

export const salaryComponentsList: SalaryComponent[] = [
  { id: "SC-01", name: "Basic Salary", category: "Earning", type: "Fixed", isStatutory: true, statutoryType: "PF", taxExempt: false },
  { id: "SC-02", name: "House Rent Allowance (HRA)", category: "Earning", type: "Formula", formula: "50% of Basic", isStatutory: false, taxExempt: true },
  { id: "SC-03", name: "Special Allowance", category: "Earning", type: "Variable", isStatutory: false, taxExempt: false },
  { id: "SC-04", name: "Overtime Allowance", category: "Earning", type: "Variable", formula: "1.5x Hourly Rate", isStatutory: false, taxExempt: false },
  { id: "SC-05", name: "Employee Provident Fund (EPF)", category: "Deduction", type: "Formula", formula: "12% of PF Basic", isStatutory: true, statutoryType: "PF", taxExempt: true },
  { id: "SC-06", name: "Employee State Insurance (ESIC)", category: "Deduction", type: "Formula", formula: "0.75% of Gross", isStatutory: true, statutoryType: "ESIC", taxExempt: false },
  { id: "SC-07", name: "Professional Tax (PT)", category: "Deduction", type: "Fixed", isStatutory: true, statutoryType: "PT", taxExempt: false },
  { id: "SC-08", name: "Income Tax (TDS)", category: "Deduction", type: "Variable", isStatutory: true, statutoryType: "TDS", taxExempt: false },
];

export const sampleAttendanceGrid = sampleEmployees.map(emp => {
  const days: Record<string, string> = {};
  for (let i = 1; i <= 31; i++) {
    if (i % 7 === 0 || i % 7 === 6) {
      days[i] = "WO";
    } else if (i === 14) {
      days[i] = "A";
    } else if (i === 21) {
      days[i] = "L";
    } else {
      days[i] = "P";
    }
  }
  return {
    employeeId: emp.id,
    employeeName: emp.fullName,
    department: emp.department,
    branch: emp.branch,
    days,
    totalPresent: 22,
    totalAbsent: 1,
    totalLate: 1
  };
});

export const frappeDoctypeMappings: FrappeDocTypeMapping[] = [
  {
    redesignSection: "Company & Organization Setup",
    frappeDoctype: "Company, Branch, Department, Designation, Cost Center",
    backendRole: "Core organization taxonomy and master records",
    keyFieldsMapped: ["company_name", "tax_id", "default_currency", "parent_department"],
    uxImprovementNote: "Replaced deeply nested Frappe tree forms with visual card sliders and instant search."
  },
  {
    redesignSection: "Policy Setup & Rules",
    frappeDoctype: "Shift Type, Leave Policy, Payroll Period, Salary Component, Statutory Category",
    backendRole: "Rules engine for shift timings, Sandwich leaves, OT multipliers, tax slabs",
    keyFieldsMapped: ["enable_late_entry_marking", "sandwich_policy", "formula", "component_type"],
    uxImprovementNote: "Created a unified Indian Policy Wizard instead of setting up 8 separate DocTypes."
  },
  {
    redesignSection: "Employee Master & Onboarding",
    frappeDoctype: "Employee, Employee Onboarding, Employee Skill, Bank Account",
    backendRole: "Complete lifecycle repository for personal, statutory, and salary details",
    keyFieldsMapped: ["employee_name", "pan_number", "uan", "status", "date_of_joining"],
    uxImprovementNote: "Replaced 14 form sections with a clean 1-Page Tabbed Profile (Personal, Salary, Timeline)."
  },
  {
    redesignSection: "Monthly Attendance Grid",
    frappeDoctype: "Attendance, Attendance Request, Shift Assignment",
    backendRole: "Daily check-in logs, biometric punches, missing punch requests",
    keyFieldsMapped: ["attendance_date", "status", "in_time", "out_time", "late_entry"],
    uxImprovementNote: "Transformed individual daily form entries into a fast, Excel-like 31-day bulk editing grid."
  },
  {
    redesignSection: "Guided Payroll Wizard",
    frappeDoctype: "Payroll Entry, Salary Slip, Additional Salary, Salary Structure Assignment",
    backendRole: "Bulk salary calculations, statutory deductions, bank file generation",
    keyFieldsMapped: ["start_date", "end_date", "gross_pay", "total_deduction", "net_pay"],
    uxImprovementNote: "Replaced manual DocType submit sequence with a 7-step guided wizard with variance checks."
  },
  {
    redesignSection: "Indian Compliance Hub",
    frappeDoctype: "PF Category, ESIC Category, Professional Tax Slab, Income Tax Slab",
    backendRole: "EPFO, ESIC, PT, LWF, and Income Tax TDS computation rules",
    keyFieldsMapped: ["minimum_wage", "pt_slab", "tds_regime", "uan_number"],
    uxImprovementNote: "Added instant ECR text file generator and HDFC/ICICI bank payout file exporter."
  }
];
