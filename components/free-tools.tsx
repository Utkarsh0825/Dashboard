"use client"

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight, ExternalLink, Calculator, FileText, Settings, Globe, BookOpen, Target, BarChart3, Lightbulb, Clock, CheckCircle, Palette } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/theme-toggle'

interface FreeToolsProps {
  navigateToView: (view: string) => void
  onDashboard: () => void
  onExploreTools: () => void
  onSignUp: () => void
}

const toolCategories = [
  {
    title: "Calculators & Business Tools",
    description: "100% Free, No Account Required",
    icon: <Calculator className="w-6 h-6" />,
    tools: [
      {
        name: "Calculator.net",
        url: "https://www.calculator.net/",
        description: "All-purpose calculators - Business, finance, math, health—100% free, no login",
        icon: <Calculator className="w-5 h-5" />
      },
      {
        name: "ToolsForMoney.com",
        url: "https://toolsformoney.com/",
        description: "Business calculators - ROI, valuation, breakeven, etc. No sign-up, free",
        icon: <Calculator className="w-5 h-5" />
      },
      {
        name: "CalcXML.com",
        url: "https://www.calcxml.com/",
        description: "Financial calculators - Dozens of business/finance tools—no account needed",
        icon: <Calculator className="w-5 h-5" />
      },
      {
        name: "Bankrate Calculators",
        url: "https://www.bankrate.com/calculators/",
        description: "Loans, savings, retirement - No login required, ad-supported",
        icon: <Calculator className="w-5 h-5" />
      },
      {
        name: "NerdWallet Calculators",
        url: "https://www.nerdwallet.com/calculators",
        description: "Personal/business finance - Highly usable, no sign-up",
        icon: <Calculator className="w-5 h-5" />
      },
      {
        name: "Omni Calculator",
        url: "https://www.omnicalculator.com/",
        description: "Huge calculator library - From finance to physics—immediate use",
        icon: <Calculator className="w-5 h-5" />
      },
      {
        name: "Gigacalculator.com",
        url: "https://www.gigacalculator.com/",
        description: "Math, business, finance - No account or paywall",
        icon: <Calculator className="w-5 h-5" />
      },
      {
        name: "GoodCalculators.com",
        url: "https://goodcalculators.com/",
        description: "Salary, loan, tax, business - Lightweight, straight-to-use tools",
        icon: <Calculator className="w-5 h-5" />
      }
    ]
  },
  {
    title: "Document & Conversion Tools",
    description: "No Login Needed",
    icon: <FileText className="w-6 h-6" />,
    tools: [
      {
        name: "PDF24 Tools",
        url: "https://tools.pdf24.org/en/",
        description: "Edit, convert, compress PDFs - No login, no watermark, no fee",
        icon: <FileText className="w-5 h-5" />
      },
      {
        name: "Smallpdf Free Tools",
        url: "https://smallpdf.com/free-tools",
        description: "Convert, merge, compress PDFs - Works without sign-in for basic use",
        icon: <FileText className="w-5 h-5" />
      },
      {
        name: "ILovePDF",
        url: "https://www.ilovepdf.com/",
        description: "PDF tools - Mostly free with no login for core tasks",
        icon: <FileText className="w-5 h-5" />
      },
      {
        name: "Online2PDF.com",
        url: "https://online2pdf.com/",
        description: "Convert/merge/edit PDFs - Totally free, no account ever",
        icon: <FileText className="w-5 h-5" />
      },
      {
        name: "Convertio",
        url: "https://convertio.co/",
        description: "File conversion (doc, ppt, etc.) - Light, no account needed for small jobs",
        icon: <FileText className="w-5 h-5" />
      }
    ]
  },
  {
    title: "Utility Tools",
    description: "Browser-based, Zero Sign-Up",
    icon: <Settings className="w-6 h-6" />,
    tools: [
      {
        name: "draw.io",
        url: "https://app.diagrams.net/",
        description: "Diagramming / Flowcharts - No sign-in, full-featured",
        icon: <Settings className="w-5 h-5" />
      },
      {
        name: "jsonformatter.org",
        url: "https://jsonformatter.org/",
        description: "Format, validate JSON - Tons of other tools too",
        icon: <Settings className="w-5 h-5" />
      },
      {
        name: "codebeautify.org",
        url: "https://codebeautify.org/",
        description: "Code formatting / conversion - For devs, but also includes CSV, XML, etc. tools",
        icon: <Settings className="w-5 h-5" />
      },
      {
        name: "regex101.com",
        url: "https://regex101.com/",
        description: "Regular expression testing - No login, instantly usable",
        icon: <Settings className="w-5 h-5" />
      },
      {
        name: "diffchecker.com",
        url: "https://www.diffchecker.com/",
        description: "Text/Doc diff - Paste & compare, no account needed",
        icon: <Settings className="w-5 h-5" />
      },
      {
        name: "notepad.pw",
        url: "https://notepad.pw/",
        description: "Quick notes - Fully anonymous, no account, shareable",
        icon: <Settings className="w-5 h-5" />
      }
    ]
  },
  {
    title: "Website & SEO Utilities",
    description: "Performance & Optimization Tools",
    icon: <Globe className="w-6 h-6" />,
    tools: [
      {
        name: "GTmetrix",
        url: "https://gtmetrix.com/",
        description: "Website speed test - No login needed for basic use",
        icon: <Globe className="w-5 h-5" />
      },
      {
        name: "Pingdom Tools",
        url: "https://tools.pingdom.com/",
        description: "Site performance - Instant results, no sign-in",
        icon: <Globe className="w-5 h-5" />
      },
      {
        name: "Ubersuggest (Free Search)",
        url: "https://neilpatel.com/ubersuggest/",
        description: "SEO and keyword lookup - Limited daily searches, but no account needed for some uses",
        icon: <Globe className="w-5 h-5" />
      },
      {
        name: "Toptal CSS/HTML Tools",
        url: "https://www.toptal.com/developers/css/sprite-generator",
        description: "Free code utilities - CSS, HEX, RGB, UUID, lorem ipsum, etc.",
        icon: <Globe className="w-5 h-5" />
      }
    ]
  },
  {
    title: "Learning & Templates",
    description: "Resources & Templates",
    icon: <BookOpen className="w-6 h-6" />,
    tools: [
      {
        name: "BetterExplained.com",
        url: "https://betterexplained.com/",
        description: "Math & business clarity - No paywall, no login",
        icon: <BookOpen className="w-5 h-5" />
      },
      {
        name: "Canva Free Templates",
        url: "https://www.canva.com/templates/",
        description: "Visual templates - Some can be edited/viewed without login",
        icon: <BookOpen className="w-5 h-5" />
      },
      {
        name: "OpenClipart",
        url: "https://openclipart.com/",
        description: "Free images for biz use - Public domain, download without login",
        icon: <BookOpen className="w-5 h-5" />
      },
      {
        name: "Unsplash",
        url: "https://unsplash.com/",
        description: "Free stock photos - Free to use, no sign-up to download",
        icon: <BookOpen className="w-5 h-5" />
      }
    ]
  }
]

