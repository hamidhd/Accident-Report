import React, { useState } from 'react';
import { UserProfile, RoleType } from '../types';
import { Shield, Key, Users, Check, X, Lock, Sliders, ChevronDown } from 'lucide-react';

interface Props {
  users: UserProfile[];
  currentUser: UserProfile;
  onSelectUser: (user: UserProfile) => void;
  onUpdateUsers?: (users: UserProfile[]) => void;
  isOpenModal: boolean;
  onCloseModal: () => void;
}

export const UserAccessManager: React.FC<Props> = ({
  users,
  currentUser,
  onSelectUser,
  onUpdateUsers,
  isOpenModal,
  onCloseModal
}) => {
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');

  const ROLE_NAMES: Record<RoleType, { title: string; badge: string; desc: string }> = {
    hse_manager: {
      title: 'مدیر ارشد HSE کارخانه',
      badge: 'bg-purple-100 text-purple-800 border-purple-300',
      desc: 'دسترسی کامل مدیریتی، نظارت بر تمام ۳ شیفت، تحلیل FSI، تایید پرونده‌ها و تنظیمات نفر-ساعت'
    },
    safety_officer: {
      title: 'افسر ایمنی صنعتی (شیفت)',
      badge: 'bg-cyan-100 text-cyan-800 border-cyan-300',
      desc: 'ثبت فوری حوادث در شیفت‌های صبح/عصر/شب، بررسی میدانی، ثبت کد قرمز و تریاژ'
    },
    unit_supervisor: {
      title: 'سرپرست / مدیر واحد تولیدی',
      badge: 'bg-blue-100 text-blue-800 border-blue-300',
      desc: 'دریافت نوتیفیکیشن حوادث واحد خود، تکمیل بخش سرپرستی، امضای دیجیتال و دستورات پیشگیرانه'
    },
    clinic_officer: {
      title: 'مسئول بهداری و طب کار',
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      desc: 'ثبت اقدامات درمانی خانه بهداشت کارخانه، ثبت روزهای استراحت کاری (Lost Workdays) جهت فرمول FSI'
    }
  };

  const PERMISSION_MATRIX = [
    { name: 'ثبت گزارش حوادث در شیفت کاری', hse: true, officer: true, supervisor: true, clinic: false },
    { name: 'ثبت سریع کد قرمز (SOS بحرانی)', hse: true, officer: true, supervisor: true, clinic: true },
    { name: 'تکمیل و امضای بخش سرپرست واحد', hse: true, officer: false, supervisor: true, clinic: false },
    { name: 'ثبت اقدامات بهداری و روزهای تلف شده (استراحت)', hse: true, officer: false, supervisor: false, clinic: true },
    { name: 'مشاهده داشبورد آماری و شاخص‌های FSI و AFR', hse: true, officer: true, supervisor: true, clinic: true },
    { name: 'خروجی اکسل پیشرفته (Excel Export)', hse: true, officer: true, supervisor: false, clinic: false },
    { name: 'ویرایش نفر-ساعت و ساختار کارخانه', hse: true, officer: false, supervisor: false, clinic: false }
  ];

  if (!isOpenModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200 font-['Vazirmatn',sans-serif]">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* هدر مدال مدیریت دسترسی‌ها */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-xl text-white">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base md:text-lg">
                مدیریت سطوح دسترسی کاربران و ماتریس مجوزهای کارخانه
              </h3>
              <p className="text-xs text-slate-400">
                تعیین نقش‌های افسران ایمنی، سرپرستان واحدها، بهداری و مدیران در سیستم HSE دانیال استیل
              </p>
            </div>
          </div>

          <button
            onClick={onCloseModal}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex-1 space-y-6">
          {/* کارت کاربر فعلی انتخاب شده */}
          <div className="p-4 bg-gradient-to-r from-cyan-900 to-slate-900 text-white rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-2xl border border-white/20">
                {currentUser.avatar || '👤'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base">{currentUser.name}</span>
                  <span className="text-xs bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 px-2 py-0.5 rounded-full font-medium">
                    کاربر فعال جاری
                  </span>
                </div>
                <p className="text-xs text-cyan-100 mt-0.5">
                  نقش سازمانی: {ROLE_NAMES[currentUser.role]?.title} • {currentUser.department || 'واحد HSE'}
                  {currentUser.shift ? ` • شیفت: ${currentUser.shift === 'morning' ? 'صبح' : currentUser.shift === 'evening' ? 'عصر' : 'شب'}` : ''}
                </p>
              </div>
            </div>

            <div className="text-xs text-slate-300 bg-white/5 p-2 rounded-lg border border-white/10">
              شماره همراه: <span className="font-mono text-white">{currentUser.phone}</span>
            </div>
          </div>

          {/* ماتریس دسترسی‌ها و مجوزها (Permission Matrix) */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h4 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
              <Key className="w-4 h-4 text-indigo-600" />
              <span>ماتریس مجوزهای سازمانی سیستم بر اساس نقش‌ها:</span>
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-right">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600 font-bold bg-slate-100">
                    <th className="p-2.5">عملیات و دسترسی</th>
                    <th className="p-2.5 text-center">مدیر HSE</th>
                    <th className="p-2.5 text-center">افسران ایمنی ۳ شیفت</th>
                    <th className="p-2.5 text-center">سرپرستان واحدها</th>
                    <th className="p-2.5 text-center">بهداری کارخانه</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {PERMISSION_MATRIX.map((perm, idx) => (
                    <tr key={idx} className="hover:bg-white transition">
                      <td className="p-2.5 font-medium text-slate-800">{perm.name}</td>
                      <td className="p-2.5 text-center">
                        {perm.hse ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-slate-300 mx-auto" />}
                      </td>
                      <td className="p-2.5 text-center">
                        {perm.officer ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-slate-300 mx-auto" />}
                      </td>
                      <td className="p-2.5 text-center">
                        {perm.supervisor ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-slate-300 mx-auto" />}
                      </td>
                      <td className="p-2.5 text-center">
                        {perm.clinic ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-slate-300 mx-auto" />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* لیست کاربران سازمانی و امکان سوئیچ سریع جهت تست و بهره‌برداری */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-600" />
                <span>تعویض سریع حساب کاربری برای بررسی سناریوها:</span>
              </h4>
              <span className="text-xs text-slate-500">
                کل کاربران تعریف شده: {users.length} نفر
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {users.map((user) => {
                const isSelected = user.id === currentUser.id;
                const roleInfo = ROLE_NAMES[user.role];

                return (
                  <div
                    key={user.id}
                    onClick={() => {
                      onSelectUser(user);
                      onCloseModal();
                    }}
                    className={`p-3.5 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-cyan-50/80 border-cyan-500 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-xl shrink-0">
                        {user.avatar || '👤'}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-slate-900">{user.name}</span>
                          {isSelected && (
                            <span className="w-2 h-2 rounded-full bg-cyan-600"></span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500">{user.department || roleInfo.title}</p>
                        <span className={`inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded border ${roleInfo.badge}`}>
                          {roleInfo.title}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${
                        isSelected
                          ? 'bg-cyan-600 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {isSelected ? 'فعال' : 'ورود'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* فوتر */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onCloseModal}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition cursor-pointer"
          >
            بستن پنجره مدیریت دسترسی
          </button>
        </div>
      </div>
    </div>
  );
};
