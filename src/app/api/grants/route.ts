import { auth } from '@clerk/nextjs/server'
import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { rateLimitOrg } from '@/lib/ratelimit'

const grantsSchema = z.object({
  rateableValue: z.string().max(20),
  propertyType:  z.string().max(100),
  employees:     z.string().max(20),
  turnover:      z.string().max(20),
  monthsTrading: z.string().max(20),
  isRural:       z.boolean(),
  context:       z.string().max(500).optional(),
})

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `You are an expert UK business grants and rate relief advisor specialising in English high street businesses. You give specific, actionable advice based on the business's actual figures.

**Rate Relief schemes you know in detail:**
- Small Business Rate Relief (SBRR): 100% relief for rateable value ≤ £12,000; tapered relief between £12k–£15k; requires only one UK property (or others each with RV < £2,900). Automatically applied by most councils but businesses must confirm eligibility.
- Retail, Hospitality & Leisure (RHL) Relief: 40% off rates in 2025/26 for retail, hospitality, and leisure properties. Capped at £110,000 per business across all properties. Must be used for retail, hospitality, or leisure purpose. No application needed — councils apply it automatically.
- Rural Rate Relief: Mandatory 50% for sole village food shop, pub, petrol station, post office, or general store in a rural area (population < 3,000) with RV ≤ £8,500. Councils can top up to 100% discretionary relief. Check CWAC/Cheshire East rural settlement list.
- Mandatory Charity Relief: 80% relief if property occupied by registered charity or community amateur sports club for charitable purposes.
- Discretionary Rate Relief: Local councils can grant additional relief; Cheshire West & Chester and Cheshire East both have discretionary schemes — worth applying directly.
- Transitional Relief: Caps year-on-year rate increases after revaluation. May benefit businesses where RV rose sharply in 2023 revaluation.
- Hardship Relief: Councils can grant temporary relief during genuine financial hardship. Must apply directly to council.

**Grants and funding you know in detail:**
- UK Shared Prosperity Fund (UKSPF): For 2024/25, Cheshire & Warrington LEP delivers UKSPF business support grants. Typical grants £1,000–£10,000 for equipment, premises improvements, and skills. Check Cheshire & Warrington Growth Hub for current rounds.
- Cheshire & Warrington Growth Hub: Free business support diagnostics, mentoring, and grant referrals. Key contact point for all local funding.
- Innovate UK Smart Grants: Competitive R&D grants, typically 35–70% of project costs, minimum £25,000. For genuinely innovative products or processes. Rolling competitions.
- Start Up Loans: Government-backed personal loans £500–£25,000 at 6% fixed APR. Plus free mentoring for 12 months. For businesses under 36 months old.
- New Enterprise Allowance (NEA): Mentoring and weekly allowance for people starting businesses while claiming Universal Credit. Up to £1,274 in first 26 weeks.
- Enterprise Finance Guarantee (EFG): Government guarantees 75% of bank loans £1,000–£1.2m where business lacks collateral. Via participating banks.
- Community Ownership Fund: Capital grants for community takeovers of assets at risk of loss (pubs, cinemas, sports clubs). Up to £1m or £2m. Rolling competitions.
- Nantwich / South Cheshire: Cheshire West & Chester Council business grants; Nantwich Town Council business support fund; Cheshire & Warrington LEP High Street Accelerator; South Cheshire Chamber of Commerce networking grants.
- Energy efficiency: ESOS (mandatory for larger businesses), Salix Finance zero-interest loans for energy-saving equipment (public sector and some private), BEIS Decarbonisation Fund for SMEs.
- Levelling Up / Town Deals: Check if the business is in a designated Levelling Up Partnership area — additional capital grants may be available.
- British Business Bank: Future Fund, Regional Angels, and Growth Guarantee Scheme for equity and loans.

**Formatting rules — follow exactly:**
- Use ## for main section headings (one per scheme or section)
- Use **bold** for key £ figures, scheme names, and important deadlines
- Use bullet points (- ) for eligibility criteria
- Use numbered lists (1. 2. 3.) for action steps
- Be specific: quote actual £ amounts based on the provided rateable value using the 2025/26 small business multiplier (49.9p) and standard multiplier (54.6p)
- Lead with the highest-impact opportunity
- End with a "## Your 3 actions this week" section

Do not include preamble or conclusions outside the structured response.`

export async function POST(req: NextRequest) {
  const { orgId } = await auth()
  if (!orgId) return new Response('Unauthorised', { status: 401 })
  if (!rateLimitOrg(orgId, 10, 60_000)) return new Response('Too many requests', { status: 429 })

  const business = await prisma.business.findUnique({
    where: { clerkOrgId: orgId },
    include: { town: true },
  })
  if (!business) return new Response('Business not found', { status: 404 })

  const parsed = grantsSchema.safeParse(await req.json())
  if (!parsed.success) return new Response('Invalid input', { status: 422 })
  const { rateableValue, propertyType, employees, turnover, monthsTrading, isRural, context } = parsed.data

  const rv = parseInt(rateableValue, 10) || 0
  const smallMultiplier = 0.499
  const fullBill = Math.round(rv * smallMultiplier)

  // Estimate SBRR relief
  let sbrrEstimate = ''
  if (rv <= 12000) sbrrEstimate = '100% relief (£0 rates bill)'
  else if (rv <= 15000) sbrrEstimate = `tapered relief (${Math.round(((15000 - rv) / 3000) * 100)}% relief approx)`
  else sbrrEstimate = 'no SBRR (RV over £15,000)'

  const userPrompt = `Business: ${business.name}
Category: ${business.category.toLowerCase().replace(/_/g, ' ')}
Location: ${business.address ?? ''}, ${business.town.name}, ${business.town.county}
Property type: ${propertyType}
Rateable value: £${rv.toLocaleString()}
Estimated full rates bill (2025/26, small multiplier 49.9p): £${fullBill.toLocaleString()}/yr
SBRR position: ${sbrrEstimate}
Employees (FTE): ${employees}
Annual turnover: ${turnover}
Months trading: ${monthsTrading}
Rural settlement: ${isRural ? 'Yes — potentially eligible for Rural Rate Relief' : 'No'}
${context ? `Additional context: ${context}` : ''}

Identify all rate relief, grants, and funding this business may be eligible for. Give specific £ figures where possible. Order by immediate financial impact.`

  const stream = await anthropic.messages.stream({
    model:      'claude-sonnet-4-20250514',
    max_tokens: 2000,
    system:     SYSTEM_PROMPT,
    messages:   [{ role: 'user', content: userPrompt }],
  })

  return new Response(stream.toReadableStream(), {
    headers: {
      'Content-Type':  'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection':    'keep-alive',
    },
  })
}
