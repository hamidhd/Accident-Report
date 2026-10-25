import * as XLSX from 'xlsx';
import { Incident, FactorySettings, HseMetrics } from '../types';
import { INCIDENT_TYPE_LABELS, SHIFT_LABELS, SEVERITY_LABELS } from './hseMetrics';

export function exportIncidentsToExcel(
  incidents: Incident[],
  settings: FactorySettings,
  metrics: HseMetrics,
  filenamePrefix = 'HSE_DanialSteel_Report'
) {
  // 1. دیتا شیت حوادث
  const incidentsData = incidents.map((inc, index) => {
    const shiftLabel = SHIFT_LABELS[inc.shift]?.title || inc.shift;
    const severityLabel = SEVERITY_LABELS[inc.severity]?.label || inc.severity;
    const typesLabel = (inc.incidentGeneral?.types || [])
      .map(t => INCIDENT_TYPE_LABELS[t] || t)
      .join('، ');

    return {
      'ردیف': index + 1,
      'کد پیگیری': inc.id,
      'کد فرم': inc.formCode || settings.formCode,
      'تاریخ حادثه': inc.incidentGeneral?.incidentDate || '-',
      'ساعت حادثه': inc.incidentGeneral?.incidentTime || '-',
      'شیفت کاری': shiftLabel,
      'افسر ایمنی ثبت‌کننده': inc.shiftOfficerName || '-',
      'نام و نام خانوادگی مصدوم': inc.injuredPerson?.fullName || '-',
      'واحد سازمانی': inc.injuredPerson?.department || '-',
      'شماره پرسنلی': inc.injuredPerson?.personnelCode || '-',
      'شغل مصدوم': inc.injuredPerson?.jobTitle || '-',
      'سطح شدت حادثه': severityLabel,
      'وضعیت بحرانی (SOS)': inc.isEmergency ? 'بله' : 'خیر',
      'نوع حادثه': typesLabel,
      'توضیح سایر': inc.incidentGeneral?.otherExplanation || '-',
      'عضو حادثه‌دیده': inc.incidentGeneral?.bodyPart || '-',
      'وسایل حفاظت فردی (PPE)': inc.incidentGeneral?.ppeUsed || '-',
      'اسامی شاهدین': inc.incidentGeneral?.witnesses || '-',
      'محل دقیق حادثه': inc.incidentGeneral?.exactLocation || '-',
      'شرح حادثه': inc.incidentGeneral?.description || '-',
      'سرپرست واحد': inc.supervisorSection?.fullName || '-',
      'تلفن سرپرست': inc.supervisorSection?.phone || '-',
      'وضعیت امضای سرپرست': inc.supervisorSection?.isSigned ? 'تایید و امضا شده' : 'در انتظار امضا',
      'تاریخ تایید سرپرست': inc.supervisorSection?.date || '-',
      'یادداشت سرپرست': inc.supervisorSection?.notes || '-',
      'اقدامات خانه بهداشت': inc.hseSection?.clinicActions || '-',
      'روزهای تلف شده (استراحت)': inc.hseSection?.lostWorkdays || 0,
      'وضعیت پرونده HSE': inc.hseSection?.status === 'closed' ? 'مختومه' : 'تحت بررسی',
      'مسئول HSE': inc.hseSection?.hseOfficerName || '-',
      'تاریخ ثبت': inc.incidentGeneral?.formCompletionDateTime || '-'
    };
  });

  // 2. دیتا شیت شاخص‌های HSE و تحلیل FSI
  const metricsData = [
    { 'شاخص HSE': 'تعداد کل حوادث ثبت شده', 'مقدار عددی': metrics.totalIncidents, 'واحد': 'فقره' },
    { 'شاخص HSE': 'حوادث توأم با اتلاف وقت کاری (LTI)', 'مقدار عددی': metrics.lostTimeIncidents, 'واحد': 'فقره' },
    { 'شاخص HSE': 'مجموع روزهای کاری تلف شده (استراحت پزشکی)', 'مقدار عددی': metrics.totalLostWorkdays, 'واحد': 'روز' },
    { 'شاخص HSE': 'کل نفر-ساعت کارکرد کارخانه در دوره', 'مقدار عددی': settings.totalManHours.toLocaleString('fa-IR'), 'واحد': 'نفر-ساعت' },
    { 'شاخص HSE': 'تعداد پرسنل فعال کارخانه', 'مقدار عددی': settings.totalWorkers, 'واحد': 'نفر' },
    { 'شاخص HSE': 'ضریب تکرار حوادث (AFR)', 'مقدار عددی': metrics.afr, 'واحد': 'به ازای ۱,۰۰۰,۰۰۰ ساعت' },
    { 'شاخص HSE': 'ضریب شدت حوادث (ASR)', 'مقدار عددی': metrics.asr, 'واحد': 'به ازای ۱,۰۰۰ ساعت' },
    { 'شاخص HSE': 'شاخص ترکیبی شدت و فراوانی (FSI)', 'مقدار عددی': metrics.fsi, 'واحد': 'ضریب بدون بعد' },
    { 'شاخص HSE': 'وضعیت ارزیابی ایمنی FSI', 'مقدار عددی': metrics.fsiStatus === 'ideal' ? 'عالی و بسیار ایمن' : metrics.fsiStatus === 'good' ? 'خوب' : metrics.fsiStatus === 'moderate' ? 'متوسط و نیازمند بهبود' : 'بحرانی و پرخطر', 'واحد': '-' },
    { 'شاخص HSE': 'نرخ وقوع حادثه (Incident Rate - OSHA)', 'مقدار عددی': metrics.incidentRate, 'واحد': 'به ازای ۲۰۰,۰۰۰ ساعت' },
    { 'شاخص HSE': 'تعداد روزهای متوالی بدون حادثه LTI', 'مقدار عددی': metrics.safeDaysWithoutLTI, 'واحد': 'روز' }
  ];

  // 3. دیتا شیت مقایسه شیفت‌ها
  const shiftsData = [
    { 'شیفت کاری': 'شیفت ۱ (صبح ۰۶:۰۰ الی ۱۴:۰۰)', 'افسر مسئول': settings.shifts.morning.officer, 'تعداد حوادث': metrics.byShift.morning, 'درصد از کل': metrics.totalIncidents > 0 ? `${Math.round((metrics.byShift.morning / metrics.totalIncidents) * 100)}%` : '۰%' },
    { 'شیفت کاری': 'شیفت ۲ (عصر ۱۴:۰۰ الی ۲۲:۰۰)', 'افسر مسئول': settings.shifts.evening.officer, 'تعداد حوادث': metrics.byShift.evening, 'درصد از کل': metrics.totalIncidents > 0 ? `${Math.round((metrics.byShift.evening / metrics.totalIncidents) * 100)}%` : '۰%' },
    { 'شیفت کاری': 'شیفت ۳ (شب ۲۲:۰۰ الی ۰۶:۰۰)', 'افسر مسئول': settings.shifts.night.officer, 'تعداد حوادث': metrics.byShift.night, 'درصد از کل': metrics.totalIncidents > 0 ? `${Math.round((metrics.byShift.night / metrics.totalIncidents) * 100)}%` : '۰%' }
  ];

  // ساخت ورک‌بوک
  const wb = XLSX.utils.book_new();

  const wsIncidents = XLSX.utils.json_to_sheet(incidentsData);
  const wsMetrics = XLSX.utils.json_to_sheet(metricsData);
  const wsShifts = XLSX.utils.json_to_sheet(shiftsData);

  // تنظیم جهت راست به چپ برای اکسل
  if (!wsIncidents['!views']) wsIncidents['!views'] = [];
  wsIncidents['!views'].push({ rightToLeft: true });
  
  if (!wsMetrics['!views']) wsMetrics['!views'] = [];
  wsMetrics['!views'].push({ rightToLeft: true });

  if (!wsShifts['!views']) wsShifts['!views'] = [];
  wsShifts['!views'].push({ rightToLeft: true });

  XLSX.utils.book_append_sheet(wb, wsIncidents, 'گزارش تفصیلی حوادث');
  XLSX.utils.book_append_sheet(wb, wsMetrics, 'شاخص‌های HSE و FSI');
  XLSX.utils.book_append_sheet(wb, wsShifts, 'تفکیک شیفت‌های سه‌گانه');

  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const filename = `${filenamePrefix}_${dateStr}.xlsx`;

  XLSX.writeFile(wb, filename);
}
