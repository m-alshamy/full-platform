// يعتمد على supabaseClient و supabasePublic المُعرَّفين في interface.js، حمّله بعده في index.html

// معرّفات عناصر القالب (<template id="courseTemplate">) في index.html
const TPL_IDS = [
    'course-card',
    'course-image',
    'course-name',
    'course-about',
    'price-container',
    'course-open-btn',
    'course-sub-btn',
];

async function fetchOwnedCourses() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) return [];

    // 1) مشتريات المستخدم الحالي — بيانات شخصية، من العميل الأساسي بدون كاش
    const { data: purchases, error: purchasesError } = await supabaseClient
        .from('purchases')
        .select('course_id')
        .order('course_id', { ascending: false })
        .limit(2);

    if (purchasesError) {
        console.error('تعذر جلب المشتريات:', purchasesError.message);
        return [];
    }

    const ownedIds = new Set(purchases.map((p) => p.course_id));
    if (!ownedIds.size) return [];

    // 2) بيانات الكورسات العامة — نفس الطلب لكل الزوار فيبقى قابلاً للكاش
    const { data: courses, error: coursesError } = await supabaseClient
        .from('courses')
        .select('id, name, image, about')
        .order('id', { ascending: false });

    if (coursesError) {
        console.error('تعذر جلب الكورسات:', coursesError.message);
        return [];
    }

    // 3) الفلترة محلياً: المملوك فقط
    return courses.filter((course) => ownedIds.has(course.id));
}
async function fetchAllCourses() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) return [];

    // 1) مشتريات المستخدم الحالي — بيانات شخصية، من العميل الأساسي بدون كاش
    const { data: purchases, error: purchasesError } = await supabaseClient
        .from('purchases')
        .select('course_id')
        .order('course_id', { ascending: false });

    if (purchasesError) {
        console.error('تعذر جلب المشتريات:', purchasesError.message);
        return [];
    }

    const ownedIds = new Set(purchases.map((p) => p.course_id));
    if (!ownedIds.size) return [];

    // 2) بيانات الكورسات العامة — نفس الطلب لكل الزوار فيبقى قابلاً للكاش
    const { data: courses, error: coursesError } = await supabaseClient
        .from('courses')
        .select('id, name, image, about')
        .order('id', { ascending: false });

    if (coursesError) {
        console.error('تعذر جلب الكورسات:', coursesError.message);
        return [];
    }

    // 3) الفلترة محلياً: المملوك فقط
    return courses.filter((course) => ownedIds.has(course.id));
}
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
    // نسخة جديدة من القالب لكل كورس
    const fragment = template.content.cloneNode(true);
    const el = (id) => fragment.getElementById(id);

    // النصوص عبر textContent (لا innerHTML) لمنع حقن HTML من قاعدة البيانات
    el('course-name').textContent = course.name ?? '';
    el('course-about').textContent = course.about ?? '';
    el('price-container').hidden = true;

    // صورة الخلفية: CSS خام inline على العنصر نفسه، وليس كلاس tailwind
    const image = el('course-image');
    const cssUrl = toCssUrl(course.image);
    if (cssUrl) {
        image.style.backgroundImage = cssUrl;
        image.style.backgroundSize = 'cover';
        image.style.backgroundPosition = 'center';
        image.style.backgroundRepeat = 'no-repeat';
    }

    // الكورس مملوك أصلاً، فلا حاجة لزر الاشتراك
    el('course-sub-btn').remove();

    // ربط معرّف الكورس بالبطاقة والزر لاستخدامه لاحقاً (فتح المحتوى)
    const card = el('course-card');
    card.dataset.courseId = course.id;
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
        empty.textContent = 'لا توجد كورسات مملوكة حالياً';
        container.replaceChildren(empty);
        return;
    }

    container.replaceChildren(
        ...courses.map((course) => buildCourseCard(template, course))
    );
}

async function refreshCourses(num) {
    if (num == 'all') {
        renderCourses(await fetchAllCourses());
    }
    if (num == 'owend') {
        renderCourses(await fetchOwnedCourses());
    }
}

document.addEventListener('DOMContentLoaded', refreshCourses('owend'));