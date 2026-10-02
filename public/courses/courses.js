// يعتمد على supabaseClient المُعرَّف في interface.js، حمّله بعده في index.html

// معرّفات عناصر القالب (<template id="courseTemplate">) في index.html
const TPL_IDS = [
    'course-card',
    'course-image',
    'course-name',
    'course-about',
    'price-container',
    'course-price',
    'course-open-btn',
    'course-sub-btn',
];

const COURSE_COLUMNS = 'id, name, image, about, price';

// معرّفات الكورسات المملوكة للمستخدم الحالي (Set فارغة لو غير مسجل أو حدث خطأ)
async function fetchOwnedIds() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) return new Set();

    const { data, error } = await supabaseClient
        .from('purchases')
        .select('course_id');

    if (error) {
        console.error('تعذر جلب المشتريات:', error.message);
        return new Set();
    }
    return new Set(data.map((p) => p.course_id));
}

// الدالة المشتركة: الكورسات الأحدث أولاً + علامة owned لكل كورس
// limit: عدد الكورسات المطلوب، أو undefined لسحب الكل
async function fetchCourses(limit) {
    let query = supabaseClient //supabasePublic
        .from('courses')
        .select(COURSE_COLUMNS)
        .order('id', { ascending: false });

    if (limit) query = query.limit(limit);

    // الاستعلامان مستقلان فننفذهما بالتوازي
    const [{ data: courses, error }, ownedIds] = await Promise.all([
        query,
        fetchOwnedIds(),
    ]);

    if (error) {
        console.error('تعذر جلب الكورسات:', error.message);
        return [];
    }

    return courses.map((course) => ({ ...course, owned: ownedIds.has(course.id) }));
}

const fetchLatestCourses = () => fetchCourses(4); // الافتراضية: أحدث 4 كورسات
const fetchAllCourses = () => fetchCourses();     // كل الكورسات

// يحوّل رابط الصورة إلى قيمة CSS آمنة لـ background-image (http/https أو مسار نسبي فقط)
function toCssUrl(rawUrl) {
    if (!rawUrl) return '';
    try {
        const url = new URL(rawUrl, document.baseURI);
        if (url.protocol !== 'http:' && url.protocol !== 'https:') return '';
        return `url("${url.href.replace(/["\\\n\r]/g, encodeURIComponent)}")`;
    } catch {
        return '';
    }
}

function buildCourseCard(template, course) {
    const fragment = template.content.cloneNode(true);
    const el = (id) => fragment.getElementById(id);

    el('course-name').textContent = course.name ?? '';
    el('course-about').textContent = course.about ?? '';

    const image = el('course-image');
    const cssUrl = toCssUrl(course.image);
    if (cssUrl) {
        image.style.backgroundImage = cssUrl;
        image.style.backgroundSize = 'cover';
        image.style.backgroundPosition = 'center';
        image.style.backgroundRepeat = 'no-repeat';
    }

    const priceBox = el('price-container');
    const subBtn = el('course-sub-btn');

    if (course.owned) {
        // مملوك: بدون شارة سعر وبدون زر اشتراك
        priceBox.hidden = true;
        subBtn.remove();
    } else {
        // غير مملوك: إظهار الشارة والسعر وإبقاء زر الاشتراك
        priceBox.hidden = false;
        el('course-price').textContent = course.price ?? '';
        subBtn.dataset.courseId = course.id;
    }

    el('course-card').dataset.courseId = course.id;
    el('course-open-btn').dataset.courseId = course.id;

    // إزالة المعرّفات من النسخة حتى لا تتكرر في الصفحة
    TPL_IDS.forEach((id) => el(id)?.removeAttribute('id'));

    return fragment;
}

function renderCourses(courses) {
    const container = document.getElementById('container');
    const template = document.getElementById('courseTemplate');
    if (!container || !template) return;

    if (!courses.length) {
        const empty = document.createElement('p');
        empty.textContent = 'لا توجد كورسات حالياً';
        container.replaceChildren(empty);
        return;
    }

    container.replaceChildren(
        ...courses.map((course) => buildCourseCard(template, course))
    );
}

// يتذكر آخر وضع عرض، فبعد الشراء تُعاد رسم القائمة بنفس الوضع
let currentMode = 'latest';

async function refreshCourses(mode = currentMode) {
    currentMode = mode;
    if (mode === 'all') renderCourses(await fetchAllCourses());
    else renderCourses(await fetchLatestCourses());
}

// تفويض الأحداث: مستمع واحد للحاوية يخدم كل الأزرار حتى بعد إعادة الرسم
document.addEventListener('DOMContentLoaded', () => {
    refreshCourses('latest');

    document.getElementById('container')?.addEventListener('click', (e) => {
        const subBtn = e.target.closest('.subBtn');
        if (subBtn) return purchaseCourse(subBtn.dataset.courseId, subBtn);

        const openBtn = e.target.closest('.enterBtn');
        if (openBtn) return openCourse(openBtn.dataset.courseId);
    });
});

function openCourse(courseId) {
    // TODO: الانتقال لصفحة محتوى الكورس
    console.log('open', courseId);
}