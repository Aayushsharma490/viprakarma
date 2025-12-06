import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';

export async function POST(req: NextRequest) {
  try {
    const { amount } = await req.json();

    // Generate UPI payment string
    const upiString = `upi://pay?pa=astrogensis@upi&pn=Astro Genesis&am=${amount}&cu=INR&tn=Payment for consultation`;

    // Generate QR code
    const qrCode = await QRCode.toDataURL(upiString);

    return NextResponse.json({ qrCode, upiString });
  } catch (error) {
    console.error('QR code generation error:', error);
    return NextResponse.json({ error: 'Failed to generate QR code' }, { status: 500 });
  }
}