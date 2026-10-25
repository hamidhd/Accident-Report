import React, { useState } from 'react';
import { Incident, FactorySettings, HseMetrics, ShiftType } from '../types';
import { calculateHseMetrics, SHIFT_LABELS, INCIDENT_TYPE_LABELS, SEVERITY_LABELS } from '../utils/hseMetrics';
import { exportIncidentsToExcel } from '../utils/excelExport';
import { 
  BarChart3, 
  TrendingUp, 
  ShieldAlert, 
  Clock, 
  Users, 
  Calendar, 
  Download, 
  AlertTriangle,
  HeartPulse,
  Award,
  HelpCircle,
  Building2,
  Activity,
  Layers
} from 'lucide-react';

interface Props {
  incidents: Incident[];
  settings: FactorySettings;
  onSelectIncident?: (incident: Incident) => void;
}

export const AnalyticsPanel: React.FC<Props> = ({ incidents, settings, onSelectIncident }) => {
  const [selectedShiftFilter, setSelectedShiftFilter] = useState<string>('all');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('all');
  const [showFormulaGuide, setShowFormulaGuide] = useState<boolean>(false);

  // فیلتر داده‌ها
  const filteredIncidents = incidents.filter(inc => {
    if (selectedShiftFilter !== 'all' && inc.shift !== selectedShiftFilter) return false;
    if (selectedDeptFilter !== 'all' && inc.injuredPerson.department !== selectedDeptFilter) return false;
    return true;
  });

  const metrics: HseMetrics = calculateHseMetrics(filteredIncidents, settings);

  const handleExport = () => {
    exportIncidentsToExcel(filteredIncidents, settings, metrics, 'HSE_Analytics_DanialSteel');
  };

  // رنگ‌بندی کارت FSI
  const getFsiTheme = (status: string) => {
    switch (status) {
      case 'ideal':
        return {
          bg: 'bg-emerald-50 border-emerald-300',
          badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          text: 'text-emerald-700',
          label: 'ایمن و مطلوب (FSI < 0.1)'
        };
      case 'good':
        return {
          bg: 'bg-teal-50 border-teal-300',
          badge: 'bg-teal-100 text-teal-800 border-teal-300',
          text: 'text-teal-700',
          label: 'قابل قبول (۰.۱ تا ۰.۳)'
        };
      case 'moderate':
        return {
          bg: 'bg-amber-50 border-amber-300',
          badge: 'bg-amber-100 text-amber-800 border-amber-300',
          text: 'text-amber-700',
          label: 'هشدار متوسط (۰.۳ تا ۰.۷)'
        };
      default:
        return {
          bg: 'bg-rose-50 border-rose-300',
          badge: 'bg-rose-100 text-rose-800 border-rose-300',
          text: 'text-rose-700',
          label: 'بحرانی و پرخطر (FSI ≥ 0.7)'
        };
    }
  };

  const fsiTheme = getFsiTheme(metrics.fsiStatus);

  return (
    <div className="space-y-6">
      {/* هدر کنترل پنل و فیلترها و دکمه اکسل */}
      <div className="bg-white p-4 md:p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-cyan-600" />
            <h2 className="text-lg md:text-xl font-bold text-slate-800">
              داشبورد تحلیلی شاخص‌های حوادث و ایمنی کارخانه
            </h2>
          </div>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            محاسبه خودکار ضرایب استاندارد بین‌المللی FSI، AFR و ASR بر اساس {settings.totalManHours.toLocaleString('fa-IR')} نفر-ساعت کارکرد
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* دکمه راهنمای فرمول‌ها */}
          <button
            onClick={() => setShowFormulaGuide(!showFormulaGuide)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs md:text-sm font-medium transition cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-cyan-700" />
            <span>فرمول‌های محاسباتی</span>
          </button>

          {/* فیلتر شیفت */}
          <select
            value={selectedShiftFilter}
            onChange={(e) => setSelectedShiftFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs md:text-sm text-slate-700 font-medium focus:ring-2 focus:ring-cyan-500 cursor-pointer"
          >
            <option value="all">همه شیفت‌ها (۳ شیفت)</option>
            <option value="morning">شیفت ۱ (صبح)</option>
            <option value="evening">شیفت ۲ (عصر)</option>
            <option value="night">شیفت ۳ (شب)</option>
          </select>

          {/* فیلتر واحد */}
          <select
            value={selectedDeptFilter}
            onChange={(e) => setSelectedDeptFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs md:text-sm text-slate-700 font-medium focus:ring-2 focus:ring-cyan-500 cursor-pointer"
          >
            <option value="all">تمام واحدهای کارخانه</option>
            {settings.departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>

          {/* خروجی اکسل */}
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs md:text-sm font-semibold shadow-xs transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>خروجی اکسل (Excel)</span>
          </button>
        </div>
      </div>

      {/* مودال یا بخش بازشونده راهنمای فرمول‌های استاندارد HSE */}
      {showFormulaGuide && (
        <div className="bg-slate-900 text-slate-100 p-5 rounded-xl border border-slate-700 text-xs md:text-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-bold text-cyan-400 text-sm">
              مبانی ریاضی و استانداردهای بین‌المللی محاسبات شاخص‌های ایمنی کارخانه دانیال استیل
            </span>
            <button
              onClick={() => setShowFormulaGuide(false)}
              className="text-slate-400 hover:text-white"
            >
              بستن ×
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-800/80 p-3.5 rounded-lg border border-slate-700">
              <div className="font-bold text-cyan-300 mb-1">۱. ضریب تکرار حوادث (AFR)</div>
              <div className="text-[11px] text-slate-400 mb-2">Accident Frequency Rate</div>
              <div className="font-mono bg-slate-950 p-2 rounded text-emerald-400 text-xs text-center direction-ltr">
                AFR = (Total Incidents × 1,000,000) / Man-Hours
              </div>
              <p className="mt-2 text-[11px] text-slate-300">
                بیانگر تعداد حوادث به ازای هر یک میلیون نفر-ساعت کارکرد پرسنل کارخانه است.
              </p>
            </div>

            <div className="bg-slate-800/80 p-3.5 rounded-lg border border-slate-700">
              <div className="font-bold text-amber-300 mb-1">۲. ضریب شدت حوادث (ASR)</div>
              <div className="text-[11px] text-slate-400 mb-2">Accident Severity Rate</div>
              <div className="font-mono bg-slate-950 p-2 rounded text-amber-400 text-xs text-center direction-ltr">
                ASR = (Lost Workdays × 1,000) / Man-Hours
              </div>
              <p className="mt-2 text-[11px] text-slate-300">
                بیانگر تعداد روزهای کاری تلف شده (استراحت پزشکی) به ازای هر هزار نفر-ساعت کارکرد است.
              </p>
            </div>

            <div className="bg-slate-800/80 p-3.5 rounded-lg border border-slate-700">
              <div className="font-bold text-rose-300 mb-1">۳. شاخص فراوانی-شدت (FSI)</div>
              <div className="text-[11px] text-slate-400 mb-2">Frequency Severity Index</div>
              <div className="font-mono bg-slate-950 p-2 rounded text-rose-400 text-xs text-center direction-ltr">
                FSI = √ [ (AFR × ASR) / 1000 ]
              </div>
              <p className="mt-2 text-[11px] text-slate-300">
                شاخص ترکیبی سنجش همزمان تواتر و عمق آسیب‌ها. کمتر از ۰.۱ وضعیت عالی و بالای ۰.۷ وضعیت بحرانی است.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ردیف کارت‌های شاخص‌های کلیدی (KPI Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* کارت ویژه FSI */}
        <div className={`p-5 rounded-xl border ${fsiTheme.bg} shadow-xs relative overflow-hidden transition`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700">شاخص FSI (تواتر و شدت)</span>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${fsiTheme.badge}`}>
              {fsiTheme.label}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-black ${fsiTheme.text}`}>{metrics.fsi}</span>
            <span className="text-xs text-slate-500 font-medium">ضریب بدون بعد</span>
          </div>
          <div className="mt-3 text-[11px] text-slate-600 flex items-center justify-between pt-2 border-t border-slate-200">
            <span>فرمول: √(AFR × ASR / ۱۰۰۰)</span>
            <span className="font-semibold text-slate-800">
              {metrics.fsiStatus === 'ideal' ? 'وضعیت عالی' : metrics.fsiStatus === 'good' ? 'مطلوب' : 'نیازمند پایش'}
            </span>
          </div>
        </div>

        {/* ضریب تکرار حوادث (AFR) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-600">ضریب تکرار حوادث (AFR)</span>
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-md">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-800">{metrics.afr}</span>
            <span className="text-xs text-slate-400">به ازای ۱M ساعت</span>
          </div>
          <div className="mt-3 text-[11px] text-slate-500 flex items-center justify-between pt-2 border-t border-slate-100">
            <span>تعداد کل حوادث:</span>
            <span className="font-bold text-slate-700">{metrics.totalIncidents} مورد</span>
          </div>
        </div>

        {/* ضریب شدت حوادث (ASR) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-600">ضریب شدت حوادث (ASR)</span>
            <div className="p-1.5 bg-amber-50 text-amber-600 rounded-md">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-800">{metrics.asr}</span>
            <span className="text-xs text-slate-400">به ازای ۱K ساعت</span>
          </div>
          <div className="mt-3 text-[11px] text-slate-500 flex items-center justify-between pt-2 border-t border-slate-100">
            <span>روزهای استراحت کاری:</span>
            <span className="font-bold text-amber-700">{metrics.totalLostWorkdays} روز تلف شده</span>
          </div>
        </div>

        {/* روزهای بدون حادثه با غیبت کاری (Safe Days) */}
        <div className="bg-gradient-to-br from-cyan-900 to-slate-900 text-white p-5 rounded-xl shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-cyan-200">روزهای ایمن متوالی (بدون LTI)</span>
            <div className="p-1.5 bg-white/10 text-cyan-300 rounded-md">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-cyan-400">{metrics.safeDaysWithoutLTI}</span>
            <span className="text-xs text-cyan-200 font-medium">روز کار متوالی</span>
          </div>
          <div className="mt-3 text-[11px] text-cyan-100 flex items-center justify-between pt-2 border-t border-cyan-800/60">
            <span>نرخ بروز حادثه (IR):</span>
            <span className="font-bold text-white">{metrics.incidentRate} (OSHA)</span>
          </div>
        </div>
      </div>

      {/* نمودارهای تحلیلی ۳ شیفت، نوع حادثه و توزیع واحدها */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ستون ۱: تحلیل مقایسه‌ای سه شیفت کاری افسران ایمنی */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-800 text-sm md:text-base">توزیع حوادث در سه شیفت کاری</h3>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full">
                افسران ایمنی
              </span>
            </div>

            <div className="space-y-4">
              {(['morning', 'evening', 'night'] as ShiftType[]).map((shiftKey) => {
                const shiftInfo = SHIFT_LABELS[shiftKey];
                const shiftOfficer = settings.shifts[shiftKey].officer;
                const count = metrics.byShift[shiftKey] || 0;
                const percent = metrics.totalIncidents > 0 ? Math.round((count / metrics.totalIncidents) * 100) : 0;

                return (
                  <div key={shiftKey} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="flex items-center justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-800">{shiftInfo.title}</span>
                      <span className="text-slate-500 font-normal">{shiftInfo.time}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2">
                      <span>افسر مسئول: <strong className="text-slate-700">{shiftOfficer}</strong></span>
                      <span className="font-bold text-slate-800">{count} حادثه ({percent}٪)</span>
                    </div>

                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${
                          shiftKey === 'morning' ? 'bg-amber-500' : shiftKey === 'evening' ? 'bg-blue-600' : 'bg-purple-600'
                        }`}
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 p-3 bg-indigo-50/60 rounded-lg border border-indigo-100 text-[11px] text-indigo-900 leading-relaxed">
            💡 <strong>تحلیل نوبتی:</strong> شیفت شب به دلیل افت هوشیاری و شیفت صبح به دلیل بارگیری‌های سنگین نیازمند بازرسی‌های مضاعف چک‌لیست تجهیزات حفاظت فردی هستند.
          </div>
        </div>

        {/* ستون ۲: انواع حوادث ثبت شده (مطابق چک‌باکس‌های فرم پیوست F-HS-07-00) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-cyan-600" />
                <h3 className="font-bold text-slate-800 text-sm md:text-base">تحلیل نوع جراحات و آسیب‌ها</h3>
              </div>
              <span className="text-xs text-slate-400">فرم F-HS-07-00</span>
            </div>

            <div className="space-y-3">
              {Object.entries(metrics.byType).map(([typeKey, count]) => {
                const label = INCIDENT_TYPE_LABELS[typeKey] || typeKey;
                const percent = metrics.totalIncidents > 0 ? Math.round((count / metrics.totalIncidents) * 100) : 0;

                return (
                  <div key={typeKey} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700">{label}</span>
                      <span className="font-bold text-slate-800">{count} مورد ({percent}٪)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-cyan-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>شدیدترین نوع: <strong className="text-rose-600">شکستگی و سوختگی</strong></span>
            <span>بیشترین فراوانی: <strong className="text-cyan-700">بریدگی با پلیسه</strong></span>
          </div>
        </div>

        {/* ستون ۳: توزیع حوادث در واحدهای کارخانه */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-800 text-sm md:text-base">رتبه‌بندی حوادث بر اساس واحدها</h3>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full">
                واحدهای کارخانه
              </span>
            </div>

            <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
              {settings.departments.map((dept) => {
                const count = metrics.byDepartment[dept] || 0;
                const isHighRisk = count >= 2;

                return (
                  <div 
                    key={dept} 
                    className={`flex items-center justify-between p-2.5 rounded-lg border text-xs transition ${
                      isHighRisk ? 'bg-rose-50/60 border-rose-200' : 'bg-slate-50 border-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className={`w-2 h-2 rounded-full ${isHighRisk ? 'bg-rose-500' : 'bg-slate-300'}`}></span>
                      <span className="font-semibold text-slate-800 truncate">{dept}</span>
                    </div>
                    <span className={`font-bold px-2 py-0.5 rounded text-xs ${
                      isHighRisk ? 'bg-rose-100 text-rose-800' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {count} حادثه
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>تعداد واحدهای فعال: <strong>{settings.departments.length} واحد</strong></span>
            <span>کل پرسنل: <strong>{settings.totalWorkers} نفر</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
