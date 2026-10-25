import React, { useState, useEffect } from 'react';
import { 
  Incident, 
  FactorySettings, 
  UserProfile, 
  NotificationItem, 
  ShiftType 
} from './types';
import { 
  INITIAL_SETTINGS, 
  INITIAL_USERS, 
  INITIAL_INCIDENTS, 
  INITIAL_NOTIFICATIONS 
} from './data/initialData';
import { calculateHseMetrics, SHIFT_LABELS } from './utils/hseMetrics';
import { exportIncidentsToExcel } from './utils/excelExport';

// کامپوننت‌ها
import { OfficialIncidentForm } from './components/OfficialIncidentForm';
import { AnalyticsPanel } from './components/AnalyticsPanel';
import { IncidentListTable } from './components/IncidentListTable';
import { IncidentFormModal } from './components/IncidentFormModal';
import { EmergencyAlertModal } from './components/EmergencyAlertModal';
import { NotificationCenter } from './components/NotificationCenter';
import { UserAccessManager } from './components/UserAccessManager';
import { FactorySettingsModal } from './components/FactorySettingsModal';
import { TauriBuildInfoModal } from './components/TauriBuildInfoModal';

import { 
  ShieldAlert, 
  Bell, 
  PlusCircle, 
  AlertOctagon, 
  FileSpreadsheet, 
  BarChart3, 
  ListFilter, 
  Sliders, 
  Users, 
  Printer, 
  Clock, 
  ChevronDown, 
  CheckCircle2, 
  Flame, 
  Building2,
  HelpCircle,
  FileText,
  Monitor
} from 'lucide-react';

