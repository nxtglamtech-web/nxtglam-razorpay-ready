'use server'

import 'server-only'
import { Resend } from 'resend'
import crypto from 'node:crypto'
import { createClient } from '@supabase/supabase-js'
import { getProduct } from '../../lib/products'

const RAZORPAY_API = 'https://api.razorpay.com/v1'
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseSecret = process.env.SUPABASE_SECRET_KEY

function getCredentials() {
  const keyId = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET

  if (!keyId || !keySecret) {
    throw new Error('Razorpay credentials are missing')
  }

  return { keyId, keySecret }
}

function getSupabase() {
  if (!supabaseUrl || !supabaseSecret) {
    throw new Error('Supabase server settings are missing')
  }

  return createClient(supabaseUrl, supabaseSecret, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

type CustomerDetails = {
  name: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  pincode: string
}

export async function createRazorpayOrder(
  cart: Record<string, number>,
  customer: CustomerDetails,
) {
  const name = customer.name?.trim()
  const email = customer.email?.trim().toLowerCase()
  const phone = customer.phone?.replace(/\D/g, '')
  const address = customer.address?.trim()
  const city = customer.city?.trim()
  const state = customer.state?.trim()
  const pincode = customer.pincode?.trim()

  if (!name || name.length > 100) throw new Error('Enter a valid customer name')
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Enter a valid email')
  if (!phone || phone.length < 10 || phone.length > 13) throw new Error('Enter a valid mobile number')
  if (!address || address.length > 500) throw new Error('Enter your full delivery address')
  if (!city || !state || !/^\d{6}$/.test(pincode)) throw new Error('Enter valid city, state and 6-digit pincode')

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

  if (lineItems.length === 0) throw new Error('Your cart is empty')

  const total = lineItems.reduce((sum, item) => sum + item.amount, 0)
  const { keyId, keySecret } = getCredentials()

  const response = await fetch(`${RAZORPAY_API}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`,
    },
    body: JSON.stringify({
      amount: total,
      currency: 'INR',
      receipt: `nxtglam_${Date.now()}`,
      notes: { store: 'NxtGlam' },
    }),
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(`Razorpay order creation failed: ${await response.text()}`)
  }

  const razorpayOrder = await response.json()
  const supabase = getSupabase()

  const { data: savedOrder, error: orderError } = await supabase
    .from('orders')
    .insert({
      customer_name: name,
      customer_email: email,
      customer_phone: phone,
      address,
      city,
      state,
      pincode,
      total_amount: total,
      currency: 'INR',
      status: 'pending',
      razorpay_order_id: razorpayOrder.id,
    })
    .select('id')
    .single()

  if (orderError || !savedOrder) {
    throw new Error(`Could not save order: ${orderError?.message ?? 'Unknown database error'}`)
  }

  const { error: itemsError } = await supabase.from('order_items').insert(
    lineItems.map(item => ({
      order_id: savedOrder.id,
      product_id: item.product.id,
      product_name: item.product.name,
      price: item.product.priceInCents,
      quantity: item.quantity,
    })),
  )

  if (itemsError) {
    await supabase.from('orders').delete().eq('id', savedOrder.id)
    throw new Error(`Could not save order items: ${itemsError.message}`)
  }

  return {
    orderId: razorpayOrder.id as string,
    amount: razorpayOrder.amount as number,
    currency: razorpayOrder.currency as string,
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

  const { keyId, keySecret } = getCredentials()

  const expectedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex')

  const signaturesMatch =
    expectedSignature.length === signature.length &&
    crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(signature))

  if (!signaturesMatch) throw new Error('Payment signature verification failed')

  const supabase = getSupabase()

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('id,total_amount,status,customer_email,customer_name,address,city,state,pincode')
    .eq('razorpay_order_id', orderId)
    .single()

  if (orderError || !order) throw new Error('Order not found in NxtGlam database')
  if (order.status === 'paid') return { verified: true }

  const paymentResponse = await fetch(`${RAZORPAY_API}/payments/${paymentId}`, {
    headers: {
      Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`,
    },
    cache: 'no-store',
  })

  if (!paymentResponse.ok) throw new Error('Could not confirm payment with Razorpay')

  const payment = await paymentResponse.json()

  if (
    payment.order_id !== orderId ||
    payment.amount !== order.total_amount ||
    payment.currency !== 'INR' ||
    payment.status !== 'captured'
  ) {
    throw new Error('Payment is not confirmed as captured. Please contact NxtGlam support.')
  }

  const { error: updateError } = await supabase
    .from('orders')
    .update({
      status: 'paid',
      razorpay_payment_id: paymentId,
      signature_verified: true,
    })
    .eq('id', order.id)

  if (updateError) throw new Error('Payment verified, but order update failed. Contact NxtGlam support.')

  const { data: orderItems, error: itemsQueryError } = await supabase
    .from('order_items')
    .select('product_name,price,quantity')
    .eq('order_id', order.id)

  if (itemsQueryError) console.error('NXTGLAM invoice items query failed:', itemsQueryError)

  if (process.env.RESEND_API_KEY && order.customer_email) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY)
      const escapeHtml = (value: unknown) => String(value ?? '').replace(/[&<>"']/g, (char) => {
        switch (char) {
          case '&': return '&amp;'
          case '<': return '&lt;'
          case '>': return '&gt;'
          case '"': return '&quot;'
          case "'": return '&#39;'
          default: return char
        }
      })

      const itemRows = (orderItems || []).map((item) => `
        <tr>
          <td style="padding:12px;border-bottom:1px solid #eee;">${escapeHtml(item.product_name)}</td>
          <td style="padding:12px;text-align:center;border-bottom:1px solid #eee;">${item.quantity}</td>
          <td style="padding:12px;text-align:right;border-bottom:1px solid #eee;">INR ${(item.price / 100).toFixed(2)}</td>
          <td style="padding:12px;text-align:right;border-bottom:1px solid #eee;">INR ${((item.price * item.quantity) / 100).toFixed(2)}</td>
        </tr>
      `).join('')

      const deliveryAddress = [order.address, order.city, order.state, order.pincode]
        .filter(Boolean)
        .map(escapeHtml)
        .join(', ')

      const amountPaid = (order.total_amount / 100).toFixed(2)
      const customerName = escapeHtml(order.customer_name || 'Customer')

      const { error: emailError } = await resend.emails.send({
        from: 'NXTGLAM <support@nxtglam.co.in>',
        to: order.customer_email,
        subject: 'Your NXTGLAM order is confirmed!',
        text: `Hi ${order.customer_name || 'Customer'},

Thank you for shopping with NXTGLAM!
Your payment has been received successfully.

Order ID: ${orderId}
${(orderItems || []).map((item) => `${item.product_name} | Qty: ${item.quantity} | INR ${(item.price * item.quantity / 100).toFixed(2)}`).join('\n')}
Amount paid: INR ${amountPaid}
Delivery address: ${deliveryAddress || 'Not available'}

Team NXTGLAM
support@nxtglam.co.in`,
        html: `
          <div style="margin:0;padding:30px 12px;background:#f5f5f5;font-family:Arial,sans-serif;color:#222;">
            <div style="max-width:650px;margin:auto;background:#fff;border:1px solid #eee;border-radius:12px;overflow:hidden;">
              <div style="padding:28px;text-align:center;background:#171717;color:#fff;">
                <h1 style="margin:0;letter-spacing:4px;">NXTGLAM</h1>
                <p style="margin:8px 0 0;color:#ddd;">ORDER CONFIRMATION</p>
              </div>
              <div style="padding:28px;">
                <p>Hi ${customerName},</p>
                <h2 style="color:#218653;">Payment successful!</h2>
                <p>Thank you for shopping with NXTGLAM. Your order is confirmed.</p>
                <p><strong>Order ID:</strong> ${escapeHtml(orderId)}</p>
                <p><strong>Payment status:</strong> PAID</p>
                <h3 style="margin-top:28px;">Order details</h3>
                <table style="width:100%;border-collapse:collapse;font-size:14px;">
                  <thead>
                    <tr style="background:#f5f5f5;">
                      <th style="padding:12px;text-align:left;">Product</th>
                      <th style="padding:12px;">Qty</th>
                      <th style="padding:12px;text-align:right;">Price</th>
                      <th style="padding:12px;text-align:right;">Total</th>
                    </tr>
                  </thead>
                  <tbody>${itemRows || '<tr><td colspan="4" style="padding:12px;">Product details unavailable</td></tr>'}</tbody>
                </table>
                <p style="text-align:right;font-size:20px;margin:24px 0;"><strong>Amount paid: INR ${amountPaid}</strong></p>
                <div style="padding:16px;background:#f7f7f7;border-radius:8px;">
                  <h3 style="margin:0 0 8px;">Delivery address</h3>
                  <p style="margin:0;">${deliveryAddress || 'Address not available'}</p>
                </div>
                <p style="margin-top:28px;">Thank you,<br/><strong>Team NXTGLAM</strong></p>
              </div>
              <div style="padding:18px;text-align:center;background:#171717;color:#ddd;font-size:12px;">
                Need help? support@nxtglam.co.in
              </div>
            </div>
          </div>
        `,
      })

      if (emailError) console.error('NXTGLAM email failed:', emailError)
    } catch (emailError) {
      console.error('NXTGLAM email error:', emailError)
    }
  }
  return { verified: true }
}
