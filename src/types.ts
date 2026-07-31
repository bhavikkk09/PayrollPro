// Types for Frappe HRMS Modern Redesign

export type NavigationSection = 
  | 'dashboard'
  | 'employees'
  | 'attendance'
  | 'leave'
  | 'payroll'
  | 'compliance'
  | 'statutory-registers'
  | 'hr-letters'
  | 'reports'
  | 'masters'
  | 'workflows'
  | 'integrations'
  | 'ai'
  | 'settings'
  | 'superadmin';

export type EmploymentType = 'Full-Time' | 'Part-Time' | 'Contract' | 'Intern' | 'Probation';
export type EmploymentStatus = 'Active' | 'On Leave' | 'Probation' | 'Notice Period' | 'Exited';

export interface Employee {
  id: string; // e.g., HR-EMP-00101
  fullName: string;
  avatarUrl?: string;
  designation: string;
  department: string;
  branch: string;
  email: string;
  phone: string;
  doj: string; // Date of Joining (YYYY-MM-DD)
  status: EmploymentStatus;
  employmentType: EmploymentType;
  managerName: string;
  costCenter: string;
  panNumber: string;
  aadhaarNumber: string;
  isPfApplicable?: boolean;
  isEsiApplicable?: boolean;
  isPtApplicable?: boolean;
  uanNumber: string;
  pfNumber?: string;
  esicNumber?: string;
  bankAccount: string;
  bankIfsc: string;
  bankName: string;
  basicSalary: number;
  grossSalary: number;
  ctc: number;
  probationEndDate?: string;
  noticePeriodDays: number;
  leaveBalance: {
    casual: number; // CL
    sick: number;   // SL
    privilege: number; // PL / Earned
    compOff: number;
  };
  attendanceSummaryMtd: {
    present: number;
    absent: number;
    halfDay: number;
    lateComing: number;
    otHours: number;
  };
}

export type AttendanceCode = 'P' | 'A' | 'L' | 'HD' | 'WO' | 'HO' | 'LATE';

export interface DailyAttendanceRecord {
  date: string; // YYYY-MM-DD
  status: AttendanceCode;
  inTime?: string;
  outTime?: string;
  totalHours?: number;
  otHours?: number;
  lateMinutes?: number;
  earlyLeavingMinutes?: number;
  isMissingPunch?: boolean;
}

export interface EmployeeMonthlyAttendance {
  employeeId: string;
  employeeName: string;
  department: string;
  daily: Record<string, DailyAttendanceRecord>; // key is day number string '1'..'31'
  totalPresent: number;
  totalAbsent: number;
  totalLeave: number;
  totalLate: number;
  totalOT: number;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: 'Casual Leave (CL)' | 'Sick Leave (SL)' | 'Privilege Leave (PL)' | 'Comp Off';
  fromDate: string;
  toDate: string;
  totalDays: number;
  reason: string;
  status: 'Pending HR Approval' | 'Pending Manager Approval' | 'Approved' | 'Rejected';
  appliedOn: string;
}

export interface SalaryComponent {
  id: string;
  name: string;
  category: 'Earning' | 'Deduction';
  type: 'Fixed' | 'Formula' | 'Variable';
  formula?: string;
  isStatutory: boolean;
  statutoryType?: 'PF' | 'ESIC' | 'PT' | 'TDS' | 'LWF';
  taxExempt: boolean;
}

export interface PayrollBatch {
  id: string;
  month: string; // e.g. "July 2026"
  year: number;
  monthIndex: number; // 7
  totalEmployees: number;
  totalGrossPay: number;
  totalNetPay: number;
  totalDeductions: number;
  totalPF: number;
  totalESIC: number;
  totalTDS: number;
  status: 'Draft' | 'Attendance Locked' | 'Calculated' | 'Pending HR Approval' | 'Pending Finance Approval' | 'Approved' | 'Disbursed';
  lockedOn?: string;
  approvedOn?: string;
  bankFileGenerated: boolean;
}

export interface ComplianceDueItem {
  id: string;
  title: string;
  category: 'PF ECR' | 'ESIC Return' | 'Professional Tax (PT)' | 'Labor Welfare Fund (LWF)' | 'TDS Form 24Q';
  dueDate: string;
  amountDue: number;
  status: 'Pending' | 'Filed' | 'Overdue';
  frequency: 'Monthly' | 'Quarterly' | 'Half-Yearly' | 'Annual';
  description: string;
}

export interface ActionItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'Approval' | 'Compliance' | 'Probation' | 'Document' | 'Payroll';
  urgency: 'High' | 'Medium' | 'Low';
  actionLabel: string;
  actionType: string;
}

export interface FrappeDocTypeMapping {
  redesignSection: string;
  frappeDoctype: string;
  backendRole: string;
  keyFieldsMapped: string[];
  uxImprovementNote: string;
}
