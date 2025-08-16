"use client"

import { useState, useEffect, useRef, Fragment } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, X, CheckCircle, Mail, Phone, AlertTriangle, TrendingUp, Lock, Check, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { Listbox, Transition } from "@headlessui/react"
import { ChevronDownIcon, CheckIcon } from "@heroicons/react/20/solid"
import type { DiagnosticAnswer } from "@/app/page"
import { saveReportRequest, updateUserData } from "@/lib/dashboard-tracking"

interface EmailCaptureProps {
  onSubmit?: (name: string, email: string) => void
  onBack?: () => void
  onLogoClick?: () => void
  onExploreTools?: () => void
  toolName?: string
  score?: number
  answers?: DiagnosticAnswer[]
}

const industryOptions = [
  "Administrative Support & Waste Management Services",
  "Agriculture, Forestry, Fishing & Hunting",
  "Construction",
  "Financial Activities",
  "Health Care & Social Assistance",
  "Information (Publishing, IT, Data Services)",
  "Manufacturing",
  "Other Services (Repair, Personal, Civic, Religious Services)",
  "Professional, Scientific & Technical Services (Consulting, Legal, Design)",
  "Real Estate & Rental & Leasing",
  "Retail Trade",
  "Transportation, Warehousing & Utilities",
  "Educational Services",
  "Management of Companies & Enterprises",
  "Wholesale Trade",
  "Accommodation & Food Services",
  "Arts, Entertainment & Recreation",
  "Mining & Oil & Gas Extraction",
  "Natural Resources & Mining (including utilities)"
]

// Business facts for loading screen
const businessFacts = [
  "Small businesses create 2 out of every 3 new jobs in the US",
  "99.9% of all US businesses are small businesses",
  "Small businesses employ 47.1% of the US workforce",
  "The average small business owner works 52 hours per week",
  "83% of small businesses use social media for marketing",
  "Only 40% of small businesses have a formal business plan",
  "Small businesses contribute 44% of US economic activity",
  "The average small business has 10 employees",
  "70% of small businesses survive their first year",
  "50% of small businesses survive their first 5 years"
]

