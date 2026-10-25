import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

/**
 * تعیین نوع ارتقای ورژن (Major, Minor, Patch) بر اساس پیام‌های کامیت گیت
 */
function determineBumpType() {
  try {
    // دریافت آخرین کامیت‌ها از آخرین تگ یا ۵ کامیت اخیر
    let commitsText = '';
    try {
      const lastTag = execSync('git describe --tags --abbrev=0 2>/dev/null', { encoding: 'utf-8' }).trim();
      if (lastTag) {
        commitsText = execSync(`git log ${lastTag}..HEAD --pretty=format:"%B---COMMIT_END---"`, { encoding: 'utf-8' });
      }
    } catch (e) {
      // اگر هنوز تگی وجود نداشت، ۵ کامیت اخیر را بررسی می‌کنیم
    }

    if (!commitsText) {
      try {
        commitsText = execSync('git log -n 5 --pretty=format:"%B---COMMIT_END---"', { encoding: 'utf-8' });
      } catch (e) {
        commitsText = 'fix: automatic regular update';
      }
    }

    const lower = commitsText.toLowerCase();

    // ۱. بررسی تغییرات اساسی و ساختارشکنی (Major)
    // تغییرات عمده مثل بازنویسی ساختار دیتابیس، شکستن API یا کلیدواژه‌های رسمی Conventional Commits
    if (
      lower.includes('breaking change') || 
      lower.includes('breaking:') || 
      lower.includes('[major]') || 
      lower.includes('type: major')
    ) {
      return { type: 'major', reason: 'شناسایی کلیدواژه تغییر ساختارشکن (Breaking Change / Major)' };
    }

    // ۲. بررسی ویژگی‌های جدید (Minor)
    // اضافه شدن فرم‌های جدید، ماژول‌های تحلیلی، قابلیت‌های جدید با feat یا feature
    if (
      lower.includes('feat:') || 
      lower.includes('feat(') || 
      lower.includes('feature:') || 
      lower.includes('[minor]') || 
      lower.includes('قابلیت جدید') || 
      lower.includes('ویژگی جدید')
    ) {
      return { type: 'minor', reason: 'شناسایی ویژگی یا قابلیت جدید (Feature / Minor)' };
    }

    // ۳. تغییرات جزیی، اصلاح باگ‌ها، استایل، یا تنظیمات (Patch)
    return { type: 'patch', reason: 'اصلاح باگ‌ها یا به‌روزرسانی‌های روتین (Fix / Patch)' };
  } catch (error) {
    console.warn('عدم امکان دسترسی به تاریخچه Git، نسخه به صورت Patch افزایش می‌یابد:', error.message);
    return { type: 'patch', reason: 'پیش‌فرض افزایش نسخه (Patch)' };
  }
}

/**
 * اعمال افزایش بر اساس SemVer (x.y.z)
 */
function incrementVersion(currentVersion, bumpType) {
  const parts = currentVersion.split('.').map(n => parseInt(n, 10) || 0);
  while (parts.length < 3) parts.push(0);

  let [major, minor, patch] = parts;

  if (bumpType === 'major') {
    major += 1;
    minor = 0;
    patch = 0;
  } else if (bumpType === 'minor') {
    minor += 1;
    patch = 0;
  } else {
    patch += 1;
  }

  return `${major}.${minor}.${patch}`;
}

function run() {
  console.log('🚀 در حال تحلیل تغییرات و محاسبه خودکار ورژن نرم‌افزار...');

  const packageJsonPath = path.join(rootDir, 'package.json');
  const tauriConfPath = path.join(rootDir, 'src-tauri', 'tauri.conf.json');
  const cargoTomlPath = path.join(rootDir, 'src-tauri', 'Cargo.toml');

  // خواندن نسخه جاری از package.json
  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  const oldVersion = pkg.version || '1.0.0';

  const { type: bumpType, reason } = determineBumpType();
  const newVersion = incrementVersion(oldVersion, bumpType);

  console.log(`📌 نسخه قبلی: ${oldVersion}`);
  console.log(`🔍 علت افزایش (${bumpType.toUpperCase()}): ${reason}`);
  console.log(`✨ نسخه جدید محاسبه‌شده: ${newVersion}`);

  // ۱. به‌روزرسانی package.json
  pkg.version = newVersion;
  fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2) + '\n');
  console.log('✓ فایل package.json به‌روزرسانی شد.');

  // ۲. به‌روزرسانی tauri.conf.json در صورت وجود
  if (fs.existsSync(tauriConfPath)) {
    const tauriConf = JSON.parse(fs.readFileSync(tauriConfPath, 'utf-8'));
    tauriConf.version = newVersion;
    fs.writeFileSync(tauriConfPath, JSON.stringify(tauriConf, null, 2) + '\n');
    console.log('✓ فایل src-tauri/tauri.conf.json به‌روزرسانی شد.');
  }

  // ۳. به‌روزرسانی Cargo.toml در صورت وجود
  if (fs.existsSync(cargoTomlPath)) {
    let cargoContent = fs.readFileSync(cargoTomlPath, 'utf-8');
    cargoContent = cargoContent.replace(/^version\s*=\s*"[^"]+"/m, `version = "${newVersion}"`);
    fs.writeFileSync(cargoTomlPath, cargoContent);
    console.log('✓ فایل src-tauri/Cargo.toml به‌روزرسانی شد.');
  }

  // خروجی جهت استفاده در GitHub Actions
  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `new_version=${newVersion}\n`);
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `old_version=${oldVersion}\n`);
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `bump_type=${bumpType}\n`);
  }

  console.log(`🎉 ارتقای موفق ورژن به ${newVersion}!`);
}

run();
