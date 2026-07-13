import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

async function getAllClaims() {
  return prisma.claimRequest.findMany({
    include: {
      business: { include: { town: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
}

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  PENDING:  { bg: '#FAEEDA', color: '#633806' },
  APPROVED: { bg: '#E1F5EE', color: '#085041' },
  REJECTED: { bg: '#f5f5f5', color: '#666' },
}

export default async function AdminClaimsPage({
  searchParams,
}: {
  searchParams: Promise<{ secret?: string }>
}) {
  const { secret } = await searchParams

  if (secret !== process.env.ADMIN_SECRET) {
    redirect('/')
  }

  const claims = await getAllClaims()
  const pending  = claims.filter(c => c.status === 'PENDING')
  const resolved = claims.filter(c => c.status !== 'PENDING')

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '32px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ color: '#085041', marginBottom: '8px' }}>Twncryr · Claim requests</h1>
      <p style={{ color: '#666', fontSize: '14px', marginBottom: '32px' }}>
        {pending.length} pending · {resolved.length} resolved
      </p>

      {pending.length === 0 ? (
        <div style={{ background: '#f5f5f5', borderRadius: '8px', padding: '24px', textAlign: 'center', marginBottom: '32px' }}>
          <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>No pending claims — you're all caught up ✓</p>
        </div>
      ) : (
        <>
          <h2 style={{ fontSize: '16px', marginBottom: '12px' }}>Pending ({pending.length})</h2>
          {pending.map(claim => (
            <ClaimCard key={claim.id} claim={claim} secret={secret!} showActions />
          ))}
        </>
      )}

      {resolved.length > 0 && (
        <>
          <h2 style={{ fontSize: '16px', marginBottom: '12px', marginTop: '32px' }}>
            Resolved ({resolved.length})
          </h2>
          {resolved.map(claim => (
            <ClaimCard key={claim.id} claim={claim} secret={secret!} showActions={false} />
          ))}
        </>
      )}
    </div>
  )
}

function ClaimCard({
  claim,
  secret,
  showActions,
}: {
  claim: any
  secret: string
  showActions: boolean
}) {
  const statusStyle = STATUS_STYLES[claim.status] ?? STATUS_STYLES.PENDING
  const approveUrl  = `/api/admin/claims/${claim.id}/approve?secret=${secret}`
  const rejectUrl   = `/api/admin/claims/${claim.id}/reject?secret=${secret}`

  return (
    <div style={{ border: '1px solid #e5e5e5', borderRadius: '10px', padding: '16px 20px', marginBottom: '12px', background: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
        <div>
          <p style={{ fontWeight: '600', fontSize: '15px', margin: '0 0 2px' }}>{claim.business.name}</p>
          <p style={{ color: '#666', fontSize: '12px', margin: 0 }}>
            {claim.business.town.name} · {claim.business.address ?? 'No address'}
          </p>
        </div>
        <span style={{ background: statusStyle.bg, color: statusStyle.color, fontSize: '11px', fontWeight: '500', padding: '3px 10px', borderRadius: '20px' }}>
          {claim.status}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '12px' }}>
        {[
          ['Claimant', claim.name],
          ['Email',    claim.email],
          ['Role',     claim.role ?? '—'],
          ['Submitted', new Date(claim.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })],
        ].map(([label, value]) => (
          <div key={label}>
            <p style={{ color: '#999', fontSize: '11px', margin: '0 0 1px' }}>{label}</p>
            <p style={{ fontSize: '13px', margin: 0 }}>{value}</p>
          </div>
        ))}
      </div>

      {showActions && (
        <div style={{ display: 'flex', gap: '10px' }}>
          <a href={approveUrl} style={{ background: '#085041', color: '#E1F5EE', padding: '8px 20px', borderRadius: '6px', textDecoration: 'none', fontSize: '13px', fontWeight: '500' }}>
            ✓ Approve
          </a>
          <a href={rejectUrl} style={{ background: '#f5f5f5', color: '#333', padding: '8px 20px', borderRadius: '6px', textDecoration: 'none', fontSize: '13px' }}>
            ✗ Reject
          </a>
          <a href={`mailto:${claim.email}`} style={{ background: 'transparent', color: '#085041', padding: '8px 20px', borderRadius: '6px', textDecoration: 'none', fontSize: '13px', border: '1px solid #cce8e0' }}>
            ✉ Email claimant
          </a>
        </div>
      )}
    </div>
  )
}
