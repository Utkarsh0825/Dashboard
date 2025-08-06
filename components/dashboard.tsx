"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ChevronLeft, X as CloseIcon, ChevronDown } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ThemeToggle } from "@/components/ui/theme-toggle"

interface DashboardProps {
  onBack: () => void
  onLogoClick: () => void
  navigateToView: (view: any) => void
  onDashboard: () => void
  onExploreTools: () => void
  onSignUp: () => void
}

export default function Dashboard({ onBack, onLogoClick, navigateToView, onDashboard, onExploreTools, onSignUp }: DashboardProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [dialogOpen, setDialogOpen] = useState<string | null>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)

  // Close mobile menu when clicking outside
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
      content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."
    },
    {
      id: "privacy-policy",
      title: "Privacy Policy",
      content: "NNX1™ is powered by the NNX1™ Diagnostic Engine, developed and licensed by NBLK LLC. As a product of NBLK, NNX1™ adheres to the same data handling, protection, and privacy standards outlined in the NBLK Privacy Policy.\n\nYou can review the full policy here: www.n-blk.com/privacy"
    },
    {
      id: "sitemap",
      title: "Sitemap",
      content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium."
    },
    {
      id: "terms-of-use",
      title: "Terms of Use",
      content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit."
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
            <Button 
              onClick={onSignUp}
              className="text-sm px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
            >
              Sign Up
            </Button>
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
            
            {/* Menu Items */}
            <div className="flex-1 px-4 py-6 space-y-4">
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  navigateToView("how-it-works-business")
                }}
                className="block w-full text-left text-foreground hover:text-muted-foreground transition-colors py-3 text-lg"
              >
                How it Works for Business
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  navigateToView("how-it-works-your-business")
                }}
                className="block w-full text-left text-foreground hover:text-muted-foreground transition-colors py-3 text-lg"
              >
                How it Works for Your Business
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
      <div className="flex flex-col items-center flex-1 text-center max-w-4xl mx-auto pt-8 relative">
        {/* Blurred Content */}
        <div className="blur-sm pointer-events-none w-full">
          <motion.div
            // initial={{ opacity: 0, y: 20 }}
            // animate={{ opacity: 1, y: 0 }}
            // transition={{ duration: 0.5, ease: "easeInOut", delay: 0.3 }}
            className="text-left space-y-8"
          >
            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">Analytics Overview</h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
              </p>
            </div>
            
            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">Performance Tracking</h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
              </p>
            </div>
            
            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">Progress Monitoring</h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
              </p>
            </div>
            
            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">Data Insights</h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Sign Up Overlay */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <motion.div
            initial={{ opacity: 1, scale: 0.8, y: 0 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.1 }}
            className="bg-card border border-border rounded-lg p-8 max-w-lg mx-4 text-center shadow-2xl"
          >
            <h2 className="text-xl font-bold text-foreground mb-4">Sign up to unlock your dashboard</h2>
            <p className="text-muted-foreground mb-6">
              Track your progress, view personalized insights, and pick up where you left off — anytime. Create a free account to access your full diagnostic history and analytics.
            </p>
            <div className="flex gap-3">
              <Button 
                onClick={onSignUp}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Sign Up
              </Button>
              <Button 
                onClick={onSignUp}
                className="flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/90"
              >
                Login
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="sticky left-0 right-0 bottom-0 py-6 bg-background backdrop-blur-md border-t border-border">
        <div className="max-w-5xl mx-auto px-4 text-center">
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
              <div className="w-full bg-muted border-2 border-border rounded-lg p-6 shadow-lg">
                <div className="text-muted-foreground text-sm leading-relaxed">{link.content}</div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      ))}
    </div>
  )
} 