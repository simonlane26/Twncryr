// Server component — data passed in from page.tsx

type Metrics = {
  views: number
  enquiries: number
  clicks: number
  rank: number
}

function MetricCard({
  label,
  value,
  delta,
  deltaUp,
  sub,
}: {
  label: string
  value: string | number
  delta?: string
  deltaUp?: boolean
  sub?: string
}) {
  return (
    <div className="bg-[var(--color-background-secondary)] rounded-xl p-3.5">
      <p className="text-[10px] font-medium tracking-[0.8px] uppercase text-[var(--color-text-secondary)] mb-1.5">
        {label}
      </p>
      <p className="text-[26px] font-medium text-[var(--color-text-primary)] leading-none">
        {value}
      </p>
      {delta && (
        <p className={`text-[11px] mt-1.5 flex items-center gap-1 ${deltaUp ? 'text-[#0F6E56]' : 'text-[var(--color-text-secondary)]'}`}>
          {deltaUp && <i className="ti ti-arrow-up text-[11px]" aria-hidden="true" />}
          {delta}
        </p>
      )}
      {sub && (
        <p className="text-[11px] text-[var(--color-text-secondary)] mt-1.5">{sub}</p>
      )}
    </div>
  )
}

export default function MetricsRow({ metrics }: { metrics: Metrics }) {
  return (
    <div className="grid grid-cols-4 gap-3">
      <MetricCard
        label="Profile views"
        value={metrics.views.toLocaleString()}
        delta="+18% this week"
        deltaUp
      />
      <MetricCard
        label="Enquiries"
        value={metrics.enquiries}
        delta={metrics.enquiries > 0 ? `${metrics.enquiries} this week` : undefined}
        deltaUp={metrics.enquiries > 0}
      />
      <MetricCard
        label="Deal clicks"
        value={metrics.clicks}
        sub="Across active deals"
      />
      <MetricCard
        label="Businesses in town"
        value={metrics.rank}
        sub="Active on Twncryr"
      />
    </div>
  )
}
