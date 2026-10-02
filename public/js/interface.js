// تحديد العناصر من شجرة الوثيقة
const menuBtn = document.getElementById('menuBtn');
const sideNav = document.getElementById('sideMenu');
const sideBar = document.getElementById('sideBar');
const sideBlack = document.getElementById('sideBlack');
const root = document.querySelector('html')
const modeBtns = document.querySelectorAll('.modeBtn')
const clpsBtn = document.getElementById('clpsBtn');
const THEME_KEY = 'theme'; // 'dark' أو 'light'
const systemThemeBtn = document.getElementById('systemThemeBtn');

function toggleCollapse() {
    // إيقاف التنفيذ فوراً إذا لم تكن القائمة موجودة في الصفحة
    if (!sideBar) return; 

    let spans = sideBar.querySelectorAll('span');
    
    spans.forEach(span => {
        span.classList.toggle('hidden');
    });

    // جلب حالة الطي من العنصر الأول وحفظها في التخزين المحلي
    if (spans.length > 0) {
        let isCollapsed = spans[0].classList.contains('hidden');
        localStorage.setItem('sidebarCollapsed', isCollapsed);
    }
}
function initSidebarState() {
    const currentSidebar = document.getElementById('sideBar');
    
    if (!currentSidebar) return; 

    const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';

    if (isCollapsed) {
        let spans = currentSidebar.querySelectorAll('span');
        spans.forEach(span => {
            span.classList.add('hidden');
        });
    }
}

function setSystemTheme() {
  try {
    localStorage.removeItem(THEME_KEY);
  } catch (e) { }

  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(systemPrefersDark ? 'dark' : 'light');
}

// دالة للتبديل بين حالات إظهار وإخفاء القائمة
function toggleSidebar() {
  sideNav.classList.toggle('translate-x-full');
  sideNav.classList.toggle('translate-x-0');
  sideBlack.classList.toggle('hidden');
}
function getSavedTheme() {
  try { return localStorage.getItem(THEME_KEY); } catch (e) { return null; }
}

function saveTheme(theme) {
  try { localStorage.setItem(THEME_KEY, theme); } catch (e) { }
}

// تطبيق الوضع على الصفحة وعلى الأزرار (بدون حفظ)
function applyTheme(theme) {
  const isDark = theme === 'dark';
  root.classList.toggle('dark', isDark);
  modeBtns.forEach(btn => btn.classList.toggle('justify-end', isDark));
}

function toggleMode() {
  const next = root.classList.contains('dark') ? 'light' : 'dark';
  applyTheme(next);
  saveTheme(next);
}
// مزامنة الأزرار مع الوضع المحفوظ عند التحميل
applyTheme(getSavedTheme() || (root.classList.contains('dark') ? 'dark' : 'light'));

// مزامنة الوضع بين التبويبات المفتوحة
window.addEventListener('storage', (e) => {
  if (e.key === THEME_KEY) applyTheme(e.newValue);
});

// تشغيل الكود عند تحميل الصفحة
menuBtn.addEventListener('click', toggleSidebar);
sideBlack.addEventListener('click', toggleSidebar);
document.addEventListener("DOMContentLoaded", function () {
  AOS.init({
    // المسافة بالبكسل من العنصر الأصلي لبدء الحركة
    offset: 150,
    // مدة الحركة بالملي ثانية
    duration: 1000,

    delay: 100,
    // تحديد ما إذا كانت الحركة ستحدث مرة واحدة فقط أم في كل مرة يتم التمرير فيها
    once: true
  });
});

function highlightActiveMenu() {
  // جلب أجزاء الرابط وتصفيتها
  const segments = location.pathname.split('/').filter(Boolean);
  if (segments.at(-1)?.includes('.')) segments.pop();

  // استخراج اسم المسار الأخير مباشرة
  const currentPath = segments.at(-1);
  if (!currentPath) return;

  // استهداف جميع الروابط التي تحمل نفس قيمة المسار المباشر
  const activeLinks = document.querySelectorAll(`[data-route="${currentPath}"]`);

  // تطبيق التنسيقات على العناصر المطابقة
  activeLinks.forEach(link => {
    link.classList.add('bg-sec-bg', 'text-pri-bg');
  });
}

// تنفيذ الدالة
highlightActiveMenu();
initSidebarState();