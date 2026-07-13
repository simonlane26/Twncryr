import { requireBusiness } from '@/lib/clerk'
import { prisma } from '@/lib/prisma'

function getLastSevenDays(): { label: string; date: Date }[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    d.setHours(0, 0, 0, 0)
    return {
      label: d.toLocaleDateString('en-GB', { weekday: 'short' }),
      date: new Date(d),
    }
  })
}

export default async function AnalyticsPage() {
  const business = await requireBusiness()

  const days = getLastSevenDays()
  const weekStart = days[0].date

  const [totalViews, totalEnquiries, topPost, weeklyPosts] = await Promise.all([
    prisma.post.aggregate({
      where: { businessId: business.id },
      _sum: { views: true },
    }),
    prisma.enquiry.count({ where: { businessId: business.id } }),
    prisma.post.findFirst({
      where: { businessId: business.id },
      orderBy: { views: 'desc' },
      select: { title: true, views: true },
    }),
    prisma.post.findMany({
      where: { businessId: business.id, createdAt: { gte: weekStart } },
      select: { createdAt: true, views: true },
    }),
  ])

  // Group views (summed from posts created that day) per day of the week
  const viewsByDay = days.map(({ date }) => {
    const next = new Date(date)
    next.setDate(next.getDate() + 1)
    const total = weeklyPosts
      .filter(p => p.createdAt >= date && p.createdAt < next)
      .reduce((sum, p) => sum + p.views, 0)
    return total
  })

  const maxViews = Math.max(...viewsByDay, 1)
  const todayIdx = 6

  const isMarketDay = [2, 6].includes(new Date().getDay())
  const topDayIdx = viewsByDay.indexOf(Math.max(...viewsByDay))

  return (
    <div className="p-5 max-w-[720px]">
      <div className="mb-5">
        <h1 className="font-serif text-[22px] text-[var(--color-text-primary)]">Analytics</h1>
        <p className="text-[13px] text-[var(--color-text-secondary)] mt-1">
          Last 30 days · {business.name}
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-[var(--color-background-secondary)] rounded-xl p-3.5">
          <p className="text-[10px] font-medium tracking-[0.8px] uppercase text-[var(--color-text-secondary)] mb-1.5">
            Total views
          </p>
          <p className="text-[26px] font-medium text-[var(--color-text-primary)] leading-none">
            {(totalViews._sum.views ?? 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-[var(--color-background-secondary)] rounded-xl p-3.5">
          <p className="text-[10px] font-medium tracking-[0.8px] uppercase text-[var(--color-text-secondary)] mb-1.5">
            Total enquiries
          </p>
          <p className="text-[26px] font-medium text-[var(--color-text-primary)] leading-none">
            {totalEnquiries}
          </p>
        </div>
        <div className="bg-[var(--color-background-secondary)] rounded-xl p-3.5">
          <p className="text-[10px] font-medium tracking-[0.8px] uppercase text-[var(--color-text-secondary)] mb-1.5">
            Top post
          </p>
          <p className="text-[20px] font-medium text-[var(--color-text-primary)] leading-none truncate">
            {topPost ? topPost.title.split(' ').slice(0, 3).join(' ') : '—'}
          </p>
          {topPost && (
            <p className="text-[11px] text-[var(--color-text-secondary)] mt-1.5">
              {topPost.views} views
            </p>
          )}
        </div>
      </div>

      {/* Weekly bar chart */}
      <div className="bg-[var(--color-background-primary)] border border-[var(--color-border-tertiary)] rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[12px] font-medium text-[var(--color-text-primary)] flex items-center gap-1.5">
            <i className="ti ti-chart-bar text-[14px] text-[#0F6E56]" aria-hidden="true" />
            Weekly activity
          </p>
          <span className="text-[10px] text-[var(--color-text-secondary)]">Posts created per day</span>
        </div>

        <div className="flex items-end gap-2" style={{ height: '88px' }}>
          {days.map(({ label }, i) => {
            const value   = viewsByDay[i]
            const pct     = value / maxViews
            const barH    = Math.max(pct * 72, value > 0 ? 8 : 3)
            const isToday = i === todayIdx
            const isTop   = i === topDayIdx && value > 0

            return (
              <div key={label} className="flex-1 flex flex-col items-center gap-1.5">
                <div className="w-full flex items-end" style={{ height: '72px' }}>
                  <div
                    className="w-full rounded-t-sm transition-all"
                    style={{
                      height: `${barH}px`,
                      background: isToday || isTop ? '#0F6E56' : '#E1F5EE',
                      border: isToday || isTop ? 'none' : '0.5px solid #5DCAA5',
                    }}
                  />
                </div>
                <span
                  className="text-[9px]"
                  style={{ color: isToday ? '#0F6E56' : 'var(--color-text-secondary)' }}
                >
                  {label}
                </span>
              </div>
            )
          })}
        </div>

        {isMarketDay && (
          <p className="text-[10px] text-[var(--color-text-secondary)] mt-3">
            Market day today — footfall peaks on Tuesdays and Saturdays.
          </p>
        )}
        {!isMarketDay && topDayIdx >= 0 && viewsByDay[topDayIdx] > 0 && (
          <p className="text-[10px] text-[var(--color-text-secondary)] mt-3">
            {days[topDayIdx].label} had the most activity this week.
          </p>
        )}
      </div>

      {/* Posts table */}
      <div className="bg-[var(--color-background-primary)] border border-[var(--color-border-tertiary)] rounded-xl p-4">
        <p className="text-[12px] font-medium text-[var(--color-text-primary)] flex items-center gap-1.5 mb-3">
          <i className="ti ti-file-text text-[14px] text-[#0F6E56]" aria-hidden="true" />
          Top posts by views
        </p>
        <TopPosts businessId={business.id} />
      </div>
    </div>
  )
}

async function TopPosts({ businessId }: { businessId: string }) {
  const posts = await prisma.post.findMany({
    where: { businessId },
    orderBy: { views: 'desc' },
    take: 5,
    select: { id: true, title: true, type: true, views: true, clicks: true, createdAt: true, active: true },
  })

  if (posts.length === 0) {
    return (
      <p className="text-[12px] text-[var(--color-text-secondary)] py-2">No posts yet.</p>
    )
  }

  const TYPE_COLORS: Record<string, { bg: string; color: string }> = {
    TABLE:        { bg: '#FAEEDA', color: '#633806' },
    DEAL:         { bg: '#E1F5EE', color: '#085041' },
    EVENT:        { bg: '#E6F1FB', color: '#042C53' },
    ANNOUNCEMENT: { bg: '#E1F5EE', color: '#085041' },
  }

  return (
    <div className="flex flex-col">
      {posts.map((post, i) => {
        const style = TYPE_COLORS[post.type] ?? TYPE_COLORS.DEAL
        return (
          <div
            key={post.id}
            className={`flex items-center gap-3 py-2.5 ${i < posts.length - 1 ? 'border-b border-[var(--color-border-tertiary)]' : ''}`}
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-[10px] font-medium"
              style={{ background: style.bg, color: style.color }}
            >
              {i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-medium text-[var(--color-text-primary)] truncate">{post.title}</p>
              <p className="text-[10px] text-[var(--color-text-secondary)] mt-0.5">
                {post.type.toLowerCase()} · {post.createdAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-[12px] font-medium text-[var(--color-text-primary)]">{post.views}</p>
              <p className="text-[10px] text-[var(--color-text-secondary)]">views</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
