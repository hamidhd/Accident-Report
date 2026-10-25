import React, { useRef } from 'react';
import { Incident } from '../types';
import { Printer, Download, CheckCircle, ShieldCheck, FileText, X } from 'lucide-react';

interface Props {
  incident: Incident;
  onClose?: () => void;
  onUpdateIncident?: (updated: Incident) => void;
  currentUserRole?: string;
  isPrintModal?: boolean;
}

export const OfficialIncidentForm: React.FC<Props> = ({
  incident,
  onClose,
  onUpdateIncident,
  currentUserRole = 'hse_manager',
  isPrintModal = false
}) => {
  const formRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const isTypeSelected = (type: string) => {
    return incident.incidentGeneral?.types?.includes(type as any);
  };

  return (
    <div className={`w-full ${isPrintModal ? 'bg-white' : ''}`}>
      {/* اکشن بار بالای فرم در حالت مشاهده */}
      <div className="no-print flex items-center justify-between pb-4 mb-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-cyan-100 text-cyan-800 rounded-lg">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-base">
              فرم رسمی گزارش حادثه داخلی (کدفرم: {incident.formCode || 'F-HS-07-00'})
            </h3>
            <p className="text-xs text-slate-500">
              فرمت استاندارد شرکت دانیال استیل • شناسه پرونده: {incident.id}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>چاپ / ذخیره PDF رسمی</span>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="بستن"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* بستر برگه استاندارد چاپی A4 مطابق دقیقا سند پیوستی F-HS-07-00 */}
      <div 
        ref={formRef}
        className="printable-incident-form mx-auto bg-white p-6 md:p-8 max-w-[850px] shadow-sm border border-slate-300 text-slate-900 rounded-sm font-['Vazirmatn',sans-serif]"
        style={{ direction: 'rtl' }}
      >
        {/* ردیف بالایی: کدفرم در گوشه راست بالا خارج از کادر اصلی */}
        <div className="flex justify-end mb-1 text-sm font-bold text-slate-900 tracking-wide">
          <span>کدفرم: {incident.formCode || 'F-HS-07-00'}</span>
        </div>

        {/* کادر هدر سازمانی شرکت دانیال استیل */}
        <div className="border-2 border-black grid grid-cols-12 items-center text-center">
          {/* سمت راست: نام شرکت */}
          <div className="col-span-4 p-3 border-l-2 border-black font-extrabold text-base md:text-lg text-slate-900 flex items-center justify-center">
            شرکت دانیال استیل
          </div>

          {/* وسط: عنوان گزارش حادثه */}
          <div className="col-span-5 p-3 border-l-2 border-black font-black text-lg md:text-2xl text-slate-900 flex items-center justify-center">
            گزارش حادثه داخلی
          </div>

          {/* سمت چپ: لوگوی رسمی دانیال استیل مطابق فایل پیوست */}
          <div className="col-span-3 p-2 flex flex-col items-center justify-center bg-white">
            <div className="flex items-center gap-1.5">
              {/* لوگوی سه بعدی آبی رنگ استیل شبیه فایل PDF */}
              <div className="w-9 h-7 bg-gradient-to-tr from-blue-700 via-indigo-600 to-cyan-500 rounded-sm flex items-center justify-center text-white font-black text-xs shadow-inner border border-blue-900">
                <span className="tracking-tighter">D</span>
              </div>
              <div className="text-right">
                <div className="text-xs font-black text-blue-950 tracking-tighter">دانیـال اسـتیل</div>
                <div className="text-[8px] text-slate-500 font-sans tracking-tight">DANIAL STEEL</div>
              </div>
            </div>
          </div>
        </div>

        {/* بخش ۱: اطلاعات پرسنل مصدوم */}
        <div className="border-x-2 border-b-2 border-black">
          <div className="bg-[#BFE3EE] text-black font-extrabold text-center py-1.5 text-sm md:text-base border-b-2 border-black">
            اطلاعات پرسنل مصدوم
          </div>
          <div className="grid grid-cols-12 text-xs md:text-sm">
            <div className="col-span-5 p-2.5 border-l-2 border-black flex items-center gap-1">
              <span className="font-bold">نام و نام خانوادگی :</span>
              <span className="font-semibold text-slate-800">{incident.injuredPerson?.fullName || '—'}</span>
            </div>
            <div className="col-span-4 p-2.5 border-l-2 border-black flex items-center gap-1">
              <span className="font-bold">پرسنل واحد :</span>
              <span className="font-semibold text-slate-800">{incident.injuredPerson?.department || '—'}</span>
            </div>
            <div className="col-span-3 p-2.5 flex items-center gap-1">
              <span className="font-bold">شماره پرسنلی :</span>
              <span className="font-semibold text-slate-800">{incident.injuredPerson?.personnelCode || '—'}</span>
            </div>
          </div>
        </div>

        {/* بخش ۲: اطلاعات عمومی حادثه */}
        <div className="border-x-2 border-b-2 border-black">
          <div className="bg-[#BFE3EE] text-black font-extrabold text-center py-1.5 text-sm md:text-base border-b-2 border-black">
            اطلاعات عمومی حادثه
          </div>

          {/* ردیف گزینه‌های نوع حادثه با دایره‌های رادیویی مطابق فرم پیوست */}
          <div className="p-2.5 border-b-2 border-black text-xs md:text-sm">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <span className="font-bold">نوع حادثه:</span>

              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                <span className={`w-4 h-4 rounded-full border-2 border-black flex items-center justify-center ${isTypeSelected('superficial_injury') ? 'bg-black' : 'bg-white'}`}>
                  {isTypeSelected('superficial_injury') && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                </span>
                <span>جراحت سطحی</span>
              </label>

              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                <span className={`w-4 h-4 rounded-full border-2 border-black flex items-center justify-center ${isTypeSelected('contusion') ? 'bg-black' : 'bg-white'}`}>
                  {isTypeSelected('contusion') && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                </span>
                <span>ضرب دیدگی</span>
              </label>

              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                <span className={`w-4 h-4 rounded-full border-2 border-black flex items-center justify-center ${isTypeSelected('fracture') ? 'bg-black' : 'bg-white'}`}>
                  {isTypeSelected('fracture') && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                </span>
                <span>شکستگی</span>
              </label>

              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                <span className={`w-4 h-4 rounded-full border-2 border-black flex items-center justify-center ${isTypeSelected('cut') ? 'bg-black' : 'bg-white'}`}>
                  {isTypeSelected('cut') && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                </span>
                <span>بریدگی</span>
              </label>

              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                <span className={`w-4 h-4 rounded-full border-2 border-black flex items-center justify-center ${isTypeSelected('burn') ? 'bg-black' : 'bg-white'}`}>
                  {isTypeSelected('burn') && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                </span>
                <span>سوختگی</span>
              </label>

              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                <span className={`w-4 h-4 rounded-full border-2 border-black flex items-center justify-center ${isTypeSelected('other') ? 'bg-black' : 'bg-white'}`}>
                  {isTypeSelected('other') && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                </span>
                <span>سایر</span>
              </label>

              <div className="inline-flex items-center gap-1 mr-auto flex-1 min-w-[140px]">
                <span className="font-semibold text-slate-700">توضیح:</span>
                <span className="border-b border-dotted border-black flex-1 pb-0.5 px-1 font-medium">
                  {incident.incidentGeneral?.otherExplanation || '—'}
                </span>
              </div>
            </div>
          </div>

          {/* ردیف ۳ ستونه: عضو حادثه دیده / وسایل حفاظت فردی / اسامی شاهدین */}
          <div className="grid grid-cols-12 text-xs md:text-sm border-b-2 border-black">
            <div className="col-span-4 p-2.5 border-l-2 border-black">
              <div className="font-bold mb-1">عضو حادثه دیده :</div>
              <div className="text-slate-800 font-medium min-h-[22px]">
                {incident.incidentGeneral?.bodyPart || '—'}
              </div>
            </div>

            <div className="col-span-4 p-2.5 border-l-2 border-black">
              <div className="font-bold mb-1">وسایل حفاظت فردی استفاده شده توسط مصدوم :</div>
              <div className="text-slate-800 font-medium min-h-[22px]">
                {incident.incidentGeneral?.ppeUsed || '—'}
              </div>
            </div>

            <div className="col-span-4 p-2.5">
              <div className="font-bold mb-1">اسامی شاهدین حادثه :</div>
              <div className="text-slate-800 font-medium min-h-[22px]">
                {incident.incidentGeneral?.witnesses || '—'}
              </div>
            </div>
          </div>

          {/* ردیف ۳ ستونه: تاریخ حادثه / ساعت حادثه / ساعت و تاریخ تکمیل فرم */}
          <div className="grid grid-cols-12 text-xs md:text-sm border-b-2 border-black">
            <div className="col-span-4 p-2.5 border-l-2 border-black flex items-center gap-1.5">
              <span className="font-bold">تاریخ حادثه:</span>
              <span className="font-semibold text-slate-800">{incident.incidentGeneral?.incidentDate || '—'}</span>
            </div>

            <div className="col-span-4 p-2.5 border-l-2 border-black flex items-center gap-1.5">
              <span className="font-bold">ساعت حادثه:</span>
              <span className="font-semibold text-slate-800">{incident.incidentGeneral?.incidentTime || '—'}</span>
            </div>

            <div className="col-span-4 p-2.5 flex items-center gap-1.5">
              <span className="font-bold">ساعت و تاریخ تکمیل فرم :</span>
              <span className="font-semibold text-slate-800">{incident.incidentGeneral?.formCompletionDateTime || '—'}</span>
            </div>
          </div>

          {/* محل دقیق حادثه */}
          <div className="p-2.5 border-b-2 border-black text-xs md:text-sm flex items-center gap-2">
            <span className="font-bold">محل دقیق حادثه:</span>
            <span className="font-semibold text-slate-800">{incident.incidentGeneral?.exactLocation || '—'}</span>
          </div>

          {/* شرح مختصری از حادثه */}
          <div className="p-2.5 text-xs md:text-sm min-h-[110px] flex flex-col">
            <div className="font-bold mb-1.5">شرح مختصری از حادثه:</div>
            <div className="text-slate-800 font-medium leading-relaxed flex-1 whitespace-pre-wrap">
              {incident.incidentGeneral?.description || '—'}
            </div>
          </div>
        </div>

        {/* بخش ۳: اطلاعات تکمیل کننده فرم (مدیر / مسئول / سرپرست واحد پرسنل صدمه دیده) */}
        <div className="border-x-2 border-b-2 border-black">
          <div className="bg-[#BFE3EE] text-black font-extrabold text-center py-1.5 text-xs md:text-sm border-b-2 border-black">
            اطلاعات تکمیل کننده فرم (مدیر / مسئول/ سرپرست واحد پرسنل صدمه دیده )
          </div>

          <div className="grid grid-cols-12 text-xs md:text-sm">
            {/* ردیف مشخصات */}
            <div className="col-span-5 p-2.5 border-l-2 border-b border-black flex items-center gap-1">
              <span className="font-bold">نام و نام خانوادگی :</span>
              <span className="font-semibold text-slate-800">{incident.supervisorSection?.fullName || '—'}</span>
            </div>

            <div className="col-span-4 p-2.5 border-l-2 border-b border-black flex items-center gap-1">
              <span className="font-bold">شماره تماس:</span>
              <span className="font-semibold text-slate-800">{incident.supervisorSection?.phone || '—'}</span>
            </div>

            <div className="col-span-3 p-2.5 border-b border-black flex items-center gap-1">
              <span className="font-bold">تاریخ:</span>
              <span className="font-semibold text-slate-800">{incident.supervisorSection?.date || '—'}</span>
            </div>

            {/* سطر بعدی واحد و سمت و امضا */}
            <div className="col-span-5 p-2.5 border-l-2 border-black flex items-center gap-1">
              <span className="font-bold">واحد:</span>
              <span className="font-semibold text-slate-800">{incident.supervisorSection?.unit || incident.injuredPerson?.department || '—'}</span>
            </div>

            <div className="col-span-4 p-2.5 border-l-2 border-black flex items-center gap-1">
              <span className="font-bold">سمت سازمانی :</span>
              <span className="font-semibold text-slate-800">{incident.supervisorSection?.organizationalRole || '—'}</span>
            </div>

            <div className="col-span-3 p-2.5 flex items-center justify-between">
              <span className="font-bold">امضاء :</span>
              <div className="text-cyan-900 font-serif italic text-xs font-bold border-b border-dashed border-cyan-800 px-2 py-0.5">
                {incident.supervisorSection?.signature || (incident.supervisorSection?.isSigned ? 'امضا دیجیتال شد' : 'در انتظار امضا')}
              </div>
            </div>
          </div>
        </div>

        {/* بخش ۴: توسط مسئول HSE تکمیل گردد */}
        <div className="border-x-2 border-b-2 border-black">
          <div className="bg-[#BFE3EE] text-black font-extrabold text-center py-1.5 text-xs md:text-sm border-b-2 border-black">
            توسط مسئول HSE تکمیل گردد
          </div>

          <div className="p-3 text-xs md:text-sm min-h-[90px] flex flex-col">
            <div className="font-bold mb-1.5 flex items-center justify-between">
              <span>اقدامات انجام شده در خانه بهداشت :</span>
              <span className="text-[11px] font-normal text-slate-600">
                روزهای استراحت کاری ثبت شده: <strong className="text-black font-bold">{incident.hseSection?.lostWorkdays || 0} روز</strong>
              </span>
            </div>
            <div className="text-slate-800 font-medium leading-relaxed flex-1 whitespace-pre-wrap">
              {incident.hseSection?.clinicActions || '—'}
            </div>
            <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-200 text-[11px] text-slate-600">
              <span>مسئول ثبت HSE: <strong>{incident.hseSection?.hseOfficerName || 'مهندس رفیعیان'}</strong></span>
              <span>وضعیت پرونده: <strong>{incident.hseSection?.status === 'closed' ? 'مختومه' : 'تحت پیگیری بهداشت'}</strong></span>
            </div>
          </div>
        </div>

        {/* پاورقی فرم */}
        <div className="mt-3 flex items-center justify-between text-[10px] text-slate-500 font-mono">
          <div>سامانه ایمنی و بهداشت صنعتی کارخانه دانیال استیل (HSE-IMS)</div>
          <div>فرم مصوب کد F-HS-07-00 • ویرایش پاییز ۱۴۰۳</div>
        </div>
      </div>

      <style>{`
        @media print {
          body {
            background-color: white !important;
            color: black !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .no-print {
            display: none !important;
          }
          .printable-incident-form {
            border: 2px solid black !important;
            box-shadow: none !important;
            margin: 0 auto !important;
            width: 100% !important;
            max-width: 100% !important;
            padding: 15px !important;
          }
        }
      `}</style>
    </div>
  );
};
