import { auth } from '@clerk/nextjs/server'
import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { prisma } from '@/lib/prisma'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const TYPE_INSTRUCTIONS: Record<string, string> = {
  instagram: 'Write 2 Instagram captions. Include relevant UK-appropriate hashtags at the end of each. Keep each under 150 words. Authentic, not corporate. Separate the two with ---',
  facebook:  'Write 2 Facebook posts — one short (2-3 sentences) and one longer (a paragraph with a story). Separate with ---',
  google:    'Write 1 Google Business Profile post optimised for local search. Include the business name and location. Clear call to action. Under 100 words.',
  newsletter:'Write a short email newsletter. First line: "Subject: [your subject line]". Then: warm greeting, 2-3 short paragraphs, CTA. Under 200 words total.',
  campaign:  'Describe one practical, creative marketing campaign for this independent business. Include: the big idea (1 sentence), what they actually do step by step, timeline, and realistic expected outcome.',
  ideas:     'List exactly 10 post ideas for the next month. Number each. Vary the mix: deals, behind-the-scenes, community, seasonal, educational, promotional. Be specific and actionable.',
  seasonal:  'Suggest 3 seasonal marketing angles for right now in the UK. Consider the current season, weather, upcoming national events and local culture. For each: the angle, a one-line headline, and a brief execution idea.',
  bio:       'Write 2 social media bios. One under 80 characters, one under 160. Include town name. Separate with ---',
}

const TONE_GUIDES: Record<string, string> = {
  warm:         'warm, friendly and welcoming — like a knowledgeable local who loves their community',
  professional: 'professional and polished but still human and approachable',
  playful:      'light-hearted, fun, with real personality — British humour where appropriate',
  urgent:       'creating genuine excitement and a sense of urgency to act now, without being pushy',
}

export async function POST(req: NextRequest) {
  const { orgId } = await auth()
  if (!orgId) return new Response('Unauthorised', { status: 401 })

  const business = await prisma.business.findUnique({
    where: { clerkOrgId: orgId },
    include: { town: true },
  })

  if (!business) return new Response('Business not found', { status: 404 })

  const { contentType, tone, focus, specifics } = await req.json()

  if (!contentType || !focus) {
    return new Response('contentType and focus are required', { status: 400 })
  }

  const instruction = TYPE_INSTRUCTIONS[contentType] ?? TYPE_INSTRUCTIONS.instagram
  const toneGuide   = TONE_GUIDES[tone] ?? TONE_GUIDES.warm

  const systemPrompt = `You are an expert marketing copywriter specialising in UK independent high street businesses. You understand what resonates with British local audiences — warm, community-focused, authentic. Never corporate. Never American in tone.

Write only the content itself — no preamble, no "here is your caption", no explanation. Just the copy, ready to post.`

  const userPrompt = `Business: ${business.name}
Type: ${business.category.toLowerCase().replace('_', ' ')}
Location: ${business.address ?? ''}, ${business.town.name}, ${business.town.county}
Description: ${business.description ?? 'A well-loved local business serving the community.'}
Town character: Historic market town, strong independent business community

Focus of this content: ${focus}
${specifics ? `Specific details to include: ${specifics}` : ''}
Tone: ${toneGuide}

Task: ${instruction}`

  try {
    const anthropicStream = anthropic.messages.stream({
      model:      'claude-sonnet-4-5',
      max_tokens: 1200,
      system:     systemPrompt,
      messages:   [{ role: 'user', content: userPrompt }],
    })

    const encoder = new TextEncoder()
    const body = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of anthropicStream) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`))
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        } catch (err) {
          console.error('Anthropic mid-stream error:', err)
        } finally {
          controller.close()
        }
      },
    })

    return new Response(body, {
      headers: {
        'Content-Type':  'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection':    'keep-alive',
      },
    })
  } catch (err) {
    console.error('Anthropic stream error:', err)
    return new Response('Generation failed', { status: 500 })
  }
}