export default function EmailCapture({ onSubmit, onBack, onLogoClick, onExploreTools, toolName = "", score = 0, answers = [] }: EmailCaptureProps) {
  const [contactDialogOpen, setContactDialogOpen] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [showResendSuccess, setShowResendSuccess] = useState(false)
  
  // Loading screen states
  const [showLoadingScreen, setShowLoadingScreen] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [currentFact, setCurrentFact] = useState(0)
  const [emailConfirmed, setEmailConfirmed] = useState(false)
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false)
  
  // Form state for single comprehensive form
  const [fullName, setFullName] = useState("")
  const [fullCompany, setFullCompany] = useState("")
  const [fullIndustry, setFullIndustry] = useState("")
  const [fullZipCode, setFullZipCode] = useState("")
  const [fullEmail, setFullEmail] = useState("")
  const [isSubmittingFull, setIsSubmittingFull] = useState(false)
  const cooldownRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (resendCooldown > 0) {
      cooldownRef.current = setTimeout(() => {
        setResendCooldown((prev) => prev - 1)
      }, 1000)
    } else if (cooldownRef.current) {
      clearTimeout(cooldownRef.current)
    }
    return () => {
      if (cooldownRef.current) clearTimeout(cooldownRef.current)
    }
  }, [resendCooldown])

  // Loading screen progress and fact rotation
  useEffect(() => {
    if (showLoadingScreen) {
      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval)
            setShowLoadingScreen(false)
            setShowSuccessModal(true)
            return 100
          }
          return prev + 4 // Complete in 25 seconds (100/4 = 25)
        })
      }, 1000)

      const factInterval = setInterval(() => {
        setCurrentFact(prev => (prev + 1) % businessFacts.length)
      }, 3000) // Change fact every 3 seconds

      return () => {
        clearInterval(progressInterval)
        clearInterval(factInterval)
      }
    }
  }, [showLoadingScreen])

  // Email confirmation effect - removed auto-start, now manual from button

  const handleZipCodeChange = (value: string) => {
    // Only allow numbers and limit to 5 digits
    const numericValue = value.replace(/\D/g, '').slice(0, 5)
    setFullZipCode(numericValue)
  }

  // Start loading screen and actual submission
  const startLoadingAndSubmission = async () => {
    setShowLoadingScreen(true)
    setLoadingProgress(0)
    setCurrentFact(0)
    
    try {
      // Get user's timezone for accurate PDF timestamps
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York'
      console.log('🌍 User timezone detected:', userTimezone)
      
      // Generate dynamic report content based on user data
      const currentDate = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'numeric', 
        day: 'numeric',
        timeZone: userTimezone
      });
      
      // Generate dynamic report content based on actual diagnostic results
      const getScoreMessage = (score: number) => {
        if (score >= 80) return "Your business shows strong performance with room for strategic improvements"
        if (score >= 60) return "Your business shows good performance with several areas for improvement"
        if (score >= 40) return "Your business has opportunities for improvement and growth"
        return "Your business has significant opportunities for improvement and growth"
      }

      const getToolDisplayName = (toolName: string) => {
        return toolName.replace(" Diagnostic", "")
      }

      const getInsights = (toolName: string, score: number) => {
        const toolInsights = {
          "Marketing Effectiveness Diagnostic": [
            "Marketing Attribution Gap - You're missing critical insights about which marketing channels and campaigns drive actual business results.",
            "Audience Targeting Optimization - There's potential to refine your targeting strategies for better return on advertising spend.",
            "Customer Feedback Integration - Enhanced customer feedback collection could optimize your offerings and customer experience."
          ],
          "Data Hygiene & Business Clarity Diagnostic": [
            "Data Centralization - Your business data could be better organized and centralized for improved decision-making.",
            "System Integration - There's opportunity to connect your business systems for better workflow efficiency.",
            "Data Quality - Improving data accuracy and consistency could enhance your business insights."
          ],
          "Cash Flow & Financial Clarity Diagnostic": [
            "Financial Tracking - Your cash flow monitoring could be enhanced for better financial visibility.",
            "Profit Analysis - There's potential to better understand your profit drivers and cost structure.",
            "Financial Planning - Improved financial planning could help optimize your business growth."
          ]
        }
        
        return toolInsights[toolName as keyof typeof toolInsights] || [
          "Business Process Optimization - There are opportunities to streamline your business operations.",
          "Performance Monitoring - Enhanced tracking could provide better insights into your business performance.",
          "Strategic Planning - Improved planning could help optimize your business growth."
        ]
      }

      const getRecommendations = (toolName: string) => {
        const toolRecommendations = {
          "Marketing Effectiveness Diagnostic": [
            "Implement comprehensive marketing attribution tracking using analytics platforms",
            "Develop detailed buyer personas based on your best customers",
            "Set up automated customer feedback collection systems",
            "Create consistent brand messaging across all marketing channels",
            "Establish A/B testing protocols for campaigns and website elements",
            "Implement marketing automation to nurture leads"
          ],
          "Data Hygiene & Business Clarity Diagnostic": [
            "Centralize your business data using cloud-based management platforms",
            "Implement automated data synchronization between your business systems",
            "Establish regular data quality audits and cleaning procedures",
            "Create standardized documentation processes for all business operations",
            "Set up comprehensive customer relationship management systems",
            "Develop clear data governance policies and procedures"
          ],
          "Cash Flow & Financial Clarity Diagnostic": [
            "Implement comprehensive financial tracking and reporting systems",
            "Develop detailed cash flow forecasting and monitoring processes",
            "Establish automated expense tracking and categorization",
            "Create clear pricing strategies based on cost analysis",
            "Set up regular financial review and planning sessions",
            "Implement profit margin optimization strategies"
          ]
        }
        
        return toolRecommendations[toolName as keyof typeof toolRecommendations] || [
          "Review diagnostic report with leadership team",
          "Prioritize top 3 recommendations by impact and resources",
          "Assign team members as owners for each initiative",
          "Create detailed implementation plans for priority areas",
          "Begin implementing quick wins for immediate results",
          "Set up weekly progress check-ins"
        ]
      }

      const insights = getInsights(toolName, score)
      const recommendations = getRecommendations(toolName)
      const scoreMessage = getScoreMessage(score)
      const toolDisplayName = getToolDisplayName(toolName)

      const reportContent = `**EXECUTIVE SUMMARY**

${scoreMessage}

**DIAGNOSTIC OVERVIEW**
Tool: ${toolDisplayName}
Score: ${score}/100
Date: ${currentDate}

**KEY INSIGHTS**

${insights.map((insight, index) => `${index + 1}. ${insight}`).join('\n\n')}

**STRATEGIC RECOMMENDATIONS**

${recommendations.map((rec, index) => `${index + 1}. ${rec}`).join('\n')}

**IMPLEMENTATION TIMELINE**

**Immediate (0-30 days):**
• Review diagnostic report with leadership team
• Prioritize top 3 recommendations by impact and resources
• Assign team members as owners for each initiative

**Short-term (30-90 days):**
• Create detailed implementation plans for priority areas
• Begin implementing quick wins for immediate results
• Set up weekly progress check-ins

**Long-term (90+ days):**
• Establish quarterly business diagnostic reviews
• Scale successful improvements across other business areas
• Consider engaging professional consultants for complex implementations

**SUCCESS METRICS**

• Business performance improvement (target: 25% increase)
• Operational efficiency optimization
• Cost reduction and profit margin improvement
• Process accuracy and consistency (target: 90%+)

**NEXT STEPS**

1. Review this report with your leadership team within 48 hours
2. Prioritize the top 3 recommendations based on impact and resources
3. Schedule follow-up consultation to discuss implementation strategy

**Contact Information:**
NBLK Consulting
442 5th Avenue, #2304, New York, NY 10018
Email: info@nblkconsulting.com
Phone: (212) 598-3030

*NNX1™ Small Business Solutions - Empowering Business Clarity Through Data-Driven Insights*`;

      // Send email with all collected information
      const response = await fetch('/api/send-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: fullEmail,
          name: fullName,
          toolName: toolName,
          reportContent: reportContent,
          score: score, // Use actual calculated score
          answers: answers,
          userTimezone: userTimezone // Pass user's timezone to API
        }),
      })

      if (response.ok) {
        const responseData = await response.json()
        console.log('✅ Email sent successfully:', responseData)
        
        // Save report request to dashboard tracking
        saveReportRequest({
          toolName,
          name: fullName,
          email: fullEmail,
          score
        })
        
        // Update user data
        updateUserData(fullName, fullEmail)
        
        // Success will be shown after loading screen completes
      } else {
        const errorData = await response.text()
        console.error('❌ Failed to send email:', errorData)
        setShowLoadingScreen(false)
        alert('Failed to send email. Please try again.')
      }
    } catch (error) {
      console.error('❌ Error sending email:', error)
      setShowLoadingScreen(false)
      alert('Network error. Please check your connection and try again.')
    } finally {
      setIsSubmittingFull(false)
    }
  }

  // Full diagnostic submit - now sends email with all collected information
  const handleFullSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName.trim() || !fullCompany.trim() || !fullIndustry.trim() || !fullZipCode.trim() || !fullEmail.trim()) return
    
    // Validate zip code length
    if (fullZipCode.length !== 5) {
      alert("Please enter a valid 5-digit zip code")
      return
    }
    
    // Show email confirmation first
    setShowEmailConfirmation(true)
    setIsSubmittingFull(true)
  }

  // Resend logic using the same dynamic content generation
  const handleResend = async () => {
    if (resendCooldown > 0) return
    if (!fullName.trim() || !fullEmail.trim()) return
    
    setResendCooldown(60)
    setShowResendSuccess(true)
    
    try {
      // Generate the same dynamic report content
      const getScoreMessage = (score: number) => {
        if (score >= 80) return "Your business shows strong performance with room for strategic improvements"
        if (score >= 60) return "Your business shows good performance with several areas for improvement"
        if (score >= 40) return "Your business has opportunities for improvement and growth"
        return "Your business has significant opportunities for improvement and growth"
      }

      const getToolDisplayName = (toolName: string) => {
        return toolName.replace(" Diagnostic", "")
      }

      const getInsights = (toolName: string, score: number) => {
        const toolInsights = {
          "Marketing Effectiveness Diagnostic": [
            "Marketing Attribution Gap - You're missing critical insights about which marketing channels and campaigns drive actual business results.",
            "Audience Targeting Optimization - There's potential to refine your targeting strategies for better return on advertising spend.",
            "Customer Feedback Integration - Enhanced customer feedback collection could optimize your offerings and customer experience."
          ],
          "Data Hygiene & Business Clarity Diagnostic": [
            "Data Centralization - Your business data could be better organized and centralized for improved decision-making.",
            "System Integration - There's opportunity to connect your business systems for better workflow efficiency.",
            "Data Quality - Improving data accuracy and consistency could enhance your business insights."
          ],
          "Cash Flow & Financial Clarity Diagnostic": [
            "Financial Tracking - Your cash flow monitoring could be enhanced for better financial visibility.",
            "Profit Analysis - There's potential to better understand your profit drivers and cost structure.",
            "Financial Planning - Improved financial planning could help optimize your business growth."
          ]
        }
        
        return toolInsights[toolName as keyof typeof toolInsights] || [
          "Business Process Optimization - There are opportunities to streamline your business operations.",
          "Performance Monitoring - Enhanced tracking could provide better insights into your business performance.",
          "Strategic Planning - Improved planning could help optimize your business growth."
        ]
      }

      const getRecommendations = (toolName: string) => {
        const toolRecommendations = {
          "Marketing Effectiveness Diagnostic": [
            "Implement comprehensive marketing attribution tracking using analytics platforms",
            "Develop detailed buyer personas based on your best customers",
            "Set up automated customer feedback collection systems",
            "Create consistent brand messaging across all marketing channels",
            "Establish A/B testing protocols for campaigns and website elements",
            "Implement marketing automation to nurture leads"
          ],
          "Data Hygiene & Business Clarity Diagnostic": [
            "Centralize your business data using cloud-based management platforms",
            "Implement automated data synchronization between your business systems",
            "Establish regular data quality audits and cleaning procedures",
            "Create standardized documentation processes for all business operations",
            "Set up comprehensive customer relationship management systems",
            "Develop clear data governance policies and procedures"
          ],
          "Cash Flow & Financial Clarity Diagnostic": [
            "Implement comprehensive financial tracking and reporting systems",
            "Develop detailed cash flow forecasting and monitoring processes",
            "Establish automated expense tracking and categorization",
            "Create clear pricing strategies based on cost analysis",
            "Set up regular financial review and planning sessions",
            "Implement profit margin optimization strategies"
          ]
        }
        
        return toolRecommendations[toolName as keyof typeof toolRecommendations] || [
          "Review diagnostic report with leadership team",
          "Prioritize top 3 recommendations by impact and resources",
          "Assign team members as owners for each initiative",
          "Create detailed implementation plans for priority areas",
          "Begin implementing quick wins for immediate results",
          "Set up weekly progress check-ins"
        ]
      }

      const insights = getInsights(toolName, score)
      const recommendations = getRecommendations(toolName)
      const scoreMessage = getScoreMessage(score)
      const toolDisplayName = getToolDisplayName(toolName)

      const reportContent = `**Assessment:** ${toolDisplayName}

**EXECUTIVE SUMMARY**

Your ${toolDisplayName} assessment reveals a score of ${score}/100, ${scoreMessage.toLowerCase()}. You have demonstrated solid business fundamentals while identifying key areas for strategic enhancement. Addressing these opportunities could significantly improve your business performance and operational efficiency.

**KEY INSIGHTS**

1. **${insights[0].split(' - ')[0]}**
   ${insights[0].split(' - ')[1]}

2. **${insights[1].split(' - ')[0]}**
   ${insights[1].split(' - ')[1]}

3. **${insights[2].split(' - ')[0]}**
   ${insights[2].split(' - ')[1]}

**STRATEGIC RECOMMENDATIONS**

${recommendations.map((rec, index) => `${index + 1}. ${rec}`).join('\n')}

**IMPLEMENTATION TIMELINE**

**Immediate (0-30 days):**
• Review diagnostic report with leadership team
• Prioritize top 3 recommendations by impact and resources
• Assign team members as owners for each initiative

**Short-term (30-90 days):**
• Create detailed implementation plans for priority areas
• Begin implementing quick wins for immediate results
• Set up weekly progress check-ins

**Long-term (90+ days):**
• Establish quarterly business diagnostic reviews
• Scale successful improvements across other business areas
• Consider engaging professional consultants for complex implementations

**SUCCESS METRICS**

• Business performance improvement (target: 25% increase)
• Operational efficiency optimization
• Cost reduction and profit margin improvement
• Process accuracy and consistency (target: 90%+)

**NEXT STEPS**

1. Review this report with your leadership team within 48 hours
2. Prioritize the top 3 recommendations based on impact and resources
3. Schedule follow-up consultation to discuss implementation strategy

**Contact Information:**
NBLK Consulting
442 5th Avenue, #2304, New York, NY 10018
Email: info@nblkconsulting.com
Phone: (212) 598-3030

*NNX1™ Small Business Solutions - Empowering Business Clarity Through Data-Driven Insights*`;

      // Send email with all collected information
      const response = await fetch('/api/send-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: fullEmail,
          name: fullName,
          toolName: toolName,
          reportContent: reportContent,
          score: score,
          answers: answers
        }),
      })

      if (!response.ok) {
        console.error('Failed to resend email')
      }
    } catch (error) {
      console.error('Error resending email:', error)
    }
    
    setTimeout(() => setShowResendSuccess(false), 2500)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-5xl mx-auto min-h-screen px-4 md:px-8 text-foreground bg-background flex flex-col"
    >
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md px-4 py-4 flex items-center justify-between border-b border-border">
        <button onClick={onBack} className="p-2">
          <ChevronLeft className="h-5 w-5 text-foreground" />
        </button>
        {/* Theme Toggle */}
        <ThemeToggle />
      </header>

      {/* Contact Us Dialog */}
      <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
        <DialogContent className="bg-card text-card-foreground rounded-2xl shadow-2xl border-0 p-0 max-w-md mx-auto">
          <div className="flex">
            <div className="flex-1 p-8 pl-10 flex flex-col gap-4">
              <DialogHeader className="mb-2">
                <DialogTitle className="text-xl font-bold">Contact Us</DialogTitle>
                <DialogDescription className="text-l text-muted-foreground">
                  We are here to help you succeed. Reach out to our team for support, questions or feedback.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-4 mt-1">
                <div className="flex items-center gap-4">
                  <Mail className="w-6 h-6 text-foreground" />
                  <a href="mailto:admin@nblkconsulting.com" className="hover:text-foreground/80 text-sm">admin@nblkconsulting.com</a>
                </div>
                <div className="flex items-center gap-4">
                  <Phone className="w-6 h-6 text-foreground" />
                  <a href="tel:+12125983030" className="hover:text-foreground/80 text-sm">+1 (212) 598-3030</a>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Main Content */}
      <div className="flex flex-col flex-1 items-center justify-start max-w-lg mx-auto gap-6 mt-6">
        {/* Single Form Box */}
                 <div className="w-full rounded-lg border-2 border-border hover:border-border p-8 bg-card/5 flex flex-col gap-4 relative shadow-lg">
           <button
             onClick={onBack}
             className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted/50 transition-colors"
             aria-label="Close"
           >
             <X className="h-5 w-5 text-muted-foreground" />
           </button>
           <h1 className="text-xl font-medium text-center">Preview Your Beta Report</h1>
          <p className="text-sm text-muted-foreground text-center mb-4">
            This is a test version of NNX Small Business Solutions module. Sign up to view your sample diagnostic module report and get notified when the full platform launches.
          </p>
          
            <form onSubmit={handleFullSubmit} className="flex flex-col gap-4">
              <Input
                type="text"
                placeholder="Preferred Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              className="bg-muted border border-border text-foreground placeholder-muted-foreground rounded-lg px-4 py-4 text-base focus:ring-1 focus:ring-primary focus:outline-none transition-all duration-100"
                required
              />
              <Input
                type="text"
                placeholder="Name of Company"
                value={fullCompany}
                onChange={(e) => setFullCompany(e.target.value)}
              className="bg-muted border border-border text-foreground placeholder-muted-foreground rounded-lg px-4 py-4 text-base focus:ring-1 focus:ring-primary focus:outline-none transition-all duration-300"
                required
              />
                             <div className="relative">
                 <Listbox value={fullIndustry} onChange={setFullIndustry}>
                   <div className="relative">
                                           <Listbox.Button className="relative w-full h-[52px] px-4 py-4 rounded-lg bg-muted border border-border text-left text-foreground placeholder-muted-foreground focus:ring-1 focus:ring-primary focus:outline-none transition-all duration-300 cursor-pointer text-base flex items-center">
                       <span className={`block truncate ${fullIndustry ? 'text-foreground' : 'text-muted-foreground'}`}>
                         {fullIndustry || "Select Industry"}
                       </span>
                       <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                         <ChevronDownIcon
                           className="h-5 w-5 text-muted-foreground"
                           aria-hidden="true"
                         />
                       </span>
                     </Listbox.Button>
                    <Transition
                      as={Fragment}
                      leave="transition ease-in duration-100"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                    >
                      <Listbox.Options className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-lg bg-card border border-border shadow-lg focus:outline-none">
                        {industryOptions.map((industry, industryIdx) => (
                          <Listbox.Option
                            key={industryIdx}
                            className={({ active }) =>
                              `relative cursor-pointer select-none py-3 px-4 ${
                                active ? 'bg-primary/10 text-primary' : 'text-foreground'
                              }`
                            }
                            value={industry}
                          >
                            {({ selected }) => (
                              <>
                                <span className={`block ${selected ? 'font-medium' : 'font-normal'}`}>
                                  {industry}
                                </span>
                                {selected ? (
                                  <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-primary">
                                    <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                  </span>
                                ) : null}
                              </>
                            )}
                          </Listbox.Option>
                        ))}
                      </Listbox.Options>
                    </Transition>
                  </div>
                </Listbox>
              </div>
              <Input
                type="text"
                placeholder="Zip Code (5 digits)"
                value={fullZipCode}
                onChange={(e) => handleZipCodeChange(e.target.value)}
                maxLength={5}
                pattern="[0-9]{5}"
                className="bg-muted border border-border text-foreground placeholder-muted-foreground rounded-lg px-4 py-4 text-base focus:ring-1 focus:ring-primary focus:outline-none transition-all duration-300"
                required
              />
              <Input
                type="email"
                placeholder="Email Address"
                value={fullEmail}
                onChange={(e) => setFullEmail(e.target.value)}
              className="bg-muted border border-border text-foreground placeholder-muted-foreground rounded-lg px-4 py-4 text-base focus:ring-1 focus:ring-primary focus:outline-none transition-all duration-300"
                required
              />
              <Button
                type="submit"
              disabled={!fullName.trim() || !fullEmail.trim() || !fullCompany.trim() || !fullIndustry.trim() || !fullZipCode.trim() || isSubmittingFull}
              className="w-full py-4 text-lg bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl transition-all duration-300 disabled:opacity-50 hover:shadow-xl transform-gpu"
              >
              {isSubmittingFull ? "Sending..." : "Submit"}
          </Button>
        </form>
          
          <div className="text-xs text-muted-foreground text-center mt-4">
              Your information is secure and won't be shared
          </div>
        </div>
      </div>
      {/* Footer: Early version notice */}
      <div className="w-full flex justify-center mt-6 mb-7">
        <div className="flex items-center gap-2 bg-muted/10 border border-border rounded-full px-4 py-2 text-xs text-muted-foreground shadow-sm">
          <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
          <span>We're currently testing interest in this early version</span>
            </div>
      </div>

      {/* Email Confirmation Modal */}
      <Dialog open={showEmailConfirmation} onOpenChange={setShowEmailConfirmation}>
        <DialogContent className="bg-card text-card-foreground rounded-2xl shadow-2xl border border-border p-0 max-w-lg mx-auto">
          <div className="flex flex-col p-8 items-center">
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.05, type: "spring", stiffness: 200, duration: 0.3 }}
              className="text-center mb-5"
            >
              <Mail className="mx-auto mb-6" size={60} strokeWidth={2.5} color="#fff" fill="none" />
              <DialogTitle className="text-xl font-medium">Confirm Your Email</DialogTitle>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.2 }}
              className="text-center mb-6"
            >
              <p className="text-sm text-muted-foreground mb-3">
                Hi <strong>{fullName}</strong>, we're about to send your report to:
              </p>
              <div className="bg-muted/20 border border-border rounded-lg p-4 mb-4">
                <p className="font-medium text-foreground">{fullEmail}</p>
              </div>
              <p className="text-xs text-muted-foreground">
                Is this email correct? You can change it below if needed.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.2 }}
              className="w-full space-y-4"
            >
              <Input
                type="email"
                placeholder="Email Address"
                value={fullEmail}
                onChange={(e) => setFullEmail(e.target.value)}
                className="bg-muted border border-border text-foreground placeholder-muted-foreground rounded-lg px-4 py-3 text-base focus:ring-1 focus:ring-primary focus:outline-none transition-all duration-300"
              />
              
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setShowEmailConfirmation(false)
                    setIsSubmittingFull(false)
                  }}
                  variant="outline"
                  className="flex-1 py-3 border border-border text-foreground hover:bg-muted/50 transition-colors"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    setEmailConfirmed(true)
                    setShowEmailConfirmation(false)
                    startLoadingAndSubmission()
                  }}
                  className="flex-1 py-3 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Confirm & Send
                </Button>
              </div>
            </motion.div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Loading Screen Modal */}
      <Dialog open={showLoadingScreen} onOpenChange={() => {}}>
        <DialogContent className="bg-card text-card-foreground rounded-2xl shadow-2xl border border-border p-0 max-w-lg mx-auto">
          <div className="flex flex-col p-8 items-center">
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.05, type: "spring", stiffness: 200, duration: 0.3 }}
              className="text-center mb-6"
            >
              <div className="relative mb-6">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-primary" />
                </div>
              </div>
              <DialogTitle className="text-xl font-medium mb-2">Generating Your Report</DialogTitle>
              <p className="text-sm text-muted-foreground">
                Analyzing your answers and creating personalized insights...
              </p>
            </motion.div>
            
            {/* Progress Bar */}
            <div className="w-full mb-6">
              <div className="flex justify-between text-xs text-muted-foreground mb-2">
                <span>Progress</span>
                <span>{loadingProgress}%</span>
              </div>
              <div className="w-full bg-muted/20 rounded-full h-2">
                <motion.div
                  className="bg-primary h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${loadingProgress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            {/* Business Fact */}
            <motion.div
              key={currentFact}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <p className="text-sm text-muted-foreground mb-2">Did you know?</p>
              <p className="text-foreground font-medium">{businessFacts[currentFact]}</p>
            </motion.div>

            {/* Loading Steps */}
            <div className="w-full mt-6 space-y-2">
              <div className="flex items-center gap-3 text-sm">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-2 h-2 bg-green-500 rounded-full"
                />
                <span className={loadingProgress > 20 ? "text-foreground" : "text-muted-foreground"}>
                  Analyzing diagnostic responses
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
                  className={`w-2 h-2 rounded-full ${loadingProgress > 40 ? "bg-green-500" : "bg-muted-foreground"}`}
                />
                <span className={loadingProgress > 40 ? "text-foreground" : "text-muted-foreground"}>
                  Generating PDF report
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 1 }}
                  className={`w-2 h-2 rounded-full ${loadingProgress > 60 ? "bg-green-500" : "bg-muted-foreground"}`}
                />
                <span className={loadingProgress > 60 ? "text-foreground" : "text-muted-foreground"}>
                  Preparing email with attachments
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 1.5 }}
                  className={`w-2 h-2 rounded-full ${loadingProgress > 80 ? "bg-green-500" : "bg-muted-foreground"}`}
                />
                <span className={loadingProgress > 80 ? "text-foreground" : "text-muted-foreground"}>
                  Sending to your inbox
                </span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="bg-card text-card-foreground rounded-2xl shadow-2xl border border-border p-0 max-w-lg mx-auto">
          <div className="flex flex-col p-8 items-center">
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.05, type: "spring", stiffness: 200, duration: 0.3 }}
              className="text-center mb-5"
            >
              <CheckCircle className="mx-auto mb-6" size={60} strokeWidth={2.5} color="#fff" fill="none" />
              <DialogTitle className="text-xl font-medium">Report Sent Successfully!</DialogTitle>
            </motion.div>
          
              
                         {/* Resend Link */}
             <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 0.2, duration: 0.2 }}
               className="text-center mt-2"
             >
               <p className="text-sm text-muted-foreground mb-1">Didn't receive the email?</p>
               <span
                 onClick={resendCooldown === 0 ? handleResend : undefined}
                 className={`text-foreground underline text-sm cursor-pointer hover:no-underline hover:text-muted-foreground transition-colors duration-300 ${resendCooldown > 0 ? 'opacity-50 pointer-events-none cursor-not-allowed' : ''}`}
                 role="button"
                 tabIndex={0}
                 aria-disabled={resendCooldown > 0}
               >
                 {resendCooldown > 0 ? `Resend Report (${resendCooldown}s)` : "Resend Report"}
               </span>
             </motion.div>
             
             {/* Navigation Buttons */}
             <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 0.3, duration: 0.2 }}
               className="flex flex-col gap-3 mt-6 w-full"
             >
               <Button
                 onClick={onLogoClick}
                 className="w-full py-3 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
               >
                 Go to Home Page
               </Button>
               <Button
                 onClick={onExploreTools}
                 variant="outline"
                 className="w-full py-3 border border-border text-foreground hover:bg-muted/50 transition-colors"
               >
                 Explore More Tools
               </Button>
             </motion.div>
            {/* Success Popup */}
            {showResendSuccess && (
              <div className="fixed top-6 right-6 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50">
                Report resent successfully!
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
