import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { Menu } from "lucide-react"

// Loading skeleton
const LoadingSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-[200px] bg-muted rounded-lg mb-4"></div>
    <div className="h-8 bg-muted rounded w-1/3 mb-2"></div>
    <div className="h-4 bg-muted rounded w-2/3"></div>
  </div>
)

// Dynamically import Hero component
const Hero = dynamic(() => import('@/components/hero'), {
  loading: () => <LoadingSkeleton />,
})

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Background effects */}
      <div className="purple-glow w-[800px] h-[800px] top-[-200px] right-[-200px] opacity-70" />
      <div className="purple-glow w-[600px] h-[600px] bottom-[-100px] left-[-100px] opacity-40" />
      
      {/* Navigation */}
      <div className="mx-4 my-3">
        <nav className="glass-nav px-5 py-3 flex justify-between items-center max-w-[1200px] mx-auto">
          <div className="flex items-center gap-2">
            <div className="text-xl font-bold flex items-center gap-2">
              <Menu className="w-5 h-5 text-primary" />
              <span className="gradient-text">ContentBuddy</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="primary-button text-sm">Start Free Trial</button>
          </div>
        </nav>
      </div>

      <Suspense fallback={<LoadingSkeleton />}>
        <Hero />
      </Suspense>
    </div>
  )
}
