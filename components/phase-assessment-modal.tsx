"use client"

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, BarChart3, TrendingUp, Zap, Target, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { savePhaseCompletion } from '@/lib/dashboard-tracking'

interface PhaseAssessmentModalProps {
  isOpen: boolean
  onClose: () => void
  onExploreTools: () => void
}

interface Question {
  id: number
  text: string
}

interface PhaseResult {
  name: string
  description: string
  icon: React.ReactNode
  color: string
  nextStep: string
  fomoText: string
}

const questions: Question[] = [
  {
    id: 1,
    text: "Have you legally registered your business with a local, state, or federal entity?"
  },
  {
    id: 2,
    text: "Has your business made its first sale?"
  },
  {
    id: 3,
    text: "Have you set up a system to track revenues and expenses?"
  },
  {
    id: 4,
    text: "Have you developed a unique value proposition for your business?"
  },
  {
    id: 5,
    text: "Have you hired any employees (beyond founders) in the past 12 months?"
  },
  {
    id: 6,
    text: "Do you track which products or services generate the most revenue?"
  },
  {
    id: 7,
    text: "Have you implemented a system to gather and act on customer feedback?"
  },
  {
    id: 8,
    text: "Do your business systems (CRM, accounting, inventory) work together and share information?"
  },
  {
    id: 9,
    text: "Do you use automation for any business processes, such as scheduling, invoicing or reporting?"
  },
  {
    id: 10,
    text: "Do you use technology to predict sales trends, customer demand or business performance?"
  }
]

const phaseResults: Record<string, PhaseResult> = {
  "Planning": {
    name: "Planning",
    description: "You're just starting. It's the perfect time to lay strong foundations.",
    icon: <Target className="w-8 h-8" />,
    color: "from-blue-500 to-blue-600",
    nextStep: "Start building your business foundation with our planning tools.",
    fomoText: "87% of businesses that start with proper planning tools scale 3x faster. Don't miss your competitive advantage!"
  },
  "Launch": {
    name: "Launch",
    description: "You've launched and taken your first steps. Let's build momentum.",
    icon: <TrendingUp className="w-8 h-8" />,
    color: "from-green-500 to-green-600",
    nextStep: "Accelerate your growth with our launch optimization tools.",
    fomoText: "92% of businesses using our launch tools see 40% revenue increase in 90 days. Your competitors are already ahead!"
  },
  "Stabilization": {
    name: "Stabilization",
    description: "You're finding consistency and need to strengthen systems.",
    icon: <BarChart3 className="w-8 h-8" />,
    color: "from-yellow-500 to-yellow-600",
    nextStep: "Strengthen your systems and prepare for scaling.",
    fomoText: "78% of businesses at your stage who optimize systems double their efficiency. Don't let inefficiency hold you back!"
  },
  "Established": {
    name: "Established",
    description: "You're operating well and are ready to scale and optimize.",
    icon: <Zap className="w-8 h-8" />,
    color: "from-purple-500 to-purple-600",
    nextStep: "Optimize and scale your established business operations.",
    fomoText: "95% of established businesses using our tools achieve 60% growth within 6 months. Scale like the pros do!"
  },
  "Integration": {
    name: "Integration",
    description: "You're highly optimized. Now's the time for strategic integration.",
    icon: <CheckCircle className="w-8 h-8" />,
    color: "from-indigo-500 to-indigo-600",
    nextStep: "Achieve strategic integration and advanced optimization.",
    fomoText: "Only 3% of businesses reach your level. Our advanced tools can make you the 1% that dominates your market!"
  }
}

const getPhaseFromYesCount = (yesCount: number): string => {
  if (yesCount <= 1) return "Planning"
  if (yesCount <= 3) return "Launch"
  if (yesCount <= 5) return "Stabilization"
  if (yesCount <= 7) return "Established"
  return "Integration"
}

