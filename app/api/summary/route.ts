import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPEN_KEY,
});

const DEFAULT_SYSTEM_PROMPT = `You are a skilled editor who creates well-structured summaries. Follow these rules:
1. Write in clear, concise paragraphs
2. Use proper punctuation and capitalization
3. Break down the content into logical sections
4. Ensure smooth transitions between ideas
5. Maintain professional tone and formatting
6. Use bullet points or numbered lists when appropriate

Your task is to summarize the transcript while maintaining excellent readability and structure.`;

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
          content: systemPrompt || DEFAULT_SYSTEM_PROMPT
        },
        {
          role: "user",
          content: `Please provide a well-structured summary of the following transcript. Use proper formatting with paragraphs, and where appropriate, use bullet points or numbered lists for key points:\n\n${transcript}`
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const summary = completion.choices[0]?.message?.content || '';

    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Error generating summary:', error);
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    );
  }
}
