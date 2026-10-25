import React, { useState } from 'react';
import { 
  Package, 
  GitBranch, 
  Cpu, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Terminal, 
  Sparkles,
  ArrowRight,
  Monitor
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentVersion: string;
}

export const TauriBuildInfoModal: React.FC<Props> = ({ isOpen, onClose, currentVersion }) => {
  const [testCommitMessage, setTestCommitMessage] = useState('feat: افزودن ماژول تحلیل ریسک شیفت شب');

  if (!isOpen) return null;

  // شبیه‌ساز محاسبه ورژن جهت آموزش و تست کاربر در محیط UI
  const calculateSimulatedVersion = (msg: string) => {
    const parts = currentVersion.split('.').map(n => parseInt(n, 10) || 0);
    let [major, minor, patch] = parts;
    const lower = msg.toLowerCase();

    let type = 'patch';
    let explanation = 'تغییر جزیی یا رفع باگ (افزایش رقم سوم)';

    if (lower.includes('breaking') || lower.includes('[major]')) {
      type = 'major';
      major += 1;
      minor = 0;
      patch = 0;
      explanation = 'تغییر ساختارشکن یا عمده (افزایش رقم اول)';
    } else if (lower.includes('feat') || lower.includes('[minor]') || lower.includes('ویژگی')) {
      type = 'minor';
      minor += 1;
      patch = 0;
      explanation = 'قابلیت یا ویژگی جدید (افزایش رقم دوم)';
    } else {
      patch += 1;
    }

    return {
      version: `${major}.${minor}.${patch}`,
      type,
      explanation
    };
  };

  const simulation = calculateSimulatedVersion(testCommitMessage);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/80 backdrop-blur-xs animate-in fade-in duration-200 font-['Vazirmatn',sans-serif]">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* هدر */}
        <div className="p-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-xl text-white">
              <Monitor className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-cyan-500/20 text-cyan-300 text-[10px] font-mono px-2 py-0.5 rounded-full border border-cyan-400/30">
                  Tauri v2 • Windows CI/CD
                </span>
                <h3 className="font-bold text-base md:text-lg">سیستم ساخت خودکار نسخه ویندوز</h3>
              </div>
              <p className="text-xs text-slate-300">
                کامپایل اینستالر ویندوز (NSIS/MSI) و ارتقای هوشمند ورژن با هر Push در گیت‌هاب
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

        <div className="p-5 overflow-y-auto flex-1 space-y-5 text-xs">
          {/* کارت وضعیت نسخه فعلی */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-slate-500 font-medium block mb-1">نسخه فعلی پروژه:</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-slate-900 font-mono">v{currentVersion}</span>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[11px] border border-emerald-300">
                  فعال و هماهنگ در Tauri 2
                </span>
              </div>
            </div>

            <div className="text-left font-mono text-[11px] text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200 w-full sm:w-auto">
              <div>🎯 Target: x86_64-pc-windows-msvc</div>
              <div>📦 Bundles: .exe (NSIS) & .msi (WiX)</div>
              <div>⚡ Engine: Tauri 2.0 + Rust Stable</div>
            </div>
          </div>

          {/* نحوه عملکرد افزایش خودکار ورژن بر اساس تغییرات (SemVer Logic) */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-600" />
              <span>قوانین افزایش هوشمند شماره ورژن بسته به نوع تغییرات:</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl border border-amber-200 bg-amber-50/60">
                <div className="font-bold text-amber-900 mb-1 flex items-center justify-between">
                  <span>تغییر اساسی (Major)</span>
                  <span className="font-mono text-xs bg-amber-200/80 px-1.5 py-0.5 rounded">X.0.0</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  هنگامی که کامیت شامل <code className="bg-amber-100 px-1 rounded">breaking change:</code> یا <code className="bg-amber-100 px-1 rounded">[major]</code> باشد.
                </p>
              </div>

              <div className="p-3 rounded-xl border border-cyan-200 bg-cyan-50/60">
                <div className="font-bold text-cyan-900 mb-1 flex items-center justify-between">
                  <span>ویژگی جدید (Minor)</span>
                  <span className="font-mono text-xs bg-cyan-200/80 px-1.5 py-0.5 rounded">x.Y.0</span>
                </div>
                <p className="text-[11px] text-cyan-800 leading-relaxed">
                  هنگامی که کامیت با <code className="bg-cyan-100 px-1 rounded">feat:</code> یا <code className="bg-cyan-100 px-1 rounded">feature:</code> آغاز شود یا قابلیت جدید اضافه گردد.
                </p>
              </div>

              <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/60">
                <div className="font-bold text-emerald-900 mb-1 flex items-center justify-between">
                  <span>اصلاح یا بهینه‌سازی (Patch)</span>
                  <span className="font-mono text-xs bg-emerald-200/80 px-1.5 py-0.5 rounded">x.y.Z</span>
                </div>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  برای رفع باگ‌ها (<code className="bg-emerald-100 px-1 rounded">fix:</code>)، تغییرات استایل، اصلاحات جزئی، یا کامیت‌های روتین.
                </p>
              </div>
            </div>
          </div>

          {/* ابزار تعاملی تست و شبیه‌سازی ورژن بعدی */}
          <div className="p-4 bg-slate-900 text-white rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                شبیه‌ساز هوش ارتقای ورژن در کامیت بعدی:
              </span>
              <span className="text-[11px] text-slate-400">پیش‌نمایش زنده</span>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-300">یک پیام کامیت نمونه وارد کنید یا از دکمه‌ها انتخاب کنید:</label>
              <input
                type="text"
                value={testCommitMessage}
                onChange={(e) => setTestCommitMessage(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono text-white focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div className="flex flex-wrap gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => setTestCommitMessage('fix: اصلاح محاسبه ضریب شدت حوادث ASR')}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 transition"
              >
                نمونه Patch (رفع باگ)
              </button>
              <button
                type="button"
                onClick={() => setTestCommitMessage('feat: افزودن ماژول امضای دیجیتال سرپرستان')}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 transition"
              >
                نمونه Minor (ویژگی جدید)
              </button>
              <button
                type="button"
                onClick={() => setTestCommitMessage('feat: ارتقای هسته و ساختار دیتابیس BREAKING CHANGE: بازنویسی فرم‌ها')}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 transition"
              >
                نمونه Major (ساختارشکن)
              </button>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-slate-400 text-[10px] block">ورژن محاسبه‌شده برای GitHub Release بعدی:</span>
                <span className="text-xl font-bold font-mono text-emerald-400">v{simulation.version}</span>
              </div>
              <div className="text-left text-[11px]">
                <span className="font-bold text-cyan-300 capitalize">نوع: {simulation.type}</span>
                <p className="text-slate-400 text-[10px]">{simulation.explanation}</p>
              </div>
            </div>
          </div>

          {/* مسیر فایل‌های ایجاد شده */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <span className="font-bold text-slate-800 block mb-2">فایل‌های پیکربندی ایجاد شده در پروژه:</span>
            <ul className="space-y-1.5 text-slate-600 font-mono text-[11px]">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>.github/workflows/build-tauri-windows.yml (پایپ‌لاین کامل اکشن‌های گیت‌هاب)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>scripts/bump-version.js (موتور ارتقای هوشمند شماره نسخه بر اساس تغییرات)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>src-tauri/tauri.conf.json (پیکربندی تائوری نسخه ۲ و خروجی نصبی NSIS و MSI)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>src-tauri/Cargo.toml & src-tauri/src/main.rs (زیرساخت راست و کد بومی ویندوز)</span>
              </li>
            </ul>
          </div>
        </div>

        {/* فوتر */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            با هر دستور <code className="font-mono bg-slate-200 px-1 py-0.5 rounded text-slate-800">git push origin main</code> فایل نصبی ویندوز به صورت خودکار کامپایل می‌گردد.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition cursor-pointer"
          >
            متوجه شدم
          </button>
        </div>
      </div>
    </div>
  );
};
