// جلب بيانات الحساب: الايميل من الجلسة، وباقي البيانات من جدول user_data
document.addEventListener('DOMContentLoaded', async () => {
    const setText = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value || '—';
    };

    try {
        const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();
        if (sessionError || !session) return;

        setText('header_email', session.user.email);

        const { data, error } = await supabaseClient
            .from('user_data')
            .select('fullname, phone, branch, parent_phone, level')
            .eq('id', session.user.id)
            .maybeSingle();

        if (error) throw error;
        if (!data) return;

        setText('header_name', data.fullname);
        setText('acc_fullname', data.fullname);
        setText('acc_phone', data.phone);
        setText('acc_parent_phone', data.parent_phone);
        setText('acc_level', data.level);
        setText('acc_branch', data.branch);
    } catch (err) {
        console.error('فشل جلب بيانات الحساب:', err);
    }
});