"use client"

import { useState, useEffect } from "react"
import { AnimatePresence } from "framer-motion"
import LandingPage from "@/components/landing-page"
import ToolsHub from "@/components/tools-hub"
import DiagnosticFlow from "@/components/diagnostic-flow"
import AnalysisScreen from "@/components/analysis-screen"
import PartialReport from "@/components/partial-report"
import EmailCapture from "@/components/email-capture"
import ContactUs from "@/components/contact"
import AboutUs from "@/components/about-us"
import FreeTools from "@/components/free-tools"

import Dashboard from "@/components/dashboard"
import Contact from "@/components/contact"
import HowItWorks from "@/components/how-it-works"
import SignUpModal from "@/components/sign-up-modal"

export type ViewType =
  | "landing"
  | "tools"
  | "diagnostic"
  | "analysis"
  | "partial-report"
  | "email-capture"
  | "success"
  | "service-partner"
  | "contact"
  | "error"
  | "questionnaire"
  | "results"
  | "admin"
  | "about-us"
  | "tool-list"
  | "dashboard"
  | "contact"
  | "how-it-works"
  | "free-tools"

export interface DiagnosticAnswer {
  questionId: string
  question: string
  answer: "Yes" | "No"
}

export interface Insight {
  title: string
  description: string
  detailedDescription?: string
  toolSuggestions?: string[]
  realWorldScenario?: string
}

export interface UserData {
  name: string
  email: string
}

