const SUPABASE_URL = 'https://whiiadjocmkppzfpbkeh.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndoaWlhZGpvY21rcHB6ZnBia2VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkzOTk1NzQsImV4cCI6MjEwNDk3NTU3NH0.1IipeBlRqwehixssS-xCDTP0JB8Fj5ajBuKE8AVKlqA';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const errorMessage = document.getElementById('error-message');

supabaseClient.auth.onAuthStateChange(async (event, session) => {
    if (session) {
        window.location.href = '../home';
    } else {
        document.body.removeAttribute('hidden');
    }
});

function showTab(tab) {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');

    if (tab === 'login') {
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        tabLogin.classList.add('text-sec-item', 'border-b-2', 'border-sec-item');
        tabLogin.classList.remove('text-gray-400');
        tabRegister.classList.remove('text-sec-item', 'border-b-2', 'border-sec-item');
        tabRegister.classList.add('text-gray-400');
    }
    if (tab === 'register') {
        registerForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
        tabRegister.classList.add('text-sec-item', 'border-b-2', 'border-sec-item');
        tabRegister.classList.remove('text-gray-400');
        tabLogin.classList.remove('text-sec-item', 'border-b-2', 'border-sec-item');
        tabLogin.classList.add('text-gray-400');
    }
    errorMessage.classList.add('hidden');
}

// ---------- تنظيف المدخلات ----------

const NAME_FIELDS = [
    ['fname', 'الاسم الأول'],
    ['sname', 'الاسم الثاني'],
    ['tname', 'الاسم الثالث'],
    ['lname', 'الاسم الأخير'],
];

// حروف عربية فقط: يحذف المسافات والأرقام والرموز والتشكيل والتطويل وأي حرف غير عربي
function cleanArabicName(value) {
    return value.replace(/[^\u0621-\u063A\u0641-\u064A]/g, '');
}

// رقم مصري: يحوّل الأرقام الهندية (٠-٩) إلى لاتينية، يحذف كل ما ليس رقماً، ويحوّل 20+ إلى 0
function cleanPhone(value) {
    return value
        .replace(/[\u0660-\u0669]/g, (d) => d.charCodeAt(0) - 0x0660)
        .replace(/\D/g, '')
        .replace(/^20(?=1)/, '0');
}
const PHONE_REGEX = /^01[0125]\d{8}$/;

// منع الأحرف غير المسموحة أثناء الكتابة واللصق في حقول الاسم
NAME_FIELDS.forEach(([id]) => {
    document.getElementById(id).addEventListener('input', (e) => {
        e.target.value = cleanArabicName(e.target.value);
    });
});

// ---------- إنشاء الحساب ----------

async function register() {
    const email = document.getElementById('register-email').value.trim().toLowerCase();
    const password = document.getElementById('register-password').value;
    const passwordConfirm = document.getElementById('register-password-confirm').value;

    if (password.length < 6) {
        showError('كلمة المرور يجب ألا تقل عن 6 أحرف');
        return;
    }
    if (password !== passwordConfirm) {
        showError('كلمتا المرور غير متطابقتين');
        return;
    }

    // الاسم الرباعي: كل حقل كلمة عربية واحدة بدون مسافات
    const names = [];
    for (const [id, label] of NAME_FIELDS) {
        const name = cleanArabicName(document.getElementById(id).value);
        if (name.length < 2) {
            showError(`${label}: حروف عربية فقط وبدون مسافات`);
            return;
        }
        names.push(name);
    }

    const phone = cleanPhone(document.getElementById('phone').value);
    const parentPhone = cleanPhone(document.getElementById('guardian-phone').value);

    if (!PHONE_REGEX.test(phone)) {
        showError('رقم الهاتف غير صحيح');
        return;
    }
    if (!PHONE_REGEX.test(parentPhone)) {
        showError('رقم هاتف ولي الأمر غير صحيح');
        return;
    }

    // مفاتيح البيانات = أسماء أعمدة القاعدة
    const { data, error } = await supabaseClient.auth.signUp({
        email: email,
        password: password,
        options: {
            data: {
                fullname: names.join(' '),
                phone: phone,
                parent_phone: parentPhone,
                level: document.getElementById('grade').value,
                branch: document.getElementById('section').value
            }
        }
    });

    if (error) {
        showError(error.message);
        return;
    }

    clearUserMetadata();
    if (data.user) {
        showError('تم إنشاء الحساب بنجاح. يتم الآن تسجيل الدخول...', true);
    }
}

async function clearUserMetadata() {
    const { error } = await supabaseClient.auth.updateUser({
        data: {
            fullname: null,
            phone: null,
            parent_phone: null,
            level: null,
            branch: null
        }
    });

    if (error) {
        console.error("تعذر تفريغ البيانات:", error.message);
    }
}

async function login() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const { error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password,
    });

    if (error) {
        let wrong = "Invalid login credentials";
        if (error.message == wrong) {
            showError("البريد الالكتروني أو كلمة السر غير صحيحة");
        }
        else {
            showError(error.message);
        }
    };
}

function showError(msg, isSuccess = false) {
    errorMessage.textContent = msg;
    errorMessage.classList.remove('hidden', 'text-red-500', 'text-green-500');
    errorMessage.classList.add(isSuccess ? 'text-green-500' : 'text-red-500');
}