export default function App() {
  // اطلاعات پایه و استیت‌ها
  const [settings, setSettings] = useState<FactorySettings>(() => {
    const saved = localStorage.getItem('danial_steel_settings');
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  const [users, setUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('danial_steel_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    return users[0]; // مدیر ارشد HSE
  });

  const [incidents, setIncidents] = useState<Incident[]>(() => {
    const saved = localStorage.getItem('danial_steel_incidents');
    return saved ? JSON.parse(saved) : INITIAL_INCIDENTS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('danial_steel_notifs');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  // ناوبری تب‌های اصلی برنامه
  const [currentTab, setCurrentTab] = useState<'analytics' | 'incidents' | 'form_preview'>('analytics');

  // مودال‌ها
  const [isNewIncidentOpen, setIsNewIncidentOpen] = useState(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isAccessManagerOpen, setIsAccessManagerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTauriModalOpen, setIsTauriModalOpen] = useState(false);
  
  // پرونده فعال جهت مشاهده فرم رسمی یا ویرایش
  const [selectedIncidentForForm, setSelectedIncidentForForm] = useState<Incident | null>(null);
  const [editingIncident, setEditingIncident] = useState<Incident | null>(null);

  // پیام موفقیت یا هشدار گذرا (Toast)
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'danger' | 'info' } | null>(null);

  // محاسبه شیفت جاری بر اساس ساعت سیستم
  const getCurrentShift = (): ShiftType => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 14) return 'morning';
    if (hour >= 14 && hour < 22) return 'evening';
    return 'night';
  };

  const activeShift = getCurrentShift();
  const shiftInfo = SHIFT_LABELS[activeShift];

  // ذخیره‌سازی خودکار در LocalStorage
  useEffect(() => {
    localStorage.setItem('danial_steel_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('danial_steel_incidents', JSON.stringify(incidents));
  }, [incidents]);

  useEffect(() => {
    localStorage.setItem('danial_steel_notifs', JSON.stringify(notifications));
  }, [notifications]);

  const showToast = (text: string, type: 'success' | 'danger' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // افزودن یا ویرایش حادثه
  const handleSaveIncident = (incident: Incident) => {
    const exists = incidents.some(i => i.id === incident.id);
    let updatedList: Incident[];

    if (exists) {
      updatedList = incidents.map(i => i.id === incident.id ? incident : i);
      showToast(`پرونده حادثه ${incident.id} با موفقیت به‌روزرسانی شد.`, 'success');
    } else {
      updatedList = [incident, ...incidents];
      showToast(`گزارش حادثه جدید با شناسه ${incident.id} و کدفرم ${incident.formCode} ثبت شد.`, 'success');

      // ایجاد خودکار نوتیفیکیشن برای سرپرست واحد
      const newNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        incidentId: incident.id,
        title: `ثبت حادثه جدید در ${incident.injuredPerson.department}`,
        message: `مصدوم: ${incident.injuredPerson.fullName} (${incident.injuredPerson.personnelCode}) در شیفت ${SHIFT_LABELS[incident.shift].title}. جهت تایید و امضای بخش سرپرست اقدام فرمایید.`,
        department: incident.injuredPerson.department,
        severity: incident.severity,
        timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
        isRead: false,
        targetRole: 'unit_supervisor',
        targetUnit: incident.injuredPerson.department
      };

      setNotifications(prev => [newNotif, ...prev]);
    }

    setIncidents(updatedList);
    setEditingIncident(null);
  };

  // ثبت وضعیت بحرانی اضطراری
  const handleEmergencySubmit = (emergencyIncident: Incident) => {
    setIncidents(prev => [emergencyIncident, ...prev]);

    // نوتیفیکیشن فوری بحرانی
    const criticalNotif: NotificationItem = {
      id: `notif-crit-${Date.now()}`,
      incidentId: emergencyIncident.id,
      title: `🚨 هشدار بحرانی: کد قرمز در ${emergencyIncident.injuredPerson.department}`,
      message: `حادثه بحرانی در ${emergencyIncident.incidentGeneral.exactLocation} ثبت شد. تیم بهداری و سرپرست واحد سریعا اعزام گردند!`,
      department: emergencyIncident.injuredPerson.department,
      severity: 'critical',
      timestamp: 'همین الان',
      isRead: false,
      targetRole: 'unit_supervisor',
      targetUnit: emergencyIncident.injuredPerson.department
    };

    setNotifications(prev => [criticalNotif, ...prev]);
    showToast(`کد قرمز در واحد ${emergencyIncident.injuredPerson.department} فعال شد! نوتیفیکیشن ارسال گردید.`, 'danger');
  };

  // امضای سریع سرپرست واحد
  const handleQuickSignSupervisor = (incident: Incident) => {
    const updated = {
      ...incident,
      supervisorSection: {
        ...incident.supervisorSection,
        fullName: currentUser.name,
        phone: currentUser.phone,
        unit: incident.injuredPerson.department,
        organizationalRole: currentUser.role === 'unit_supervisor' ? 'سرپرست واحد' : 'مدیر HSE',
        date: new Date().toLocaleDateString('fa-IR'),
        signature: `${currentUser.name} (تایید سیستمی دیجیتال)`,
        isSigned: true,
        notes: incident.supervisorSection?.notes || 'بررسی و تایید شد.'
      }
    };
    handleSaveIncident(updated);
    showToast(`بخش سرپرست واحد برای پرونده ${incident.id} تایید و امضا شد.`, 'success');
  };

  // محاسبه شاخص‌های جاری
  const metrics = calculateHseMetrics(incidents, settings);

  // بررسی آیا حادثه بحرانی نیازمند اقدام فوری داریم
  const criticalUnresolved = incidents.filter(i => i.severity === 'critical' && (!i.supervisorSection.isSigned || i.hseSection.status === 'under_review'));

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-['Vazirmatn',sans-serif] text-slate-800 antialiased selection:bg-cyan-500 selection:text-white pb-16">
      
      {/* پیام گذرا (Toast Notification) */}
      {toastMessage && (
        <div className="fixed bottom-5 left-5 z-50 animate-in slide-in-from-bottom duration-300">
          <div className={`px-4 py-3 rounded-xl shadow-lg border flex items-center gap-2.5 text-xs font-bold ${
            toastMessage.type === 'danger'
              ? 'bg-rose-600 text-white border-rose-700'
              : toastMessage.type === 'info'
              ? 'bg-slate-900 text-white border-slate-800'
              : 'bg-emerald-600 text-white border-emerald-700'
          }`}>
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* بنر وضعیت بحرانی جاری (در صورت وجود حادثه کد قرمز حل نشده) */}
      {criticalUnresolved.length > 0 && (
        <div className="bg-rose-600 text-white px-4 py-2 flex items-center justify-between text-xs font-bold shadow-md animate-pulse">
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 shrink-0" />
            <span>
              هشدار بحرانی: {criticalUnresolved.length} مورد حادثه کد قرمز در خطوط تولید نیازمند اقدام اورژانسی است!
            </span>
          </div>
          <button
            onClick={() => {
              setCurrentTab('incidents');
              setSelectedIncidentForForm(criticalUnresolved[0]);
            }}
            className="bg-white text-rose-700 px-3 py-1 rounded-lg text-xs font-black hover:bg-rose-50 transition cursor-pointer"
          >
            مشاهده پرونده بحرانی
          </button>
        </div>
      )}

      {/* هدر بالایی برنامه */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          
          {/* سمت راست: لوگو و نام سامانه دانیال استیل */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-cyan-500 flex items-center justify-center text-white font-black text-sm shadow-sm border border-blue-900">
                <span>D</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-black text-base md:text-lg text-slate-900 tracking-tight">
                    شرکت دانیال استیل
                  </h1>
                  <span className="text-[10px] font-mono font-bold bg-cyan-100 text-cyan-800 px-2 py-0.5 rounded border border-cyan-300">
                    {settings.formCode || 'F-HS-07-00'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  سامانه مدیریت و گزارش‌دهی حوادث صنعتی ۳ شیفت
                </p>
              </div>
            </div>

            {/* شیفت فعال جاری */}
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-lg text-xs border border-slate-200">
              <Clock className="w-3.5 h-3.5 text-cyan-700" />
              <span className="text-slate-500">شیفت کاری فعال:</span>
              <span className="font-bold text-slate-800">{shiftInfo.title}</span>
              <span className="text-[10px] text-slate-400 font-mono">({shiftInfo.time})</span>
            </div>
          </div>

          {/* سمت چپ: دکمه‌های اکشن سریع، نوتیفیکیشن، و تعویض کاربر */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* دکمه ثبت سریع بحرانی (SOS کد قرمز) */}
            <button
              onClick={() => setIsEmergencyModalOpen(true)}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/20 transition cursor-pointer group"
              title="ثبت سریع حادثه بحرانی"
            >
              <AlertOctagon className="w-4 h-4 shrink-0 group-hover:animate-spin" />
              <span className="hidden sm:inline">ثبت سریع بحرانی (کد قرمز)</span>
              <span className="sm:hidden">SOS</span>
            </button>

            {/* دکمه ثبت گزارش حادثه استاندارد */}
            <button
              onClick={() => {
                setEditingIncident(null);
                setIsNewIncidentOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold shadow-sm transition cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">ثبت حادثه جدید (افسر ایمنی)</span>
              <span className="sm:hidden">ثبت حادثه</span>
            </button>

            {/* زنگوله نوتیفیکیشن با شمارنده */}
            <div className="relative">
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer border border-slate-200"
                title="مرکز اعلان‌های سرپرستی"
              >
                <Bell className="w-5 h-5" />
                {notifications.filter(n => !n.isRead).length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-600 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">
                    {notifications.filter(n => !n.isRead).length}
                  </span>
                )}
              </button>

              <NotificationCenter
                notifications={notifications}
                currentUser={currentUser}
                isOpen={isNotifOpen}
                onClose={() => setIsNotifOpen(false)}
                onSelectNotification={(incidentId) => {
                  const target = incidents.find(i => i.id === incidentId);
                  if (target) {
                    setSelectedIncidentForForm(target);
                    setCurrentTab('incidents');
                  }
                }}
                onMarkAsRead={(id) => {
                  setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
                }}
                onMarkAllAsRead={() => {
                  setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                }}
              />
            </div>

            {/* پروفایل کاربر فعال و تعویض نقش سازمانی */}
            <button
              onClick={() => setIsAccessManagerOpen(true)}
              className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition cursor-pointer bg-white"
              title="مدیریت دسترسی و تغییر کاربر"
            >
              <span className="text-xl">{currentUser.avatar || '👨‍💼'}</span>
              <div className="text-right hidden md:block">
                <div className="text-xs font-bold text-slate-800 leading-tight">{currentUser.name}</div>
                <div className="text-[10px] text-cyan-700 font-semibold">{currentUser.department || 'واحد HSE'}</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* نوار تب‌های ناوبری اصلی */}
        <div className="border-t border-slate-200 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
            <nav className="flex space-x-2 space-x-reverse text-xs md:text-sm font-bold">
              <button
                onClick={() => setCurrentTab('analytics')}
                className={`py-3 px-4 border-b-2 flex items-center gap-2 transition cursor-pointer ${
                  currentTab === 'analytics'
                    ? 'border-cyan-600 text-cyan-700 bg-cyan-50/50'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>داشبورد تحلیلی و شاخص‌های FSI</span>
              </button>

              <button
                onClick={() => setCurrentTab('incidents')}
                className={`py-3 px-4 border-b-2 flex items-center gap-2 transition cursor-pointer ${
                  currentTab === 'incidents'
                    ? 'border-cyan-600 text-cyan-700 bg-cyan-50/50'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <ListFilter className="w-4 h-4" />
                <span>لیست حوادث ثبت شده ۳ شیفت ({incidents.length})</span>
              </button>

              <button
                onClick={() => {
                  setSelectedIncidentForForm(incidents[0] || null);
                  setCurrentTab('form_preview');
                }}
                className={`py-3 px-4 border-b-2 flex items-center gap-2 transition cursor-pointer ${
                  currentTab === 'form_preview'
                    ? 'border-cyan-600 text-cyan-700 bg-cyan-50/50'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>پیش‌نمایش فرم رسمی پیوست (F-HS-07-00)</span>
              </button>
            </nav>

            <div className="hidden sm:flex items-center gap-2 py-2">
              <button
                onClick={() => setIsTauriModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-lg text-xs font-bold transition cursor-pointer"
                title="سیستم کامپایل خودکار ویندوز (Tauri 2) و افزایش هوشمند ورژن"
              >
                <Monitor className="w-3.5 h-3.5 text-indigo-600" />
                <span>نسخه ویندوز (Tauri 2)</span>
                <span className="text-[10px] font-mono bg-indigo-200/60 px-1.5 py-0.2 rounded text-indigo-900 font-semibold">v1.0.0</span>
              </button>

              <button
                onClick={() => setIsSettingsOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition cursor-pointer"
                title="تنظیمات نفر-ساعت و ضرایب"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>تنظیمات پایه‌ای</span>
              </button>

              <button
                onClick={() => exportIncidentsToExcel(incidents, settings, metrics, 'HSE_DanialSteel_Report')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold transition cursor-pointer"
                title="خروجی کامل اکسل"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>خروجی اکسل</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* محتوای اصلی صفحه بر اساس تب فعال */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 flex-1 w-full">
        {/* تب ۱: داشبورد تحلیلی و ضرایب FSI / AFR / ASR */}
        {currentTab === 'analytics' && (
          <AnalyticsPanel
            incidents={incidents}
            settings={settings}
            onSelectIncident={(inc) => {
              setSelectedIncidentForForm(inc);
              setCurrentTab('form_preview');
            }}
          />
        )}

        {/* تب ۲: لیست حوادث ثبت شده کارخانه */}
        {currentTab === 'incidents' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  دفتر ثبت و پیگیری حوادث در ۳ شیفت کاری
                </h2>
                <p className="text-xs text-slate-500">
                  ثبت توسط افسران ایمنی، تایید توسط سرپرستان واحدها، و اقدامات درمانی بهداری کارخانه دانیال استیل
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => exportIncidentsToExcel(incidents, settings, metrics, 'HSE_Incidents_Log')}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>دانلود فایل اکسل</span>
                </button>
              </div>
            </div>

            <IncidentListTable
              incidents={incidents}
              currentUser={currentUser}
              settings={settings}
              onViewOfficialForm={(inc) => {
                setSelectedIncidentForForm(inc);
              }}
              onEditIncident={(inc) => {
                setEditingIncident(inc);
                setIsNewIncidentOpen(true);
              }}
              onQuickSignSupervisor={handleQuickSignSupervisor}
            />
          </div>
        )}

        {/* تب ۳: پیش‌نمایش فرم رسمی پیوست F-HS-07-00 */}
        {currentTab === 'form_preview' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-base text-slate-800">
                  پیش‌نمایش فرم چاپی استاندارد گزارش حادثه
                </h3>
                <p className="text-xs text-slate-500">
                  فرمت پیوستی معتبر شرکت دانیال استیل با کدفرم F-HS-07-00 جهت بایگانی فیزیکی و بازرسی اداره کار
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600">انتخاب پرونده:</span>
                <select
                  value={selectedIncidentForForm?.id || incidents[0]?.id || ''}
                  onChange={(e) => {
                    const found = incidents.find(i => i.id === e.target.value);
                    if (found) setSelectedIncidentForForm(found);
                  }}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 cursor-pointer"
                >
                  {incidents.map(inc => (
                    <option key={inc.id} value={inc.id}>
                      {inc.id} - {inc.injuredPerson?.fullName} ({inc.injuredPerson?.department})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {selectedIncidentForForm ? (
              <OfficialIncidentForm
                incident={selectedIncidentForForm}
                currentUserRole={currentUser.role}
                onUpdateIncident={handleSaveIncident}
              />
            ) : (
              <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-400">
                پرونده‌ای جهت نمایش فرم انتخاب نشده است.
              </div>
            )}
          </div>
        )}
      </main>

      {/* مدال مشاهده و چاپ فرم رسمی F-HS-07-00 هنگام کلیک روی ردیف‌های جدول */}
      {selectedIncidentForForm && currentTab !== 'form_preview' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[95vh] p-4 sm:p-6 overflow-y-auto">
            <OfficialIncidentForm
              incident={selectedIncidentForForm}
              onClose={() => setSelectedIncidentForForm(null)}
              currentUserRole={currentUser.role}
              onUpdateIncident={handleSaveIncident}
              isPrintModal={true}
            />
          </div>
        </div>
      )}

      {/* مدال ثبت و ویرایش حادثه */}
      <IncidentFormModal
        isOpen={isNewIncidentOpen}
        onClose={() => {
          setIsNewIncidentOpen(false);
          setEditingIncident(null);
        }}
        onSave={handleSaveIncident}
        settings={settings}
        currentUser={currentUser}
        initialIncident={editingIncident}
      />

      {/* مدال ثبت سریع وضعیت بحرانی (SOS / کد قرمز) */}
      <EmergencyAlertModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        settings={settings}
        currentShift={activeShift}
        currentOfficerName={currentUser.name}
        onEmergencySubmit={handleEmergencySubmit}
      />

      {/* مدال مدیریت دسترسی و ماتریس مجوزها */}
      <UserAccessManager
        users={users}
        currentUser={currentUser}
        isOpenModal={isAccessManagerOpen}
        onCloseModal={() => setIsAccessManagerOpen(false)}
        onSelectUser={(user) => {
          setCurrentUser(user);
          showToast(`کاربر جاری به «${user.name}» (${user.department || 'HSE'}) تغییر یافت.`, 'info');
        }}
        onUpdateUsers={setUsers}
      />

      {/* مدال تنظیمات کارخانه و نفر-ساعت */}
      <FactorySettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={(newSettings) => {
          setSettings(newSettings);
          showToast('تنظیمات پایه‌ای کارخانه و نفر-ساعت با موفقیت ذخیره شد.', 'success');
        }}
      />

      {/* مدال راهنمای ساخت نسخه ویندوز و افزایش خودکار ورژن با Tauri 2 */}
      <TauriBuildInfoModal
        isOpen={isTauriModalOpen}
        onClose={() => setIsTauriModalOpen(false)}
        currentVersion="1.0.0"
      />
    </div>
  );
}
