import type { Event } from '@prisma/client'

// Server component — static, no real-time needed for events

function formatEventDate(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

function formatEventTime(date: Date, allDay: boolean): string {
  if (allDay) return 'All day'
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

function isToday(date: Date): boolean {
  const now = new Date()
  return (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  )
}

function isThisWeek(date: Date): boolean {
  const now = new Date()
  const diff = date.getTime() - now.getTime()
  return diff >= 0 && diff < 7 * 24 * 60 * 60 * 1000
}

export default function EventsSidebar({
  events,
  townName,
}: {
  events: Event[]
  townName: string
}) {
  return (
    <div className="bg-[var(--color-background-primary)] border border-[var(--color-border-tertiary)] rounded-xl p-4">
      <p className="text-[10px] font-medium tracking-[1.2px] uppercase text-[var(--color-text-secondary)] mb-3 flex items-center gap-1.5">
        <i className="ti ti-calendar text-[13px] text-[#0F6E56]" aria-hidden="true" />
        Coming up in {townName}
      </p>

      {events.length === 0 ? (
        <p className="text-[12px] text-[var(--color-text-secondary)] py-2">
          No upcoming events yet.
        </p>
      ) : (
        <div className="flex flex-col">
          {events.map((event, i) => {
            const today = isToday(event.startDate)
            const thisWeek = isThisWeek(event.startDate)

            return (
              <div
                key={event.id}
                className={`py-2.5 ${i < events.length - 1 ? 'border-b border-[var(--color-border-tertiary)]' : ''}`}
              >
                {/* Date */}
                <div className="flex items-center gap-1.5 mb-1">
                  <p className="text-[10px] font-medium text-[#0F6E56] uppercase tracking-[0.8px]">
                    {today
                      ? 'Today'
                      : thisWeek
                      ? formatEventDate(event.startDate).replace(/^\w+,\s/, '') // drop weekday for non-today
                      : formatEventDate(event.startDate)
                    }
                  </p>
                  {today && (
                    <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-[#0F6E56] text-[#E1F5EE]">
                      TODAY
                    </span>
                  )}
                  {event.featured && !today && (
                    <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-[#F3E8FF] text-[#5B21B6]">
                      FEATURED
                    </span>
                  )}
                </div>

                {/* Title */}
                <p className="text-[13px] font-medium text-[var(--color-text-primary)] mb-0.5">
                  {event.title}
                </p>

                {/* Location + time */}
                <p className="text-[11px] text-[var(--color-text-secondary)]">
                  {event.location && `${event.location} · `}
                  {formatEventTime(event.startDate, event.allDay)}
                  {event.endDate && event.allDay && ' – ' + formatEventDate(event.endDate)}
                </p>
              </div>
            )
          })}
        </div>
      )}

      <a
        href="/events"
        className="block text-center text-[11px] text-[#0F6E56] mt-3 hover:underline no-underline"
      >
        See all events →
      </a>
    </div>
  )
}
