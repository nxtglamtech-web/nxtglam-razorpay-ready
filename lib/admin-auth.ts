import 'server-only'
import crypto from 'node:crypto'
import { cookies } from 'next/headers'

const COOKIE_NAME = 'nxtglam_admin_session'
const SESSION_DURATION = 12 * 60 * 60 * 1000

export async function isAdminAuthenticated() {
  const secret = process.env.ADMIN_SESSION_SECRET
  if (!secret) return false

  const store = await cookies()
  const value = store.get(COOKIE_NAME)?.value
  if (!value) return false

  const [timestamp, signature] = value.split('.')
  const issuedAt = Number(timestamp)

  if (!timestamp || !signature || !Number.isFinite(issuedAt)) return false
  if (Date.now() - issuedAt > SESSION_DURATION || issuedAt > Date.now() + 60000) return false

  const expected = crypto.createHmac('sha256', secret).update(timestamp).digest('hex')
  const actualBuffer = Buffer.from(signature)
  const expectedBuffer = Buffer.from(expected)

  return actualBuffer.length === expectedBuffer.length &&
    crypto.timingSafeEqual(actualBuffer, expectedBuffer)
}
