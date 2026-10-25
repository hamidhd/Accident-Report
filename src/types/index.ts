export type ShiftType = 'morning' | 'evening' | 'night';

export type IncidentCategory = 
  | 'superficial_injury' // جراحت سطحی
  | 'contusion'           // ضرب دیدگی
  | 'fracture'            // شکستگی
  | 'cut'                 // بریدگی
  | 'burn'                // سوختگی
  | 'other';              // سایر

export type SeverityLevel = 'minor' | 'moderate' | 'severe' | 'critical';

export interface InjuredPerson {
  fullName: string;        // نام و نام خانوادگی
  department: string;      // پرسنل واحد
  personnelCode: string;   // شماره پرسنلی
  jobTitle?: string;       // شغل سازمانی
}

export interface IncidentGeneral {
  types: IncidentCategory[];
  otherExplanation: string;
  bodyPart: string;                  // عضو حادثه دیده
  ppeUsed: string;                   // وسایل حفاظت فردی استفاده شده توسط مصدوم
  witnesses: string;                 // اسامی شاهدین حادثه
  incidentDate: string;              // تاریخ حادثه (مثلا ۱۴۰۳/۰۸/۰۲)
  incidentTime: string;              // ساعت حادثه (مثلا ۱۰:۳۰)
  formCompletionDateTime: string;    // ساعت و تاریخ تکمیل فرم
  exactLocation: string;             // محل دقیق حادثه
  description: string;               // شرح مختصری از حادثه
}

export interface SupervisorSection {
  fullName: string;                  // نام و نام خانوادگی
  phone: string;                     // شماره تماس
  unit: string;                      // واحد
  organizationalRole: string;        // سمت سازمانی
  date: string;                      // تاریخ
  signature: string;                 // امضا
  signedAt?: string;
  isSigned: boolean;
  notes?: string;
}

export interface HseSection {
  clinicActions: string;             // اقدامات انجام شده در خانه بهداشت
  lostWorkdays: number;              // تعداد روزهای کاری تلف شده (استراحت پزشکی)
  hseOfficerName: string;            // نام مسئول HSE
  hseRegistrationDate: string;       // تاریخ ثبت در HSE
  status: 'under_review' | 'closed' | 'referred_hospital';
  followUpActions?: string;
}

export interface Incident {
  id: string;                        // شناسه یکتا مثلا INC-1403-104
  formCode: string;                  // F-HS-07-00
  shift: ShiftType;                  // سه شیفت کارخانه
  shiftOfficerName: string;          // افسر ایمنی ثبت‌کننده
  shiftOfficerId: string;
  severity: SeverityLevel;
  isEmergency: boolean;              // آیا وضعیت بحرانی سریع ثبت شده
  
  injuredPerson: InjuredPerson;
  incidentGeneral: IncidentGeneral;
  supervisorSection: SupervisorSection;
  hseSection: HseSection;

  createdAt: string;
  updatedAt: string;
}

export type RoleType = 'hse_manager' | 'safety_officer' | 'unit_supervisor' | 'clinic_officer';

export interface UserProfile {
  id: string;
  name: string;
  role: RoleType;
  department?: string;
  shift?: ShiftType;
  phone: string;
  avatar?: string;
}

export interface FactorySettings {
  factoryName: string;
  companyName: string;
  formCode: string;
  totalWorkers: number;
  totalManHours: number;             // نفر-ساعت کارکرد دوره جهت فرمول AFR و ASR
  formulaBasis: 1000000 | 200000;    // مبنای ضرب محاسبات OSHA / ISO
  departments: string[];
  shifts: {
    morning: { label: string; hours: string; officer: string };
    evening: { label: string; hours: string; officer: string };
    night: { label: string; hours: string; officer: string };
  };
}

export interface NotificationItem {
  id: string;
  incidentId: string;
  title: string;
  message: string;
  department: string;
  severity: SeverityLevel;
  timestamp: string;
  isRead: boolean;
  targetRole: RoleType;
  targetUnit?: string;
}

export interface HseMetrics {
  totalIncidents: number;
  lostTimeIncidents: number;         // حوادث دارای روزهای تلف شده
  totalLostWorkdays: number;         // کل روزهای کاری از دست رفته
  afr: number;                       // Accident Frequency Rate (ضریب تکرار حوادث)
  asr: number;                       // Accident Severity Rate (ضریب شدت حوادث)
  fsi: number;                       // Frequency Severity Index
  incidentRate: number;              // نرخ بروز حوادث
  safeDaysWithoutLTI: number;        // روزهای بدون حادثه تلف کننده زمان
  fsiStatus: 'ideal' | 'good' | 'moderate' | 'critical';
  byShift: Record<ShiftType, number>;
  byDepartment: Record<string, number>;
  byType: Record<string, number>;
  bySeverity: Record<SeverityLevel, number>;
}
