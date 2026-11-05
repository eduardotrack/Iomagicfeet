import { json } from 'co-body'

import type { Context } from '../index'
import { validateSubscription } from '../validation/subscription'

const FAILURE_MESSAGE = 'Não foi possível cadastrar o aviso. Tente novamente.'

export async function subscribeAvailability(ctx: Context) {
  ctx.set('Cache-Control', 'no-store, private')
  ctx.set('Pragma', 'no-cache')

  // Origin checks mitigate CSRF; they do not authenticate callers.
  const origin = ctx.get('origin')
  if (ctx.get('sec-fetch-site') === 'cross-site' ||
    (origin && !isSameOrigin(origin, ctx.host))) {
    ctx.status = 403
    ctx.body = { message: 'Origem não permitida.' }
    return
  }

  if (!ctx.is('application/json')) {
    ctx.status = 415
    ctx.body = { message: 'Envie os dados em JSON.' }
    return
  }

  let body: unknown
  try {
    body = await json(ctx.req, { limit: '4kb', strict: true })
  } catch (error) {
    ctx.status = error.status === 413 ? 413 : 400
    ctx.body = { message: 'Dados inválidos.' }
    return
  }

  const subscription = validateSubscription(body)
  if (!subscription) {
    ctx.status = 400
    ctx.body = { message: 'Verifique nome, email, tamanho e aceite dos termos.' }
    return
  }

  try {
    // App identity inserts validated anonymous opt-ins only.
    const saved = await ctx.clients.masterdata.createDocument({
      dataEntity: 'AS',
      fields: {
        name: subscription.name,
        email: subscription.email,
        skuId: subscription.skuId,
        createdAt: new Date().toISOString(),
      },
    })

    if (!saved || !saved.DocumentId) {
      throw new Error('Missing document confirmation')
    }

    ctx.status = 201
    ctx.body = { success: true }
  } catch (error) {
    const upstreamStatus = error.response && error.response.status
    ctx.vtex.logger.error({
      message: 'availability-subscription-save-failed',
      upstreamStatus: typeof upstreamStatus === 'number' ? upstreamStatus : undefined,
    })

    ctx.status = upstreamStatus === 429 ? 429 : 502
    if (ctx.status === 429) ctx.set('Retry-After', '60')
    ctx.body = { message: FAILURE_MESSAGE }
  }
}

function isSameOrigin(origin: string, host: string): boolean {
  try {
    const parsed = new URL(origin)
    return parsed.protocol === 'https:' && parsed.host === host
  } catch {
    return false
  }
}
