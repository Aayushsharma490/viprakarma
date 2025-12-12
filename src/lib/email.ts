import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: `"Viprakarma" <${process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
}

export async function sendWelcomeEmail(email: string, name: string): Promise<boolean> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #d97706;">Welcome to Viprakarma! 🙏</h1>
      <p>Hi ${name},</p>
      <p>Thank you for joining Viprakarma. We're excited to help you discover your cosmic blueprint and spiritual path!</p>
      <p>Get started by:</p>
      <ul>
        <li>Generating your personalized Kundali</li>
        <li>Exploring numerology insights</li>
        <li>Chatting with our AI Astrologer</li>
        <li>Booking consultations with expert pandits and astrologers</li>
      </ul>
      <p>Namaste,<br>The Viprakarma Team</p>
    </div>
  `;
  
  return sendEmail({
    to: email,
    subject: 'Welcome to Viprakarma',
    html,
  });
}

export async function sendBookingConfirmation(
  email: string,
  name: string,
  bookingDetails: any
): Promise<boolean> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #d97706;">Booking Confirmed! ✅</h1>
      <p>Hi ${name},</p>
      <p>Your booking has been confirmed. Here are the details:</p>
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Service:</strong> ${bookingDetails.serviceType}</p>
        <p><strong>Date:</strong> ${bookingDetails.scheduledDate}</p>
        <p><strong>Time:</strong> ${bookingDetails.scheduledTime}</p>
        <p><strong>Duration:</strong> ${bookingDetails.duration} minutes</p>
        <p><strong>Amount:</strong> ₹${bookingDetails.amount}</p>
      </div>
      <p>We look forward to serving you!</p>
      <p>Namaste,<br>Viprakarma</p>
    </div>
  `;
  
  return sendEmail({
    to: email,
    subject: 'Booking Confirmation - Viprakarma',
    html,
  });
}

export async function sendPaymentReceipt(
  email: string,
  name: string,
  paymentDetails: any
): Promise<boolean> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #d97706;">Payment Receipt 💳</h1>
      <p>Hi ${name},</p>
      <p>Thank you for your payment. Here are the details:</p>
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Amount Paid:</strong> ₹${paymentDetails.amount}</p>
        <p><strong>Payment ID:</strong> ${paymentDetails.razorpayPaymentId}</p>
        <p><strong>Order ID:</strong> ${paymentDetails.razorpayOrderId}</p>
        <p><strong>Status:</strong> ${paymentDetails.status}</p>
      </div>
      <p>This is your official receipt for the transaction.</p>
      <p>Namaste,<br>Viprakarma</p>
    </div>
  `;
  
  return sendEmail({
    to: email,
    subject: 'Payment Receipt - Viprakarma',
    html,
  });
}