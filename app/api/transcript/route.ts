import { YoutubeTranscript } from 'youtube-transcript';
import { NextResponse } from 'next/server';

const cleanTranscript = (text: string) => {
  return text
    // Remove HTML entities
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    // Remove metadata in brackets
    .replace(/\[.*?\]/g, '')
    // Remove multiple spaces
    .replace(/\s+/g, ' ')
    .trim();
};

// Extract video ID from YouTube URL
const extractVideoId = (url: string) => {
  const patterns = [
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i,
    /^[a-zA-Z0-9_-]{11}$/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
};

export async function POST(request: Request) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    const videoId = extractVideoId(url);
    if (!videoId) {
      return NextResponse.json(
        { error: 'Invalid YouTube URL or video ID' },
        { status: 400 }
      );
    }

    try {
      const transcript = await YoutubeTranscript.fetchTranscript(videoId);
      const cleanedText = transcript
        .map(segment => cleanTranscript(segment.text))
        .filter(text => text.length > 0) // Remove empty segments
        .join(' ');

      return NextResponse.json({ transcript: cleanedText });
    } catch (transcriptError) {
      console.error('Failed to fetch transcript:', transcriptError);
      return NextResponse.json(
        { error: 'No transcript available for this video. Make sure the video has closed captions enabled.' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Transcript error:', error);
    return NextResponse.json(
      { error: 'Failed to process request. Please check the URL and try again.' },
      { status: 500 }
    );
  }
}
