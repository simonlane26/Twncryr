import { auth } from '@clerk/nextjs/server'
import { MemberRole } from '@prisma/client'
import { prisma } from './prisma'

export async function getCurrentBusiness() {
  const { orgId } = await auth()
  if (!orgId) return null

  return prisma.business.findUnique({
    where: { clerkOrgId: orgId },
    include: { town: true },
  })
}

export async function requireBusiness() {
  const business = await getCurrentBusiness()
  if (!business) {
    throw new Error('No business found for this session')
  }
  return business
}

export async function getUserRole(): Promise<MemberRole | null> {
  const { orgRole } = await auth()
  if (!orgRole) return null

  const roleMap: Record<string, MemberRole> = {
    'org:admin': MemberRole.ADMIN,
    'org:member': MemberRole.MEMBER,
  }

  return roleMap[orgRole] ?? null
}

export async function requireRole(minimumRole: MemberRole) {
  const role = await getUserRole()
  const hierarchy: MemberRole[] = [MemberRole.MEMBER, MemberRole.ADMIN, MemberRole.OWNER]

  const userLevel = hierarchy.indexOf(role ?? MemberRole.MEMBER)
  const requiredLevel = hierarchy.indexOf(minimumRole)

  if (userLevel < requiredLevel) {
    throw new Error(`Insufficient role. Required: ${minimumRole}, got: ${role}`)
  }

  return role
}

export async function handleUserCreated(clerkUserId: string) {
  console.log('New user:', clerkUserId)
}

export async function handleOrgCreated(clerkOrgId: string, businessId: string) {
  await prisma.business.update({
    where: { id: businessId },
    data: {
      clerkOrgId,
      claimed: true,
    },
  })
}

export async function handleOrgMembershipCreated(
  clerkOrgId: string,
  clerkUserId: string,
  clerkRole: string
) {
  const business = await prisma.business.findUnique({
    where: { clerkOrgId },
  })

  if (!business) return

  const roleMap: Record<string, MemberRole> = {
    'org:admin': MemberRole.ADMIN,
    'org:member': MemberRole.MEMBER,
  }

  await prisma.businessMember.upsert({
    where: {
      businessId_clerkUserId: {
        businessId: business.id,
        clerkUserId,
      },
    },
    create: {
      businessId: business.id,
      clerkUserId,
      role: roleMap[clerkRole] ?? MemberRole.MEMBER,
    },
    update: {
      role: roleMap[clerkRole] ?? MemberRole.MEMBER,
    },
  })
}
