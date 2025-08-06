"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { ArrowLeft, Target, BarChart3, TrendingUp, Shield, Zap, Layers, Users, MapPin, Handshake, Network } from "lucide-react"

interface HowItWorksProps {
  onBack: () => void
  onLogoClick: () => void
  navigateToView: (view: any) => void
  onDashboard: () => void
  onExploreTools: () => void
  onSignUp: () => void
}

export default function HowItWorks({ onBack, onLogoClick, navigateToView, onDashboard, onExploreTools, onSignUp }: HowItWorksProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const mobileMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const tiles = [
    {
      icon: Target,
      title: "Discover Your Phase",
      description: "Find out what stage your business is in — from idea to AI integration. Get guidance tailored to your growth level: Planning, Launch, Stabilization, Established, or Integration."
    },
    {
      icon: BarChart3,
      title: "Use Diagnostic Modules",
      description: "Choose tools that match your business needs — like Cash Flow, Hiring, or Marketing. Each one gives you a focused report and action steps you can use immediately."
    },
    {
      icon: TrendingUp,
      title: "Track Progress & Get Full Report",
      description: "Sign up to unlock a multi-page business diagnostic report. Track modules you've completed, monitor your growth, and download personalized summaries."
    },
    {
      icon: MapPin,
      title: "Understand Your Market",
      description: "Access smart demographic and market data based on your business and location. Clear data that helps you make smarter, local decisions."
    },
    {
      icon: Handshake,
      title: "Become a B2B Partner",
      description: "Get recommended to other businesses who need your services. Join our trusted network and grow through strategic, data-powered connections."
    },
    {
      icon: Network,
      title: "Join the NNX1 Network",
      description: "Connect with other small businesses, interns, and founders. Share insights, collaborate, and grow together inside a support-driven ecosystem."
    }
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-8 py-6 flex items-center justify-between">
          <button
            onClick={onLogoClick}
            className="text-2xl font-bold text-foreground transition-transform hover:scale-105 cursor-pointer"
          >
            NNX1
          </button>
          
          <nav className="hidden md:flex items-center space-x-6">
            <button
              onClick={() => navigateToView("how-it-works")}
              className="text-foreground hover:text-muted-foreground transition-colors font-medium text-sm"
            >
              How it Works
            </button>
            <button
              onClick={onExploreTools}
              className="text-foreground hover:text-muted-foreground transition-colors font-medium text-sm"
            >
              Explore Tools
            </button>
            <button
              onClick={onDashboard}
              className="text-foreground hover:text-muted-foreground transition-colors font-medium text-sm"
            >
              Dashboard
            </button>
            <button
              onClick={() => window.open('https://nblk.typeform.com/NBLKForm', '_blank')}
              className="text-foreground hover:text-muted-foreground transition-colors font-medium text-sm"
            >
              Feedback
            </button>
            <button
              onClick={() => window.open('https://nblk.typeform.com/to/qUvCLRgr', '_blank')}
              className="text-foreground hover:text-muted-foreground transition-colors font-medium text-sm"
            >
              B2B Partner
            </button>
          </nav>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={onSignUp}
              className="text-sm px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
            >
              Sign Up
            </button>
            <ThemeToggle />
            {/* Mobile menu button */}
            <button 
              className="md:hidden text-foreground hover:text-muted-foreground transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden bg-card border-t border-border"
            ref={mobileMenuRef}
          >
            <div className="px-8 py-4 space-y-4">
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  navigateToView("how-it-works")
                }}
                className="block w-full text-left text-foreground hover:text-muted-foreground transition-colors"
              >
                How it Works
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  onDashboard()
                }}
                className="block w-full text-left text-foreground hover:text-muted-foreground transition-colors"
              >
                Dashboard
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  onExploreTools()
                }}
                className="block w-full text-left text-foreground hover:text-muted-foreground transition-colors"
              >
                Explore Tools
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  window.open('https://nblk.typeform.com/NBLKForm', '_blank')
                }}
                className="block w-full text-left text-foreground hover:text-muted-foreground transition-colors"
              >
                Feedback
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  window.open('https://nblk.typeform.com/to/qUvCLRgr', '_blank')
                }}
                className="block w-full text-left text-foreground hover:text-muted-foreground transition-colors"
              >
                B2B Partner
              </button>
            </div>
          </motion.div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 py-16 max-w-6xl mx-auto">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <button
            onClick={onBack}
            className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </button>
        </motion.div>

        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            How NNX1™ Works
          </h1>
          <p className="text-xl text-muted-foreground mb-6 max-w-4xl mx-auto">
            Simple. Fast. Built for real business growth. Pick the topics that matter — like cash flow, hiring, or marketing. Start with one or explore them all. No sign-up needed.
          </p>
          <p className="text-lg text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            Behind the scenes? Years of research. NNX1™ is designed to feel fast and easy — but each question and result is grounded in research-based mapping to proven business frameworks. While it is simple to use, it delivers real, relevant insights that align with what actually drives business growth.
          </p>
        </motion.div>

        {/* Tiles Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
        >
          {tiles.map((tile, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
              className="bg-card border-2 border-border rounded-xl p-8 hover:shadow-2xl transition-all duration-300 shadow-lg hover:scale-105"
            >
              <div className="flex items-center mb-4">
                <tile.icon className="h-8 w-8 text-primary mr-3" />
                <h3 className="text-xl font-bold text-foreground">{tile.title}</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                {tile.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Why Choose NNX1 Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold text-foreground mb-8">
            Why Choose NNX1 for Your Business?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="text-left"
            >
              <h3 className="text-xl font-bold text-foreground mb-3">Industry-Specific Insights</h3>
              <p className="text-muted-foreground leading-relaxed">
                Our diagnostics are tailored to your specific industry, ensuring relevant and actionable recommendations.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              className="text-left"
            >
              <h3 className="text-xl font-bold text-foreground mb-3">Growth-Focused Approach</h3>
              <p className="text-muted-foreground leading-relaxed">
                Every insight is designed to drive measurable growth and improve your business performance.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.0 }}
              className="text-left"
            >
              <h3 className="text-xl font-bold text-foreground mb-3">Time-Saving Efficiency</h3>
              <p className="text-muted-foreground leading-relaxed">
                Get comprehensive business insights in minutes, not months, with our streamlined diagnostic process.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.1 }}
              className="text-left"
            >
              <h3 className="text-xl font-bold text-foreground mb-3">Continuous Improvement</h3>
              <p className="text-muted-foreground leading-relaxed">
                Track your progress and receive updated recommendations as your business evolves and scales.
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.2 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold text-foreground mb-6">
            Ready to Discover Your Business Potential?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-3xl mx-auto">
            Start your personalized business diagnostic today and unlock insights that will transform your business growth.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              onClick={() => {
                onExploreTools()
                // Scroll to top when navigating
                window.scrollTo(0, 0)
              }}
              className="text-lg px-8 py-4 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 transform hover:scale-105"
            >
              Begin Your Personalized Diagnostic
            </Button>
            <Button
              onClick={onSignUp}
              variant="outline"
              className="text-lg px-8 py-4 border-2 border-border hover:bg-muted transition-all duration-200 transform hover:scale-105"
            >
              Sign Up
            </Button>
          </div>
        </motion.div>
      </main>
    </div>
  )
} 