export default function NBLKToolsHub() {
  const [currentView, setCurrentView] = useState<ViewType>("landing")
  const [previousView, setPreviousView] = useState<ViewType>("landing")
  const [selectedTool, setSelectedTool] = useState<string>("")
  const [answers, setAnswers] = useState<DiagnosticAnswer[]>([])
  const [userData, setUserData] = useState<UserData>({ name: "", email: "" })
  const [score, setScore] = useState<number>(0)
  const [mounted, setMounted] = useState(false)
  const [completedTools, setCompletedTools] = useState<string[]>([])
  const [generatedInsights, setGeneratedInsights] = useState<any[]>([])
  const [signUpModalOpen, setSignUpModalOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogoClick = () => {
    setCurrentView("landing")
    setPreviousView("landing")
    setAnswers([])
    setScore(0)
    setSelectedTool("")
    setUserData({ name: "", email: "" })
  }

  const navigateToView = (view: ViewType) => {
    setPreviousView(currentView)
    setCurrentView(view)
  }

  const handleToolSelect = (toolName: string) => {
    setSelectedTool(toolName)
    setAnswers([])
    setCurrentView("diagnostic")
  }

  const handleDiagnosticComplete = (diagnosticAnswers: DiagnosticAnswer[]) => {
    setAnswers(diagnosticAnswers)
    const yesCount = diagnosticAnswers.filter((a) => a.answer === "Yes").length
    setScore(yesCount * 10)
    setCurrentView("analysis")

    // Simulate analysis time
    setTimeout(() => {
      setCurrentView("partial-report")
      // Add tool to completedTools if not already present
      setCompletedTools((prev) => {
        if (!prev.includes(selectedTool)) {
          return [...prev, selectedTool]
        }
        return prev
      })
    }, 4000)
  }

  const handleEmailSubmit = async (name: string, email: string) => {
    setUserData({ name, email })

    try {
      await generateAndSendReport(name, email, selectedTool, answers, score)
      // Mark milestone step 3 as complete for this session
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('toolsHubMilestoneStep3Complete', 'true');
      }
      // setCurrentView("success") // REMOVE THIS LINE
      // Instead, stay on email-capture and let the modal show
    } catch (error) {
      console.error("Failed to send report:", error)
      // setCurrentView("success") // REMOVE THIS LINE
      // Instead, stay on email-capture and let the modal show
    }
  }

  const generateAndSendReport = async (
    name: string,
    email: string,
    toolName: string,
    answers: DiagnosticAnswer[],
    score: number,
  ) => {
    try {
      // Generate comprehensive report
      const reportResponse = await fetch("/api/generate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toolName, score, answers, name }),
      })

      const reportData = await reportResponse.json()

      if (reportData.success) {
        // Send email with report
        await fetch("/api/send-report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: email,
            name,
            toolName,
            reportContent: reportData.content,
            score,
          }),
        })
      }
    } catch (error) {
      console.error("Failed to generate/send report:", error)
    }
  }

  const handleRetakeDiagnostic = () => {
    setAnswers([])
    setScore(0)
    setCurrentView("tools")
  }

  const handleResendReport = async () => {
    try {
      await generateAndSendReport(userData.name, userData.email, selectedTool, answers, score)
    } catch (error) {
      console.error("Failed to resend report:", error)
    }
  }

  const handleSignUp = () => {
    setSignUpModalOpen(true)
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <AnimatePresence mode="wait">
        {currentView === "landing" && <LandingPage key="landing" onExploreTools={() => navigateToView("tools")} onDashboard={() => navigateToView("dashboard")} onContact={() => navigateToView("contact")} onLogoClick={handleLogoClick} navigateToView={navigateToView} onSignUp={handleSignUp} />}

        {currentView === "tools" && (
          <ToolsHub 
            key="tools" 
            onToolSelect={handleToolSelect} 
            onLogoClick={handleLogoClick} 
            completedTools={completedTools}
            onDashboard={() => navigateToView("dashboard")}
            onContact={() => navigateToView("contact")}
            navigateToView={navigateToView}
            onSignUp={handleSignUp}
          />
        )}

        {currentView === "diagnostic" && (
          <DiagnosticFlow
            key="diagnostic"
            toolName={selectedTool}
            onComplete={handleDiagnosticComplete}
            onBack={() => setCurrentView("tools")}
            onLogoClick={handleLogoClick}
          />
        )}

        {currentView === "analysis" && <AnalysisScreen key="analysis" />}

        {currentView === "partial-report" && (
          <PartialReport
            key="partial-report"
            toolName={selectedTool}
            score={score}
            answers={answers}
            onGetFullReport={() => setCurrentView("email-capture")}
            onRetakeDiagnostic={handleRetakeDiagnostic}
            onLogoClick={handleLogoClick}
            businessName={userData.name || "Your Business"}
          />
        )}

        {currentView === "email-capture" && (
          <EmailCapture
            key="email-capture"
            onSubmit={handleEmailSubmit}
            onBack={() => setCurrentView("partial-report")}
            onLogoClick={handleLogoClick}
            onExploreTools={() => navigateToView("tools")}
            toolName={selectedTool}
            score={score}
            answers={answers}
          />
        )}

        

        

        

        {currentView === "about-us" && <AboutUs key="about-us" onBack={() => setCurrentView(previousView)} />}



        {currentView === "dashboard" && <Dashboard key="dashboard" onBack={() => setCurrentView(previousView)} onLogoClick={handleLogoClick} navigateToView={navigateToView} onDashboard={() => navigateToView("dashboard")} onExploreTools={() => navigateToView("tools")} onSignUp={handleSignUp} />}

        {currentView === "contact" && <Contact key="contact" onBack={() => setCurrentView(previousView)} />}

        {currentView === "how-it-works" && <HowItWorks key="how-it-works" onBack={() => setCurrentView(previousView)} onLogoClick={handleLogoClick} navigateToView={navigateToView} onDashboard={() => navigateToView("dashboard")} onExploreTools={() => navigateToView("tools")} onSignUp={handleSignUp} />}

        {currentView === "free-tools" && <FreeTools key="free-tools" onBack={() => setCurrentView(previousView)} onLogoClick={handleLogoClick} navigateToView={navigateToView} onDashboard={() => navigateToView("dashboard")} onExploreTools={() => navigateToView("tools")} onSignUp={handleSignUp} />}
      </AnimatePresence>
      <SignUpModal isOpen={signUpModalOpen} onClose={() => setSignUpModalOpen(false)} />
    </div>
  )
}
