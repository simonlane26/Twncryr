import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

async function getAllSuppliers() {
  return prisma.supplier.findMany({ orderBy: { createdAt: 'desc' } })
}

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  PENDING:   { bg: '#FAEEDA', color: '#633806' },
  APPROVED:  { bg: '#E1F5EE', color: '#085041' },
  REJECTED:  { bg: '#f5f5f5', color: '#666' },
}

export default async function AdminSuppliersPage({
  searchParams,
}: {
  searchParams: Promise<{ approved?: string }>
}) {
  const user = await currentUser()
  const email = user?.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress
  if (email !== process.env.ADMIN_EMAIL) redirect('/sign-in')

  const { approved } = await searchParams
  const suppliers = await getAllSuppliers()
  const pending  = suppliers.filter(s => s.status === 'PENDING')
  const resolved = suppliers.filter(s => s.status !== 'PENDING')

  const btnBase: React.CSSProperties = {
    padding: '8px 20px', borderRadius: '6px', fontSize: '13px',
    cursor: 'pointer', border: 'none', fontFamily: 'sans-serif',
  }

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '32px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ color: '#085041', marginBottom: '8px' }}>Twncryr · Supplier applications</h1>
      <p style={{ color: '#666', fontSize: '14px', marginBottom: '32px' }}>
        {pending.length} pending · {resolved.length} resolved
      </p>
      <p style={{ fontSize: '13px', marginBottom: '24px' }}>
        <a href="/admin/claims" style={{ color: '#085041' }}>← Business claims</a>
      </p>

      {approved && (
        <div style={{ background: '#E1F5EE', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', fontSize: '14px', color: '#085041' }}>
          ✓ <strong>{approved}</strong> approved and notified.
        </div>
      )}

      {pending.length === 0 ? (
        <div style={{ background: '#f5f5f5', borderRadius: '8px', padding: '24px', textAlign: 'center', marginBottom: '32px' }}>
          <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>No pending applications ✓</p>
        </div>
      ) : (
        <>
          <h2 style={{ fontSize: '16px', marginBottom: '12px' }}>Pending ({pending.length})</h2>
          {pending.map(s => (
            <div key={s.id} style={{ border: '1px solid #e5e5e5', borderRadius: '10px', padding: '16px 20px', marginBottom: '12px', background: '#fff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div>
                  <p style={{ fontWeight: '600', fontSize: '15px', margin: '0 0 2px' }}>{s.companyName}</p>
                  <p style={{ color: '#666', fontSize: '12px', margin: 0 }}>{s.category} · min {s.minGroupSize} businesses</p>
                </div>
                <span style={{ background: STATUS_STYLES[s.status].bg, color: STATUS_STYLES[s.status].color, fontSize: '11px', fontWeight: '500', padding: '3px 10px', borderRadius: '20px' }}>
                  {s.status}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '10px' }}>
                {[
                  ['Contact', s.contactName],
                  ['Email', s.email],
                  ['Phone', s.phone ?? '—'],
                  ['Website', s.website ?? '—'],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p style={{ color: '#999', fontSize: '11px', margin: '0 0 1px' }}>{label}</p>
                    <p style={{ fontSize: '13px', margin: 0 }}>{value}</p>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: '13px', color: '#444', background: '#f9f9f9', padding: '10px 12px', borderRadius: '6px', margin: '0 0 12px', lineHeight: '1.5' }}>
                {s.offerSummary}
              </p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <form action={`/api/suppliers/${s.id}/approve`} method="POST" style={{ display: 'inline' }}>
                  <button type="submit" style={{ ...btnBase, background: '#085041', color: '#E1F5EE', fontWeight: '500' }}>✓ Approve</button>
                </form>
                <form action={`/api/suppliers/${s.id}/reject`} method="POST" style={{ display: 'inline' }}>
                  <button type="submit" style={{ ...btnBase, background: '#f5f5f5', color: '#333' }}>✗ Reject</button>
                </form>
                <a href={`mailto:${s.email}`} style={{ ...btnBase, background: 'transparent', color: '#085041', border: '1px solid #cce8e0', display: 'inline-block', lineHeight: '1.2', textDecoration: 'none' }}>✉ Email</a>
              </div>
            </div>
          ))}
        </>
      )}

      {resolved.length > 0 && (
        <>
          <h2 style={{ fontSize: '16px', marginBottom: '12px', marginTop: '32px' }}>Resolved ({resolved.length})</h2>
          {resolved.map(s => (
            <div key={s.id} style={{ border: '1px solid #e5e5e5', borderRadius: '8px', padding: '12px 16px', marginBottom: '8px', background: '#fafafa', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontWeight: '500', fontSize: '14px', margin: '0 0 2px' }}>{s.companyName}</p>
                <p style={{ color: '#999', fontSize: '12px', margin: 0 }}>{s.category} · {s.contactName}</p>
              </div>
              <span style={{ background: STATUS_STYLES[s.status].bg, color: STATUS_STYLES[s.status].color, fontSize: '11px', fontWeight: '500', padding: '3px 10px', borderRadius: '20px' }}>
                {s.status}
              </span>
            </div>
          ))}
        </>
      )}
    </div>
  )
}
