import React from 'react';
import { NotificationItem, UserProfile } from '../types';
import { Bell, CheckCheck, AlertCircle, AlertTriangle, ShieldAlert, ArrowLeft, X } from 'lucide-react';

interface Props {
  notifications: NotificationItem[];
  currentUser: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSelectNotification: (incidentId: string) => void;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}

export const NotificationCenter: React.FC<Props> = ({
  notifications,
  currentUser,
  isOpen,
  onClose,
  onSelectNotification,
  onMarkAsRead,
  onMarkAllAsRead
}) => {
  if (!isOpen) return null;

  // فیلتر اعلان‌های مرتبط با کاربر فعلی (اگر سرپرست واحد باشد، یا مدیر، یا تمام اعلان‌ها)
  const userNotifications = notifications.filter(notif => {
    if (currentUser.role === 'hse_manager') return true;
    if (currentUser.role === 'unit_supervisor') {
      return !notif.targetUnit || notif.targetUnit === currentUser.department;
    }
    return true;
  });

  const unreadCount = userNotifications.filter(n => !n.isRead).length;

  return (
    <div className="absolute left-0 sm:left-4 top-14 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 font-['Vazirmatn',sans-serif]">
      {/* هدر اعلان‌ها */}
      <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Bell className="w-5 h-5 text-cyan-400" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping"></span>
            )}
          </div>
          <div>
            <h4 className="font-bold text-sm">پیام‌ها و هشدارهای سرپرستی</h4>
            <p className="text-[11px] text-slate-400">
              {currentUser.name} ({currentUser.department || 'دفتر HSE'})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllAsRead}
              className="text-[11px] text-cyan-300 hover:text-white flex items-center gap-1 transition"
              title="خواندن همه"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>همه خوانده شد</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* لیست پیام‌ها */}
      <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
        {userNotifications.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-xs">هیچ اعلان جدیدی وجود ندارد.</p>
          </div>
        ) : (
          userNotifications.map((notif) => {
            const isCritical = notif.severity === 'critical' || notif.severity === 'severe';

            return (
              <div
                key={notif.id}
                className={`p-3.5 transition hover:bg-slate-50 cursor-pointer ${
                  !notif.isRead ? 'bg-cyan-50/50' : 'bg-white'
                }`}
                onClick={() => {
                  onMarkAsRead(notif.id);
                  onSelectNotification(notif.incidentId);
                  onClose();
                }}
              >
                <div className="flex items-start gap-2.5">
                  <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                    isCritical ? 'bg-rose-100 text-rose-600' : 'bg-cyan-100 text-cyan-700'
                  }`}>
                    {isCritical ? <ShieldAlert className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className={`text-xs font-bold truncate ${isCritical ? 'text-rose-700' : 'text-slate-800'}`}>
                        {notif.title}
                      </span>
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-cyan-600 shrink-0"></span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2 mb-2">
                      {notif.message}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>{notif.timestamp}</span>
                      <span className="text-cyan-700 font-semibold flex items-center gap-1 hover:underline">
                        مشاهده و تایید فرم
                        <ArrowLeft className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* فوتر نوتیفیکیشن */}
      <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center text-[11px] text-slate-500">
        سیستم اطلاع‌رسانی خودکار سرپرستان واحدهای تولیدی دانیال استیل
      </div>
    </div>
  );
};
