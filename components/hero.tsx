"use client"

import dynamic from 'next/dynamic'
import { Button } from "@/components/ui/button"
// Import only the icons needed for initial render
import { FileText, Menu, MessageSquareText, Copy, Check, RotateCcw } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useState, useCallback, useMemo, Suspense } from "react"
import { toast } from "sonner"
import { DEFAULT_PROMPT, DEFAULT_REMIX_PROMPT, DEFAULT_NOTES_PROMPT } from '@/lib/prompts'
import { formatTranscript, copyToClipboard } from '@/lib/utils'
import { generateContent, validateYoutubeUrl } from '@/lib/services'
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"

// Lazy load secondary icons
const ScanText = dynamic(() => import('lucide-react').then(mod => mod.ScanText))
const Notebook = dynamic(() => import('lucide-react').then(mod => mod.Notebook))
const Wand2 = dynamic(() => import('lucide-react').then(mod => mod.Wand2))
const Sparkles = dynamic(() => import('lucide-react').then(mod => mod.Sparkles))

// Loading fallback
const LoadingSpinner = () => (
  <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
)

export default function Hero() {
  const [youtubeUrl, setYoutubeUrl] = useState("")
  const [hasTranscript, setHasTranscript] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [summary, setSummary] = useState("")
  const [remixedContent, setRemixedContent] = useState("")
  const [notes, setNotes] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSummaryLoading, setIsSummaryLoading] = useState(false)
  const [isRemixLoading, setIsRemixLoading] = useState(false)
  const [isNotesLoading, setIsNotesLoading] = useState(false)
  const [error, setError] = useState("")
  const [isSummarized, setIsSummarized] = useState(false)
  const [isRemixed, setIsRemixed] = useState(false)
  const [isNotesGenerated, setIsNotesGenerated] = useState(false)
  const [customPrompt, setCustomPrompt] = useState(DEFAULT_PROMPT)
  const [customRemixPrompt, setCustomRemixPrompt] = useState(DEFAULT_REMIX_PROMPT)
  const [customNotesPrompt, setCustomNotesPrompt] = useState(DEFAULT_NOTES_PROMPT)
  const [isPromptModified, setIsPromptModified] = useState(false)
  const [isRemixPromptModified, setIsRemixPromptModified] = useState(false)
  const [isNotesPromptModified, setIsNotesPromptModified] = useState(false)
  const [isCopied, setIsCopied] = useState(false);
  const [isRemixCopied, setIsRemixCopied] = useState(false);
  const [isNotesCopied, setIsNotesCopied] = useState(false);
  const [isTranscriptCopied, setIsTranscriptCopied] = useState(false);

  // Memoize formatted transcript
  const formattedTranscript = useMemo(() => {
    if (!transcript) return [];
    return formatTranscript(transcript);
  }, [transcript]);

  const generateTranscript = useCallback(async () => {
    if (!validateYoutubeUrl(youtubeUrl)) {
      setError("Invalid YouTube URL");
      return;
    }

    setIsLoading(true);
    setError("");
    
    try {
      const response = await fetch('/api/transcript', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: youtubeUrl }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate transcript');
      }

      setTranscript(data.transcript);
      setHasTranscript(true);
      toast.success("Transcript generated successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate transcript");
      toast.error("Failed to generate transcript");
    } finally {
      setIsLoading(false);
    }
  }, [youtubeUrl]);

  const generateSummary = useCallback(async (prompt?: string) => {
    if (!transcript) {
      toast.error("No transcript available");
      return;
    }

    setIsSummaryLoading(true);
    setError("");
    
    try {
      const data = await generateContent('/api/summary', transcript, prompt || customPrompt);
      setSummary(data.summary);
      setIsSummarized(true);
      toast.success("Summary generated successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate summary");
      toast.error("Failed to generate summary");
    } finally {
      setIsSummaryLoading(false);
    }
  }, [transcript, customPrompt]);

  const generateRemix = useCallback(async (prompt?: string) => {
    if (!transcript) {
      toast.error("No transcript available");
      return;
    }

    setIsRemixLoading(true);
    setError("");
    
    try {
      const data = await generateContent('/api/remix', transcript, prompt || customRemixPrompt);
      setRemixedContent(data.remixedContent);
      setIsRemixed(true);
      toast.success("Transcript remixed successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remix transcript");
      toast.error("Failed to remix transcript");
    } finally {
      setIsRemixLoading(false);
    }
  }, [transcript, customRemixPrompt]);

  const generateNotes = useCallback(async (prompt?: string) => {
    if (!transcript) {
      toast.error("No transcript available");
      return;
    }

    setIsNotesLoading(true);
    setError("");
    
    try {
      const data = await generateContent('/api/notes', transcript, prompt || customNotesPrompt);
      setNotes(data.notes);
      setIsNotesGenerated(true);
      toast.success("Research notes generated successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate notes");
      toast.error("Failed to generate notes");
    } finally {
      setIsNotesLoading(false);
    }
  }, [transcript, customNotesPrompt]);

  const handleCopy = async (text: string, setCopied: (copied: boolean) => void) => {
    await copyToClipboard(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    // Reset input values
    setYoutubeUrl('');
    setTranscript('');
    setSummary('');
    setRemixedContent('');
    setNotes('');
    setError('');
    setHasTranscript(false);

    // Reset all loading states
    setIsLoading(false);
    setIsSummaryLoading(false);
    setIsRemixLoading(false);
    setIsNotesLoading(false);

    // Reset all generation states
    setIsSummarized(false);
    setIsRemixed(false);
    setIsNotesGenerated(false);

    // Reset all prompts to defaults
    setCustomPrompt(DEFAULT_PROMPT);
    setCustomRemixPrompt(DEFAULT_REMIX_PROMPT);
    setCustomNotesPrompt(DEFAULT_NOTES_PROMPT);
    setIsPromptModified(false);
    setIsRemixPromptModified(false);
    setIsNotesPromptModified(false);

    // Reset copy states
    setIsCopied(false);
    setIsRemixCopied(false);
    setIsNotesCopied(false);
    setIsTranscriptCopied(false);
  };

  // Add mouse move handler for dynamic effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    e.currentTarget.style.setProperty('--x', `${x}%`)
    e.currentTarget.style.setProperty('--y', `${y}%`)
  }

  return (
    <div className="flex-1 flex flex-col bg-zinc-950">
      <div className="flex-1 flex flex-col items-center justify-center w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full max-w-5xl space-y-8 my-8">
          <div className="text-center space-y-4">
            <h1 className="modern-title text-5xl font-bold tracking-tight sm:text-7xl">
              <span className="bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">Content</span>{' '}
              <span className="bg-gradient-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent">Analysis</span>{' '}
              <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">Made</span>{' '}
              <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">Easy</span>
            </h1>
            <p className="text-lg leading-8 text-zinc-400 max-w-2xl mx-auto">
              Transform your video content with AI-powered transcripts, summaries, and analysis.
            </p>
          </div>

          <div className="w-full space-y-8">
            {/* URL Input */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-full max-w-xl">
                <div className="flex items-center justify-center gap-4">
                  <Input 
                    type="text" 
                    placeholder="Paste your YouTube video link here..." 
                    className="max-w-xl bg-zinc-900/50 border-zinc-800"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleReset}
                    className="bg-zinc-900/50 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100"
                    title="Reset Form"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
                {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap justify-center gap-3 mt-6">
                <Button 
                  className="w-[140px] bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!validateYoutubeUrl(youtubeUrl) || isLoading}
                  onClick={generateTranscript}
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <FileText className="w-4 h-4" />
                  )}
                  {isLoading ? '🤖 Loading...' : 'Transcript'}
                </Button>
                <Button 
                  className="w-[140px] bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!hasTranscript || isSummaryLoading}
                  onClick={() => generateSummary()}
                >
                  {isSummaryLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <Suspense fallback={<LoadingSpinner />}>
                      <ScanText className="w-4 h-4" />
                    </Suspense>
                  )}
                  {isSummaryLoading ? '🤖 Loading...' : 'Summary'}
                </Button>
                <Button 
                  className="w-[140px] bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!hasTranscript || isRemixLoading}
                  onClick={() => generateRemix()}
                >
                  {isRemixLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <Suspense fallback={<LoadingSpinner />}>
                      <Sparkles className="w-4 h-4" />
                    </Suspense>
                  )}
                  {isRemixLoading ? '🤖 Loading...' : 'Remix'}
                </Button>
                <Button 
                  className="w-[140px] bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!hasTranscript || isNotesLoading}
                  onClick={() => generateNotes()}
                >
                  {isNotesLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <Suspense fallback={<LoadingSpinner />}>
                      <Notebook className="w-4 h-4" />
                    </Suspense>
                  )}
                  {isNotesLoading ? "Analyzing..." : "Notes"}
                </Button>
              </div>
            </div>

            {/* Transcript and Summary Display */}
            {transcript && (
              <div className="max-w-4xl mx-auto">
                <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm relative group">
                  <CardHeader className="border-b border-zinc-800">
                    <CardTitle className="text-zinc-100">
                      <Tabs defaultValue="transcript" className="w-full">
                        <div className="flex justify-center mb-6">
                          <TabsList className="dynamic-tabs" onMouseMove={handleMouseMove}>
                            <TabsTrigger value="transcript">
                              Transcript
                            </TabsTrigger>
                            <TabsTrigger value="summary">
                              AI Summary
                            </TabsTrigger>
                            <TabsTrigger value="remix">
                              Remix
                            </TabsTrigger>
                            <TabsTrigger value="notes">
                              Research Notes
                            </TabsTrigger>
                          </TabsList>
                        </div>
                        <TabsContent value="transcript" className="mt-0 border-none p-0">
                          <ScrollArea className="h-[400px] w-full rounded-md">
                            <div className="text-left text-zinc-300 text-sm leading-7 tracking-wide p-6">
                              {isLoading ? (
                                <div className="flex items-center justify-center h-full gap-3">
                                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                  <span>🤖 Generating transcript...</span>
                                </div>
                              ) : transcript ? (
                                <div className="space-y-4">
                                  <div className="flex justify-end gap-2">
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100"
                                            onClick={() => handleCopy(transcript, setIsTranscriptCopied)}
                                          >
                                            {isTranscriptCopied ? (
                                              <Check className="h-4 w-4" />
                                            ) : (
                                              <Copy className="h-4 w-4" />
                                            )}
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>Copy Transcript</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  </div>
                                  <div className="whitespace-pre-line">
                                    {formattedTranscript.join('\n\n')}
                                  </div>
                                </div>
                              ) : (
                                <p>No transcript available</p>
                              )}
                            </div>
                          </ScrollArea>
                        </TabsContent>

                        <TabsContent value="summary" className="mt-0 border-none p-0">
                          <ScrollArea className="h-[400px] w-full rounded-md">
                            <div className="text-left text-zinc-300 text-sm leading-7 tracking-wide p-6">
                              {isSummaryLoading ? (
                                <div className="flex items-center justify-center h-full gap-3">
                                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                  <span>🤖 Generating summary...</span>
                                </div>
                              ) : summary ? (
                                <div className="space-y-4">
                                  <div className="flex justify-end gap-2">
                                    <Dialog>
                                      <TooltipProvider>
                                        <Tooltip>
                                          <DialogTrigger asChild>
                                            <TooltipTrigger asChild>
                                              <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100"
                                              >
                                                <MessageSquareText className="h-4 w-4" />
                                              </Button>
                                            </TooltipTrigger>
                                          </DialogTrigger>
                                          <TooltipContent>
                                            <p>Edit Prompt</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                      <DialogContent className="bg-zinc-900 border-zinc-800">
                                        <DialogHeader>
                                          <DialogTitle className="text-zinc-100">Customize Summary Prompt</DialogTitle>
                                          <DialogDescription className="text-zinc-400">
                                            Modify the system prompt to change how the AI generates the summary.
                                          </DialogDescription>
                                        </DialogHeader>
                                        <Textarea
                                          value={customPrompt}
                                          onChange={(e) => {
                                            setCustomPrompt(e.target.value);
                                            setIsPromptModified(e.target.value !== DEFAULT_PROMPT);
                                          }}
                                          className="min-h-[100px] bg-zinc-800/50 border-zinc-700 text-zinc-100"
                                        />
                                        <DialogFooter className="flex flex-row justify-between items-center">
                                          <Button
                                            variant="outline"
                                            onClick={() => {
                                              setCustomPrompt(DEFAULT_PROMPT);
                                              setIsPromptModified(false);
                                              toast.success("Restored default prompt");
                                            }}
                                            className="bg-zinc-800/50 border-zinc-700 text-zinc-100 hover:bg-zinc-800 hover:text-zinc-50"
                                            disabled={!isPromptModified}
                                          >
                                            Restore Default
                                          </Button>
                                          <Button
                                            onClick={() => {
                                              generateSummary(customPrompt);
                                            }}
                                            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0"
                                          >
                                            Regenerate Summary
                                          </Button>
                                        </DialogFooter>
                                      </DialogContent>
                                    </Dialog>
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100"
                                            onClick={() => handleCopy(summary, setIsCopied)}
                                          >
                                            {isCopied ? (
                                              <Check className="h-4 w-4" />
                                            ) : (
                                              <Copy className="h-4 w-4" />
                                            )}
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>Copy Summary</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  </div>
                                  {summary.split('\n\n').map((paragraph, index) => (
                                    <div key={index} className="mb-4">
                                      {paragraph.startsWith('•') || paragraph.match(/^\d+\./) ? (
                                        // Handle bullet points and numbered lists
                                        <div className="pl-4">{paragraph}</div>
                                      ) : paragraph.length > 0 ? (
                                        // Regular paragraphs
                                        <p className="first-letter:capitalize">
                                          {paragraph.trim()}
                                        </p>
                                      ) : null}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-zinc-400">
                                  Click the Summary button to generate an AI-powered summary of your transcript.
                                </p>
                              )}
                            </div>
                          </ScrollArea>
                        </TabsContent>

                        <TabsContent value="remix" className="mt-0 border-none p-0">
                          <ScrollArea className="h-[400px] w-full rounded-md">
                            <div className="text-left text-zinc-300 text-sm leading-7 tracking-wide p-6">
                              {isRemixLoading ? (
                                <div className="flex items-center justify-center h-full gap-3">
                                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                  <span>🤖 Remixing transcript...</span>
                                </div>
                              ) : remixedContent ? (
                                <div className="space-y-4">
                                  <div className="flex justify-end gap-2">
                                    <Dialog>
                                      <TooltipProvider>
                                        <Tooltip>
                                          <DialogTrigger asChild>
                                            <TooltipTrigger asChild>
                                              <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100"
                                              >
                                                <MessageSquareText className="h-4 w-4" />
                                              </Button>
                                            </TooltipTrigger>
                                          </DialogTrigger>
                                          <TooltipContent>
                                            <p>Edit Prompt</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                      <DialogContent className="bg-zinc-900 border-zinc-800">
                                        <DialogHeader>
                                          <DialogTitle className="text-zinc-100">Customize Remix Prompt</DialogTitle>
                                          <DialogDescription className="text-zinc-400">
                                            Modify the system prompt to change how the AI rewrites the transcript.
                                          </DialogDescription>
                                        </DialogHeader>
                                        <Textarea
                                          value={customRemixPrompt}
                                          onChange={(e) => {
                                            setCustomRemixPrompt(e.target.value);
                                            setIsRemixPromptModified(e.target.value !== DEFAULT_REMIX_PROMPT);
                                          }}
                                          className="min-h-[100px] bg-zinc-800/50 border-zinc-700 text-zinc-100"
                                        />
                                        <DialogFooter className="flex flex-row justify-between items-center">
                                          <Button
                                            variant="outline"
                                            onClick={() => {
                                              setCustomRemixPrompt(DEFAULT_REMIX_PROMPT);
                                              setIsRemixPromptModified(false);
                                              toast.success("Restored default remix prompt");
                                            }}
                                            className="bg-zinc-800/50 border-zinc-700 text-zinc-100 hover:bg-zinc-800 hover:text-zinc-50"
                                            disabled={!isRemixPromptModified}
                                          >
                                            Restore Default
                                          </Button>
                                          <Button
                                            onClick={() => {
                                              generateRemix(customRemixPrompt);
                                            }}
                                            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0"
                                          >
                                            Regenerate Remix
                                          </Button>
                                        </DialogFooter>
                                      </DialogContent>
                                    </Dialog>
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100"
                                            onClick={() => handleCopy(remixedContent, setIsRemixCopied)}
                                          >
                                            {isRemixCopied ? (
                                              <Check className="h-4 w-4" />
                                            ) : (
                                              <Copy className="h-4 w-4" />
                                            )}
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>Copy Remixed Content</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  </div>
                                  {remixedContent.split('\n\n').map((paragraph, index) => (
                                    <div key={index} className="mb-4">
                                      {paragraph.startsWith('•') || paragraph.match(/^\d+\./) ? (
                                        <div className="pl-4">{paragraph}</div>
                                      ) : paragraph.length > 0 ? (
                                        <p className="first-letter:capitalize">
                                          {paragraph.trim()}
                                        </p>
                                      ) : null}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-zinc-400">
                                  Click the Remix button to generate a rewritten version of your transcript.
                                </p>
                              )}
                            </div>
                          </ScrollArea>
                        </TabsContent>

                        <TabsContent value="notes" className="mt-0 border-none p-0">
                          <ScrollArea className="h-[400px] w-full rounded-md">
                            <div className="text-left text-zinc-300 text-sm leading-7 tracking-wide p-6">
                              {isNotesLoading ? (
                                <div className="flex items-center justify-center h-full gap-3">
                                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                  <span>🤖 Generating research notes...</span>
                                </div>
                              ) : notes ? (
                                <div className="space-y-4">
                                  <div className="flex justify-end gap-2">
                                    <Dialog>
                                      <TooltipProvider>
                                        <Tooltip>
                                          <DialogTrigger asChild>
                                            <TooltipTrigger asChild>
                                              <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100"
                                              >
                                                <MessageSquareText className="h-4 w-4" />
                                              </Button>
                                            </TooltipTrigger>
                                          </DialogTrigger>
                                          <TooltipContent>
                                            <p>Edit Prompt</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                      <DialogContent className="bg-zinc-900 border-zinc-800">
                                        <DialogHeader>
                                          <DialogTitle className="text-zinc-100">Customize Notes Prompt</DialogTitle>
                                          <DialogDescription className="text-zinc-400">
                                            Modify the system prompt to change how the AI analyzes and generates research notes.
                                          </DialogDescription>
                                        </DialogHeader>
                                        <Textarea
                                          value={customNotesPrompt}
                                          onChange={(e) => {
                                            setCustomNotesPrompt(e.target.value);
                                            setIsNotesPromptModified(e.target.value !== DEFAULT_NOTES_PROMPT);
                                          }}
                                          className="min-h-[100px] bg-zinc-800/50 border-zinc-700 text-zinc-100"
                                        />
                                        <DialogFooter className="flex flex-row justify-between items-center">
                                          <Button
                                            variant="outline"
                                            onClick={() => {
                                              setCustomNotesPrompt(DEFAULT_NOTES_PROMPT);
                                              setIsNotesPromptModified(false);
                                              toast.success("Restored default notes prompt");
                                            }}
                                            className="bg-zinc-800/50 border-zinc-700 text-zinc-100 hover:bg-zinc-800 hover:text-zinc-50"
                                            disabled={!isNotesPromptModified}
                                          >
                                            Restore Default
                                          </Button>
                                          <Button
                                            onClick={() => {
                                              generateNotes(customNotesPrompt);
                                            }}
                                            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0"
                                          >
                                            Regenerate Notes
                                          </Button>
                                        </DialogFooter>
                                      </DialogContent>
                                    </Dialog>
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100"
                                            onClick={() => handleCopy(notes, setIsNotesCopied)}
                                          >
                                            {isNotesCopied ? (
                                              <Check className="h-4 w-4" />
                                            ) : (
                                              <Copy className="h-4 w-4" />
                                            )}
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>Copy Notes</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  </div>
                                  <div className="prose prose-invert max-w-none">
                                    {notes.split('\n\n').map((section, index) => {
                                      // Check if it's a heading (starts with #)
                                      if (section.startsWith('#')) {
                                        const level = section.match(/^#+/)[0].length;
                                        const text = section.replace(/^#+\s*/, '');
                                        const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;
                                        return (
                                          <HeadingTag key={index} className={`text-zinc-100 font-bold ${level === 1 ? 'text-xl' : level === 2 ? 'text-lg' : 'text-base'} mt-6 mb-3`}>
                                            {text}
                                          </HeadingTag>
                                        );
                                      }
                                      // Check if it's a bullet point or numbered list
                                      else if (section.match(/^[\s-]*[-•]\s+/) || section.match(/^\d+\./)) {
                                        return (
                                          <div key={index} className="pl-4 mb-2">
                                            {section}
                                          </div>
                                        );
                                      }
                                      // Regular paragraph
                                      else if (section.length > 0) {
                                        return (
                                          <p key={index} className="mb-4">
                                            {section.trim()}
                                          </p>
                                        );
                                      }
                                      return null;
                                    })}
                                  </div>
                                </div>
                              ) : (
                                <p className="text-zinc-400">
                                  Click the Notes button to generate detailed research notes and analysis.
                                </p>
                              )}
                            </div>
                          </ScrollArea>
                        </TabsContent>
                      </Tabs>
                    </CardTitle>
                  </CardHeader>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
      <footer className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 py-1">
        <div className="container flex items-center justify-between mx-auto px-4">
          <p className="text-xs text-zinc-400">
            &copy; 2025 ContentBuddy. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/ritobanrc/contentbuddy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-zinc-400 hover:text-zinc-100 transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://twitter.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-zinc-400 hover:text-zinc-100 transition-colors"
            >
              Twitter
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
