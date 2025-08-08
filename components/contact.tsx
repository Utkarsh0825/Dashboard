"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ChevronLeft, X as CloseIcon } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ThemeToggle } from "@/components/ui/theme-toggle"

interface ContactProps {
  onBack: () => void
}

export default function Contact({ onBack }: ContactProps) {
  const [dialogOpen, setDialogOpen] = useState<string | null>(null)

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
      {/* Sticky Header */}
      <header className="sticky top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-5xl mx-auto px-8 py-6 flex items-center justify-between">
          <button
            onClick={onBack}
            className="text-foreground hover:text-muted-foreground transition-colors p-2"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <h1 className="mt-2 text-xl md:text-2xl font-bold text-foreground absolute left-1/2 transform -translate-x-1/2">
            Get in Touch
          </h1>
          
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-col items-center flex-1 text-center max-w-4xl mx-auto pt-8">

        {/* Content */}
        <motion.div
          // initial={{ opacity: 0, y: 20 }}
          // animate={{ opacity: 1, y: 0 }}
          // transition={{ duration: 0.5, ease: "easeInOut", delay: 0.3 }}
          className="text-left space-y-8"
        >
          <div className="space-y-3">
            <p className="text-base text-muted-foreground leading-relaxed">
              We are here to help you succeed. Reach out to our team for support, questions or feedback!
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email Contact Box */}
            <div className="bg-card border-2 border-border rounded-lg p-8 shadow-lg hover:bg-muted transition-colors">
              <div className="flex items-center space-x-5">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="text-base font-medium flex-1">
                  <h3 className="text-base text-foreground">Email</h3>
                  <a 
                    href="mailto:admin@nblkconsulting.com" 
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    admin@nblkconsulting.com
                  </a>
                </div>
              </div>
            </div>

            {/* Phone Contact Box */}
            <div className="bg-card border-2 border-border rounded-lg p-8 shadow-lg hover:bg-muted transition-colors">
              <div className="flex items-center space-x-5">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div className="text-base font-medium flex-1">
                  <h3 className="text-base text-foreground">Phone</h3>
                  <a 
                    href="tel:+12125983030" 
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    +1 (212) 598-3030
                  </a>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
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