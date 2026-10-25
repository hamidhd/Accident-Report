import React, { useState } from 'react';
import { FactorySettings, Incident, ShiftType } from '../types';
import { 
  AlertOctagon, 
  PhoneCall, 
  Ambulance, 
  Flame, 
  Zap, 
  ShieldAlert, 
  CheckCircle2, 
  Volume2, 
  VolumeX,
  X,
  Send
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  settings: FactorySettings;
  currentShift: ShiftType;
  currentOfficerName: string;
  onEmergencySubmit: (incident: Incident) => void;
}

export const EmergencyAlertModal: React.FC<Props> = ({
  isOpen,
  onClose,
  settings,
  currentShift,
  currentOfficerName,
  onEmergencySubmit
}) => {
  const [department, setDepartment] = useState<string>(settings.departments[0] || 'خط نورد گرم مقاطع');
  const [exactLocation, setExactLocation] = useState<string>('');
  const [injuredName, setInjuredName] = useState<string>('');
  const [personnelCode, setPersonnelCode] = useState<string>('');
  const [emergencyType, setEmergencyType] = useState<string>('trapped_machinery'); // گیرکردن، سوختگی شدید، سقوط و...
  const [injuredCount, setInjuredCount] = useState<number>(1);
  const [needsAmbulance, setNeedsAmbulance] = useState<boolean>(true);
  const [isPowerCutoffNeeded, setIsPowerCutoffNeeded] = useState<boolean>(false);
  const [quickDescription, setQuickDescription] = useState<string>('');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  if (!isOpen) return null;

  const playSiren = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch (e) {
      // Audio not permitted without user interaction
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (soundEnabled) playSiren();

    const now = new Date();
    const dateStr = '۱۴۰۳/۰۸/' + String(now.getDate()).padStart(2, '0');
    const timeStr = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');

    const emergencyTypeMap: Record<string, { type: any; desc: string }> = {
      trapped_machinery: { type: 'fracture', desc: 'گیر افتادن در تجهیزات مکانیکی و ماشین‌آلات' },
      severe_burn: { type: 'burn', desc: 'سوختگی حاد ناشی از مذاب یا سرباره کوره' },
      fall_height: { type: 'fracture', desc: 'سقوط از ارتفاع یا اسکلت فلزی' },
      electric_shock: { type: 'burn', desc: 'برق‌گرفتگی ولتاژ بالا در تاسیسات' },
      heavy_crush: { type: 'contusion', desc: 'له‌شدگی با بار جرثقیل یا استکر' }
    };

    const selectedTypeInfo = emergencyTypeMap[emergencyType] || { type: 'fracture', desc: 'حادثه بحرانی حاد' };

    const newIncident: Incident = {
      id: `SOS-${Date.now().toString().slice(-4)}`,
      formCode: settings.formCode || 'F-HS-07-00',
      shift: currentShift,
      shiftOfficerName: currentOfficerName,
      shiftOfficerId: 'current-officer',
      severity: 'critical',
      isEmergency: true,
      injuredPerson: {
        fullName: injuredName || 'مصدوم نیازمند امداد فوری',
        department: department,
        personnelCode: personnelCode || 'ثبت اورژانسی',
        jobTitle: 'پرسنل خط تولید'
      },
      incidentGeneral: {
        types: [selectedTypeInfo.type],
        otherExplanation: selectedTypeInfo.desc,
        bodyPart: 'نیاز به تریاژ در صحنه حادثه',
        ppeUsed: 'در حال بررسی توسط افسر ایمنی',
        witnesses: 'تیم امداد و نجات شیفت',
        incidentDate: dateStr,
        incidentTime: timeStr,
        formCompletionDateTime: `${dateStr} ساعت ${timeStr}`,
        exactLocation: exactLocation || `${department} - بخش عملیاتی`,
        description: `[ثبت سریع کد قرمز SOS] ${selectedTypeInfo.desc}. ${quickDescription}. ${needsAmbulance ? 'آمبولانس فراخوان شد.' : ''} ${isPowerCutoffNeeded ? 'دستور قطع برق اضطراری صادر شد.' : ''}`
      },
      supervisorSection: {
        fullName: 'سرپرست ' + department,
        phone: 'تماس اضطراری بی‌سیم',
        unit: department,
        organizationalRole: 'سرپرست کشیک واحد',
        date: dateStr,
        signature: 'اعلام فوری در صحنه',
        isSigned: false,
        notes: 'هشدار پیامکی و سیستمی به سرپرست ارسال گردید.'
      },
      hseSection: {
        clinicActions: needsAmbulance ? 'آماده‌باش تیم بهداری و اعزام آمبولانس به محل حادثه' : 'اعزام کارشناس بهداشت',
        lostWorkdays: 14,
        hseOfficerName: currentOfficerName,
        hseRegistrationDate: dateStr,
        status: 'under_review'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onEmergencySubmit(newIncident);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border-4 border-rose-600 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* هدر اعلام وضعیت بحرانی با انیمیشن اخطار */}
        <div className="bg-gradient-to-r from-rose-700 via-red-600 to-rose-700 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl animate-pulse">
              <AlertOctagon className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-white text-rose-700 text-[11px] font-black px-2 py-0.5 rounded-full">
                  کد قرمز / SOS
                </span>
                <h3 className="font-black text-lg">ثبت سریع و فوری حادثه بحرانی</h3>
              </div>
              <p className="text-xs text-rose-100">
                ارسال همزمان آلارم به سرپرست واحد، بهداری، و مدیریت HSE کارخانه
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs transition"
              title={soundEnabled ? 'صدا فعال' : 'صدا غیرفعال'}
            >
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* خط تماس سریع اورژانسی کارخانه */}
        <div className="bg-rose-50 px-4 py-2.5 border-b border-rose-200 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="font-bold text-rose-900 flex items-center gap-1.5">
            <PhoneCall className="w-4 h-4 text-rose-600" />
            خطوط ارتباطی فوری کارخانه دانیال استیل:
          </span>
          <div className="flex items-center gap-4 text-slate-700 font-bold">
            <span className="bg-white px-2 py-1 rounded border border-rose-300">داخلی بهداری: ۱۲۳</span>
            <span className="bg-white px-2 py-1 rounded border border-rose-300">آتش‌نشانی کارخانه: ۱۲۵</span>
            <span className="bg-white px-2 py-1 rounded border border-rose-300">اورژانس شهری: ۱۱۵</span>
          </div>
        </div>

        {/* فرم ثبت سریع */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* انتخاب واحد کارخانه */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                واحد حادثه‌دیده <span className="text-rose-500">*</span>
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-rose-500 focus:bg-white"
              >
                {settings.departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            {/* محل دقیق */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                محل دقیق در سالن / ایستگاه <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="مثلاً: سکوی کوره شماره ۲، پای استند ۴"
                value={exactLocation}
                onChange={(e) => setExactLocation(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-rose-500 focus:bg-white"
              />
            </div>

            {/* ماهیت بحران */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                نوع و ماهیت وضعیت بحرانی <span className="text-rose-500">*</span>
              </label>
              <select
                value={emergencyType}
                onChange={(e) => setEmergencyType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-rose-500"
              >
                <option value="trapped_machinery">گیر افتادن یا له‌شدگی در ماشین‌آلات / غلتک نورد</option>
                <option value="severe_burn">سوختگی حاد پاشش مذاب کوره القایی</option>
                <option value="fall_height">سقوط از ارتفاع / پله‌های صنعتی</option>
                <option value="electric_shock">برق‌گرفتگی شدید / اتصال تابلو فشار قوی</option>
                <option value="heavy_crush">سقوط بندیل یا بار معلق جرثقیل سقفی</option>
              </select>
            </div>

            {/* نام مصدوم (اختیاری در لحظه بحران) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                نام مصدوم (در صورت مشخص بودن)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="نام و خانوادگی"
                  value={injuredName}
                  onChange={(e) => setInjuredName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
                />
                <input
                  type="text"
                  placeholder="شماره پرسنلی"
                  value={personnelCode}
                  onChange={(e) => setPersonnelCode(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
                />
              </div>
            </div>
          </div>

          {/* گزینه‌های اقدام فوری */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
            <span className="text-xs font-bold text-slate-800 block mb-1">
              اقدامات سریع مورد نیاز سیستم امداد:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <label className="flex items-center gap-2 p-2.5 bg-white rounded-lg border border-slate-200 cursor-pointer hover:border-rose-400">
                <input
                  type="checkbox"
                  checked={needsAmbulance}
                  onChange={(e) => setNeedsAmbulance(e.target.checked)}
                  className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500"
                />
                <Ambulance className="w-4 h-4 text-rose-600" />
                <span className="font-semibold text-slate-800">اعزام فوری آمبولانس کارخانه به صحنه</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 bg-white rounded-lg border border-slate-200 cursor-pointer hover:border-rose-400">
                <input
                  type="checkbox"
                  checked={isPowerCutoffNeeded}
                  onChange={(e) => setIsPowerCutoffNeeded(e.target.checked)}
                  className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                />
                <Zap className="w-4 h-4 text-amber-600" />
                <span className="font-semibold text-slate-800">دستور قطع برق / قفل خط تولید (LOTO)</span>
              </label>
            </div>
          </div>

          {/* شرح مختصر بحران */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              شرح وضعیت و نیازهای فوری صحنه
            </label>
            <textarea
              rows={2}
              placeholder="مثلاً: وضعیت هوشیاری، نیاز به تجهیزات نجات، محل قرارگیری فعلی مصدوم..."
              value={quickDescription}
              onChange={(e) => setQuickDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-rose-500"
            ></textarea>
          </div>

          {/* دکمه‌های تایید و ارسال */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 text-sm font-semibold hover:bg-slate-100 transition cursor-pointer"
            >
              انصراف
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold shadow-md shadow-rose-600/30 transition cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>ارسال فوری هشدار بحرانی و ثبت کد قرمز</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
