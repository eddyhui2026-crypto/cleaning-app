"use client"

import React, { useState } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "")

type PaymentFormWrapperProps = {
  quoteId: string
  amount: number
  onSuccess: () => void
}

function CheckoutForm({ quoteId, amount, onSuccess }: PaymentFormWrapperProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setLoading(true)
    // create payment intent on backend
    const res = await fetch("/api/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quoteId, amount }),
    })
    const { clientSecret } = await res.json()
    const result = await stripe.confirmCardPayment(clientSecret, { payment_method: { card: elements.getElement(CardElement)! } })
    if (result.error) alert(result.error.message)
    else onSuccess()
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <CardElement className="p-2 border rounded" />
      <button type="submit" disabled={!stripe || loading} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
        Pay £{amount}
      </button>
    </form>
  )
}

export default function PaymentFormWrapper(props: PaymentFormWrapperProps) {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm {...props} />
    </Elements>
  )
}