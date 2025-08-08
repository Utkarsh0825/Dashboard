"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Target, BarChart3, Lightbulb, Clock, CheckCircle, ChevronDown } from "lucide-react"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { useState, useEffect, useRef } from "react"

interface HowItWorksYourBusinessProps {
  onBack: () => void
  onLogoClick: () => void
  navigateToView: (view: any) => void
  onDashboard: () => void
  onExploreTools: () => void
  onSignUp: () => void
}

export default function HowItWorksYourBusiness({ onBack, onLogoClick, navigateToView, onDashboard, onExploreTools, onSignUp }: HowItWorksYourBusinessProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

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
            {/* How it Works Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center text-foreground hover:text-muted-foreground transition-colors font-medium text-sm"
              >
                How it Works
                <ChevronDown className="ml-1 h-4 w-4" />
              </button>
              
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 mt-2 w-64 bg-card border border-border rounded-lg shadow-lg z-50"
                >
                  <div className="py-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setDropdownOpen(false)
                        navigateToView("how-it-works-business")
                      }}
                      className="block w-full text-left px-4 py-2 text-foreground hover:bg-muted transition-colors"
                    >
                      How it Works for Business
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setDropdownOpen(false)
                        navigateToView("how-it-works-your-business")
                      }}
                      className="block w-full text-left px-4 py-2 text-foreground hover:bg-muted transition-colors"
                    >
                      How it Works for Your Business
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
            
            <button
              onClick={onDashboard}
              className="text-foreground hover:text-muted-foreground transition-colors font-medium text-sm"
            >
              Dashboard
            </button>
            <button
              onClick={onExploreTools}
              className="text-foreground hover:text-muted-foreground transition-colors font-medium text-sm"
            >
              Explore Tools
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
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 py-8 max-w-5xl mx-auto w-full">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <Button
            onClick={onBack}
            variant="ghost"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </motion.div>

        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            How NNX1™ Works for Your Business
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Personalized diagnostics tailored to your specific business needs, industry, and growth stage.
          </p>
        </motion.div>

        {/* Process Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-card border-2 border-border rounded-lg p-8 shadow-lg hover:shadow-xl transition-shadow"
          >
            <Target className="w-12 h-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-3">1. Personalized Assessment</h3>
            <p className="text-muted-foreground">
              Our AI analyzes your specific business profile, industry, size, and goals to create a customized diagnostic experience.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-card border-2 border-border rounded-lg p-8 shadow-lg hover:shadow-xl transition-shadow"
          >
            <BarChart3 className="w-12 h-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-3">2. Industry Benchmarking</h3>
            <p className="text-muted-foreground">
              Compare your performance against industry standards and similar businesses to identify unique opportunities.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-card border-2 border-border rounded-lg p-8 shadow-lg hover:shadow-xl transition-shadow"
          >
            <Lightbulb className="w-12 h-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-3">3. Actionable Insights</h3>
            <p className="text-muted-foreground">
              Receive specific, implementable recommendations that address your business's unique challenges and opportunities.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-card border-2 border-border rounded-lg p-8 shadow-lg hover:shadow-xl transition-shadow"
          >
            <Clock className="w-12 h-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-3">4. Ongoing Support</h3>
            <p className="text-muted-foreground">
              Track your progress over time and receive updated insights as your business evolves and grows.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-card border-2 border-border rounded-lg p-8 shadow-lg hover:shadow-xl transition-shadow"
          >
            <CheckCircle className="w-12 h-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-3">5. Measurable Results</h3>
            <p className="text-muted-foreground">
              See tangible improvements in your business metrics and performance through our proven diagnostic framework.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="bg-card border-2 border-border rounded-lg p-8 shadow-lg hover:shadow-xl transition-shadow"
          >
            <Target className="w-12 h-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-3">6. Custom Solutions</h3>
            <p className="text-muted-foreground">
              Get tailored recommendations that fit your specific business model, market, and growth objectives.
            </p>
          </motion.div>
        </div>

        {/* Benefits Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-8 mb-12"
        >
          <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
            Why Choose NNX1™ for Your Business?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">Industry-Specific Insights</h3>
              <p className="text-muted-foreground">
                Our diagnostics are tailored to your specific industry, ensuring relevant and actionable recommendations.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">Growth-Focused Approach</h3>
              <p className="text-muted-foreground">
                Every insight is designed to drive measurable growth and improve your business performance.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">Time-Saving Efficiency</h3>
              <p className="text-muted-foreground">
                Get comprehensive business insights in minutes, not months, with our streamlined diagnostic process.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">Continuous Improvement</h3>
              <p className="text-muted-foreground">
                Track your progress and receive updated recommendations as your business evolves and scales.
              </p>
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="text-center bg-card border border-border rounded-lg p-8"
        >
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Ready to Discover Your Business Potential?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Start your personalized business diagnostic today and unlock insights that will transform your business growth.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="bg-primary text-primary-foreground hover:bg-primary/90 flex-1 sm:flex-none sm:w-64"
              onClick={onExploreTools}
            >
              Begin Your Personalized Diagnostic
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-primary text-primary hover:bg-primary/10 flex-1 sm:flex-none sm:w-64"
              onClick={onSignUp}
            >
              Sign Up
            </Button>
          </div>
        </motion.div>
      </main>
    </div>
  )
} 