import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// Custom error class for transcript formatting
class TranscriptFormattingError extends Error {
  constructor(message: string, public details?: any) {
    super(message);
    this.name = 'TranscriptFormattingError';
  }
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const decodeHtmlEntities = (text: string): string => {
  const entities = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&nbsp;': ' ',
    '&ndash;': '–',
    '&mdash;': '—',
    '&hellip;': '…',
    '&trade;': '™',
    '&copy;': '©',
    '&reg;': '®',
    '&deg;': '°',
    '&plusmn;': '±',
    '&para;': '¶',
    '&sect;': '§',
    '&ldquo;': '"',
    '&rdquo;': '"',
    '&lsquo;': "'",
    '&rsquo;': "'",
  };

  return text.replace(/&[#\w]+;/g, entity => 
    entities[entity as keyof typeof entities] || entity
  );
};

export const formatTranscript = (text: string): string[] => {
  if (!text) return [];

  // Clean up the text
  const cleanText = text
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();

  // Split text into chunks by word count first
  const words = cleanText.split(' ');
  const formattedParagraphs: string[] = [];
  let currentParagraph: string[] = [];
  const WORDS_PER_PARAGRAPH = 60; // Roughly 2-3 lines per paragraph

  words.forEach((word, index) => {
    const shouldStartNewParagraph = 
      currentParagraph.length >= WORDS_PER_PARAGRAPH ;
    if (shouldStartNewParagraph && currentParagraph.length > 0) {
      const paragraph = currentParagraph
        .join(' ')
        .trim();

      if (paragraph) {
        // Ensure first letter is capitalized
        const decodedText = decodeHtmlEntities(paragraph);
        formattedParagraphs.push(decodedText.charAt(0).toUpperCase() + decodedText.slice(1));
      }
      currentParagraph = [];
    }

    currentParagraph.push(word);
  });

  // Handle the last paragraph
  if (currentParagraph.length > 0) {
    const paragraph = currentParagraph
      .join(' ')
      .trim();

    if (paragraph) {
      // Ensure first letter is capitalized
      const decodedText = decodeHtmlEntities(paragraph);
      formattedParagraphs.push(decodedText.charAt(0).toUpperCase() + decodedText.slice(1));
    }
  }

  return formattedParagraphs.length > 0 ? formattedParagraphs : ['No valid content could be formatted'];
};

export const copyToClipboard = async (text: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(text);
    return Promise.resolve();
  } catch (err) {
    return Promise.reject(new Error("Failed to copy to clipboard"));
  }
};
