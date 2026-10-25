import { Incident, FactorySettings, UserProfile, NotificationItem } from '../types';

export const INITIAL_SETTINGS: FactorySettings = {
  factoryName: 'کارخانه دانیال استیل',
  companyName: 'شرکت دانیال استیل',
  formCode: 'F-HS-07-00',
  totalWorkers: 380,
  totalManHours: 645000, // نفر-ساعت کارکرد تجمعی دوره جاری
  formulaBasis: 1000000,
  departments: [
    'خط نورد گرم مقاطع',
    'خط نورد سرد',
    'واحد کوره و ذوب',
    'کارگاه تراشکاری و غلتک',
    'انبار محصول و بارگیری',
    'واحد نگهداری و تعمیرات (نت)',
    'آزمایشگاه و کنترل کیفی',
    'تاسیسات و برق قدرت'
  ],
  shifts: {
    morning: { label: 'شیفت ۱ (صبح)', hours: '۰۶:۰۰ الی ۱۴:۰۰', officer: 'مهندس رضایی' },
    evening: { label: 'شیفت ۲ (عصر)', hours: '۱۴:۰۰ الی ۲۲:۰۰', officer: 'مهندس کریمی' },
    night: { label: 'شیفت ۳ (شب)', hours: '۲۲:۰۰ الی ۰۶:۰۰', officer: 'مهندس عباسی' }
  }
};

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'user-hse-head',
    name: 'مهندس حمید رفیعیان',
    role: 'hse_manager',
    department: 'مدیریت ایمنی، بهداشت و محیط زیست (HSE)',
    phone: '۰۹۱۲۳۴۵۶۷۸۹',
    avatar: '👨‍💼'
  },
  {
    id: 'user-officer-morning',
    name: 'مهندس علیرضا رضایی',
    role: 'safety_officer',
    shift: 'morning',
    department: 'واحد ایمنی صنعتی',
    phone: '۰۹۱۳۱۱۱۱۰۰۱',
    avatar: '👷‍♂️'
  },
  {
    id: 'user-officer-evening',
    name: 'مهندس سجاد کریمی',
    role: 'safety_officer',
    shift: 'evening',
    department: 'واحد ایمنی صنعتی',
    phone: '۰۹۱۳۲۲۲۲۰۰۲',
    avatar: '👷‍♂️'
  },
  {
    id: 'user-officer-night',
    name: 'مهندس مرتضی عباسی',
    role: 'safety_officer',
    shift: 'night',
    department: 'واحد ایمنی صنعتی',
    phone: '۰۹۱۳۳۳۳۳۰۰۳',
    avatar: '👷‍♂️'
  },
  {
    id: 'user-sup-rolling',
    name: 'مهندس بهرام صادقی',
    role: 'unit_supervisor',
    department: 'خط نورد گرم مقاطع',
    phone: '۰۹۱۴۴۴۴۴۰۰۴',
    avatar: '👨‍🏭'
  },
  {
    id: 'user-sup-furnace',
    name: 'مهندس کاظم محمدی',
    role: 'unit_supervisor',
    department: 'واحد کوره و ذوب',
    phone: '۰۹۱۵۵۵۵۵۰۰۵',
    avatar: '👨‍🏭'
  },
  {
    id: 'user-sup-repairs',
    name: 'مهندس هادی رستمی',
    role: 'unit_supervisor',
    department: 'واحد نگهداری و تعمیرات (نت)',
    phone: '۰۹۱۶۶۶۶۶۰۰۶',
    avatar: '👨‍🔧'
  },
  {
    id: 'user-clinic',
    name: 'خانم دکتر مریم اسدی',
    role: 'clinic_officer',
    department: 'بهداری و طب کار کارخانه',
    phone: '۰۹۱۷۷۷۷۷۰۰۷',
    avatar: '👩‍⚕️'
  }
];

