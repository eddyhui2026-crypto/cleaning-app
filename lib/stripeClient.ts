import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "";

// 將 apiVersion 改成 Vercel 要求嘅版本，並加上 "as any" 確保編譯通過
export const stripe = new Stripe(stripeSecretKey, { 
  apiVersion: "2025-02-24.acacia" as any 
});