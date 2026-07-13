// Server component — no interactivity needed

export default function MarketDayBanner({
  day,
  townName,
  dealCount,
}: {
  day: string
  townName: string
  dealCount: number
}) {
  return (
    <div className="mx-5 mt-4 bg-[#E1F5EE] border border-[#5DCAA5] rounded-xl px-4 py-3 flex items-start gap-3">
      <div className="w-2 h-2 rounded-full bg-[#0F6E56] flex-shrink-0 mt-1.5" />
      <p className="text-[13px] text-[#085041] leading-relaxed">
        <strong>Market day today — {day}.</strong>{' '}
        {dealCount > 0
          ? `${dealCount} ${dealCount === 1 ? 'business has' : 'businesses have'} special offers running. Check the deals below.`
          : `Extra footfall in ${townName} town centre today. A great time to visit the high street.`
        }
      </p>
    </div>
  )
}