export default function FreeTools({ navigateToView, onDashboard, onExploreTools, onSignUp }: FreeToolsProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const mobileMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-8 py-6 flex items-center justify-between">
          <button
            onClick={() => navigateToView("landing")}
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
              onClick={() => window.open('https://nblk.typeform.com/to/qUvCLRgr', '_blank')}
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
                  window.open('https://nblk.typeform.com/to/qUvCLRgr', '_blank')
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
                  navigateToView("free-tools")
                  setMobileMenuOpen(false)
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
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Free Business Tools
          </h1>
          <div className="max-w-4xl mx-auto">
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8">
              Small business owners are inundated with subscriptions, fees, and hidden costs as they grow. NNX1™ has created a smarter way forward—a 100% curated collection of free tools to help your business run, scale, and thrive. No sign-ups, no upsells, no catch—just powerful tools you can use immediate
            </p>
          </div>
        </motion.div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {toolCategories.map((category, categoryIndex) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: categoryIndex * 0.1 }}
              className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="text-primary">
                  {category.icon}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground">{category.title}</h3>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                {category.tools.map((tool, toolIndex) => (
                  <motion.div
                    key={tool.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (categoryIndex * 0.1) + (toolIndex * 0.05) }}
                    className="group"
                  >
                    <a
                      href={tool.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-all duration-200 group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-muted-foreground group-hover:text-primary transition-colors mt-0.5">
                          {tool.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">
                            {tool.name}
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                            {tool.description}
                          </p>
                        </div>
                      </div>
                    </a>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 bg-background border-t border-border">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-sm opacity-80 text-muted-foreground mb-5">
            NNX1™ Business Solutions™ is your intelligent business companion — built for thinking of starting a business, small businesses, nonprofits & founders managing growth or complexity. Powered by the NNX1™ engine (patent pending), developed and licensed by NBLK LLC, this tool turns intuitive answers into expert insights and clear, actionable recommendations. Based on years of research, NNX1™ is designed with the human element in mind and built around key indicators of business success, scale & growth.
          </p>
          
          {/* Footer Links */}
          <div className="flex flex-wrap justify-center items-center text-sm">
            <button
              onClick={() => navigateToView("about-us")}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              About Us
            </button>
            <span className="text-muted-foreground mx-4"> | </span>
            <button
              onClick={() => navigateToView("privacy-policy")}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy Policy
            </button>
            <span className="text-muted-foreground mx-4"> | </span>
            <button
              onClick={() => navigateToView("terms-of-use")}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms of Use
            </button>
            <span className="text-muted-foreground mx-4"> | </span>
            <button
              onClick={() => navigateToView("disclaimer")}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Disclaimer
            </button>
            <span className="text-muted-foreground mx-4"> | </span>
            <button
              onClick={() => navigateToView("contact")}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Contact
            </button>
          </div>
        </div>
      </footer>
    </div>
  )
} 