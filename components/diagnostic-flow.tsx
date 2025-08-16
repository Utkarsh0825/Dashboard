"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, MoreVertical, Mail, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import Image from "next/image"
import { questionSets } from "@/lib/questions"
import { saveQuestionnaireResponseSimple, generateSessionId } from "@/lib/simple-supabase-api"
import type { DiagnosticAnswer } from "@/app/page"
import { saveDiagnosticProgress, getResumeData } from "@/lib/dashboard-tracking"

interface DiagnosticFlowProps {
  toolName: string
  onComplete: (answers: DiagnosticAnswer[]) => void
  onBack: () => void
  onLogoClick: () => void
  onReturnToResults?: () => void
  isCompleted?: boolean
}

export default function DiagnosticFlow({ toolName, onComplete, onBack, onLogoClick, onReturnToResults, isCompleted = false }: DiagnosticFlowProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<DiagnosticAnswer[]>([])
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [contactDialogOpen, setContactDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [sessionId, setSessionId] = useState<string>("")
  const [isResuming, setIsResuming] = useState(false)

  const questions = questionSets[toolName] || []
  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  // Check for existing progress and resume if available
  useEffect(() => {
    const existingProgress = getResumeData(toolName)
    
    if (existingProgress && !existingProgress.completed) {
      console.log(`🔄 Resuming diagnostic: ${toolName} from question ${existingProgress.currentQuestion}`)
      setSessionId(existingProgress.sessionId)
      setCurrentQuestionIndex(existingProgress.currentQuestion)
      setAnswers(existingProgress.answers)
      setIsResuming(true)
    } else {
      const newSessionId = generateSessionId()
      setSessionId(newSessionId)
      console.log(`Started new session: ${newSessionId} for tool: ${toolName}`)
    }
  }, [toolName])

  const handleAnswer = async (answer: "Yes" | "No") => {
    const newAnswer: DiagnosticAnswer = {
      questionId: currentQuestion.id,
      question: currentQuestion.text,
      answer,
    }

    setIsSaving(true)
    
    try {
      // Save to database with questionnaire token
      await saveQuestionnaireResponseSimple({
        sessionId,
        toolName,
        questionIndex: currentQuestionIndex,
        questionText: currentQuestion.text,
        answer
      })

      console.log(`Saved answer for question ${currentQuestionIndex + 1}: ${answer}`)

      // Update local state
      const newAnswers = [...answers, newAnswer]
      setAnswers(newAnswers)

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1)
        
        // Save progress to dashboard tracking
        saveDiagnosticProgress({
          toolName,
          completed: false,
          score: 0,
          currentQuestion: currentQuestionIndex + 1,
          totalQuestions: questions.length,
          answers: newAnswers,
          startedAt: Date.now(),
          sessionId
        })
      } else {
        console.log(`Completed questionnaire for ${toolName}`)
        
        // Save completion to dashboard tracking
        const yesCount = newAnswers.filter(a => a.answer === "Yes").length
        const score = Math.round((yesCount / questions.length) * 100)
        
        console.log(`🎯 Saving diagnostic completion: ${toolName}, Score: ${score}%, Completed: true`)
        
        saveDiagnosticProgress({
          toolName,
          completed: true,
          score,
          currentQuestion: questions.length,
          totalQuestions: questions.length,
          answers: newAnswers,
          startedAt: Date.now(),
          completedAt: Date.now(),
          sessionId
        })
        
        console.log(`✅ Diagnostic completion saved for: ${toolName}`)
        
        onComplete(newAnswers)
      }
    } catch (error) {
      console.error('Error saving answer:', error)
      // Show user-friendly error message
      alert('There was an error saving your answer. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
      setAnswers(answers.slice(0, -1))
    }
  }

  if (!currentQuestion) {
    return null
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col max-w-5xl mx-auto">
      {/* Resume Notification */}
      {isResuming && (
        <div className="bg-blue-500/10 border border-blue-500/20 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <p className="text-sm text-blue-300">
              Resuming from question {currentQuestionIndex + 1} of {questions.length}
            </p>
            <button 
              onClick={() => {
                setIsResuming(false)
                setCurrentQuestionIndex(0)
                setAnswers([])
                const newSessionId = generateSessionId()
                setSessionId(newSessionId)
              }}
              className="text-xs text-blue-300 hover:text-blue-100 underline"
            >
              Start Fresh
            </button>
          </div>
        </div>
      )}
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md px-4 py-4 flex items-center justify-between border-b border-border">
        <button onClick={onBack} className="p-2">
          <ChevronLeft className="h-5 w-5 text-foreground" />
        </button>
        <h1 className="text-base font-medium text-center flex-1">
          {toolName.replace("Diagnostic", "")}
        </h1>
        {isCompleted && onReturnToResults && (
          <button 
            onClick={onReturnToResults}
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            Return to Results
          </button>
        )}
        {/* Theme Toggle */}
        <ThemeToggle />
        {/* Modern Dropdown Menu */}
        <div className="relative">
          
          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-44 rounded-xl bg-white text-black shadow-xl z-50 overflow-hidden"
              >
                <Button
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm hover:bg-gray-100 transition rounded-none justify-start"
                  variant="ghost"
                  onClick={() => {
                    setContactDialogOpen(true)
                    setDropdownOpen(false)
                  }}
                >
                  Contact Us
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      

      {/* Progress Info */}
      <div className="px-10 mt-4">
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
        </div>
        <div className="flex justify-between h-2 mt-3 bg-muted/40 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-foreground rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          />
        </div>
      </div>

      {/* Question Section */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          // transition={{ duration: 0.3 }}
          className="flex-1 flex flex-col items-center mt-10 px-4"
        >
          <div className="text-center mb-8 px-4">
            <h2 className="text-xl font-semibold leading-snug">
              {currentQuestion.text}
            </h2>
          </div>

          <div className="w-full px-6 max-w-md space-y-4">
            <Button
              variant="outline"
              className="w-full py-6 rounded-lg transition-all bg-card border border-border hover:border-border hover:shadow-xl"
              onClick={() => handleAnswer("Yes")}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Yes"}
            </Button>
            <Button
              variant="outline"
              className="w-full py-6 rounded-lg transition-all bg-card border border-border hover:border-border hover:shadow-xl"
              onClick={() => handleAnswer("No")}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "No"}
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
