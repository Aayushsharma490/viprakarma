require('dotenv').config({ path: '.env.local' });
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);
const EMAIL_FROM = process.env.EMAIL_FROM || 'VipraKarma <onboarding@resend.dev>';
const TEST_EMAIL = 'delivered@resend.dev'; // Resend's test email that always works

async function sendTestEmail() {
    console.log(`Sending test email from ${EMAIL_FROM} to ${TEST_EMAIL}...`);
    try {
        // 1. Basic Test
        const { error: error1 } = await resend.emails.send({
            from: EMAIL_FROM,
            to: [TEST_EMAIL],
            subject: 'VipraKarma System Test',
            html: '<p>This is a test email to verify the notification system is working.</p>'
        });
        if (error1) console.error('Basic Test Failed:', error1);
        else console.log('Basic Test Success');

        // 2. Consultation Request (User -> Admin/Astrologer)
        const { error: error2 } = await resend.emails.send({
            from: EMAIL_FROM,
            to: [TEST_EMAIL],
            subject: 'New Consultation Request - VipraKarma',
            html: `
                <h1>New Consultation Request</h1>
                <p><strong>User:</strong> Test User</p>
                <p><strong>Type:</strong> Chat Consultation</p>
                <p>Please log in to the admin panel to review.</p>
            `
        });
        if (error2) console.error('Consultation Email Failed:', error2);
        else console.log('Consultation Email Success');

        // 3. Subscription Request (User -> Admin)
        const { error: error3 } = await resend.emails.send({
            from: EMAIL_FROM,
            to: [TEST_EMAIL],
            subject: 'New Subscription Request - VipraKarma',
            html: `
                <h1>New Subscription Request</h1>
                <p><strong>User:</strong> Test User</p>
                <p><strong>Plan:</strong> Premium Plan</p>
                <p>Please verify payment in the admin panel.</p>
            `
        });
        if (error3) console.error('Subscription Email Failed:', error3);
        else console.log('Subscription Email Success');

        // 4. Pooja Booking Request (User -> Admin)
        const { error: error4 } = await resend.emails.send({
            from: EMAIL_FROM,
            to: [TEST_EMAIL],
            subject: 'New Pooja Booking Request - VipraKarma',
            html: `
                <h1>New Pooja Booking Request</h1>
                <p><strong>User:</strong> Test User</p>
                <p><strong>Pooja:</strong> Satyanarayan Pooja</p>
                <p><strong>Date:</strong> 2024-12-25</p>
                <p>Please review details in the admin panel.</p>
            `
        });
        if (error4) console.error('Pooja Email Failed:', error4);
        else console.log('Pooja Email Success');

    } catch (e) {
        console.error('Email Test Exception:', e);
    }
}

sendTestEmail();
