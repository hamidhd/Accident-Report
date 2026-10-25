import React, { useState } from 'react';
import { FactorySettings } from '../types';
import { Sliders, Save, X, Building, Clock, Users, Hash, Check } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  settings: FactorySettings;
  onSaveSettings: (settings: FactorySettings) => void;
}

export const FactorySettingsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings
}) => {
  if (!isOpen) return null;

  const [companyName, setCompanyName] = useState(settings.companyName);
  const [formCode, setFormCode] = useState(settings.formCode);
  const [totalWorkers, setTotalWorkers] = useState(settings.totalWorkers);
  const [totalManHours, setTotalManHours] = useState(settings.totalManHours);
  const [formulaBasis, setFormulaBasis] = useState<1000000 | 200000>(settings.formulaBasis || 1000000);
  const [morningOfficer, setMorningOfficer] = useState(settings.shifts.morning.officer);
  const [eveningOfficer, setEveningOfficer] = useState(settings.shifts.evening.officer);
  const [nightOfficer, setNightOfficer] = useState(settings.shifts.night.officer);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      ...settings,
      companyName,
      formCode,
      totalWorkers: Number(totalWorkers) || 300,
      totalManHours: Number(totalManHours) || 500000,
      formulaBasis,
      shifts: {
        morning: { ...settings.shifts.morning, officer: morningOfficer },
        evening: { ...settings.shifts.evening, officer: eveningOfficer },
        night: { ...settings.shifts.night, officer: nightOfficer }
      }
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200 font-['Vazirmatn',sans-serif]">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-600 rounded-xl text-white">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base md:text-lg">تنظیمات پایه‌ای کارخانه و ضرایب HSE</h3>
              <p className="text-xs text-slate-400">تنظیم پارامترهای فرمول‌های FSI، نفر-ساعت و شیفت‌ها</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">نام سازمان / کارخانه</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">کد فرم مصوب گزارش حادثه</label>
              <input
                type="text"
                value={formCode}
                onChange={(e) => setFormCode(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold"
                required
              />
            </div>

            <div className="p-3 bg-cyan-50 rounded-xl border border-cyan-200">
              <label className="block font-bold text-cyan-950 mb-1">
                کل نفر-ساعت کارکرد کارخانه در دوره (Man-Hours)
              </label>
              <p className="text-[10px] text-cyan-800 mb-2">مخرج کسر فرمول‌های AFR، ASR و FSI</p>
              <input
                type="number"
                min="1000"
                step="1000"
                value={totalManHours}
                onChange={(e) => setTotalManHours(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-cyan-400 rounded-lg text-sm font-bold text-cyan-950 font-mono"
                required
              />
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <label className="block font-bold text-slate-800 mb-1">تعداد کل پرسنل فعال کارخانه</label>
              <p className="text-[10px] text-slate-500 mb-2">جهت محاسبه سرانه آسیب و نسبت‌ها</p>
              <input
                type="number"
                min="10"
                value={totalWorkers}
                onChange={(e) => setTotalWorkers(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-800 font-mono"
                required
              />
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <label className="block font-bold text-slate-800 mb-1">مبنای استاندارد ضریب تکرار (AFR Basis)</label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <label className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-300 cursor-pointer">
                <input
                  type="radio"
                  name="basis"
                  checked={formulaBasis === 1000000}
                  onChange={() => setFormulaBasis(1000000)}
                />
                <span className="font-semibold">استاندارد بین‌المللی ۱,۰۰۰,۰۰۰ ساعت (ISO/ILO)</span>
              </label>
              <label className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-300 cursor-pointer">
                <input
                  type="radio"
                  name="basis"
                  checked={formulaBasis === 200000}
                  onChange={() => setFormulaBasis(200000)}
                />
                <span className="font-semibold">استاندارد ۲۰۰,۰۰۰ ساعت (OSHA Rate)</span>
              </label>
            </div>
          </div>

          {/* افسران مسئول ۳ شیفت */}
          <div className="space-y-2">
            <span className="block font-bold text-slate-800">افسران ایمنی مسئول شیفت‌های سه‌گانه:</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <span className="text-[11px] text-slate-500 block mb-1">شیفت ۱ (صبح ۰۶-۱۴):</span>
                <input
                  type="text"
                  value={morningOfficer}
                  onChange={(e) => setMorningOfficer(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                />
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block mb-1">شیفت ۲ (عصر ۱۴-۲۲):</span>
                <input
                  type="text"
                  value={eveningOfficer}
                  onChange={(e) => setEveningOfficer(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                />
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block mb-1">شیفت ۳ (شب ۲۲-۰۶):</span>
                <input
                  type="text"
                  value={nightOfficer}
                  onChange={(e) => setNightOfficer(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              انصراف
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-bold transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>ذخیره تنظیمات</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
