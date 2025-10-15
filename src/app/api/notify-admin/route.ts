import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const { userName, userEmail, consultationType, amount } = await request.json();

    if (!userName || !userEmail || !consultationType || !amount) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Nodemailer transporter setup
    // IMPORTANT: Yeh details aapko apne .env.local file mein daalni hongi
    const transporter = nodemailer.createTransport({
      service: 'gmail', // Aap koi bhi email service use kar sakte hain
      auth: {
        user: process.env.EMAIL_USER, // Aapki email ID
        pass: process.env.EMAIL_PASS, // Aapka email App Password
      },
    });

    // Admin ko bhejne wala email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL, // Admin ki email ID
      subject: `New Consultation Booking: ${consultationType}`,
      html: `
        <h1>New Consultation Booking Received</h1>
        <p>A new payment has been successfully processed. Please contact the user to schedule the session.</p>
        <h2>Booking Details:</h2>
        <ul>
          <li><strong>User Name:</strong> ${userName}</li>
          <li><strong>User Email:</strong> ${userEmail}</li>
          <li><strong>Consultation Type:</strong> ${consultationType}</li>
          <li><strong>Amount Paid:</strong> ₹${amount}</li>
        </ul>
        <p><strong>Next Step:</strong> Please reply to this user at <strong>${userEmail}</strong> with the session link or further instructions.</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: 'Notification sent successfully!' }, { status: 200 });

  } catch (error) {
    console.error('Failed to send email:', error);
    return NextResponse.json({ message: 'Failed to send notification' }, { status: 500 });
  }
}