import { clerkClient } from '@clerk/nextjs/server'

export async function isAdminUser(userId: string): Promise<boolean> {
  const client = await clerkClient()
  const user = await client.users.getUser(userId)
  const primary = user.emailAddresses.find(e => e.id === user.primaryEmailAddressId)
  return primary?.emailAddress === process.env.ADMIN_EMAIL
}
