import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { amount } = await req.json();

    // Just return the static QR code path + upiString
    const upiString = `upi://pay?pa=astrogensis@upi&pn=Astro Genesis&am=${amount}&cu=INR&tn=Payment for consultation`;
    const qrCode = '/qr.png'; // static QR image

    return NextResponse.json({ qrCode, upiString });
  } catch (error) {
    console.error('QR code API error:', error);
    return NextResponse.json({ error: 'Failed to get QR code' }, { status: 500 });
  }
}
