import React, { useState } from 'react';
import { Incident, FactorySettings, ShiftType, IncidentCategory, SeverityLevel, UserProfile } from '../types';
import { SHIFT_LABELS, INCIDENT_TYPE_LABELS, SEVERITY_LABELS } from '../utils/hseMetrics';
import { 
  FileText, 
  Save, 
  X, 
  User, 
  Clock, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  HeartHandshake,
  Stethoscope
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (incident: Incident) => void;
  settings: FactorySettings;
  currentUser: UserProfile;
  initialIncident?: Incident | null;
}

export const IncidentFormModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSave,
  settings,
  currentUser,
  initialIncident
}) => {
  if (!isOpen) return null;

  const isEditing = Boolean(initialIncident);

  // پیش‌فرض زمان و تاریخ
  const now = new Date();
  const defaultDate = initialIncident?.incidentGeneral?.incidentDate || '۱۴۰۳/۰۸/' + String(now.getDate()).padStart(2, '0');
  const defaultTime = initialIncident?.incidentGeneral?.incidentTime || String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');

  // استیت‌های فرم
  const [shift, setShift] = useState<ShiftType>(
    initialIncident?.shift || currentUser.shift || 'morning'
  );
  const [severity, setSeverity] = useState<SeverityLevel>(initialIncident?.severity || 'minor');
  const [officerName, setOfficerName] = useState<string>(
    initialIncident?.shiftOfficerName || currentUser.name
  );

  // اطلاعات پرسنل مصدوم
  const [fullName, setFullName] = useState<string>(initialIncident?.injuredPerson?.fullName || '');
  const [department, setDepartment] = useState<string>(
    initialIncident?.injuredPerson?.department || settings.departments[0] || 'خط نورد گرم مقاطع'
  );
  const [personnelCode, setPersonnelCode] = useState<string>(initialIncident?.injuredPerson?.personnelCode || '');
  const [jobTitle, setJobTitle] = useState<string>(initialIncident?.injuredPerson?.jobTitle || '');

  // اطلاعات عمومی حادثه
  const [types, setTypes] = useState<IncidentCategory[]>(
    initialIncident?.incidentGeneral?.types || ['superficial_injury']
  );
  const [otherExplanation, setOtherExplanation] = useState<string>(
    initialIncident?.incidentGeneral?.otherExplanation || ''
  );
  const [bodyPart, setBodyPart] = useState<string>(initialIncident?.incidentGeneral?.bodyPart || '');
  const [ppeUsed, setPpeUsed] = useState<string>(
    initialIncident?.incidentGeneral?.ppeUsed || 'کفش ایمنی، کلاه ایمنی، دستکش کار'
  );
  const [witnesses, setWitnesses] = useState<string>(initialIncident?.incidentGeneral?.witnesses || '');
  const [incidentDate, setIncidentDate] = useState<string>(defaultDate);
  const [incidentTime, setIncidentTime] = useState<string>(defaultTime);
  const [exactLocation, setExactLocation] = useState<string>(initialIncident?.incidentGeneral?.exactLocation || '');
  const [description, setDescription] = useState<string>(initialIncident?.incidentGeneral?.description || '');

  // بخش سرپرست واحد
  const [supervisorName, setSupervisorName] = useState<string>(
    initialIncident?.supervisorSection?.fullName || (currentUser.role === 'unit_supervisor' ? currentUser.name : '')
  );
  const [supervisorPhone, setSupervisorPhone] = useState<string>(
    initialIncident?.supervisorSection?.phone || (currentUser.role === 'unit_supervisor' ? currentUser.phone : '')
  );
  const [supervisorRole, setSupervisorRole] = useState<string>(
    initialIncident?.supervisorSection?.organizationalRole || 'سرپرست تولید'
  );
  const [supervisorSigned, setSupervisorSigned] = useState<boolean>(
    initialIncident?.supervisorSection?.isSigned || false
  );
  const [supervisorNotes, setSupervisorNotes] = useState<string>(
    initialIncident?.supervisorSection?.notes || ''
  );

  // بخش بهداری و HSE
  const [clinicActions, setClinicActions] = useState<string>(
    initialIncident?.hseSection?.clinicActions || ''
  );
  const [lostWorkdays, setLostWorkdays] = useState<number>(
    initialIncident?.hseSection?.lostWorkdays || 0
  );
  const [hseStatus, setHseStatus] = useState<'under_review' | 'closed' | 'referred_hospital'>(
    initialIncident?.hseSection?.status || 'under_review'
  );

  // تب فعال در فرم
  const [activeTab, setActiveTab] = useState<'general' | 'supervisor' | 'clinic'>('general');

  const toggleType = (t: IncidentCategory) => {
    if (types.includes(t)) {
      setTypes(types.filter(item => item !== t));
    } else {
      setTypes([...types, t]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const incidentId = initialIncident?.id || `INC-1403-${Math.floor(100 + Math.random() * 900)}`;
    const completionDateTime = initialIncident?.incidentGeneral?.formCompletionDateTime || `${incidentDate} ساعت ${incidentTime}`;

    const newIncident: Incident = {
      id: incidentId,
      formCode: settings.formCode || 'F-HS-07-00',
      shift,
      shiftOfficerName: officerName,
      shiftOfficerId: currentUser.id,
      severity,
      isEmergency: severity === 'critical',
      injuredPerson: {
        fullName,
        department,
        personnelCode,
        jobTitle
      },
      incidentGeneral: {
        types,
        otherExplanation,
        bodyPart,
        ppeUsed,
        witnesses,
        incidentDate,
        incidentTime,
        formCompletionDateTime: completionDateTime,
        exactLocation,
        description
      },
      supervisorSection: {
        fullName: supervisorName,
        phone: supervisorPhone,
        unit: department,
        organizationalRole: supervisorRole,
        date: incidentDate,
        signature: supervisorSigned ? `${supervisorName} (تایید شده)` : 'در انتظار امضا',
        isSigned: supervisorSigned,
        notes: supervisorNotes
      },
      hseSection: {
        clinicActions: clinicActions || 'شستشو و معاینه در بهداری کارخانه',
        lostWorkdays: Number(lostWorkdays) || 0,
        hseOfficerName: currentUser.role === 'hse_manager' ? currentUser.name : 'مهندس حمید رفیعیان',
        hseRegistrationDate: incidentDate,
        status: hseStatus
      },
      createdAt: initialIncident?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(newIncident);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh]">
        {/* هدر مدال */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-600 rounded-xl text-white">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base md:text-lg">
                {isEditing ? `ویرایش پرونده حادثه (${initialIncident?.id})` : 'ثبت گزارش جدید حادثه کارخانه'}
              </h3>
              <p className="text-xs text-slate-300">
                فرم استاندارد پیوستی F-HS-07-00 • شرکت دانیال استیل
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* نوار ناوبری تب‌ها در فرم چند مرحله‌ای */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs md:text-sm font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 border-b-2 transition cursor-pointer ${
              activeTab === 'general'
                ? 'border-cyan-600 text-cyan-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>اطلاعات مصدوم و جزئیات حادثه (بخش عمومی)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('supervisor')}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 border-b-2 transition cursor-pointer ${
              activeTab === 'supervisor'
                ? 'border-cyan-600 text-cyan-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <HeartHandshake className="w-4 h-4" />
            <span>بخش سرپرست واحد {supervisorSigned ? '✓ (امضا شده)' : ''}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('clinic')}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 border-b-2 transition cursor-pointer ${
              activeTab === 'clinic'
                ? 'border-cyan-600 text-cyan-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            <span>اقدامات خانه بهداشت و استراحت (HSE)</span>
          </button>
        </div>

        {/* بدنه فرم */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto flex-1 space-y-5">
          {/* تب ۱: اطلاعات مصدوم و حادثه */}
          {activeTab === 'general' && (
            <div className="space-y-5">
              {/* بخش انتخاب شیفت و درجه شدت */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">شیفت ثبت حادثه</label>
                  <select
                    value={shift}
                    onChange={(e) => setShift(e.target.value as ShiftType)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800"
                  >
                    <option value="morning">شیفت ۱ (صبح ۰۶:۰۰ تا ۱۴:۰۰)</option>
                    <option value="evening">شیفت ۲ (عصر ۱۴:۰۰ تا ۲۲:۰۰)</option>
                    <option value="night">شیفت ۳ (شب ۲۲:۰۰ تا ۰۶:۰۰)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">افسر ایمنی ثبت‌کننده</label>
                  <input
                    type="text"
                    value={officerName}
                    onChange={(e) => setOfficerName(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">سطح شدت حادثه</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as SeverityLevel)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800"
                  >
                    <option value="minor">خفیف (بدون نیاز به بستری)</option>
                    <option value="moderate">متوسط (درمانگاهی/پانسمان)</option>
                    <option value="severe">شدید (ارجاع به بیمارستان)</option>
                    <option value="critical">بحرانی (کد قرمز / نقص عضو)</option>
                  </select>
                </div>
              </div>

              {/* کادر آبی مطابق فرم: اطلاعات پرسنل مصدوم */}
              <div className="border border-cyan-200 rounded-xl overflow-hidden">
                <div className="bg-[#BFE3EE] text-slate-900 font-extrabold px-4 py-2 text-xs md:text-sm flex items-center justify-between">
                  <span>اطلاعات پرسنل مصدوم</span>
                  <span className="text-[11px] font-normal text-slate-700">فرم پیوست F-HS-07-00</span>
                </div>
                <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      نام و نام خانوادگی : <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: علی رضایی"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      پرسنل واحد : <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-cyan-500 font-medium"
                    >
                      {settings.departments.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      شماره پرسنلی : <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: ۵۱۲۰"
                      value={personnelCode}
                      onChange={(e) => setPersonnelCode(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                </div>
              </div>

              {/* کادر آبی مطابق فرم: اطلاعات عمومی حادثه */}
              <div className="border border-cyan-200 rounded-xl overflow-hidden space-y-4">
                <div className="bg-[#BFE3EE] text-slate-900 font-extrabold px-4 py-2 text-xs md:text-sm">
                  اطلاعات عمومی حادثه
                </div>

                <div className="p-4 space-y-4">
                  {/* نوع حادثه (چک‌باکس‌ها) */}
                  <div>
                    <span className="block text-xs font-bold text-slate-800 mb-2">
                      نوع حادثه (مطابق گزینه‌های فرم استاندارد):
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-xs">
                      {[
                        { key: 'superficial_injury', label: 'جراحت سطحی' },
                        { key: 'contusion', label: 'ضرب دیدگی' },
                        { key: 'fracture', label: 'شکستگی' },
                        { key: 'cut', label: 'بریدگی' },
                        { key: 'burn', label: 'سوختگی' },
                        { key: 'other', label: 'سایر' }
                      ].map((item) => (
                        <label
                          key={item.key}
                          onClick={() => toggleType(item.key as IncidentCategory)}
                          className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition select-none ${
                            types.includes(item.key as IncidentCategory)
                              ? 'bg-cyan-50 border-cyan-500 text-cyan-900 font-bold'
                              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={types.includes(item.key as IncidentCategory)}
                            onChange={() => {}}
                            className="rounded text-cyan-600 focus:ring-cyan-500"
                          />
                          <span>{item.label}</span>
                        </label>
                      ))}
                    </div>

                    {types.includes('other') && (
                      <div className="mt-2">
                        <input
                          type="text"
                          placeholder="توضیح نوع سایر..."
                          value={otherExplanation}
                          onChange={(e) => setOtherExplanation(e.target.value)}
                          className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                        />
                      </div>
                    )}
                  </div>

                  {/* عضو حادثه دیده / وسایل حفاظت فردی / اسامی شاهدین */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        عضو حادثه دیده :
                      </label>
                      <input
                        type="text"
                        placeholder="مثال: انگشتان دست راست، ساعد، چشم"
                        value={bodyPart}
                        onChange={(e) => setBodyPart(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        وسایل حفاظت فردی استفاده شده توسط مصدوم :
                      </label>
                      <input
                        type="text"
                        placeholder="مثال: کلاه ایمنی، کفش ایمنی، دستکش چرمی"
                        value={ppeUsed}
                        onChange={(e) => setPpeUsed(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        اسامی شاهدین حادثه :
                      </label>
                      <input
                        type="text"
                        placeholder="نام شاهدان در صحنه"
                        value={witnesses}
                        onChange={(e) => setWitnesses(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  {/* تاریخ، ساعت، محل دقیق */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        تاریخ حادثه :
                      </label>
                      <input
                        type="text"
                        value={incidentDate}
                        onChange={(e) => setIncidentDate(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        ساعت حادثه :
                      </label>
                      <input
                        type="text"
                        value={incidentTime}
                        onChange={(e) => setIncidentTime(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        محل دقیق حادثه :
                      </label>
                      <input
                        type="text"
                        placeholder="مثال: سالن نورد، استند شماره ۳"
                        value={exactLocation}
                        onChange={(e) => setExactLocation(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  {/* شرح مختصری از حادثه */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      شرح مختصری از حادثه : <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      placeholder="چگونگی وقوع حادثه، علل اولیه و اقدامات آنی انجام شده را به طور مختصر و شفاف شرح دهید..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs leading-relaxed focus:ring-2 focus:ring-cyan-500"
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* تب ۲: اطلاعات تکمیل کننده فرم (سرپرست واحد) */}
          {activeTab === 'supervisor' && (
            <div className="space-y-4">
              <div className="p-3 bg-cyan-50 text-cyan-900 rounded-xl border border-cyan-200 text-xs leading-relaxed">
                این بخش اختصاص به <strong>مدیر / مسئول / سرپرست واحد پرسنل صدمه دیده</strong> دارد. با تایید و امضای این بخش، مراتب صحت اطلاعات و دستورات اصلاحی جهت پیشگیری از تکرار حادثه ثبت می‌گردد.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">نام و نام خانوادگی سرپرست واحد</label>
                  <input
                    type="text"
                    value={supervisorName}
                    onChange={(e) => setSupervisorName(e.target.value)}
                    placeholder="مثال: مهندس بهرام صادقی"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">شماره تماس سرپرست</label>
                  <input
                    type="text"
                    value={supervisorPhone}
                    onChange={(e) => setSupervisorPhone(e.target.value)}
                    placeholder="۰۹..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">سمت سازمانی</label>
                  <input
                    type="text"
                    value={supervisorRole}
                    onChange={(e) => setSupervisorRole(e.target.value)}
                    placeholder="مثال: سرپرست تولید خط نورد مقاطع"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">واحد تحت نظارت</label>
                  <input
                    type="text"
                    value={department}
                    disabled
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg text-xs text-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اقدامات پیشگیرانه / دستورات سرپرست واحد</label>
                <textarea
                  rows={3}
                  value={supervisorNotes}
                  onChange={(e) => setSupervisorNotes(e.target.value)}
                  placeholder="اقدامات اصلاحی اتخاذ شده در واحد جهت جلوگیری از تکرار حادثه..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                ></textarea>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 text-xs block">وضعیت تایید و امضای دیجیتال سرپرست</span>
                  <span className="text-[11px] text-slate-500">امضا با کد شناسایی سازمانی ثبت می‌گردد.</span>
                </div>
                <label className="flex items-center gap-2 cursor-pointer bg-white px-4 py-2 rounded-lg border border-slate-300 hover:border-cyan-500">
                  <input
                    type="checkbox"
                    checked={supervisorSigned}
                    onChange={(e) => setSupervisorSigned(e.target.checked)}
                    className="w-4 h-4 text-cyan-600 rounded"
                  />
                  <span className="text-xs font-bold text-cyan-900">
                    {supervisorSigned ? 'تایید و امضا شد' : 'امضای الکترونیکی فرم'}
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* تب ۳: بهداری و اقدامات HSE */}
          {activeTab === 'clinic' && (
            <div className="space-y-4">
              <div className="p-3 bg-teal-50 text-teal-900 rounded-xl border border-teal-200 text-xs leading-relaxed">
                این بخش <strong>توسط مسئول بهداری و HSE</strong> کارخانه تکمیل می‌گردد و مستقیماً در محاسبه <strong>شاخص شدت (ASR) و شاخص فراوانی-شدت (FSI)</strong> تاثیرگذار است.
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  اقدامات انجام شده در خانه بهداشت کارخانه :
                </label>
                <textarea
                  rows={3}
                  value={clinicActions}
                  onChange={(e) => setClinicActions(e.target.value)}
                  placeholder="پانسمان، بخیه، شستشو با بتادین، تزریق واکسن کزاز، آتل‌بندی، ارجاع به مراکز درمانی خارج کارخانه..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs leading-relaxed"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200">
                  <label className="block text-xs font-bold text-amber-900 mb-1">
                    تعداد روزهای استراحت کاری / غیبت (Lost Workdays) :
                  </label>
                  <p className="text-[11px] text-amber-700 mb-2">
                    هر روز استراحت در فرمول ASR و FSI ضرب می‌شود (اگر استراحت ندارد ۰ وارد کنید)
                  </p>
                  <input
                    type="number"
                    min="0"
                    max="180"
                    value={lostWorkdays}
                    onChange={(e) => setLostWorkdays(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg text-sm font-bold text-amber-900"
                  />
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    وضعیت پرونده پزشکی و اداری در واحد HSE :
                  </label>
                  <select
                    value={hseStatus}
                    onChange={(e) => setHseStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 mt-2"
                  >
                    <option value="closed">مختومه (بهبود یافته و بازگشت به کار)</option>
                    <option value="under_review">تحت پیگیری بهداشت کار / استراحت استعلاجی</option>
                    <option value="referred_hospital">اعزام شده به بیمارستان تخصصی</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* فوتر دکمه‌های ثبت */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              کدفرم اختصاصی: <strong className="text-slate-800">{settings.formCode}</strong>
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 text-xs font-semibold hover:bg-slate-100 transition cursor-pointer"
              >
                انصراف
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold shadow-sm transition cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>ذخیره نهایی پرونده حادثه</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
