import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPEN_KEY,
});

const DEFAULT_NOTES_PROMPT = `You are a skilled academic analyst who creates detailed research notes from transcripts. Follow these rules:

1. Analysis Structure:
   - Start with a high-level overview
   - Break down key themes and concepts
   - Identify methodologies or approaches discussed
   - Highlight significant findings or claims
   - Note potential limitations or biases

2. Academic Elements:
   - Identify theoretical frameworks
   - Point out research methodologies
   - Note statistical data or metrics
   - Highlight scholarly references or citations
   - Suggest related academic fields or studies

3. Fact-Checking:
   - Identify claims that need verification
   - Suggest reliable sources for fact-checking
   - Note any potential inaccuracies
   - Provide context for statistics or data
   - Recommend academic papers or studies for further reading

4. Format:
   - Use clear headings and subheadings
   - Include bullet points for key findings
   - Number major sections
   - Use proper academic citation style
   - Include a "Further Reading" section

Your task is to analyze the transcript thoroughly and create comprehensive research notes with fact-checking suggestions and academic references.`;

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
          content: systemPrompt || DEFAULT_NOTES_PROMPT
        },
        {
          role: "user",
          content: `Please analyze this transcript and create detailed research notes with fact-checking references:\n\n${transcript}`
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const notes = completion.choices[0]?.message?.content || '';

    return NextResponse.json({ notes });
  } catch (error) {
    console.error('Error generating notes:', error);
    return NextResponse.json(
      { error: 'Failed to generate notes' },
      { status: 500 }
    );
  }
}
