import { NextRequest, NextResponse } from 'next/server'

const SERIOUS_KEYWORDS = [
  'chest pain', 'heart attack', 'stroke', 'difficulty breathing', 'shortness of breath',
  'severe bleeding', 'unconscious', 'seizure', 'paralysis', 'severe headache',
  'vision loss', 'numbness', 'severe abdominal pain', 'blood in urine', 'blood in stool',
  'high fever', 'swelling', 'jaundice', 'lump', 'persistent cough', 'coughing blood',
  'cancer', 'tumor', 'fracture', 'broken bone', 'diabetic emergency', 'hypertension crisis',
  'depression', 'anxiety attack', 'suicidal', 'overdose', 'allergic reaction', 'anaphylaxis',
  'cut deep', 'deep cut', 'wound', 'bleeding', 'burn', 'poisoning', 'fainted', 'collapsed'
]

function isSeriousQuery(text: string): boolean {
  const lower = text.toLowerCase()
  return SERIOUS_KEYWORDS.some(kw => lower.includes(kw))
}

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json()

    const apiKey = process.env.SARVAM_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Sarvam API key not configured' }, { status: 500 })
    }

    type ChatMessage = { role: 'user' | 'assistant'; content: string }

    // Build history — only user/assistant turns
    let conversationHistory: ChatMessage[] = (history || [])
      .filter((m: { role: string }) => m.role === 'user' || m.role === 'assistant')
      .map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }))

    // Sarvam requires first message (after system) to be from user.
    // Strip any leading assistant messages (e.g. the initial greeting).
    while (conversationHistory.length > 0 && conversationHistory[0].role === 'assistant') {
      conversationHistory = conversationHistory.slice(1)
    }

    const systemPrompt = `You are MediBot, a helpful and empathetic health assistant for MediBook, a doctor appointment platform.

Your role:
- Answer general health questions clearly and compassionately
- Provide practical information about symptoms, medications, healthy habits, and wellness tips
- Always remind users that you are not a substitute for professional medical advice
- Keep responses concise (2-5 sentences), friendly, and easy to understand
- Do NOT diagnose diseases or prescribe specific medications
- For minor issues (common cold, mild headache, basic nutrition), provide helpful general advice
- For anything serious or potentially requiring medical care, strongly encourage the user to see a doctor

Always respond in English. Be warm, professional, and supportive.`

    const response = await fetch('https://api.sarvam.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': apiKey,
      },
      body: JSON.stringify({
        model: 'sarvam-m',
        messages: [
          { role: 'system', content: systemPrompt },
          ...conversationHistory,
          { role: 'user', content: message },
        ],
        max_tokens: 400,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('Sarvam API error:', err)
      const isSerious = isSeriousQuery(message)
      return NextResponse.json({
        reply: isSerious
          ? "This sounds like it could need medical attention. Please consult a doctor as soon as possible."
          : "I'm sorry, I had trouble processing that. Please try rephrasing your question.",
        isSerious,
      })
    }

    const data = await response.json()
    const raw = data.choices?.[0]?.message?.content || "I'm sorry, I couldn't process your question. Please try again."

    // Strip internal <think>...</think> reasoning blocks (sarvam-m model)
    const reply = raw.replace(/<think>[\s\S]*?<\/think>/gi, '').trim()

    const isSerious = isSeriousQuery(message) || isSeriousQuery(reply)

    return NextResponse.json({ reply, isSerious })
  } catch (error) {
    console.error('Chatbot error:', error)
    return NextResponse.json({
      reply: "I'm having trouble connecting right now. Please try again in a moment.",
      isSerious: false,
    })
  }
}
