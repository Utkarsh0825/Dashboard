"use client"

import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, Database, TrendingUp, DollarSign, TestTube2, Settings, LucideGitGraph, Target, Mail, Phone, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useState, useRef, useEffect } from "react"

import { ThemeToggle } from "@/components/ui/theme-toggle"
import PhaseAssessmentModal from "./phase-assessment-modal"

interface ToolsHubProps {
  onToolSelect: (toolName: string) => void
  onLogoClick: () => void
  completedTools?: string[]
  onDashboard: () => void
  onContact: () => void
  navigateToView: (view: any) => void
  onSignUp: () => void
}

const tools = [
  {
    id: "data-hygiene",
    name: "Data Hygiene & Business Clarity",
    backendName: "Data Hygiene & Business Clarity Diagnostic",
    description: "Evaluate if your data systems are aligned, accessible and clean across teams",
    icon: Database,
  },
  {
    id: "marketing-effectiveness",
    name: "Marketing Effectiveness",
    backendName: "Marketing Effectiveness Diagnostic",
    description: "Discover if your marketing efforts are reaching the right people at the right time",
    icon: TrendingUp,
  },
  {
    id: "cash-flow",
    name: "Cash Flow & Financial Growth",
    backendName: "Cash Flow & Financial Clarity Diagnostic",
    description: "Understand and optimize your business cash flow and spending",
    icon: DollarSign,
  },
]

const placeholderTools = [
  {
    id: "operational-efficiency",
    name: "Operational Efficiency",
    description: "Optimize your business operations and improve efficiency across all departments",
    icon: TestTube2,
  },
  {
    id: "customer-retention",
    name: "Customer Retention & Growth",
    description: "Build stronger customer relationships and drive sustainable business growth",
    icon: Settings,
  },
  {
    id: "team-support",
    name: "Support & Grow Your Team",
    description: "Develop your team's capabilities and create a thriving workplace culture",
    icon: LucideGitGraph,
  },
]

