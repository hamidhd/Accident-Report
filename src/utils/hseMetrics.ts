import { Incident, FactorySettings, HseMetrics, ShiftType, SeverityLevel } from '../types';

export function calculateHseMetrics(incidents: Incident[], settings: FactorySettings): HseMetrics {
  const totalIncidents = incidents.length;
  
  // حوادث دارای غیبت کاری / روزهای استراحت
  const lostTimeIncidents = incidents.filter(inc => (inc.hseSection?.lostWorkdays || 0) > 0).length;
  
  const totalLostWorkdays = incidents.reduce((sum, inc) => {
    return sum + (Number(inc.hseSection?.lostWorkdays) || 0);
  }, 0);

  const manHours = Math.max(settings.totalManHours, 1000);
  const basis = settings.formulaBasis || 1000000;

  // ضریب تکرار حوادث (AFR: Accident Frequency Rate)
  // AFR = (تعداد کل حوادث * 1,000,000) / کل نفر-ساعت کارکرد
  const afr = Number(((totalIncidents * basis) / manHours).toFixed(2));

  // ضریب شدت حوادث (ASR: Accident Severity Rate)
  // ASR = (مجموع روزهای تلف شده * 1,000) / کل نفر-ساعت کارکرد
  const asr = Number(((totalLostWorkdays * 1000) / manHours).toFixed(3));

  // شاخص فراوانی - شدت (FSI: Frequency Severity Index)
  // FSI = sqrt((AFR * ASR) / 1000)
  const fsiRaw = Math.sqrt((afr * asr) / 1000);
  const fsi = Number(fsiRaw.toFixed(3));

  // نرخ شیوع حادثه بر اساس استاندارد ۲۰۰,۰۰۰ ساعت کاری OSHA
  // Incident Rate = (Total Incidents * 200,000) / Total Man-Hours
  const incidentRate = Number(((totalIncidents * 200000) / manHours).toFixed(2));

  // محاسبه وضعیت FSI
  let fsiStatus: 'ideal' | 'good' | 'moderate' | 'critical' = 'ideal';
  if (fsi >= 0.7) {
    fsiStatus = 'critical';
  } else if (fsi >= 0.3) {
    fsiStatus = 'moderate';
  } else if (fsi >= 0.1) {
    fsiStatus = 'good';
  } else {
    fsiStatus = 'ideal';
  }

  // تفکیک شیفت‌ها
  const byShift: Record<ShiftType, number> = {
    morning: 0,
    evening: 0,
    night: 0
  };

  // تفکیک نوع حادثه
  const byType: Record<string, number> = {
    superficial_injury: 0,
    contusion: 0,
    fracture: 0,
    cut: 0,
    burn: 0,
    other: 0
  };

  // تفکیک شدت
  const bySeverity: Record<SeverityLevel, number> = {
    minor: 0,
    moderate: 0,
    severe: 0,
    critical: 0
  };

  // تفکیک واحدها
  const byDepartment: Record<string, number> = {};
  settings.departments.forEach(dept => {
    byDepartment[dept] = 0;
  });

  incidents.forEach(inc => {
    if (byShift[inc.shift] !== undefined) {
      byShift[inc.shift]++;
    }
    
    if (bySeverity[inc.severity] !== undefined) {
      bySeverity[inc.severity]++;
    }

    const dept = inc.injuredPerson.department;
    if (dept) {
      byDepartment[dept] = (byDepartment[dept] || 0) + 1;
    }

    if (inc.incidentGeneral?.types) {
      inc.incidentGeneral.types.forEach(t => {
        if (byType[t] !== undefined) {
          byType[t]++;
        } else {
          byType[t] = 1;
        }
      });
    }
  });

  // تخمین روزهای بدون حادثه با غیبت کاری (Safe Days Without LTI)
  // به عنوان مثال بر اساس آخرین حادثه با استراحت کاری
  const now = new Date().getTime();
  let latestLtiDate = 0;
  incidents.forEach(inc => {
    if ((inc.hseSection?.lostWorkdays || 0) > 0) {
      const dt = new Date(inc.createdAt).getTime();
      if (dt > latestLtiDate) {
        latestLtiDate = dt;
      }
    }
  });

  const safeDaysWithoutLTI = latestLtiDate > 0
    ? Math.max(1, Math.floor((now - latestLtiDate) / (1000 * 60 * 60 * 24)))
    : 42; // مقدار پیش‌فرض مطلوب

  return {
    totalIncidents,
    lostTimeIncidents,
    totalLostWorkdays,
    afr,
    asr,
    fsi,
    incidentRate,
    safeDaysWithoutLTI,
    fsiStatus,
    byShift,
    byDepartment,
    byType,
    bySeverity
  };
}

export const INCIDENT_TYPE_LABELS: Record<string, string> = {
  superficial_injury: 'جراحت سطحی',
  contusion: 'ضرب دیدگی',
  fracture: 'شکستگی',
  cut: 'بریدگی',
  burn: 'سوختگی',
  other: 'سایر موارد'
};

export const SHIFT_LABELS: Record<ShiftType, { title: string; time: string; badgeColor: string }> = {
  morning: { title: 'شیفت ۱ (صبح)', time: '۰۶:۰۰ الی ۱۴:۰۰', badgeColor: 'bg-amber-100 text-amber-800 border-amber-300' },
  evening: { title: 'شیفت ۲ (عصر)', time: '۱۴:۰۰ الی ۲۲:۰۰', badgeColor: 'bg-blue-100 text-blue-800 border-blue-300' },
  night: { title: 'شیفت ۳ (شب)', time: '۲۲:۰۰ الی ۰۶:۰۰', badgeColor: 'bg-purple-100 text-purple-800 border-purple-300' }
};

export const SEVERITY_LABELS: Record<SeverityLevel, { label: string; color: string; bg: string }> = {
  minor: { label: 'خفیف (بدون نیاز به بستری)', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-300' },
  moderate: { label: 'متوسط (درمانگاهی/پانسمان)', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-300' },
  severe: { label: 'شدید (ارجاع به بیمارستان)', color: 'text-orange-700', bg: 'bg-orange-50 border-orange-300' },
  critical: { label: 'بحرانی (خطر جانی/نقص عضو)', color: 'text-rose-700', bg: 'bg-rose-50 border-rose-300' }
};
