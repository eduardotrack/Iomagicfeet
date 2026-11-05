interface Subscription {
  name: string
  email: string
  skuId: string
}

const ALLOWED_FIELDS = ['name', 'email', 'skuId', 'acceptTerms']
const CONTROL_CHARACTERS = /[\u0000-\u001f\u007f]/

export function validateSubscription(body: unknown): Subscription | null {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null

  const input = body as Record<string, unknown>
  if (Object.keys(input).some(key => !ALLOWED_FIELDS.includes(key))) return null
  if (input.acceptTerms !== true || typeof input.name !== 'string' ||
    typeof input.email !== 'string' || typeof input.skuId !== 'string') return null

  const name = input.name.trim()
  const email = input.email.trim().toLowerCase()
  const skuId = input.skuId.trim()

  if (name.length < 2 || name.length > 100 || CONTROL_CHARACTERS.test(name)) return null
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    CONTROL_CHARACTERS.test(email)) return null
  if (!/^[1-9]\d{0,19}$/.test(skuId)) return null

  return { name, email, skuId }
}
