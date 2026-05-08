import { generateText } from "ai"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { system, messages, max_tokens = 1200 } = body

    // Extract the last user message content
    const userMessages = messages?.filter((m: { role: string }) => m.role === 'user') || []
    const userMessage = userMessages[userMessages.length - 1]?.content || ""

    // Build conversation context from chat history
    const conversationContext = messages?.map((m: { role: string; content: string }) => 
      `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`
    ).join('\n') || userMessage

    const { text } = await generateText({
      // Using Vercel AI Gateway - free, no API key needed
      model: "google/gemini-2.5-flash-preview-05-20",
      system: system || "You are a helpful assistant.",
      prompt: conversationContext,
      maxTokens: max_tokens,
    })

    // Return in Anthropic-compatible format for the frontend
    return Response.json({
      content: [{ text }],
    })
  } catch (error) {
    console.error("[v0] AI API error:", error)
    return Response.json(
      { error: "Failed to generate response" },
      { status: 500 }
    )
  }
}
