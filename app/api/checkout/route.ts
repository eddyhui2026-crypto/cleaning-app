import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16', // 或者最新版本
});

export async function POST(req: Request) {
  try {
    const { jobId, price, address } = await req.json();

    // 1. 建立 Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: `Cleaning Service: ${address}`,
            },
            unit_amount: Math.round(price * 100), // Stripe 用 pence 計，所以要 x 100
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      // 畀完錢返嚟邊版 (加上 Job ID 方便更新狀態)
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/client/pay/${jobId}?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/client/pay/${jobId}`,
      metadata: { jobId }, // 呢個好緊要，用嚟對數
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
