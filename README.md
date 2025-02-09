# ContentBuddy 🤖

A modern web application that helps you process YouTube video content into various formats:

## Features

- **Transcript Generation**: Extract text content from YouTube videos
- **AI Summary**: Get concise summaries of video content
- **Content Remix**: Generate alternative versions of the content
- **Research Notes**: Create structured notes from the video content
- **Custom Prompts**: Customize AI behavior for each generation type

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS, shadcn/ui
- **AI Integration**: OpenAI API
- **Styling**: Modern, responsive design with dark theme

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/Ritobanb/contentbuddy.git
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up environment variables:
Create a `.env` file with:
```
OPENAI_API_KEY=your_api_key_here
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Usage

1. Enter a YouTube URL
2. Click "Get Transcript" to extract the video content
3. Use the various generation options:
   - Generate Summary
   - Remix Content
   - Generate Notes
4. Customize prompts using the edit buttons
5. Copy results to clipboard as needed

## License

MIT License
