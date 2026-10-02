// donut load

window.addEventListener('load', () => {
    // المصفوفات المحدثة لتشمل قسمين فقط مع فواصلهما
    const chartData = {
        labels: ["القسم الأول", "فاصل", "القسم الثاني", "فاصل"],
        series: [40, 0.5, 60, 0.5]
    };

    // إعدادات المكتبة تبقى كما هي
    const chartOptions = {
        donut: true,
        donutSolid: false,
        startAngle: 270,
        showLabel: false,
        chartPadding: 0
    };

    new Chartist.Pie('#donut-chart', chartData, chartOptions);
});
// دالة لدمج البيانات الطويلة في متوسطات لتناسب العرض المرئي
function compressData(dataArray, maxVisualPoints) {
    // إذا كانت الأيام أقل من الحد الأقصى المسموح، يتم تمريرها كما هي
    if (dataArray.length <= maxVisualPoints) {
        return dataArray;
    }

    // حساب حجم الحزمة (كم يوماً سيتم دمجه في نقطة واحدة)
    const chunkSize = Math.ceil(dataArray.length / maxVisualPoints);
    const compressedArray = [];

    // تقسيم المصفوفة إلى حزم وحساب متوسط كل حزمة
    for (let i = 0; i < dataArray.length; i += chunkSize) {
        const chunk = dataArray.slice(i, i + chunkSize);
        const sum = chunk.reduce((total, num) => total + num, 0);
        
        // استخدام Math.round لتجنب الكسور العشرية في معدل التفاعل
        const average = Math.round(sum / chunk.length); 
        compressedArray.push(average);
    }

    return compressedArray;
}
// line load

window.addEventListener('load', () => {
    // افترض أن هذه البيانات الخام تمثل تتبع الطالب لـ 120 يوماً متصلاً
    const rawDatabaseValues = [2,5,1,6,3,0,4,7,8,3,5,2,1,0,4,6,9,10,8,5,3,2,1,4,6,7,5,3,2,4,1,4,6,7,5,3,2,4];

    // تحديد الحد الأقصى للنقاط التي يمكن للشاشة استيعابها بنظافة (مثلاً 40 نقطة)
    // الدالة ستقوم هنا بدمج كل 3 أيام في نقطة واحدة تلقائياً
    const optimizedValues = compressData(rawDatabaseValues, 40);

    const activityData = {
        series: [optimizedValues] // حقن البيانات المعالجة والمختزلة
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

    new Chartist.Line('#activity-chart', activityData, activityOptions);
});