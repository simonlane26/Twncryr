import { NextRequest, NextResponse } from 'next/server'
import { Webhook } from 'svix'
import {
  handleUserCreated,
  handleOrgCreated,
  handleOrgMembershipCreated,
} from '@/lib/clerk'

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET
  if (!webhookSecret) {
    return NextResponse.json({ error: 'Missing webhook secret' }, { status: 500 })
  }

  const svixId = req.headers.get('svix-id')
  const svixTimestamp = req.headers.get('svix-timestamp')
  const svixSignature = req.headers.get('svix-signature')

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 })
  }

  const body = await req.text()
  const wh = new Webhook(webhookSecret)

  let event: any
  try {
    event = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    })
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  switch (event.type) {
    case 'user.created':
      await handleUserCreated(event.data.id)
      break

    case 'organization.created':
      if (event.data.public_metadata?.businessId) {
        await handleOrgCreated(event.data.id, event.data.public_metadata.businessId)
      }
      break

    case 'organizationMembership.created':
      await handleOrgMembershipCreated(
        event.data.organization.id,
        event.data.public_user_data.user_id,
        event.data.role
      )
      break
  }

  return NextResponse.json({ received: true })
}
