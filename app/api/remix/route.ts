import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPEN_KEY,
});

const DEFAULT_REMIX_PROMPT = `You are a skilled editor who rewrites transcripts while maintaining their original narrative and meaning. Follow these rules:
1. Keep the same story and message as the original
2. Maintain a neutral, professional tone
3. Use clear, well-structured paragraphs
4. Ensure proper grammar and punctuation
5. Preserve all factual information
6. Do not summarize or omit content
7. Keep the same chronological order of events

Your task is to rewrite the transcript in a clear, professional style while keeping all original content and meaning intact.`;

export async function POST(req: Request) {
  try {
    const { transcript, systemPrompt } = await req.json();

    if (!transcript) {
      return NextResponse.json(
        { error: 'Transcript is required' },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: systemPrompt || DEFAULT_REMIX_PROMPT
        },
        {
          role: "user",
          content: `Please rewrite the following transcript in a clear, professional style. Maintain all original content and meaning, but improve the clarity and structure:\n\n${transcript}`
        }
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const remixedContent = completion.choices[0]?.message?.content || '';

    return NextResponse.json({ remixedContent });
  } catch (error) {
    console.error('Error remixing transcript:', error);
    return NextResponse.json(
      { error: 'Failed to remix transcript' },
      { status: 500 }
    );
  }
}
