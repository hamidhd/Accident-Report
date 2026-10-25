import React, { useState } from 'react';
import { Incident, FactorySettings, UserProfile, ShiftType } from '../types';
import { SHIFT_LABELS, SEVERITY_LABELS, INCIDENT_TYPE_LABELS } from '../utils/hseMetrics';
import { 
  Search, 
  Filter, 
  Printer, 
  Edit3, 
  Eye, 
  CheckCircle, 
  Clock, 
  FileText, 
  AlertCircle,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface Props {
  incidents: Incident[];
  currentUser: UserProfile;
  settings: FactorySettings;
  onViewOfficialForm: (incident: Incident) => void;
  onEditIncident: (incident: Incident) => void;
  onQuickSignSupervisor?: (incident: Incident) => void;
}

export const IncidentListTable: React.FC<Props> = ({
  incidents,
  currentUser,
  settings,
  onViewOfficialForm,
  onEditIncident,
  onQuickSignSupervisor
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedShift, setSelectedShift] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const filtered = incidents.filter(inc => {
    // جستجو در نام، کد پرسنلی، محل، یا شناسه
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchName = inc.injuredPerson?.fullName?.toLowerCase().includes(q);
      const matchCode = inc.injuredPerson?.personnelCode?.toLowerCase().includes(q);
      const matchDept = inc.injuredPerson?.department?.toLowerCase().includes(q);
      const matchLoc = inc.incidentGeneral?.exactLocation?.toLowerCase().includes(q);
      const matchId = inc.id?.toLowerCase().includes(q);
      if (!matchName && !matchCode && !matchDept && !matchLoc && !matchId) return false;
    }

    if (selectedShift !== 'all' && inc.shift !== selectedShift) return false;
    if (selectedSeverity !== 'all' && inc.severity !== selectedSeverity) return false;
    if (selectedStatus === 'signed' && !inc.supervisorSection?.isSigned) return false;
    if (selectedStatus === 'pending' && inc.supervisorSection?.isSigned) return false;

    return true;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* فیلترها و سرچ‌بار */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* سرچ باکس */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="جستجوی نام مصدوم، کد پرسنلی، محل حادثه یا شناسه پرونده..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-9 pl-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-cyan-500 placeholder:text-slate-400"
          />
        </div>

        {/* فیلترهای کناری */}
        <div className="flex flex-wrap items-center gap-2">
          {/* فیلتر شیفت */}
          <select
            value={selectedShift}
            onChange={(e) => setSelectedShift(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-700 font-medium cursor-pointer"
          >
            <option value="all">تمام شیفت‌ها</option>
            <option value="morning">شیفت ۱ (صبح)</option>
            <option value="evening">شیفت ۲ (عصر)</option>
            <option value="night">شیفت ۳ (شب)</option>
          </select>

          {/* فیلتر شدت */}
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-700 font-medium cursor-pointer"
          >
            <option value="all">همه شدت‌ها</option>
            <option value="minor">خفیف</option>
            <option value="moderate">متوسط</option>
            <option value="severe">شدید</option>
            <option value="critical">بحرانی (SOS)</option>
          </select>

          {/* وضعیت تایید سرپرست */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-700 font-medium cursor-pointer"
          >
            <option value="all">وضعیت امضای سرپرست</option>
            <option value="pending">در انتظار امضا سرپرست</option>
            <option value="signed">تایید و امضا شده</option>
          </select>
        </div>
      </div>

      {/* جدول گزارش‌ها */}
      <div className="overflow-x-auto">
        <table className="w-full text-right text-xs">
          <thead>
            <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-bold">
              <th className="p-3.5">شناسه و کد فرم</th>
              <th className="p-3.5">مصدوم و واحد</th>
              <th className="p-3.5">شیفت کاری</th>
              <th className="p-3.5">نوع و شدت حادثه</th>
              <th className="p-3.5">تاریخ و ساعت</th>
              <th className="p-3.5">تایید سرپرست واحد</th>
              <th className="p-3.5">استراحت کاری (LTI)</th>
              <th className="p-3.5 text-center">عملیات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-400">
                  موردی مطابق با فیلترهای جستجو یافت نشد.
                </td>
              </tr>
            ) : (
              filtered.map((inc) => {
                const shiftInfo = SHIFT_LABELS[inc.shift];
                const severityInfo = SEVERITY_LABELS[inc.severity];
                const isSigned = inc.supervisorSection?.isSigned;
                const lostDays = inc.hseSection?.lostWorkdays || 0;

                return (
                  <tr key={inc.id} className="hover:bg-slate-50/80 transition">
                    {/* شناسه و فرم */}
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900 font-mono">{inc.id}</div>
                      <div className="text-[10px] text-cyan-700 font-semibold mt-0.5">
                        {inc.formCode || 'F-HS-07-00'}
                      </div>
                      {inc.isEmergency && (
                        <span className="inline-block mt-1 text-[9px] font-black bg-rose-100 text-rose-700 px-1.5 py-0.2 rounded border border-rose-300 animate-pulse">
                          کد قرمز SOS
                        </span>
                      )}
                    </td>

                    {/* مشخصات مصدوم */}
                    <td className="p-3.5">
                      <div className="font-bold text-slate-800">{inc.injuredPerson?.fullName || 'نامشخص'}</div>
                      <div className="text-[11px] text-slate-500">{inc.injuredPerson?.department}</div>
                      <div className="text-[10px] text-slate-400 font-mono">کد: {inc.injuredPerson?.personnelCode || '—'}</div>
                    </td>

                    {/* شیفت کاری */}
                    <td className="p-3.5">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold border ${shiftInfo.badgeColor}`}>
                        {shiftInfo.title}
                      </span>
                      <div className="text-[10px] text-slate-500 mt-1">افسر: {inc.shiftOfficerName}</div>
                    </td>

                    {/* نوع و شدت */}
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-700 mb-1">
                        {(inc.incidentGeneral?.types || []).map(t => INCIDENT_TYPE_LABELS[t] || t).join('، ') || 'ثبت نشده'}
                      </div>
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${severityInfo.bg} ${severityInfo.color}`}>
                        {severityInfo.label.split(' ')[0]}
                      </span>
                    </td>

                    {/* تاریخ و ساعت */}
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-700">{inc.incidentGeneral?.incidentDate}</div>
                      <div className="text-[11px] text-slate-500 font-mono">ساعت {inc.incidentGeneral?.incidentTime}</div>
                    </td>

                    {/* وضعیت امضای سرپرست */}
                    <td className="p-3.5">
                      {isSigned ? (
                        <div className="flex items-center gap-1.5 text-emerald-700 font-semibold text-xs">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                          <span>تایید و امضا شد</span>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 text-amber-700 font-semibold text-[11px] bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-600" />
                            در انتظار تایید سرپرست
                          </span>
                          {(currentUser.role === 'unit_supervisor' || currentUser.role === 'hse_manager') && onQuickSignSupervisor && (
                            <button
                              onClick={() => onQuickSignSupervisor(inc)}
                              className="block text-[10px] text-cyan-700 hover:text-cyan-900 font-bold underline cursor-pointer"
                            >
                              امضای سریع سرپرست
                            </button>
                          )}
                        </div>
                      )}
                    </td>

                    {/* استراحت کاری */}
                    <td className="p-3.5">
                      {lostDays > 0 ? (
                        <span className="font-bold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded border border-amber-300">
                          {lostDays} روز غیبت
                        </span>
                      ) : (
                        <span className="text-slate-500 font-medium">بدون غیبت کاری</span>
                      )}
                    </td>

                    {/* عملیات */}
                    <td className="p-3.5">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onViewOfficialForm(inc)}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-cyan-50 hover:bg-cyan-100 text-cyan-800 rounded-lg font-bold text-xs transition cursor-pointer border border-cyan-200"
                          title="مشاهده فرم پیوست F-HS-07-00 و چاپ"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>فرم رسمی</span>
                        </button>

                        <button
                          onClick={() => onEditIncident(inc)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                          title="ویرایش پرونده و اطلاعات بهداری"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* فوتر جدول */}
      <div className="p-3.5 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
        <div>
          نمایش <strong className="text-slate-800">{filtered.length}</strong> پرونده از کل <strong className="text-slate-800">{incidents.length}</strong> حادثه ثبت شده در کارخانه دانیال استیل
        </div>
        <div className="flex items-center gap-1 text-[11px] font-medium text-slate-600">
          <span>کد استاندارد ایزو کارخانه: <strong>ISO 45001 / F-HS-07-00</strong></span>
        </div>
      </div>
    </div>
  );
};
