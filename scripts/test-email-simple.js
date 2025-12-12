
require('dotenv').config({ path: '.env.local' });
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

async function testEmail() {
    console.log('Testing Resend Email...');
    console.log('API Key present:', !!process.env.RESEND_API_KEY);
    if (process.env.RESEND_API_KEY) {
        console.log('API Key start:', process.env.RESEND_API_KEY.substring(0, 5) + '...');
    }

    const emailFrom = process.env.EMAIL_FROM || 'onboarding@resend.dev';
    console.log('Sending from:', emailFrom);

    try {
        const { data, error } = await resend.emails.send({
            from: emailFrom,
            to: 'aayushsharms2005@gmail.com', // Restricted to this email until domain verified
            subject: 'Test Email from VipraKarma Script',
            html: '<p>If you see this, <strong>Resend is working!</strong></p>'
        });

        if (error) {
            console.error('❌ Resend Error:', error);
        } else {
            console.log('✅ Email sent successfully!', data);
        }
    } catch (err) {
        console.error('❌ Unexpected Error:', err);
    }
}

testEmail();
