import { YoutubeTranscript } from 'youtube-transcript';

YoutubeTranscript.fetchTranscript('https://www.youtube.com/watch?v=9jgR-Ih_wGs')
  .then(transcript => {
    // Join all transcript segments into a single text
    const fullText = transcript
      .map(segment => segment.text)
      .join(' ');
    console.log(fullText);
  });