export default function ToolsHub({ onToolSelect, onLogoClick, completedTools = [], onDashboard, onContact, navigateToView, onSignUp }: ToolsHubProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)
  const [phaseModalOpen, setPhaseModalOpen] = useState(false)
  const [phaseCompleted, setPhaseCompleted] = useState(false)
  const [step2Blinking, setStep2Blinking] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const cardsContainerRef = useRef<HTMLDivElement>(null)
  const [completionTimes, setCompletionTimes] = useState<Record<string, number>>({})
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const [showGuidedExperience, setShowGuidedExperience] = useState(false)
  const [guidedTarget, setGuidedTarget] = useState<string>('')

  // Initialize completion times from sessionStorage
  useEffect(() => {
    const storedTimes = sessionStorage.getItem('toolCompletionTimes')
    if (storedTimes) {
      setCompletionTimes(JSON.parse(storedTimes))
    }
  }, [])

  // Update completion times when completedTools changes
  useEffect(() => {
    const currentTime = Date.now()
    const newTimes = { ...completionTimes }
    let hasChanges = false

    // Find newly completed tools (tools that are in completedTools but not in completionTimes)
    completedTools.forEach(toolName => {
      if (!completionTimes[toolName]) {
        newTimes[toolName] = currentTime
        hasChanges = true
      }
    })

    if (hasChanges) {
      setCompletionTimes(newTimes)
      sessionStorage.setItem('toolCompletionTimes', JSON.stringify(newTimes))
    }
  }, [completedTools])



  // Check for guided navigation from dashboard
  useEffect(() => {
    const guidedNavigation = sessionStorage.getItem('dashboard_guided_navigation')
    if (guidedNavigation) {
      console.log(`🎯 Guided navigation detected: ${guidedNavigation}`)
      
      // Handle different navigation types
      if (guidedNavigation.startsWith('progress_overview_')) {
        // For progress overview navigation, extract the tool name
        const toolBackendName = guidedNavigation.replace('progress_overview_', '')
        setGuidedTarget(`business_health_${toolBackendName}`) // Use same format as business health
      } else {
        setGuidedTarget(guidedNavigation)
      }
      
      setShowGuidedExperience(true)
      
      // Clear the flag
      sessionStorage.removeItem('dashboard_guided_navigation')
      
      // Scroll to top immediately without animation
      if (typeof window !== 'undefined') {
        window.scrollTo(0, 0)
      }
      
      // Clear guided experience after 30 seconds
      setTimeout(() => {
        setShowGuidedExperience(false)
        setGuidedTarget('')
      }, 30000)
    }
  }, [])

  const getTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000)
    if (seconds < 60) return "a while ago"
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes} minutes ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} hours ago`
    const days = Math.floor(hours / 24)
    return `${days} days ago`
  }

  const formatCompletionDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const month = date.toLocaleDateString('en-US', { month: 'short' })
    const day = date.getDate()
    const year = date.getFullYear()
    return `${month} ${day}, ${year}`
  }

  const toggleExpand = (index: number) => {
    setExpandedIndex(index === expandedIndex ? null : index)
  }

  const [dialogOpen, setDialogOpen] = useState<string | null>(null)

  const footerLinks = [
    {
      id: "about-us",
      title: "About Us",
      content: "NNX1™ is built for small business owners, nonprofit leaders, and founders who want clear, fast insight. Answer simple questions and get targeted, expert-backed recommendations to improve operations, cash flow, marketing, and more — no technical skills required.\n\nUse It Free — No Sign-Up Required\nPick any module and receive personalized suggestions right away, based on your answers.\n\nSign Up to Unlock Full Benefits (Still Free)\nCreate a free account to access:\n• A detailed report after each module\n• Progress tracking across modules\n• A complete business-wide diagnostic after finishing all modules\n• Auto-generated job descriptions for hiring or delegation\n• Matches with qualified interns or support resources\n\nGet Recommended as a B2B Service Provider\nIf your business offers services to others, you can become part of our trusted B2B network. Our algorithm will automatically recommend your business when another user expresses a need your services can meet — based on their diagnostic responses.\n\nNNX1™ doesn't just help individual businesses grow — it connects them."
    },
    {
      id: "privacy-policy",
      title: "Privacy Policy",
      content: "NNX1™ is powered by the NNX1™ Diagnostic Engine, developed and licensed by NBLK LLC. As a product of NBLK, NNX1™ adheres to the same data handling, protection, and privacy standards outlined in the NBLK Privacy Policy.\n\nYou can review the full policy here: www.n-blk.com/privacy"
    },
    {
      id: "terms-of-use",
      title: "Terms of Use",
      content: "By using this site or tool, you agree to the Terms of Use and Privacy Policy set by NBLK LLC, which apply to this platform and all related services.\n\nView Full Terms of Use\nhttps://www.n-blk.com/terms-of-use"
    },
    {
      id: "disclaimer",
      title: "Disclaimer",
      content: "This tool is a beta MVP (Minimum Viable Product) released for testing and feedback purposes only. Results may include incomplete insights, AI-generated hallucinations, or inaccurate data outputs. Please do not rely solely on this tool for critical business decisions. NNX Business Solutions and NBLK LLC assume no liability for actions taken based on this beta version. Feedback is highly encouraged — click here to share any suggestions, issues, or ideas for improvement.\n\nhttps://nblk.typeform.com/NBLKForm"
    },
    {
      id: "contact",
      title: "Contact",
      content: "We are here to help you succeed. Reach out to our team for support, questions or feedback!"
    }
  ]

  // Handle click outside for dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">

      {/* Navigation Header */}
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
              onClick={() => {
                // Refresh the tools hub view
                window.location.reload()
              }}
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
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-foreground hover:text-muted-foreground transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="md:hidden fixed top-0 left-0 right-0 bottom-0 bg-background/95 backdrop-blur-sm z-50"
          ref={mobileMenuRef}
        >
          <div className="flex flex-col h-full">
            {/* Header with close button */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <span className="text-lg font-semibold text-foreground">Menu</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-foreground hover:text-muted-foreground transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Mobile menu items */}
            <div className="flex-1 p-4 space-y-4">
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  navigateToView("how-it-works")
                }}
                className="block w-full text-left text-foreground hover:text-muted-foreground transition-colors py-2"
              >
                How it Works
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  window.location.reload()
                }}
                className="block w-full text-left text-foreground hover:text-muted-foreground transition-colors py-2"
              >
                Explore Tools
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  onDashboard()
                }}
                className="block w-full text-left text-foreground hover:text-muted-foreground transition-colors py-2"
              >
                Dashboard
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  window.open('https://nblk.typeform.com/NBLKForm', '_blank')
                }}
                className="block w-full text-left text-foreground hover:text-muted-foreground transition-colors py-2"
              >
                Feedback
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  window.open('https://nblk.typeform.com/to/qUvCLRgr', '_blank')
                }}
                className="block w-full text-left text-foreground hover:text-muted-foreground transition-colors py-2"
              >
                B2B Partner
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Page Content */}
      <main className="mt-5 flex-1 px-6 py-2 max-w-5xl mx-auto w-full">
        
        {/* Step 1: Getting Started Section */}
        <div id="phase-assessment-section" className={`space-y-4 mb-8 transition-opacity duration-300 ${phaseCompleted ? 'opacity-60' : 'opacity-100'}`}>
          <h2 className="text-xl font-semibold mb-4 pl-2 text-foreground">Step 1: Discover Your Business Phase</h2>
          <div className="space-y-3">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.03 }}
              className={`cursor-pointer relative ${showGuidedExperience && guidedTarget === 'phase_assessment' ? 'animate-pulse' : ''}`}
            >
              <Card
                onClick={() => {
                  setPhaseModalOpen(true)
                  // Scroll to top when opening modal
                  window.scrollTo(0, 0)
                }}
                className={`transition-all bg-card border border-border ${
                  showGuidedExperience && guidedTarget === 'phase_assessment' 
                    ? 'bg-blue-50 dark:bg-blue-900/20 shadow-lg shadow-blue-500/25 border-blue-300 dark:border-blue-700' 
                    : ''
                }`}
              >
                            {/* Contextual Guide for Phase Assessment */}
            {showGuidedExperience && guidedTarget === 'phase_assessment' && (
              <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full shadow-lg animate-pulse">
                <Target className="w-3 h-3 inline mr-1" />
                Start Here
              </div>
            )}
                <CardHeader className="flex flex-row items-center gap-5">
                  <div className="flex items-center gap-4">
                    <Target className="w-8 h-8 text-foreground" />
                    <div className="flex-1">
                      <CardTitle className="text-foreground text-base tracking-normal">Find My Phase</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">Answer a few quick questions to find out where your business is on its journey — from Planning to Integration. This helps fine-tune the tools and insights for where you are now.</p>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Step 2: Assess Your Business */}
        <div id="tools-section" className={`space-y-4 mb-8 transition-opacity duration-300 ${phaseCompleted ? 'opacity-100' : 'opacity-60'}`}>
          <h2 className="text-xl font-semibold mb-4 pl-2 text-foreground">Step 2: Dive Into the Modules</h2>
          <p className="text-muted-foreground mb-2 pl-2">
            Pick any topic that matters — like cash flow, marketing, or data hygiene. Get a personalized result for each one. Sign up to track your progress, complete all modules, and unlock a full diagnostic report with cross-functional insights.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" ref={cardsContainerRef}>
            {/* Left Column - Working Tools */}
            <div className="space-y-4">
          {tools.map((tool, index) => {
            const isOpen = expandedIndex === index
            return (
        <motion.div
          key={tool.id}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.03 }}
          className={`cursor-pointer relative ${showGuidedExperience && guidedTarget === `business_health_${tool.backendName}` ? 'animate-pulse' : ''}`}
        >
          <Card
            onClick={() => toggleExpand(index)}
                      className={`transition-all bg-card border border-border ${
                        showGuidedExperience && guidedTarget === `business_health_${tool.backendName}` 
                          ? 'bg-blue-50 dark:bg-blue-900/20 shadow-lg shadow-blue-500/25 border-blue-300 dark:border-blue-700' 
                          : ''
                      }`}
          >
            {/* Contextual Guide for Diagnostic Tools */}
            {showGuidedExperience && guidedTarget === `business_health_${tool.backendName}` && (
              <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full shadow-lg animate-pulse">
                <Target className="w-3 h-3 inline mr-1" />
                Recommended
              </div>
            )}
                  <CardHeader className="flex flex-row items-center gap-5">
                        <div className="flex items-center gap-4">
                          <tool.icon className="w-8 h-8 text-foreground" />
                          <div className="flex-1">
                            <CardTitle className="text-foreground text-base tracking-normal">{tool.name}</CardTitle>
                            {completedTools.includes(tool.backendName) && (
                              <p className="text-xs text-green-600 dark:text-green-200 mt-1 opacity-80">
                                COMPLETED ON {formatCompletionDate(completionTimes[tool.backendName])}
                              </p>
                      )}
                    </div>
                        </div>
                  </CardHeader>

                  {/* Expanded content */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <CardContent className="pt-0 pb-4 px-11">
                  <motion.div
                          key="content"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                              <p className="text-sm text-muted-foreground mb-4">{tool.description}</p>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                                  onToolSelect(tool.backendName)
                    }}
                                className="text-sm w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    size="lg"
                  >
                                Start Diagnostic
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                        </motion.div>
                </CardContent>
                    )}
                  </AnimatePresence>
              </Card>
            </motion.div>
            )
          })}
        </div>

            {/* Right Column - Coming Soon Tools */}
            <div className="space-y-4">
              {placeholderTools.map((tool, index) => (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.03 }}
                  className="cursor-pointer"
                >
                  <Card
                    onClick={() => toggleExpand(index + tools.length)}
                    className="transition-all bg-card border border-border"
                  >
                    <CardHeader className="flex flex-row items-center gap-5">
                      <div className="flex items-center gap-4">
                        <tool.icon className="w-8 h-8 text-foreground" />
                        <div className="flex-1">
                          <CardTitle className="text-foreground text-base tracking-normal">{tool.name}</CardTitle>
                        </div>
                      </div>
                    </CardHeader>

                    {/* Expanded content */}
                    <AnimatePresence initial={false}>
                      {expandedIndex === index + tools.length && (
                        <CardContent className="pt-0 pb-4 px-11">
                          <motion.div
                            key="content"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <p className="text-sm text-muted-foreground mb-4">{tool.description}</p>
                            <Button
                              disabled
                              className="text-sm w-full bg-muted/70 border-2 border-border text-muted-foreground cursor-not-allowed"
                              size="lg"
                            >
                              Coming Soon
                            </Button>
                          </motion.div>
                        </CardContent>
                      )}
                    </AnimatePresence>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming Modules Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 1.0 }}
          className="mt-16"
        >
          <h2 className="text-2xl font-bold mb-4 text-center">Upcoming Modules</h2>
          <p className="text-muted-foreground mb-8 text-center">
            We're continuously expanding our diagnostic tools to cover every aspect of your business
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
            <div className="bg-card border-2 border-border rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-200">
              <h3 className="font-semibold text-foreground">Legal & Compliance Readiness</h3>
            </div>
            <div className="bg-card border-2 border-border rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-200">
              <h3 className="font-semibold text-foreground">Hiring & Onboarding</h3>
            </div>
            <div className="bg-card border-2 border-border rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-200">
              <h3 className="font-semibold text-foreground">Employee Management</h3>
            </div>
            <div className="bg-card border-2 border-border rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-200">
              <h3 className="font-semibold text-foreground">Customer Service & Support Systems</h3>
            </div>
            <div className="bg-card border-2 border-border rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-200">
              <h3 className="font-semibold text-foreground">Sales Strategy & Process</h3>
            </div>
            <div className="bg-card border-2 border-border rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-200">
              <h3 className="font-semibold text-foreground">AI & Automation Readiness</h3>
            </div>
            <div className="bg-card border-2 border-border rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-200">
              <h3 className="font-semibold text-foreground">Reputation Management</h3>
            </div>
            <div className="bg-card border-2 border-border rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-200">
              <h3 className="font-semibold text-foreground">Scaling & Growth Readiness</h3>
            </div>
            <div className="bg-card border-2 border-border rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-200">
              <h3 className="font-semibold text-foreground">Pricing Strategy & Profitability</h3>
            </div>
          </div>
        </motion.div>
      </main>

        {/* Footer */}
      <footer className="sticky left-0 right-0 bottom-0 py-6 bg-background backdrop-blur-md border-t border-border">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <div className="flex flex-wrap justify-center items-center text-sm">
            {footerLinks.map((link, index) => (
              <div key={link.id} className="flex items-center">
                <button
                  onClick={() => setDialogOpen(link.id)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.title}
                </button>
                {index < footerLinks.length - 1 && (
                  <span className="text-muted-foreground mx-4"> | </span>
                )}
              </div>
            ))}
          </div>
      </div>
      </footer>

      {/* Phase Assessment Modal */}
      <PhaseAssessmentModal
        isOpen={phaseModalOpen}
        onClose={() => setPhaseModalOpen(false)}
        onExploreTools={() => {
          setPhaseModalOpen(false)
          setPhaseCompleted(true)
          setStep2Blinking(true)
          // Blink twice (on-off-on-off)
          setTimeout(() => setStep2Blinking(false), 200)
          setTimeout(() => setStep2Blinking(true), 400)
          setTimeout(() => setStep2Blinking(false), 600)
        }}
        onDashboard={onDashboard}
      />

      {/* Footer Link Dialogs */}
      {footerLinks.map((link) => (
        <Dialog key={link.id} open={dialogOpen === link.id} onOpenChange={() => setDialogOpen(null)}>
          <DialogContent className="max-w-xl bg-card border border-border">
            <div className="flex flex-col items-left gap-4">
              {/* Header with close button */}
              <div className="flex items-left justify-between w-full mb-1">
                <div className="text-lg font-semibold text-foreground">{link.title}</div>
                {/* Removed duplicate close button - DialogContent has built-in close */}
              </div>
              
              {/* Content */}
              <div className="w-full bg-muted border-2 border-border rounded-lg p-6 shadow-lg max-h-[70vh] overflow-y-auto">
                <div className="text-muted-foreground text-sm leading-relaxed">
                  {link.id === "privacy-policy" ? (
                    <>
                      By using this site or tool, you agree to the Terms of Use and Privacy Policy set by NBLK LLC, which apply to this platform and all related services.
                      <br /><br />
                      <a 
                        href="https://www.n-blk.com/privacy" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80 underline"
                      >
                        View Full Privacy Policy
                      </a>
                    </>
                  ) : link.id === "terms-of-use" ? (
                    <>
                      By using this site or tool, you agree to the Terms of Use and Privacy Policy set by NBLK LLC, which apply to this platform and all related services.
                      <br /><br />
                      <a
                        href="https://www.n-blk.com/terms-of-use"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80 underline"
                      >
                        View Full Terms of Use
                      </a>
                    </>
                  ) : link.id === "disclaimer" ? (
                    <>
                      This tool is a beta MVP (Minimum Viable Product) released for testing and feedback purposes only. Results may include incomplete insights, AI-generated hallucinations, or inaccurate data outputs. Please do not rely solely on this tool for critical business decisions. NNX Business Solutions and NBLK LLC assume no liability for actions taken based on this beta version. Feedback is highly encouraged — click here to share any suggestions, issues, or ideas for improvement.
                      <br /><br />
                      <a
                        href="https://nblk.typeform.com/NBLKForm"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80 underline"
                      >
                        Share Feedback
                      </a>
                    </>
                  ) : link.id === "about-us" ? (
                    <div className="space-y-4">
                      <p>
                        NNX1™ is built for small business owners, nonprofit leaders, and founders who want clear, fast insight. Answer simple questions and get targeted, expert-backed recommendations to improve operations, cash flow, marketing, and more — no technical skills required.
                      </p>
                      
                      <div className="space-y-3">
                        <h3 className="font-semibold text-foreground">Use It Free — No Sign-Up Required</h3>
                        <p>Pick any module and receive personalized suggestions right away, based on your answers.</p>
                      </div>
                      
                      <div className="space-y-3">
                        <h3 className="font-semibold text-foreground">Sign Up to Unlock Full Benefits (Still Free)</h3>
                        <p>Create a free account to access:</p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                          <li>A detailed report after each module</li>
                          <li>Progress tracking across modules</li>
                          <li>A complete business-wide diagnostic after finishing all modules</li>
                          <li>Auto-generated job descriptions for hiring or delegation</li>
                          <li>Matches with qualified interns or support resources</li>
                        </ul>
                      </div>
                      
                      <div className="space-y-3">
                        <h3 className="font-semibold text-foreground">Get Recommended as a B2B Service Provider</h3>
                        <p>If your business offers services to others, you can become part of our trusted B2B network. Our algorithm will automatically recommend your business when another user expresses a need your services can meet — based on their diagnostic responses.</p>
                      </div>
                      
                      <p className="font-medium text-foreground">
                        NNX1™ doesn't just help individual businesses grow — it connects them.
                      </p>
                    </div>
                  ) : link.id === "contact" ? (
                    <div className="space-y-6">
                      <p className="text-center text-muted-foreground leading-relaxed">
                        We are here to help you succeed. Reach out to our team for support, questions or feedback!
                      </p>
                      
                      <div className="space-y-4">
                        {/* Email Card */}
                        <div className="bg-card border-2 border-border rounded-lg p-8 shadow-lg flex items-center space-x-4 w-full">
                          <div className="bg-muted rounded-full p-3 flex-shrink-0">
                            <Mail className="w-6 h-6 text-foreground" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-foreground text-lg">Email</h3>
                            <a 
                              href="mailto:info@nblkconsulting.com" 
                              className="text-primary hover:text-primary/80 underline text-base"
                            >
                              info@nblkconsulting.com
                            </a>
                          </div>
                        </div>
                        
                        {/* Phone Card */}
                        <div className="bg-card border-2 border-border rounded-lg p-8 shadow-lg flex items-center space-x-4 w-full">
                          <div className="bg-muted rounded-full p-3 flex-shrink-0">
                            <Phone className="w-6 h-6 text-foreground" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-foreground text-lg">Phone</h3>
                            <a 
                              href="tel:+12125983030" 
                              className="text-primary hover:text-primary/80 underline text-base"
                            >
                              +1 (212) 598-3030
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    link.content
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      ))}
    </div>
  )
}
