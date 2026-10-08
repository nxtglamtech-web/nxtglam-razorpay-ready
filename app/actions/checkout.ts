'use server'

import crypto from 'node:crypto'
import { headers } from 'next/headers'
import { getProduct } from '../../lib/products'

const RAZORPAY_API = 'https://api.razorpay.com/v1/orders'

function getRazorpayCredentials() {
  const keyId = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET

  if (!keyId || !keySecret) {
    throw new Error('Razorpay keys are not configured. Add them to .env.local')
  }

  return { keyId, keySecret }
}

export async function createRazorpayOrder(cart: Record<string, number>) {
  const lineItems = Object.entries(cart).map(([productId, quantity]) => {
    const product = getProduct(productId)

    if (!product || !Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
      throw new Error('Invalid cart')
    }

    return {
      product,
      quantity,
      amount: product.priceInCents * quantity,
    }
  })

  if (lineItems.length === 0) {
    throw new Error('Your cart is empty')
  }

  const total = lineItems.reduce((sum, item) => sum + item.amount, 0)
  const { keyId, keySecret } = getRazorpayCredentials()

  const requestHeaders = await headers()
  const origin = requestHeaders.get('origin') ?? 'http://localhost:3000'

  const receipt = `nxtglam_${Date.now()}`

  const response = await fetch(RAZORPAY_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`,
    },
    body: JSON.stringify({
      amount: total,
      currency: 'INR',
      receipt,
      notes: {
        store: 'NxtGlam',
        origin,
      },
    }),
    cache: 'no-store',
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Razorpay order creation failed: ${error}`)
  }

  const order = await response.json()

  return {
    orderId: order.id as string,
    amount: order.amount as number,
    currency: order.currency as string,
    keyId,
  }
}

export async function verifyRazorpayPayment({
  orderId,
  paymentId,
  signature,
}: {
  orderId: string
  paymentId: string
  signature: string
}) {
  if (!orderId || !paymentId || !signature) {
    throw new Error('Missing payment verification details')
  }

  const { keySecret } = getRazorpayCredentials()

  const expectedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex')

  const signaturesMatch =
    expectedSignature.length === signature.length &&
    crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(signature),
    )

  if (!signaturesMatch) {
    throw new Error('Payment verification failed')
  }

  return { verified: true }
}
