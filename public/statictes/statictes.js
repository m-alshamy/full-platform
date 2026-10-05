// دالة لدمج البيانات الطويلة في متوسطات لتناسب العرض المرئي
function compressData(dataArray, maxVisualPoints) {
    // إذا كانت البيانات أقل من الحد الأقصى المسموح، يتم تمريرها كما هي
    if (dataArray.length <= maxVisualPoints) {
        return dataArray;
    }

    // حساب حجم الحزمة (كم قيمة سيتم دمجها في نقطة واحدة)
    const chunkSize = Math.ceil(dataArray.length / maxVisualPoints);
    const compressedArray = [];

    // تقسيم المصفوفة إلى حزم وحساب متوسط كل حزمة
    for (let i = 0; i < dataArray.length; i += chunkSize) {
        const chunk = dataArray.slice(i, i + chunkSize);
        const sum = chunk.reduce((total, num) => total + num, 0);

        // استخدام Math.round لتجنب الكسور العشرية في معدل التفاعل
        compressedArray.push(Math.round(sum / chunk.length));
    }

    return compressedArray;
}

// رسم الدونات
function initDonut() {
    const el = document.getElementById('donut-chart');
    if (!el) return;

    // قسمان فقط مع فاصل بينهما
    const chartData = {
        labels: ["القسم الأول", "فاصل", "القسم الثاني", "فاصل"],
        series: [40, 0.5, 60, 0.5]
    };

    const chartOptions = {
        donut: true,
        donutSolid: false,
        startAngle: 270,
        showLabel: false,
        chartPadding: 0
    };

    new Chartist.Pie(el, chartData, chartOptions);
}

// رسم النشاط (خطي)
function initActivity() {
    const el = document.getElementById('activity-chart');
    if (!el) return;

    // البيانات الخام لتتبع نشاط الطالب (يوم لكل قيمة)
    const rawDatabaseValues = [
        2, 5, 1, 6, 3, 0, 4, 7, 8, 3, 5, 2, 1, 0, 4, 6, 9, 10, 8, 5,
        3, 2, 1, 4, 6, 7, 5, 3, 2, 4, 1, 4, 6, 7, 5, 3, 2, 4
    ];

    // الحد الأقصى للنقاط التي تتسع لها الشاشة بوضوح
    // إذا زادت البيانات عنه، تدمج الدالة القيم المتجاورة في متوسطات
    const MAX_POINTS = 40;
    const optimizedValues = compressData(rawDatabaseValues, MAX_POINTS);

    const activityData = {
        series: [optimizedValues]
    };

    const activityOptions = {
        showArea: true,
        showPoint: false,
        showLine: true,
        lineSmooth: Chartist.Interpolation.cardinal({
            tension: 0.7
        }),
        axisY: {
            showLabel: true,
            showGrid: false,
            offset: 0
        },
        axisX: {
            showGrid: false,
            showLabel: false
        },
        chartPadding: {
            top: 15, right: 0, bottom: 15, left: 0
        }
    };

    new Chartist.Line(el, activityData, activityOptions);
}

// نقطة التشغيل الوحيدة
document.addEventListener('DOMContentLoaded', () => {
    // إذا لم تُحمَّل المكتبة لأي سبب، نتوقف بدون أخطاء
    if (typeof Chartist === 'undefined') {
        console.warn('Chartist library is not loaded.');
        return;
    }

    initDonut();
    initActivity();
});