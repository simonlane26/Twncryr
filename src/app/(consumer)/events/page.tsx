import { requireTown } from '@/lib/town'
import { prisma } from '@/lib/prisma'
import { CalendarBlank } from '@phosphor-icons/react/dist/ssr'

export default async function EventsPage() {
  const town = await requireTown()

  const events = await prisma.event.findMany({
    where: {
      town: { slug: town.slug },
      active: true,
    },
    orderBy: { startDate: 'asc' },
  })

  const upcoming = events.filter(e => e.startDate >= new Date())
  const past = events.filter(e => e.startDate < new Date())

  return (
    <main className="bg-[var(--color-background-tertiary)] min-h-screen">
      <div className="bg-[var(--color-background-primary)] border-b border-[var(--color-border-tertiary)] px-5 py-6">
        <p className="text-[10px] font-medium tracking-[1.8px] uppercase text-[#0F6E56] mb-2">{town.name}</p>
        <h1 className="font-[family-name:var(--font-fraunces)] text-[24px] font-semibold">What&apos;s on</h1>
      </div>

      <div className="p-5 max-w-2xl">
        {upcoming.length === 0 && (
          <div className="text-center py-16">
            <CalendarBlank size={40} className="text-[var(--color-border-secondary)] mx-auto mb-3" />
            <p className="text-[14px] text-[var(--color-text-secondary)]">No upcoming events yet.</p>
          </div>
        )}

        {upcoming.length > 0 && (
          <>
            <p className="text-[10px] font-medium tracking-[1.4px] uppercase text-[var(--color-text-secondary)] mb-3">Upcoming</p>
            <div className="flex flex-col gap-3 mb-8">
              {upcoming.map(event => (
                <div key={event.id} className="bg-[var(--color-background-primary)] border border-[var(--color-border-tertiary)] rounded-xl p-4">
                  <div className="flex gap-4 items-start">
                    <div className="w-14 flex-shrink-0 text-center bg-[#E1F5EE] rounded-lg p-2">
                      <p className="text-[10px] font-medium text-[#085041] uppercase">
                        {event.startDate.toLocaleDateString('en-GB', { month: 'short' })}
                      </p>
                      <p className="text-[20px] font-semibold text-[#0F6E56] leading-none">
                        {event.startDate.getDate()}
                      </p>
                    </div>
                    <div className="flex-1">
                      <p className="text-[14px] font-medium text-[var(--color-text-primary)]">{event.title}</p>
                      {event.description && (
                        <p className="text-[12px] text-[var(--color-text-secondary)] leading-relaxed mt-1">{event.description}</p>
                      )}
                      {event.location && (
                        <p className="text-[11px] text-[var(--color-text-secondary)] mt-2">📍 {event.location}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {past.length > 0 && (
          <>
            <p className="text-[10px] font-medium tracking-[1.4px] uppercase text-[var(--color-text-secondary)] mb-3">Past events</p>
            <div className="flex flex-col gap-2 opacity-60">
              {past.slice(0, 5).map(event => (
                <div key={event.id} className="bg-[var(--color-background-primary)] border border-[var(--color-border-tertiary)] rounded-xl p-3 flex items-center gap-3">
                  <CalendarBlank size={16} className="text-[var(--color-text-secondary)]" />
                  <div>
                    <p className="text-[13px] font-medium text-[var(--color-text-primary)]">{event.title}</p>
                    <p className="text-[11px] text-[var(--color-text-secondary)]">
                      {event.startDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  )
}
