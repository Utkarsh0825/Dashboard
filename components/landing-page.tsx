"use client"

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { ChevronDown, ArrowRight } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import PhaseAssessmentModal from './phase-assessment-modal'

interface LandingPageProps {
  onExploreTools: () => void
  onDashboard: () => void
  onContact: () => void
  onLogoClick: () => void
  navigateToView: (view: any) => void
  onSignUp: () => void
}

export default function LandingPage({ onExploreTools, onDashboard, onContact, onLogoClick, navigateToView, onSignUp }: LandingPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [dialogOpen, setDialogOpen] = useState<string | null>(null)
  const [phaseModalOpen, setPhaseModalOpen] = useState(false)
  const mobileMenuRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
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
            {/* <button
              onClick={() => navigateToView("free-tools")}
              className="text-foreground hover:text-muted-foreground transition-colors font-medium text-sm"
            >
              Free Resources
            </button> */}
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
            
            {/* Menu Items */}
            <div className="flex-1 px-4 py-6 space-y-4">
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  navigateToView("how-it-works")
                }}
                className="block w-full text-left text-foreground hover:text-muted-foreground transition-colors py-3 text-lg"
              >
                How it Works
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  onDashboard()
                }}
                className="block w-full text-left text-foreground hover:text-muted-foreground transition-colors py-3 text-lg"
              >
                Dashboard
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  onExploreTools()
                }}
                className="block w-full text-left text-foreground hover:text-muted-foreground transition-colors py-3 text-lg"
              >
                Explore Tools
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  window.open('https://nblk.typeform.com/NBLKForm', '_blank')
                }}
                className="block w-full text-left text-foreground hover:text-muted-foreground transition-colors py-3 text-lg"
              >
                Feedback
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  window.open('https://nblk.typeform.com/to/qUvCLRgr', '_blank')
                }}
                className="block w-full text-left text-foreground hover:text-muted-foreground transition-colors py-3 text-lg"
              >
                B2B Partner
              </button>
              {/* <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  navigateToView("free-tools")
                }}
                className="block w-full text-left text-foreground hover:text-muted-foreground transition-colors py-3 text-lg"
              >
                Free Resources
              </button> */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  onSignUp()
                }}
                className="block w-full text-left text-primary hover:text-primary/80 transition-colors py-3 text-lg font-medium"
              >
                Sign Up
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center flex-1 px-6 py-16 text-center min-h-screen">
        {/* Main Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut", delay: 0.1 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-8">
            NNX1™ Small Business Solutions
          </h1>
        </motion.div>

        {/* Description Lines */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.3 }}
          className="text-center mb-12 max-w-4xl mx-auto"
        >
          <p className="text-lg text-muted-foreground mb-4 font-medium">
          Try a quick business self-check. No signup needed - just pick a topic and go​
          </p>
          <p className="text-lg text-muted-foreground mb-4 font-medium">
            Turn 3 minutes into smarter decisions. No sign-up. Just answers to help you grow or start your business.
          </p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.5 }}
          className="mb-16"
        >
          <Button
            onClick={() => {
              onExploreTools()
              // Scroll to top when navigating
              window.scrollTo(0, 0)
            }}
            className="text-xl px-12 py-6 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-xl"
          >
            Get Started
            <ArrowRight className="ml-3 h-6 w-6" />
          </Button>
        </motion.div>

        {/* Small Business Statistics */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.7 }}
          className="w-full max-w-5xl mx-auto mb-12"
        >
          <h2 className="text-2xl font-bold text-foreground mb-8">Small Business by the Numbers</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card border-2 border-border rounded-xl p-10 text-center hover:shadow-2xl transition-all duration-300 shadow-xl hover:scale-105">
              <h3 className="text-3xl font-bold text-primary mb-3">33.3M</h3>
              <p className="text-base text-muted-foreground">Small businesses exist in the U.S.</p>
            </div>
            <div className="bg-card border-2 border-border rounded-xl p-10 text-center hover:shadow-2xl transition-all duration-300 shadow-xl hover:scale-105">
              <h3 className="text-3xl font-bold text-primary mb-3">14.3M</h3>
              <p className="text-base text-muted-foreground">Have 5 or fewer employees</p>
            </div>
            <div className="bg-card border-2 border-border rounded-xl p-10 text-center hover:shadow-2xl transition-all duration-300 shadow-xl hover:scale-105">
              <h3 className="text-3xl font-bold text-primary mb-3">400K+</h3>
              <p className="text-base text-muted-foreground">New businesses launched every month</p>
            </div>
          </div>
        </motion.div>

        {/* Italic Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.9 }}
          className="max-w-4xl mx-auto"
        >
          <p className="text-muted-foreground italic text-xl leading-relaxed">
            NNX1™ is built to help small businesses grow with clarity, confidence, and tools that meet you where you are — one smart step at a time.
          </p>
        </motion.div>
      </div>
      
      <footer className="py-6 bg-background backdrop-blur-md border-t border-border">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-sm opacity-80 text-muted-foreground mb-5">NNX1™ Business Solutions is your intelligent business companion — built for those thinking of starting a business, small businesses, nonprofits & founders managing growth or complexity. Powered by the NNX1™ engine. Developed and licensed by NBLK LLC, this tool turns intuitive answers into expert insights and clear, actionable recommendations. Based on years of research, NNX1™ is designed with the human element in mind and built around key indicators of business success, scale & growth.</p>
          
          {/* Footer Links */}
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
        onExploreTools={onExploreTools}
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
                  ) : link.id === "contact" ? (
                    <div className="space-y-6">
                      <p className="text-center text-muted-foreground leading-relaxed">
                        We are here to help you succeed. Reach out to our team for support, questions or feedback!
                      </p>
                      
                      <div className="space-y-4">
                        {/* Email Card */}
                        <div className="bg-card border-2 border-border rounded-lg p-8 flex items-center space-x-4 w-full shadow-lg">
                          <div className="bg-muted rounded-full p-3 flex-shrink-0">
                            <svg className="w-6 h-6 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
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
                        <div className="bg-card border-2 border-border rounded-lg p-8 flex items-center space-x-4 w-full shadow-lg">
                          <div className="bg-muted rounded-full p-3 flex-shrink-0">
                            <svg className="w-6 h-6 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
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
