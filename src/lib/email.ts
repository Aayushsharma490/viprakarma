import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const EMAIL_FROM = process.env.EMAIL_FROM || 'VipraKarma <onboarding@resend.dev>';

export async function sendPasswordResetEmail(email: string, resetCode: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: [email],
      subject: 'Password Reset Code - VipraKarma',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
              .code-box { background: white; border: 2px solid #10b981; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
              .code { font-size: 32px; font-weight: bold; color: #10b981; letter-spacing: 8px; }
              .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
              .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🔐 Password Reset Request</h1>
              </div>
              <div class="content">
                <p>Hello,</p>
                <p>We received a request to reset your password for your VipraKarma account.</p>
                
                <div class="code-box">
                  <p style="margin: 0; font-size: 14px; color: #6b7280;">Your verification code is:</p>
                  <div class="code">${resetCode}</div>
                  <p style="margin: 10px 0 0 0; font-size: 12px; color: #6b7280;">This code will expire in 15 minutes</p>
                </div>
                
                <p>Enter this code on the password reset page to continue.</p>
                
                <div class="warning">
                  <strong>⚠️ Security Notice:</strong><br>
                  If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
                </div>
                
                <p>Thank you,<br><strong>VipraKarma Team</strong></p>
              </div>
              <div class="footer">
                <p>This is an automated email. Please do not reply to this message.</p>
                <p>&copy; 2024 VipraKarma. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('[Email] Resend error:', error);
      return { success: false, error };
    }

    console.log('[Email] Password reset email sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('[Email] Failed to send password reset email:', error);
    return { success: false, error };
  }
}

export async function sendWelcomeEmail(email: string, name: string) {
  try {
    const { data, error } = await resend.emails.send({

      from: EMAIL_FROM,
      to: [email],
      subject: 'Welcome to VipraKarma! 🙏',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
              .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🙏 Welcome to VipraKarma!</h1>
              </div>
              <div class="content">
                <p>Dear ${name},</p>
                <p>Thank you for joining VipraKarma! We're excited to have you as part of our spiritual community.</p>
                
                <p><strong>What you can do with VipraKarma:</strong></p>
                <ul>
                  <li>📅 Get personalized Mahurat (auspicious timings)</li>
                  <li>🔮 Generate detailed Kundali reports</li>
                  <li>💬 Consult with expert astrologers</li>
                  <li>🎯 Receive spiritual guidance</li>
                </ul>
                
                <p>Your account is now active and ready to use!</p>
                
                <p>Thank you,<br><strong>VipraKarma Team</strong></p>
              </div>
              <div class="footer">
                <p>&copy; 2024 VipraKarma. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('[Email] Resend error:', error);
      return { success: false, error };
    }

    console.log('[Email] Welcome email sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('[Email] Failed to send welcome email:', error);
    return { success: false, error };
  }
}

export async function sendChatNotificationEmail(
  astrologerEmail: string,
  astrologerName: string,
  userName: string,
  chatLink: string
) {
  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: [astrologerEmail],
      subject: 'New Chat Session Request - VipraKarma',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px; }
              .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>💬 New Chat Request</h1>
              </div>
              <div class="content">
                <p>Namaste ${astrologerName},</p>
                <p>You have a new chat session request from <strong>${userName}</strong>.</p>
                
                <p>Please join the session immediately to assist the user.</p>
                
                <div style="text-align: center;">
                  <a href="${chatLink}" class="button">Join Chat Session</a>
                </div>
                
                <p style="margin-top: 20px;">Or copy this link:</p>
                <p style="word-break: break-all; color: #10b981;">${chatLink}</p>
                
                <p>Thank you,<br><strong>VipraKarma Team</strong></p>
              </div>
              <div class="footer">
                <p>&copy; 2024 VipraKarma. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('[Email] Resend error:', error);
      return { success: false, error };
    }

    console.log('[Email] Chat notification email sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('[Email] Failed to send chat notification email:', error);
    return { success: false, error };
  }
}