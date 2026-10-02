const SUPABASE_URL = 'https://whiiadjocmkppzfpbkeh.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndoaWlhZGpvY21rcHB6ZnBia2VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkzOTk1NzQsImV4cCI6MjEwNDk3NTU3NH0.1IipeBlRqwehixssS-xCDTP0JB8Fj5ajBuKE8AVKlqA';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
// في interface.js، جنب تعريف supabaseClient الموجود بالفعل
const supabasePublic = supabase.createClient(
  window.location.origin,
  SUPABASE_KEY    // نفس المفتاح اللي بتستخدمه في supabaseClient
);

// حارس الجلسة: بدون جلسة نشطة يُحوَّل الزائر لصفحة الدخول.
// يجب أن يبقى هذا الـ callback بسيطاً ولا يرمي أي خطأ: أي استثناء داخله
// يجعل المكتبة تستدعيه مرة ثانية بجلسة فارغة فيحدث التحويل لصفحة الدخول.
supabaseClient.auth.onAuthStateChange((event, session) => {
    if (!session) {
        window.location.href = (event === 'SIGNED_OUT') ? '/' : '../login';
        return;
    }

    // إزالة الإخفاء فوراً بمجرد تأكيد الجلسة المحلية
    document.body?.removeAttribute('hidden');
});

async function logout() {
    await supabaseClient.auth.signOut();
}