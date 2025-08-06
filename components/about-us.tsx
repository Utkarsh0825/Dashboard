"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ChevronLeft, X as CloseIcon } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ThemeToggle } from "@/components/ui/theme-toggle"

interface AboutUsProps {
  onBack: () => void
}

export default function AboutUs({ onBack }: AboutUsProps) {
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
            NNX1™ Small Business Solutions
          </h1>
          
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-col items-center flex-1 text-center max-w-4xl mx-auto pt-8 pb-10">

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut", delay: 0.3 }}
          className="text-left space-y-8"
        >
          <div className="space-y-3">
            <p className="text-base text-muted-foreground leading-relaxed">
              NNX1™ is built for small business owners, nonprofit leaders, and founders who want clear, fast insight. Answer simple questions and get targeted, expert-backed recommendations to improve operations, cash flow, marketing, and more — no technical skills required.
            </p>
          </div>
          
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">Use It Free — No Sign-Up Required</h2>
            <p className="text-base text-muted-foreground leading-relaxed">
              Pick any module and receive personalized suggestions right away, based on your answers.
            </p>
          </div>
          
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">Sign Up to Unlock Full Benefits (Still Free)</h2>
            <p className="text-base text-muted-foreground leading-relaxed">
              Create a free account to access:
            </p>
            <ul className="text-base text-muted-foreground leading-relaxed list-disc list-inside space-y-1 ml-4">
              <li>A detailed report after each module</li>
              <li>Progress tracking across modules</li>
              <li>A complete business-wide diagnostic after finishing all modules</li>
              <li>Auto-generated job descriptions for hiring or delegation</li>
              <li>Matches with qualified interns or support resources</li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">Get Recommended as a B2B Service Provider</h2>
            <p className="text-base text-muted-foreground leading-relaxed">
              If your business offers services to others, you can become part of our trusted B2B network. Our algorithm will automatically recommend your business when another user expresses a need your services can meet — based on their diagnostic responses.
            </p>
            <p className="text-base text-muted-foreground leading-relaxed">
              NNX1™ doesn't just help individual businesses grow — it connects them.
            </p>
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
                <div className="text-muted-foreground text-sm leading-relaxed">
                  {link.id === "privacy-policy" ? (
                    <>
                      NNX1™ is powered by the NNX1™ Diagnostic Engine, developed and licensed by NBLK LLC. As a product of NBLK, NNX1™ adheres to the same data handling, protection, and privacy standards outlined in the NBLK Privacy Policy.
                      <br /><br />
                      You can review the full policy here:{" "}
                      <a
                        href="https://www.n-blk.com/privacy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80 underline"
                      >
                        www.n-blk.com/privacy
                      </a>
                    </>
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