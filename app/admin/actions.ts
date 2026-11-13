'use server'

import { revalidatePath } from 'next/cache'
import { isAdminAuthenticated } from '../../lib/admin-auth'
import { supabaseAdmin } from '../../lib/supabase-admin'

import 'server-only'
import crypto from 'node:crypto'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function loginAdmin(formData: FormData) {
  const configuredPassword = process.env.ADMIN_PASSWORD
  const secret = process.env.ADMIN_SESSION_SECRET
  const enteredPassword = String(formData.get('password') ?? '')

  if (!configuredPassword || !secret) {
    throw new Error('Admin security settings are missing')
  }

  const enteredHash = crypto.createHash('sha256').update(enteredPassword).digest()
  const configuredHash = crypto.createHash('sha256').update(configuredPassword).digest()

  if (!crypto.timingSafeEqual(enteredHash, configuredHash)) {
    redirect('/admin?error=1')
  }

  const timestamp = Date.now().toString()
  const signature = crypto.createHmac('sha256', secret).update(timestamp).digest('hex')
  const store = await cookies()

  store.set('nxtglam_admin_session', `${timestamp}.${signature}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/admin',
    maxAge: 12 * 60 * 60,
  })

  redirect('/admin')
}

export async function logoutAdmin() {
  const store = await cookies()

  store.set('nxtglam_admin_session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/admin',
    maxAge: 0,
    expires: new Date(0),
  })

  redirect('/admin')
}

export async function updateDeliveryStatus(formData: FormData) {
  if (!(await isAdminAuthenticated())) redirect('/admin')

  const orderId = String(formData.get('orderId') ?? '')
  const deliveryStatus = String(formData.get('deliveryStatus') ?? '')
  const allowed = ['processing', 'shipped', 'delivered', 'cancelled']

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId) || !allowed.includes(deliveryStatus)) {
    throw new Error('Invalid order or delivery status')
  }

  const { error } = await supabaseAdmin.from('orders').update({ delivery_status: deliveryStatus }).eq('id', orderId)
  if (error) throw new Error('Could not update delivery status')

  revalidatePath('/admin')
}

export async function updateCourierDetails(formData: FormData) {
  if (!(await isAdminAuthenticated())) redirect('/admin')

  const orderId = String(formData.get('orderId') ?? '')
  const courierName = String(formData.get('courierName') ?? '').trim()
  const trackingNumber = String(formData.get('trackingNumber') ?? '').trim()
  const trackingUrl = String(formData.get('trackingUrl') ?? '').trim()

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId)) {
    throw new Error('Invalid order ID')
  }

  if (trackingUrl && !/^https:\/\/\S+$/i.test(trackingUrl)) {
    throw new Error('Tracking link must start with https://')
  }

  const { error } = await supabaseAdmin
    .from('orders')
    .update({
      courier_name: courierName || null,
      tracking_number: trackingNumber || null,
      tracking_url: trackingUrl || null,
    })
    .eq('id', orderId)

  if (error) throw new Error('Could not save courier details')

  revalidatePath('/admin')
}
