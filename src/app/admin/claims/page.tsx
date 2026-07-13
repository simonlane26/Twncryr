import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

async function getAllClaims() {
  return prisma.claimRequest.findMany({
    include: { business: { include: { town: true } } },
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
  searchParams: Promise<{ approved?: string }>
}) {
  const user = await currentUser()
  const email = user?.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress
  if (email !== process.env.ADMIN_EMAIL) redirect('/sign-in')

  const { approved } = await searchParams
  const claims  = await getAllClaims()
  const pending  = claims.filter(c => c.status === 'PENDING')
  const resolved = claims.filter(c => c.status !== 'PENDING')

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '32px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ color: '#085041', marginBottom: '8px' }}>Twncryr · Claim requests</h1>
      <p style={{ color: '#666', fontSize: '14px', marginBottom: '32px' }}>
        {pending.length} pending · {resolved.length} resolved
      </p>

      {approved && (
        <div style={{ background: '#E1F5EE', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', fontSize: '14px', color: '#085041' }}>
          ✓ <strong>{approved}</strong> approved and notified.
        </div>
      )}

      {pending.length === 0 ? (
        <div style={{ background: '#f5f5f5', borderRadius: '8px', padding: '24px', textAlign: 'center', marginBottom: '32px' }}>
          <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>No pending claims — you're all caught up ✓</p>
        </div>
      ) : (
        <>
          <h2 style={{ fontSize: '16px', marginBottom: '12px' }}>Pending ({pending.length})</h2>
          {pending.map(claim => (
            <ClaimCard key={claim.id} claim={claim} showActions />
          ))}
        </>
      )}

      {resolved.length > 0 && (
        <>
          <h2 style={{ fontSize: '16px', marginBottom: '12px', marginTop: '32px' }}>
            Resolved ({resolved.length})
          </h2>
          {resolved.map(claim => (
            <ClaimCard key={claim.id} claim={claim} showActions={false} />
          ))}
        </>
      )}
    </div>
  )
}

function ClaimCard({ claim, showActions }: { claim: any; showActions: boolean }) {
  const statusStyle = STATUS_STYLES[claim.status] ?? STATUS_STYLES.PENDING

  const btnBase: React.CSSProperties = {
    padding: '8px 20px', borderRadius: '6px', textDecoration: 'none', fontSize: '13px',
    cursor: 'pointer', border: 'none', fontFamily: 'sans-serif',
  }

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
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <form action={`/api/admin/claims/${claim.id}/approve`} method="POST" style={{ display: 'inline' }}>
            <button type="submit" style={{ ...btnBase, background: '#085041', color: '#E1F5EE', fontWeight: '500' }}>
              ✓ Approve
            </button>
          </form>
          <form action={`/api/admin/claims/${claim.id}/reject`} method="POST" style={{ display: 'inline' }}>
            <button type="submit" style={{ ...btnBase, background: '#f5f5f5', color: '#333' }}>
              ✗ Reject
            </button>
          </form>
          <a href={`mailto:${claim.email}`} style={{ ...btnBase, background: 'transparent', color: '#085041', border: '1px solid #cce8e0', display: 'inline-block', lineHeight: '1.2' }}>
            ✉ Email claimant
          </a>
        </div>
      )}
    </div>
  )
}