export const INITIAL_INCIDENTS: Incident[] = [
  {
    id: 'INC-1403-101',
    formCode: 'F-HS-07-00',
    shift: 'morning',
    shiftOfficerName: 'مهندس علیرضا رضایی',
    shiftOfficerId: 'user-officer-morning',
    severity: 'minor',
    isEmergency: false,
    injuredPerson: {
      fullName: 'محمد قنبری',
      department: 'خط نورد گرم مقاطع',
      personnelCode: '۸۲۹۱',
      jobTitle: 'اپراتور بستر خنک‌کننده'
    },
    incidentGeneral: {
      types: ['cut'],
      otherExplanation: '',
      bodyPart: 'ساعد دست راست',
      ppeUsed: 'کفش ایمنی، کلاه ایمنی، دستکش برزنتی (دستکش ضدبرش استفاده نشده بود)',
      witnesses: 'حسین احمدی، بهزاد یوسفی',
      incidentDate: '۱۴۰۳/۰۷/۱۰',
      incidentTime: '۰۹:۲۵',
      formCompletionDateTime: '۱۴۰۳/۰۷/۱۰ ساعت ۱۰:۱۵',
      exactLocation: 'سالن شماره ۲ نورد، بخش جمع‌آوری ضایعات میلگرد',
      description: 'هنگام جابجایی قطعه پلیسه لبه مقطع فولادی با دستکش معمولی، پلیسه تیز لبه دچار لغزش شده و ساعد دست مصدوم دچار بریدگی حدود ۳ سانتی‌متر گردید.'
    },
    supervisorSection: {
      fullName: 'مهندس بهرام صادقی',
      phone: '۰۹۱۴۴۴۴۴۰۰۴',
      unit: 'خط نورد گرم مقاطع',
      organizationalRole: 'سرپرست تولید خط نورد',
      date: '۱۴۰۳/۰۷/۱۰',
      signature: 'بهرام صادقی (تایید سیستمی)',
      isSigned: true,
      notes: 'تذکر شفاهی به پرسنل جهت الزام پوشیدن دستکش ضدبرش کولار Kevlar صادر گردید.'
    },
    hseSection: {
      clinicActions: 'شستشو با بتادین و نرمال سالین، بخیه سطحی (۲ عدد) در خانه بهداشت کارخانه، تزریق واکسن کزاز، پانسمان استریل.',
      lostWorkdays: 0,
      hseOfficerName: 'مهندس حمید رفیعیان',
      hseRegistrationDate: '۱۴۰۳/۰۷/۱۰',
      status: 'closed'
    },
    createdAt: '2026-10-10T09:30:00Z',
    updatedAt: '2026-10-10T11:00:00Z'
  },
  {
    id: 'INC-1403-102',
    formCode: 'F-HS-07-00',
    shift: 'night',
    shiftOfficerName: 'مهندس مرتضی عباسی',
    shiftOfficerId: 'user-officer-night',
    severity: 'severe',
    isEmergency: true,
    injuredPerson: {
      fullName: 'رضا میرزایی',
      department: 'واحد کوره و ذوب',
      personnelCode: '۶۱۴۰',
      jobTitle: 'تکنسین شارژ قراضه کوره'
    },
    incidentGeneral: {
      types: ['burn', 'contusion'],
      otherExplanation: '',
      bodyPart: 'مچ پا و پشت دست چپ',
      ppeUsed: 'لباس کار ضدجرقه آلومینیومی، گتر نسوز، کلاه نقابدار، کفش ایمنی ذوب',
      witnesses: 'اکبر نظری، داوود مرادی',
      incidentDate: '۱۴۰۳/۰۷/۱۸',
      incidentTime: '۰۲:۴۰',
      formCompletionDateTime: '۱۴۰۳/۰۷/۱۸ ساعت ۰۳:۳۰',
      exactLocation: 'سکوی شارژ کوره القایی شماره ۱',
      description: 'هنگام اضافه نمودن قراضه به دلیل رطوبت جزیی در مخزن، پاشش جرقه و سرباره مذاب رخ داد که بخشی از گتر پا را سوزاند و به دلیل عقب‌نشینی ناگهانی، پای مصدوم به لبه سکو برخورد کرده و ضربه دید.'
    },
    supervisorSection: {
      fullName: 'مهندس کاظم محمدی',
      phone: '۰۹۱۵۵۵۵۵۰۰۵',
      unit: 'واحد کوره و ذوب',
      organizationalRole: 'مدیر شیفت ذوب و کوره',
      date: '۱۴۰۳/۰۷/۱۸',
      signature: 'کاظم محمدی',
      isSigned: true,
      notes: 'دستور توقف فوری شارژ قراضه مرطوب و بازرسی هیتر پیش‌گرم قراضه صادر شد.'
    },
    hseSection: {
      clinicActions: 'پماد سوختگی سیلور سولفادیازین، شستشوی ضدعفونی، یخ‌درمانی موضع ضرب‌دیدگی، اعزام به بیمارستان سوانح و سوختگی توسط آمبولانس کارخانه.',
      lostWorkdays: 4,
      hseOfficerName: 'مهندس حمید رفیعیان',
      hseRegistrationDate: '۱۴۰۳/۰۷/۱۸',
      status: 'closed'
    },
    createdAt: '2026-10-18T02:45:00Z',
    updatedAt: '2026-10-18T06:00:00Z'
  },
  {
    id: 'INC-1403-103',
    formCode: 'F-HS-07-00',
    shift: 'evening',
    shiftOfficerName: 'مهندس سجاد کریمی',
    shiftOfficerId: 'user-officer-evening',
    severity: 'moderate',
    isEmergency: false,
    injuredPerson: {
      fullName: 'سعید پناهی',
      department: 'کارگاه تراشکاری و غلتک',
      personnelCode: '۵۰۴۳',
      jobTitle: 'تراشکار غلتک سنگین نورد'
    },
    incidentGeneral: {
      types: ['contusion', 'superficial_injury'],
      otherExplanation: '',
      bodyPart: 'شست پای راست',
      ppeUsed: 'کفش ایمنی سرپنجه فولادی، لباس کار، عینک حفاظتی',
      witnesses: 'مجید شریفی، علی فراهانی',
      incidentDate: '۱۴۰۳/۰۷/۲۲',
      incidentTime: '۱۸:۱۵',
      formCompletionDateTime: '۱۴۰۳/۰۷/۲۲ ساعت ۱۹:۰۰',
      exactLocation: 'کارگاه ماشینکاری، پای دستگاه تراش غلتک ۴ متری',
      description: 'هنگام جابجایی فک دستگاه گیره توسط جراثقال سقفی، تکان ناگهانی بار باعث اصابت گوشه گیره به روی کفش مصدوم گردید. به لطف سرپنجه فولادی کفش ایمنی از خردشدگی جلوگیری شد ولی ضربه باعث کوفتگی شدید انگشت گردید.'
    },
    supervisorSection: {
      fullName: 'مهندس هادی رستمی',
      phone: '۰۹۱۶۶۶۶۶۰۰۶',
      unit: 'واحد نگهداری و تعمیرات (نت)',
      organizationalRole: 'سرپرست کارگاه‌های مکانیک',
      date: '۱۴۰۳/۰۷/۲۲',
      signature: 'هادی رستمی',
      isSigned: true,
      notes: 'بازرسی سیم بکسل و بالابر سقفی انجام شد.'
    },
    hseSection: {
      clinicActions: 'کمپرس سرد، ارزیابی رادیولوژی (عدم شکستگی تایید شد)، باند کشی و تجویز مسکن.',
      lostWorkdays: 2,
      hseOfficerName: 'مهندس حمید رفیعیان',
      hseRegistrationDate: '۱۴۰۳/۰۷/۲۲',
      status: 'closed'
    },
    createdAt: '2026-10-22T18:20:00Z',
    updatedAt: '2026-10-22T20:00:00Z'
  },
  {
    id: 'INC-1403-104',
    formCode: 'F-HS-07-00',
    shift: 'morning',
    shiftOfficerName: 'مهندس علیرضا رضایی',
    shiftOfficerId: 'user-officer-morning',
    severity: 'critical',
    isEmergency: true,
    injuredPerson: {
      fullName: 'فرزاد نعمتی',
      department: 'انبار محصول و بارگیری',
      personnelCode: '۷۷۲۹',
      jobTitle: 'کمک انباردار و ریگر جرثقیل'
    },
    incidentGeneral: {
      types: ['fracture', 'contusion'],
      otherExplanation: '',
      bodyPart: 'مچ و ساق دست راست',
      ppeUsed: 'کلاه ایمنی، کفش ایمنی، جلیقه شبرنگ، دستکش چرمی',
      witnesses: 'قاسم علیزاده، ناصر احمدوند',
      incidentDate: '۱۴۰۳/۰۸/۰۱',
      incidentTime: '۱۱:۱۰',
      formCompletionDateTime: '۱۴۰۳/۰۸/۰۱ ساعت ۱۱:۵۰',
      exactLocation: 'انبار روباز بندیل‌های میلگرد، پای استکر شماره ۳',
      description: 'هنگام بستن قلاب و تسمه به بندیل ۲ تنی مقاطع استیل، حرکت ناگهانی کفی تریلی باعث لغزش بندیل و گیر افتادن ساعد دست راست بین دو بندیل گردید که منجر به شکستگی استخوان رادیوس شد.'
    },
    supervisorSection: {
      fullName: 'مهندس بهرام صادقی',
      phone: '۰۹۱۴۴۴۴۴۰۰۴',
      unit: 'انبار محصول و بارگیری',
      organizationalRole: 'مدیر لجستیک و انبار کارخانه',
      date: '۱۴۰۳/۰۸/۰۱',
      signature: 'بهرام صادقی',
      isSigned: true,
      notes: 'پروتکل ایمنی مهار چرخ‌های تریلی (Wheel Chock) الزامی شد.'
    },
    hseSection: {
      clinicActions: 'آتل‌بندی اورژانسی دست، تزریق مسکن، اعزام فوری با کد بحرانی به بیمارستان تخصصی ارتوپدی.',
      lostWorkdays: 21,
      hseOfficerName: 'مهندس حمید رفیعیان',
      hseRegistrationDate: '۱۴۰۳/۰۸/۰۱',
      status: 'under_review'
    },
    createdAt: '2026-11-01T11:15:00Z',
    updatedAt: '2026-11-01T13:00:00Z'
  },
  {
    id: 'INC-1403-105',
    formCode: 'F-HS-07-00',
    shift: 'night',
    shiftOfficerName: 'مهندس مرتضی عباسی',
    shiftOfficerId: 'user-officer-night',
    severity: 'minor',
    isEmergency: false,
    injuredPerson: {
      fullName: 'مهدی کشاورز',
      department: 'خط نورد گرم مقاطع',
      personnelCode: '۹۱۲۰',
      jobTitle: 'کمک نوردکار استند ۵'
    },
    incidentGeneral: {
      types: ['superficial_injury'],
      otherExplanation: '',
      bodyPart: 'گونه و لاله گوش راست',
      ppeUsed: 'کلاه ایمنی، کفش ایمنی، لباس کار (بدون شیلد محافظ صورت)',
      witnesses: 'حامد زارعی، رسول مرادی',
      incidentDate: '۱۴۰۳/۰۸/۰۳',
      incidentTime: '۰۴:۱۰',
      formCompletionDateTime: '۱۴۰۳/۰۸/۰۳ ساعت ۰۴:۵۰',
      exactLocation: 'سالن تولید نورد پیوسته، استندهای نهایی',
      description: 'پرتاب پلیسه ریز اکسید آهن داغ هنگام خروج تسمه از قفسه نورد به سمت صورت اپراتور و ایجاد سوختگی سطحی نقطه‌ای.'
    },
    supervisorSection: {
      fullName: 'مهندس بهرام صادقی',
      phone: '۰۹۱۴۴۴۴۴۰۰۴',
      unit: 'خط نورد گرم مقاطع',
      organizationalRole: 'سرپرست تولید خط نورد',
      date: '۱۴۰۳/۰۸/۰۳',
      signature: 'بهرام صادقی',
      isSigned: true,
      notes: 'توزیع عینک‌های حفاظتی بغل‌دار و شیلد صورت در قفسه ایستگاه استند.'
    },
    hseSection: {
      clinicActions: 'شستشوی چشم و پوست، پماد آنتی‌بیوتیک موضعی، ترخیص پس از نیم ساعت استراحت.',
      lostWorkdays: 0,
      hseOfficerName: 'مهندس حمید رفیعیان',
      hseRegistrationDate: '۱۴۰۳/۰۸/۰۳',
      status: 'closed'
    },
    createdAt: '2026-11-03T04:15:00Z',
    updatedAt: '2026-11-03T05:30:00Z'
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    incidentId: 'INC-1403-104',
    title: 'هشدار بحرانی: حادثه در انبار محصول و بارگیری',
    message: 'حادثه شکستگی دست راست آقای فرزاد نعمتی ثبت شد. نیاز به بررسی فوری و تایید سرپرست واحد.',
    department: 'انبار محصول و بارگیری',
    severity: 'critical',
    timestamp: '۱۴۰۳/۰۸/۰۱ - ۱۱:۱۵',
    isRead: false,
    targetRole: 'unit_supervisor',
    targetUnit: 'انبار محصول و بارگیری'
  },
  {
    id: 'notif-2',
    incidentId: 'INC-1403-105',
    title: 'ثبت حادثه جدید در خط نورد گرم',
    message: 'جراحت سطحی آقای مهدی کشاورز در شیفت شب ثبت شد. جهت تکمیل بخش سرپرست اقدام فرمایید.',
    department: 'خط نورد گرم مقاطع',
    severity: 'minor',
    timestamp: '۱۴۰۳/۰۸/۰۳ - ۰۴:۱۵',
    isRead: false,
    targetRole: 'unit_supervisor',
    targetUnit: 'خط نورد گرم مقاطع'
  }
];