export default function PhaseAssessmentModal({ isOpen, onClose, onExploreTools }: PhaseAssessmentModalProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<boolean[]>([])
  const [showResult, setShowResult] = useState(false)

  const progress = ((currentQuestion + 1) / questions.length) * 100
  const yesCount = answers.filter(answer => answer).length
  const phase = getPhaseFromYesCount(yesCount)
  const phaseResult = phaseResults[phase]

  const handleAnswer = (answer: boolean) => {
    const newAnswers = [...answers, answer]
    setAnswers(newAnswers)
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      // Save phase completion to dashboard tracking
      const yesCount = newAnswers.filter(answer => answer).length
      const score = Math.round((yesCount / questions.length) * 100)
      savePhaseCompletion(phase, score, newAnswers)
      setShowResult(true)
    }
  }

  const getPhaseProgress = (phaseName: string) => {
    const phases = ['Planning', 'Launch', 'Stabilization', 'Established', 'Integration'];
    const index = phases.indexOf(phaseName);
    return index >= 0 ? (index / (phases.length - 1)) * 100 : 0;
  };

  const getPhaseColor = (phaseName: string) => {
    const phase = phaseResults[phaseName];
    return phase ? phase.color : 'bg-muted';
  };


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-full overflow-hidden bg-card border border-border shadow-2xl">
        <div className="p-0">
            <AnimatePresence mode="wait">
              {!showResult ? (
                <motion.div
                  key="question"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-8 pb-8"
                >
                  {/* Progress Bar */}
                  <div className="mb-8">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Question {currentQuestion + 1} of {questions.length}</span>
                    </div>
                    <div className="flex justify-between h-2 mt-3 bg-muted/70 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-foreground rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                      />
                    </div>
                  </div>

                  {/* Question */}
                  <motion.div
                    key={currentQuestion}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-8"
                  >
                    <h2 className="text-2xl font-semibold text-center text-foreground mb-4 leading-tight">
                      {questions[currentQuestion].text}
                    </h2>
                  </motion.div>

                  {/* Answer Buttons */}
                  <div className="space-y-4">
                    <Button
                      variant="outline"
                      className="w-full py-6 rounded-lg transition-all bg-card border border-border hover:border-border hover:shadow-xl"
                      onClick={() => handleAnswer(true)}
                    >
                      Yes
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full py-6 rounded-lg transition-all bg-card border border-border hover:border-border hover:shadow-xl"
                      onClick={() => handleAnswer(false)}
                    >
                      No
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-8"
                >
                  {/* Result Header */}
                  <div className="text-center mb-8">
                    <h1
                      
                      className="text-3xl font-bold text-foreground mb-2"
                    >
                      You're in the {phaseResult.name.toUpperCase()} Phase
                    </h1>
                    
                    <p className="text-base text-muted-foreground">
                      {phaseResult.description}
                    </p>
                  </div>

                  {/* Progress Bar with 5 Phases */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mb-8"
                  >
                    <div className="relative">
                      {/* Progress Bar Background */}
                      <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-primary rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${getPhaseProgress(phaseResult.name)}%` }}
                          transition={{ duration: 0.8, ease: "easeInOut" }}
                        />
                      </div>
                      
                      {/* Phase Labels */}
                      <div className="flex justify-between mt-3 text-xs">
                        <div className="flex flex-col items-center">
                          <div className={`w-3 h-3 rounded-full ${getPhaseColor('Planning')} ${phaseResult.name === 'Planning' ? 'ring-2 ring-primary ring-offset-2' : ''}`}></div>
                          <span className="text-muted-foreground mt-1">Planning</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className={`w-3 h-3 rounded-full ${getPhaseColor('Launch')} ${phaseResult.name === 'Launch' ? 'ring-2 ring-primary ring-offset-2' : ''}`}></div>
                          <span className="text-muted-foreground mt-1">Launch</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className={`w-3 h-3 rounded-full ${getPhaseColor('Stabilization')} ${phaseResult.name === 'Stabilization' ? 'ring-2 ring-primary ring-offset-2' : ''}`}></div>
                          <span className="text-muted-foreground mt-1">Stabilization</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className={`w-3 h-3 rounded-full ${getPhaseColor('Established')} ${phaseResult.name === 'Established' ? 'ring-2 ring-primary ring-offset-2' : ''}`}></div>
                          <span className="text-muted-foreground mt-1">Established</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className={`w-3 h-3 rounded-full ${getPhaseColor('Integration')} ${phaseResult.name === 'Integration' ? 'ring-2 ring-primary ring-offset-2' : ''}`}></div>
                          <span className="text-muted-foreground mt-1">Integration</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* What's Next Box with FOMO */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-gradient-to-r from-primary/9 to-primary/5 border border-primary/20 rounded-xl p-6 mb-6"
                  >
                    <h3 className="text-lg font-semibold text-foreground mb-2">What's Next?</h3>
                    <p className="text-muted-foreground mb-3 text-base">{phaseResult.nextStep}</p>
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                      <p className="text-sm font-medium text-green-700 dark:text-green-300">
                        {phaseResult.fomoText}
                      </p>
                    </div>
                  </motion.div>

                  {/* Explore Tools Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <Button 
                      onClick={onExploreTools}
                      size="lg"
                      className="w-full bg-primary text-primary-foreground opacity-90 hover:bg-primary/90"
                    >
                      Step 2: Assess Your Business
                    </Button>
                  </motion.div>


                </motion.div>
              )}
            </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  )
} 