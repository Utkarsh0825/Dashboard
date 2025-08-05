"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, X as CloseIcon, CheckCircle, XCircle, EyeOff, MoreVertical, Mail, Phone, AlertTriangle, TrendingUp, Lock, Check, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import type { DiagnosticAnswer } from "@/app/page"

interface PartialReportProps {
  toolName: string
  score: number
  answers: DiagnosticAnswer[]
  onGetFullReport: () => void
  onRetakeDiagnostic: () => void
  onLogoClick: () => void
  businessName: string // Added prop for business name
}

export default function PartialReport({
  toolName,
  score,
  answers,
  onGetFullReport,
  onRetakeDiagnostic,
  onLogoClick,
  businessName, // Added prop
}: PartialReportProps) {
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null)
  const [contactDialogOpen, setContactDialogOpen] = useState(false)
  const [lockedIdx, setLockedIdx] = useState<number | null>(null);
  const [walkthroughOpen, setWalkthroughOpen] = useState(false);
  const [walkthroughStep, setWalkthroughStep] = useState(0);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [showResendSuccess, setShowResendSuccess] = useState(false);
  const [step3Complete, setStep3Complete] = useState(false);
  const [expandedStep, setExpandedStep] = useState<number | null>(null)
  const [expandedInsights, setExpandedInsights] = useState<{ [key: number]: boolean }>({})
  const [insightDialogOpen, setInsightDialogOpen] = useState<number | null>(null)
  // Show walkthrough on first visit only
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const seen = localStorage.getItem('toolsHubWalkthroughSeen');
      if (!seen) {
        setWalkthroughOpen(true);
        localStorage.setItem('toolsHubWalkthroughSeen', 'true');
      }
    }
  }, []);

  // Handle resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setStep3Complete(sessionStorage.getItem('toolsHubMilestoneStep3Complete') === 'true');
    }
  }, []);

  const handleResendReport = async () => {
    if (resendCooldown > 0) return;
    
    setResendCooldown(60); // 60 seconds cooldown
    setShowResendSuccess(true);
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      setShowResendSuccess(false);
    }, 3000);
  };
  const levels = [
    {
      label: 'Level 1: Getting Started',
      description: 'You’ve taken the first step! At this level, your business is just beginning to organize things.'
    },
    {
      label: 'Level 2: Builder',
      description: 'Now you’re building a stronger system. You’ve started using tools to keep your work in place.'
    },
    {
      label: 'Level 3: Operator',
      description: 'You’ve got things running smoothly! Work is faster and more clear.'
    },
    {
      label: 'Level 4: Pro Optimizer',
      description: 'You’re a pro now! Everything is organized, fast, and smart. You make better decisions because your data is clean.'
    },
  ];

  const getScoreMessage = (score: number) => {
    if (score === 100) return "Excellent! Your business is performing well, but we can help you go even further"
    if (score === 0) return "No worries: this is the first step to getting clear. Let's fix this together"
    if (score >= 80) return "Your business shows strong performance with room for strategic improvements"
    if (score >= 60) return "Your business shows good performance with several areas for improvement"
    return "Your business has significant opportunities for improvement and growth"
  }

  const generateInsights = (answers: DiagnosticAnswer[], toolName: string) => {
    const noAnswers = answers.filter((a) => a.answer === "No")
    const yesAnswers = answers.filter((a) => a.answer === "Yes")
    const yesCount = yesAnswers.length
    const noCount = noAnswers.length
    const insights = []

    // Helper function to get assessment-specific tool suggestions based on actual assessment purpose
    const getAssessmentTools = (assessmentType: string, area: string) => {
      const toolMap: { [key: string]: { [key: string]: string[] } } = {
        "Data Hygiene & Business Clarity Diagnostic": {
          "Data Centralization": [
            "Centralized data management platforms",
            "Flexible business data organization tools",
            "Comprehensive business documentation systems"
          ],
          "System Integration": [
            "Automated data synchronization tools",
            "Workflow and project management platforms",
            "Team communication systems"
          ],
          "Data Quality": [
            "Workflow management platforms",
            "Task tracking systems",
            "Project organization tools"
          ],
          "Lead Tracking": [
            "Customer relationship management platforms",
            "Comprehensive CRM systems",
            "Sales pipeline management tools"
          ]
        },
        "Marketing Effectiveness Diagnostic": {
          "Marketing Analytics": [
            "Website performance tracking tools",
            "Email marketing campaign platforms",
            "Social media management systems"
          ],
          "Customer Feedback": [
            "Customer feedback collection tools",
            "Interactive survey platforms",
            "Customer support systems"
          ],
          "Pricing Strategy": [
            "Competitor analysis tools",
            "Price optimization software",
            "Market research platforms"
          ],
          "Brand Management": [
            "Professional marketing material creation tools",
            "Social media scheduling platforms",
            "Brand monitoring systems"
          ]
        },
        "Cash Flow & Financial Clarity Diagnostic": {
          "Profit Tracking": [
            "Comprehensive financial tracking platforms",
            "Free accounting and invoicing tools",
            "Small business accounting software"
          ],
          "Financial Planning": [
            "Business planning platforms",
            "Financial forecasting tools",
            "Cash flow management systems"
          ],
          "Expense Management": [
            "Cloud-based financial management platforms",
            "Budget tracking tools",
            "Financial data integration systems"
          ],
          "Sales Goals": [
            "Sales tracking software",
            "Goal setting platforms",
            "Performance monitoring tools"
          ]
        }
      }
      
      const assessmentTools = toolMap[assessmentType] || {}
      return assessmentTools[area] || []
    }

    // Helper function to categorize areas based on actual questions and assessment purpose
    const categorizeAreas = (answers: DiagnosticAnswer[], isStrengths: boolean, assessmentType: string) => {
      const categories: { [key: string]: { questions: string[], count: number, uniqueDescriptions: Set<string> } } = {}
      
      // Initialize categories based on assessment type
      if (assessmentType === "Data Hygiene & Business Clarity Diagnostic") {
        categories["Data Centralization"] = { questions: [], count: 0, uniqueDescriptions: new Set() }
        categories["System Integration"] = { questions: [], count: 0, uniqueDescriptions: new Set() }
        categories["Data Quality"] = { questions: [], count: 0, uniqueDescriptions: new Set() }
        categories["Lead Tracking"] = { questions: [], count: 0, uniqueDescriptions: new Set() }
      } else if (assessmentType === "Marketing Effectiveness Diagnostic") {
        categories["Marketing Analytics"] = { questions: [], count: 0, uniqueDescriptions: new Set() }
        categories["Customer Feedback"] = { questions: [], count: 0, uniqueDescriptions: new Set() }
        categories["Pricing Strategy"] = { questions: [], count: 0, uniqueDescriptions: new Set() }
        categories["Brand Management"] = { questions: [], count: 0, uniqueDescriptions: new Set() }
      } else if (assessmentType === "Cash Flow & Financial Clarity Diagnostic") {
        categories["Profit Tracking"] = { questions: [], count: 0, uniqueDescriptions: new Set() }
        categories["Financial Planning"] = { questions: [], count: 0, uniqueDescriptions: new Set() }
        categories["Expense Management"] = { questions: [], count: 0, uniqueDescriptions: new Set() }
        categories["Sales Goals"] = { questions: [], count: 0, uniqueDescriptions: new Set() }
      }

      answers.forEach(answer => {
        const question = answer.question.toLowerCase()
        let category = ""
        let description = ""

        // Data Hygiene & Business Clarity categorization
        if (assessmentType === "Data Hygiene & Business Clarity Diagnostic") {
          if (question.includes("place") || question.includes("keep") || question.includes("organized")) {
            category = "Data Centralization"
            description = isStrengths ? "You have centralized data management" : "You need centralized data management"
          } else if (question.includes("talk") || question.includes("system") || question.includes("tools")) {
            category = "System Integration"
            description = isStrengths ? "You have integrated systems" : "You need better system integration"
          } else if (question.includes("mistakes") || question.includes("reports") || question.includes("understand")) {
            category = "Data Quality"
            description = isStrengths ? "You have good data quality" : "You need better data quality"
          } else if (question.includes("leads") || question.includes("customer")) {
            category = "Lead Tracking"
            description = isStrengths ? "You have lead tracking systems" : "You need lead tracking systems"
          }
        }
        // Marketing Effectiveness categorization
        else if (assessmentType === "Marketing Effectiveness Diagnostic") {
          if (question.includes("ads") || question.includes("emails") || question.includes("working") || question.includes("digital tools") || question.includes("find you") || question.includes("marketing")) {
            category = "Marketing Analytics"
            description = isStrengths ? "You have effective marketing tracking" : "You need marketing analytics"
          } else if (question.includes("feedback") || question.includes("reviews") || question.includes("customers") || question.includes("complaining") || question.includes("saying")) {
            category = "Customer Feedback"
            description = isStrengths ? "You have strong customer feedback systems" : "You need better customer feedback"
          } else if (question.includes("prices") || question.includes("charge") || question.includes("pricing") || question.includes("others charge")) {
            category = "Pricing Strategy"
            description = isStrengths ? "You have good pricing strategy" : "You need better pricing strategy"
          } else if (question.includes("brand") || question.includes("message") || question.includes("customers") || question.includes("clear") || question.includes("consistent") || question.includes("best customers")) {
            category = "Brand Management"
            description = isStrengths ? "You have clear brand management" : "You need better brand management"
          }
        }
        // Cash Flow & Financial Clarity categorization
        else if (assessmentType === "Cash Flow & Financial Clarity Diagnostic") {
          if (question.includes("profit") || question.includes("income") || question.includes("expenses")) {
            category = "Profit Tracking"
            description = isStrengths ? "You have good profit tracking" : "You need better profit tracking"
          } else if (question.includes("money") || question.includes("funding") || question.includes("planning")) {
            category = "Financial Planning"
            description = isStrengths ? "You have good financial planning" : "You need better financial planning"
          } else if (question.includes("costs") || question.includes("expenses") || question.includes("track")) {
            category = "Expense Management"
            description = isStrengths ? "You have good expense management" : "You need better expense management"
          } else if (question.includes("sales") || question.includes("goals") || question.includes("target")) {
            category = "Sales Goals"
            description = isStrengths ? "You have good sales goal setting" : "You need better sales goal setting"
          }
        }

        if (category && categories[category]) {
          categories[category].questions.push(answer.question)
          categories[category].count++
          categories[category].uniqueDescriptions.add(description)
        }
      })

      return Object.entries(categories).filter(([_, data]) => data.count > 0)
    }

    // Generate insights based on the assessment results
    const strongAreas = categorizeAreas(yesAnswers, true, toolName)
    const improvementAreas = categorizeAreas(noAnswers, false, toolName)
    
    // Determine the scenario based on actual results
    const hasStrengths = strongAreas.length > 0
    const hasImprovements = improvementAreas.length > 0
    
    // Scenario 1: All answers are "No" (no strengths, only improvements)
    if (!hasStrengths && hasImprovements) {
      const [improvementCategory, improvementData] = improvementAreas[0]
      const improvementDescription = Array.from(improvementData.uniqueDescriptions).join(", ")
      const improvementTools = getAssessmentTools(toolName, improvementCategory)
        
        insights.push({
        title: "Foundation Building Opportunity",
        description: "You're at the perfect starting point for systematic business improvement. Every successful business began with this exact foundation.",
        detailedDescription: `This is an opportunity to build robust systems from the ground up. Your assessment shows you need to focus on ${improvementCategory}:\n\n• ${improvementDescription}\n\nStart with one area this week - choose the simplest change that will have the biggest immediate impact. Begin by creating basic systems and processes.`,
        toolSuggestions: improvementTools.slice(0, 3),
        realWorldScenario: "Many successful businesses started exactly where you are. The key is to implement changes systematically, one area at a time, building momentum as you go."
      })
      
      insights.push({
        title: "Systematic Improvement Strategy",
        description: `Focus on implementing systematic changes in ${improvementCategory}. This area presents the highest potential for immediate impact.`,
        detailedDescription: `Your assessment reveals that ${improvementCategory} is your top priority:\n\n• ${improvementDescription}\n\nThis area represents an opportunity to enhance operational efficiency and overall business performance. Focus on this area to provide the highest return on investment.`,
        toolSuggestions: improvementTools.slice(0, 3),
        realWorldScenario: `Businesses that systematically address ${improvementCategory} often see measurable improvements in efficiency and profitability within 3-6 months of implementation.`
      })
      
      insights.push({
        title: "Strategic Action Plan",
        description: `Focus on building your foundation in ${improvementCategory}. Start with the simplest changes that will have the biggest immediate impact.`,
        detailedDescription: `Your action plan is clear:\n\n• Priority Area: ${improvementCategory}\n• Immediate Action: Start with basic systems\n• Timeline: Begin this week\n\nThis approach will maximize your return on effort and create sustainable competitive advantages. Focus on ${improvementCategory} initially to build momentum and demonstrate quick wins.`,
        toolSuggestions: improvementTools.slice(0, 2),
        realWorldScenario: `Businesses with your profile often achieve the best results by focusing improvement efforts on ${improvementCategory} while building a strong foundation.`
      })
    }
    // Scenario 2: All answers are "Yes" (only strengths, no improvements)
    else if (hasStrengths && !hasImprovements) {
      const [strengthCategory, strengthData] = strongAreas[0]
      const strengthDescription = Array.from(strengthData.uniqueDescriptions).join(", ")
      const strengthTools = getAssessmentTools(toolName, strengthCategory)
      
        insights.push({
        title: "Exceptional Business Operations",
        description: "Your business demonstrates mastery across all critical areas. You're operating at an advanced level with robust systems in place.",
        detailedDescription: `Your comprehensive approach to business management is exemplary. You've successfully implemented systems across all major operational areas, particularly in ${strengthCategory}:\n\n• ${strengthDescription}\n\nThis positions your business for sustainable growth and market leadership. Consider exploring advanced optimization strategies and scaling opportunities.`,
        toolSuggestions: strengthTools.slice(0, 2),
        realWorldScenario: "A business like yours might focus on advanced analytics, automation, and strategic partnerships to further optimize operations and explore new market opportunities."
      })
      
        insights.push({
        title: "Advanced Optimization Strategy",
        description: "Your strong foundation positions you for advanced optimization and scaling opportunities.",
        detailedDescription: `With excellence across all areas, particularly in ${strengthCategory}, you're ready for advanced optimization strategies. Consider exploring automation, advanced analytics, and strategic partnerships to further enhance your competitive position and explore new market opportunities.`,
        toolSuggestions: strengthTools.slice(0, 2),
        realWorldScenario: "Businesses at your level often focus on advanced analytics, automation, and strategic partnerships to further optimize operations and explore new market opportunities."
      })
      
      insights.push({
        title: "Strategic Growth Plan",
        description: `Leverage your strength in ${strengthCategory} to explore new opportunities and scale your operations.`,
        detailedDescription: `Your balanced profile provides clear strategic direction:\n\n• Build on Strength: Continue excelling in ${strengthCategory}\n• Explore Opportunities: Consider new markets or services\n• Scale Operations: Implement advanced systems\n\nThis approach will maximize your competitive advantage and create sustainable growth opportunities.`,
        toolSuggestions: strengthTools.slice(0, 2),
        realWorldScenario: `Businesses with your profile often achieve the best results by leveraging their strength in ${strengthCategory} while exploring new market opportunities.`
      })
    }
    // Scenario 3: Mixed results (both strengths and improvements)
    else if (hasStrengths && hasImprovements) {
      const [strengthCategory, strengthData] = strongAreas[0]
      const strengthDescription = Array.from(strengthData.uniqueDescriptions).join(", ")
      const strengthTools = getAssessmentTools(toolName, strengthCategory)
      
      // Find improvement area that's different from strength
      const availableImprovements = improvementAreas.filter(([category]) => category !== strengthCategory)
      const improvementCategory = availableImprovements.length > 0 ? availableImprovements[0] : improvementAreas[0]
      const [improvementArea, improvementData] = improvementCategory
      const improvementDescription = Array.from(improvementData.uniqueDescriptions).join(", ")
      const improvementTools = getAssessmentTools(toolName, improvementArea)
      
      insights.push({
        title: "Your Primary Business Strength",
        description: `You excel in ${strengthCategory}. This is your strongest area and provides a solid foundation for growth.`,
        detailedDescription: `Your business demonstrates strong performance in ${strengthCategory}:\n\n• ${strengthDescription}\n\nThis strength gives you a competitive advantage and provides excellent leverage for strategic improvements. Focus on maintaining this strength while building upon it to create sustainable growth opportunities.`,
        toolSuggestions: strengthTools.slice(0, 2),
        realWorldScenario: `Businesses with strengths in ${strengthCategory} often see significant ROI by leveraging this area as a competitive advantage while systematically improving other operational aspects.`
      })
        
        insights.push({
        title: "Your Key Improvement Opportunity",
        description: `You have a clear opportunity to improve in ${improvementArea}. This area presents the highest potential for strategic enhancement.`,
        detailedDescription: `Your assessment reveals a key area with significant improvement potential:\n\n• ${improvementArea}: ${improvementDescription}\n\nThis area represents an opportunity to enhance operational efficiency, customer satisfaction, and overall business performance. Focus on this area to provide the highest return on investment while maintaining your existing strengths.`,
        toolSuggestions: improvementTools.slice(0, 3),
        realWorldScenario: `Businesses that systematically address ${improvementArea} often see measurable improvements in efficiency, customer satisfaction, and profitability within 3-6 months of implementation.`
      })
      
      insights.push({
        title: "Strategic Action Plan",
        description: `Leverage your strength in ${strengthCategory} while systematically improving ${improvementArea}.`,
        detailedDescription: `Your balanced profile provides clear strategic direction:\n\n• Build on Strength: Continue excelling in ${strengthCategory}\n• Address Improvement: Focus on ${improvementArea}\n• Prioritize Actions: Start with ${improvementArea} this week\n\nThis approach will maximize your return on effort and create sustainable competitive advantages. Focus on ${improvementArea} initially to build momentum and demonstrate quick wins.`,
        toolSuggestions: improvementTools.slice(0, 2),
        realWorldScenario: `Businesses with your profile often achieve the best results by focusing improvement efforts on ${improvementArea} while maintaining their strong foundation in ${strengthCategory}.`
      })
    }
    // Scenario 4: No clear pattern (edge case)
    else {
        insights.push({
        title: "Business Assessment Complete",
        description: "Your diagnostic assessment provides valuable insights into your business operations.",
        detailedDescription: "Your assessment results show a unique business profile. Consider reviewing your answers and retaking the assessment if needed to get more specific insights about your business strengths and improvement opportunities.",
        toolSuggestions: getAssessmentTools(toolName, "Data Centralization").slice(0, 2),
        realWorldScenario: "Every business is unique. Take time to reflect on your assessment answers and consider how they align with your business goals and challenges."
      })
      
      insights.push({
        title: "Next Steps",
        description: "Consider retaking the assessment or exploring our other diagnostic tools for more specific insights.",
        detailedDescription: "To get more targeted insights, consider:\n\n• Retaking this assessment with different answers\n• Trying our other diagnostic tools\n• Consulting with a business advisor\n\nThis will help you get more specific guidance for your business needs.",
        toolSuggestions: [],
        realWorldScenario: "Many businesses benefit from multiple assessments to get a comprehensive view of their operations and opportunities."
      })
        
        insights.push({
        title: "Business Growth Strategy",
        description: "Focus on systematic improvement and continuous learning to drive business growth.",
        detailedDescription: "Regardless of your current assessment results, successful businesses focus on:\n\n• Continuous improvement\n• Systematic processes\n• Regular assessment and adjustment\n\nCommit to ongoing improvement and regular evaluation of your business systems.",
        toolSuggestions: getAssessmentTools(toolName, "Data Centralization").slice(0, 2),
        realWorldScenario: "The most successful businesses are those that commit to continuous improvement and regular assessment of their operations."
      })
    }

    return insights
  }

  const insights = generateInsights(answers, toolName)

  // Calculate the average score from the leaderboard
  

  // Generate and persist random scores for other businesses for the session
  function getRandomScore(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  let sessionScores: number[] | null = null;
  if (typeof window !== 'undefined') {
    const stored = sessionStorage.getItem('toolsHubLeaderboardScores');
    if (stored) {
      try {
        sessionScores = JSON.parse(stored);
      } catch {}
    }
    if (!sessionScores || sessionScores.length !== 2) {
      sessionScores = [getRandomScore(20, 55), getRandomScore(40, 60)];
      sessionStorage.setItem('toolsHubLeaderboardScores', JSON.stringify(sessionScores));
    }
  } else {
    sessionScores = [getRandomScore(20, 55), getRandomScore(40, 60)];
  }
  const otherBusinesses = [
    { name: "Other Business", score: sessionScores[0] },
    { name: "Other Business", score: sessionScores[1] },
    { name: businessName, score: score }, // Current business
  ];
  // Remove duplicate if businessName matches a mock
  let allBusinesses = otherBusinesses.filter(
    (entry, idx, arr) =>
      arr.findIndex(e => e.name === entry.name && e.score === entry.score) === idx
  );
  // Sort descending by score
  allBusinesses.sort((a, b) => b.score - a.score);
  // Take top 3 for leaderboard
  const leaderboard = allBusinesses.slice(0, 3);
  const average = Math.round(
    leaderboard.reduce((sum, entry) => sum + entry.score, 0) / leaderboard.length
  );
  // Achievement badge logic based on new score ranges
  let achievementBadge = {
    icon: EyeOff,
    color: 'bg-foreground',
    label: 'Level 1: Getting Started',
    description: 'Every journey begins with a step.'
  }
  if (score >= 0 && score <= 30) {
    achievementBadge = {
      icon: EyeOff,
      color: 'bg-foreground',
      label: 'Level 1: Getting Started',
      description: 'Every journey begins with a step.'
    }
  } else if (score >= 31 && score <= 70) {
    achievementBadge = {
      icon: AlertTriangle,
      color: 'bg-foreground',
      label: 'Level 2: Builder',
      description: 'You\'re building a strong foundation!'
    }
  } else if (score >= 71 && score <= 90) {
    achievementBadge = {
      icon: TrendingUp,
      color: 'bg-foreground',
      label: 'Level 3: Operator',
      description: 'You\'re running a solid operation!'
    }
  } else if (score >= 91 && score <= 100) {
    achievementBadge = {
      icon: CheckCircle,
      color: 'bg-foreground',
      label: 'Level 4: Pro Optimizer',
      description: 'You\'re among the best—keep optimizing!'
    }
  }

  // Calculate points to next level
  let pointsToNext = null;
  let nextLevelLabel = '';
  if (score >= 0 && score <= 30) {
    pointsToNext = 31 - score;
    nextLevelLabel = 'Level 2: Builder';
  } else if (score >= 31 && score <= 70) {
    pointsToNext = 71 - score;
    nextLevelLabel = 'Level 3: Operator';
  } else if (score >= 71 && score <= 90) {
    pointsToNext = 91 - score;
    nextLevelLabel = 'Level 4: Pro Optimizer';
  } else if (score >= 91) {
    pointsToNext = null;
  }

  // Determine progress bar color based on score
  let progressBarColor = 'bg-red-500'
  if (score <= 30) {
    progressBarColor = 'bg-red-500'
  } else if (score <= 70) {
    progressBarColor = 'bg-yellow-500'
  } else if (score <= 90) {
    progressBarColor = 'bg-blue-500'
  } else {
    progressBarColor = 'bg-green-500'
  }

  // Calculate performance text based on average score
  let performanceText = '';
  if (score > average) {
    const percent = Math.round(((score - average) / average) * 100);
    performanceText = `You are performing better than ${percent}% of similar businesses.`;
  } else if (score < average) {
    const percent = Math.round(((average - score) / average) * 100);
    performanceText = `You are performing worse than ${percent}% of similar businesses.`;
  } else {
    performanceText = `You are performing on par with similar businesses.`;
  }

  // Milestone tracker logic
  // Use the same recommendations as backend
  function getMilestoneRecommendations(toolName: string) {
    if (toolName.includes("Data Hygiene")) {
      return [
        "Implement a centralized Customer Relationship Management (CRM) system",
        "Establish automated data synchronization between key business systems",
        "Create standardized data entry procedures and training protocols",
        "Set up automated reporting dashboards for real-time business metrics",
      ];
    } else if (toolName.includes("Marketing")) {
      return [
        "Implement marketing attribution tracking using Google Analytics 4",
        "Develop detailed buyer personas based on your best customers",
        "Set up automated customer feedback collection systems",
        "Create consistent brand messaging across all marketing channels",
      ];
    } else if (toolName.includes("Cash Flow")) {
      return [
        "Create rolling 13-week cash flow forecasts updated weekly",
        "Implement automated invoicing and payment reminder systems",
        "Establish business emergency fund equal to 3-6 months operating expenses",
        "Set up weekly financial dashboards with key metrics",
      ];
    }
    return [
      "Implement systematic processes to address identified operational gaps",
      "Establish regular review cycles to monitor progress",
      "Consider automation tools to reduce manual work",
      "Set up clear metrics and KPIs to track improvement",
    ];
  }

  const milestoneRecs = getMilestoneRecommendations(toolName);
  // Pointer position logic
  let pointerIdx = 0;
  if (score >= 0 && score <= 30) pointerIdx = 0;
  else if (score >= 31 && score <= 60) pointerIdx = 1;
  else if (score >= 61 && score <= 85) pointerIdx = 2;
  else if (score >= 86) pointerIdx = 3;

  // Milestone step descriptions
  const milestoneSteps = [
    {
      label: 'Take Diagnostic',
      completed: true,
      description: 'You completed the module diagnostic to assess your current business status'
    },
    {
      label: 'Free Insight',
      completed: true,
      description: 'This is a preview of your results. See where you stand!'
    },
    {
      label: 'Enter Email',
      completed: step3Complete,
      description: 'Want a detailed breakdown for this module? Enter your email & we’ll send it right over'
    },
    {
      label: 'Sign-up',
      completed: false,
      description: 'Sign up to unlock all features: multi-page report, tailored recommendations and staffing match tool'
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen px-4 md:px-8 text-foreground bg-background"
    >
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md px-4 py-4 flex items-center justify-between border-b border-border">
          <button onClick={() => {
            if (typeof window !== 'undefined') {
              sessionStorage.removeItem('toolsHubMilestoneStep3Complete');
            }
            onRetakeDiagnostic();
          }} className="p-2">
            <ChevronLeft className="h-5 w-5 text-foreground" />
          </button>
          <h1 className="text-sm font-medium text-center flex-1">
          {toolName.replace("Diagnostic", "")}
        </h1>
          {/* Theme Toggle */}
          <ThemeToggle />
        </header>

        {/* Contact Us Dialog */}
        
        {/* Score Card */}
        <div className="rounded-lg border border-border p-6 bg-card shadow-lg flex flex-col items-center gap-6">
          {/* Modern Score Progress Bar */}
          <div className="w-full max-w-md flex flex-col items-center relative">
            {/* Floating Score Badge - now tracks progress */}
            <div className="absolute -top-10 z-30 transition-all duration-500"
              style={{
                left: `calc(${score}% - 10px)`, // 48px is half the badge width (96px)
                minWidth: '96px',
                maxWidth: '120px',
                pointerEvents: 'none',
                // Clamp so it doesn't overflow
                transform:
                  score <= 5
                    ? 'translateX(0)' // left edge
                    : score >= 95
                    ? 'translateX(-100%)' // right edge
                    : 'translateX(-50%)', // center
              }}
            >
              <div className="relative flex flex-col items-center">
                {/* Gamified Glow */}
                <div
                  className={`absolute inset-0 blur-xl opacity-60 rounded-full animate-pulse ${progressBarColor.replace('bg-', 'bg-')}`}
                  style={{ zIndex: -1 }}
                />
                <div className={`${progressBarColor} text-background font-bold text-3xl rounded-full px-8 py-3 shadow-2xl border-4 border-border/20 flex flex-col items-center relative`}>
                  {score}
                </div>
                {/* Pointer/triangle */}
                <div
                  className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent"
                  style={{ 
                    borderTopColor: progressBarColor === 'bg-red-500' ? '#ef4444' :
                                  progressBarColor === 'bg-yellow-500' ? '#eab308' :
                                  progressBarColor === 'bg-blue-500' ? '#3b82f6' :
                                  progressBarColor === 'bg-green-500' ? '#22c55e' : '#6b7280'
                  }}
                />
              </div>
            </div>
            {/* Progress Bar with Average Marker */}
            <div className="w-full mt-11 relative">
              <div className="h-4 w-full bg-muted rounded-full overflow-hidden relative">
                <div
                  className={`h-4 rounded-full transition-all duration-500 ${progressBarColor}`}
                  style={{ width: `${score}%` }}
                />
              </div>
              
            </div>
            {/* SECOND PROGRESS BAR: Average Only */}
            {/* Lighter color, smaller size, floating badge at average */}
            {(() => {
              // Average bar color logic 
      let avgBarColor = 'bg-red-500';
      if (average <= 30) {
                avgBarColor = 'bg-red-500';
      } else if (average <= 70) {
        avgBarColor = 'bg-yellow-500';
      } else if (average <= 90) {
        avgBarColor = 'bg-blue-500';
              } else {
                avgBarColor = 'bg-green-500';
              }
              // Bar height and badge size
              return (
                <>
                  <div className="w-full relative mt-9">
                    {/* Floating Average Badge */}
                    <div
                      className="absolute -top-11 z-20 transition-all duration-500"
                      style={{
                        left: `calc(${average}% )`,
                        minWidth: '48px',
                        maxWidth: '64px',
                        pointerEvents: 'none',
                        transform:
                          average <= 5
                            ? 'translateX(0)'
                            : average >= 95
                            ? 'translateX(-100%)'
                            : 'translateX(-50%)',
                      }}
                    >
                      <div className="relative flex flex-col items-center">
                        <div className={`${avgBarColor} text-background font-bold text-base rounded-full px-4 py-1 shadow border-2 border-border/30 flex flex-col items-center relative`}>
                          {average}
                        </div>
                        {/* Pointer/triangle */}
                        <div
                  className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent"
                  style={{ 
                    borderTopColor: avgBarColor === 'bg-red-500' ? '#ef4444' :
                                   avgBarColor === 'bg-yellow-500' ? '#eab308' :
                                   avgBarColor === 'bg-blue-500' ? '#3b82f6' :
                                   avgBarColor === 'bg-green-500' ? '#22c55e' : '#6b7280'
                  }}
                        />
                      </div>
                    </div>
                    {/* Average Progress Bar */}
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden relative">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${avgBarColor}`}
                        style={{ width: `${average}%` }}
                      />
                    </div>
                  </div>
                  {/* Legend for the two bars */}
                  <div className="flex gap-6 items-center justify-center mt-8 mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`inline-block w-3 h-3 rounded-full ${progressBarColor} border border-border/20`} />
                      <span className="text-xs text-muted-foreground">Your Score</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-block w-3 h-3 rounded-full ${avgBarColor} border border-border/20`} />
                      <span className="text-xs text-muted-foreground">Average Score</span>
                    </div>
                  </div>
                </>
              );
            })()}
            {/* Score Range Text */}
            {/* <div className="text-sm text-white/80 mt-2">{score}/100</div> */}
            {/* Average Text */}
            
          </div>
          <div className="flex flex-col items-center gap-2">
            <p className="text-foreground text-lg font-medium text-center">{getScoreMessage(score)}</p>
            <div className="text-sm text-muted-foreground ">{performanceText}</div>
          </div>
         {/* Achievement Badge */}
         <div className="w-full flex flex-col items-center justify-center mt-2 relative">
            {/* Walkthrough modal overlay */}
           <Dialog open={walkthroughOpen} onOpenChange={setWalkthroughOpen}>
             <DialogContent className="max-w-xl bg-card border border-border">
               <div className="flex flex-col items-left gap-4">
                 {/* Header */}
                 <div className="flex items-left justify-between w-full mb-1">
                   <div className="text-lg font-semibold">Level Guide</div>
                 </div>
                 
                 {/* Badge row for walkthrough (no animation) */}
                 <div className="w-full flex items-center justify-center gap-2 mb-4">
                   {levels.map((level, idx) => {
                     const isActive = walkthroughStep === idx;
                     return (
                       <div
                         key={level.label}
                         className={`flex flex-col items-center ${isActive ? 'z-20' : 'opacity-40'} mx-2`}
                       >
                         <div className={`rounded-full border border-border shadow-sm ${isActive ? 'bg-card text-foreground font-semibold px-6 py-2.5 text-base' : 'bg-muted text-foreground font-normal px-3 py-1.5 text-xs'}`}
                         >
                           {level.label.replace(/Level \d+: /, '')}
                         </div>
                       </div>
                     )
                   })}
                 </div>
                 {/* Level info card */}
                 <div className="w-full bg-muted/5 border border-border rounded-lg p-4 text-center">
                   <div className="font-semibold mb-2">{levels[walkthroughStep].label}</div>
                   <div className="text-muted-foreground text-sm p-2">{levels[walkthroughStep].description}</div>
                 </div>
                 {/* Navigation controls with arrow icons */}
                 <div className="flex gap-3 justify-center mt-2">
                   <button
                     className="p-2 rounded-full bg-muted-foreground/10 text-foreground border border-border/20 disabled:opacity-30 flex items-center justify-center"
                     onClick={() => setWalkthroughStep(walkthroughStep - 1)}
                     disabled={walkthroughStep === 0}
                     aria-label="Previous"
                   >
                     <ChevronLeft className="w-5 h-5" />
                   </button>
                   <button
                     className="p-2 rounded-full bg-muted-foreground/10 text-foreground border border-border/20 disabled:opacity-30 flex items-center justify-center"
                     onClick={() => setWalkthroughStep(walkthroughStep + 1)}
                     disabled={walkthroughStep === levels.length - 1}
                     aria-label="Next"
                   >
                     <ChevronRight className="w-5 h-5" />
                   </button>
                 </div>
               </div>
             </DialogContent>
           </Dialog>
            <div className="w-full max-w-xl flex items-center justify-center" style={{ height: '60px' }}>
              {levels.map((level, idx) => {
                const isCurrent = achievementBadge.label === level.label;
                return (
                  <div
                    key={level.label}
                    className={`flex flex-col items-center ${isCurrent ? 'mx-2 z-20' : 'mx-1 opacity-50 scale-95'}`}
                  >
                    <div
                      className={`flex items-center justify-center rounded-full border border-border shadow-sm ${isCurrent ? 'bg-card text-foreground text-sm px-10 py-4 font-semibold' : 'bg-muted text-foreground text-xs px-6 py-2 font-normal'} cursor-pointer`}
                      onClick={() => {
                        setWalkthroughStep(idx);
                        setWalkthroughOpen(true);
                      }}
                      tabIndex={0}
                      role="button"
                      aria-label={`Show info for ${level.label}`}
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          setWalkthroughStep(idx);
                          setWalkthroughOpen(true);
                        }
                      }}
                    >
                      {level.label}
                    </div>
                    {/* Tooltip on hover for current badge remains */}
                    {isCurrent && pointsToNext !== null && nextLevelLabel && (
                      <div className="relative">
                        <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-max px-4 py-2 rounded-lg bg-card/90 text-xs text-foreground shadow-lg border border-border opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50">
                          You are {pointsToNext} point{pointsToNext === 1 ? '' : 's'} away from becoming a {nextLevelLabel.replace('Level 2: ', '').replace('Level 3: ', '').replace('Level 4: ', '').toLowerCase()}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
         </div>
        </div>

        {/* Leaderboard Section */}
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold mb-0">Leaderboard</h2>
          <div className="rounded-lg border border-border p-5 bg-muted/5 mt-0">
            <div className="overflow-x-auto">
              <table className="min-w-full text-base text-left">
                <thead>
                  <tr className="text-muted-foreground border-b border-border/10">
                    <th className="py-2 px-3 font-medium">Rank</th>
                    <th className="py-2 px-3 font-medium">Business</th>
                    <th className="py-2 px-3 font-medium">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((entry, idx) => {
                    const isCurrent = entry.name === businessName && entry.score === score
                    return (
                      <tr
                        key={entry.name + entry.score}
                        className={
                          isCurrent
                            ? `font-bold border-b border-white/10 ${progressBarColor} bg-opacity-10`
                            : "border-b border-white/10"
                        }
                      >
                        <td className="py-2 px-3">{idx + 1}</td>
                        <td className="py-2 px-3 flex items-center gap-2">
                          {isCurrent ? (
                            <span className={`inline-block text-black text-sm font-semibold rounded px-2 py-0.5 mr-2 ${progressBarColor}`}>You</span>
                          ) : (
                            <span className="blur-[2px] select-none">{entry.name}</span>
                          )}
                        </td>
                        <td className="py-2 px-3">{entry.score}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              
            </div>
          </div>
        </div>
        {/* End Leaderboard Section */}

        {/* Key Insights */}
        <div className="space-y-4">
          <h2 className="text-lg pt-4 font-semibold">Insights</h2>
          
          {insights.map((insight, index) => (
            <div key={index} className="rounded-lg border border-border p-6 bg-muted/5">
              <div className="flex-1">
                <h4 className="font-semibold text-base mb-2 text-foreground">
                  {insight.title}
                </h4>
                <p className="text-foreground text-sm mb-3">{insight.description}</p>
                
                {/* Tool Suggestions */}
                {insight.toolSuggestions && insight.toolSuggestions.length > 0 && (
                  <div className="mb-3">
                    <h5 className="font-medium text-sm text-foreground mb-2">Recommended Tools:</h5>
                    <div className="flex flex-wrap gap-2">
                      {insight.toolSuggestions.map((tool, toolIndex) => (
                        <span key={toolIndex} className="inline-block bg-primary/10 text-primary text-xs px-2 py-1 rounded">
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Read More Button */}
                {(insight.detailedDescription || insight.realWorldScenario) && (
                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => setInsightDialogOpen(index)}
                      className="text-sm text-primary hover:text-primary/80 font-medium"
                    >
                      Read More
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Insight Detail Dialog */}
        {insights.map((insight, index) => (
          <Dialog key={`dialog-${index}`} open={insightDialogOpen === index} onOpenChange={() => setInsightDialogOpen(null)}>
            <DialogContent className="max-w-2xl bg-card border border-border">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-foreground">{insight.title}</h3>
                </div>
                
                <div className="space-y-4">
                  {/* Detailed Description */}
                  {insight.detailedDescription && (
                    <div>
                      <h4 className="font-medium text-foreground mb-2">Detailed Analysis</h4>
                      <p className="text-muted-foreground text-sm leading-relaxed">{insight.detailedDescription}</p>
                    </div>
                  )}
                  
                  {/* Tool Suggestions */}
                  {insight.toolSuggestions && insight.toolSuggestions.length > 0 && (
                    <div>
                      <h4 className="font-medium text-foreground mb-2">Recommended Tools</h4>
                      <div className="space-y-2">
                        {insight.toolSuggestions.map((tool, toolIndex) => (
                          <div key={toolIndex} className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-primary rounded-full"></span>
                            <span className="text-muted-foreground text-sm">{tool}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Real World Scenario */}
                  {insight.realWorldScenario && (
                    <div>
                      <h4 className="font-medium text-foreground mb-2">Real-World Application</h4>
                      <p className="text-muted-foreground text-sm leading-relaxed">{insight.realWorldScenario}</p>
                    </div>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        ))}

        {/* Milestone Tracker Section */}
        <div className="mt-1 z-0">
          <h2 className="text-lg font-semibold pt-4 mb-4 text-left">Track Milestones</h2>
          <div className="rounded-lg border border-border p-10 bg-muted/5 flex flex-col items-center w-full mx-auto z-0">
            {/* Only keep the alternative circle step tracker for milestones */}
            <div className="w-full max-w-3xl mx-auto items-center">
              <div className="flex items-left w-full">
                {milestoneSteps.map((step, idx, arr) => {
                  const isLast = idx === arr.length - 1;
                  const isExpanded = expandedStep === idx;
                  return (
                    <div key={step.label} className="flex-1 flex flex-col">
                      <div className="flex items-center w-full">
                        {/* Circle */}
                        <div className={`flex items-center justify-center rounded-full border-2 ${step.completed ? 'bg-green-500 border-green-500 text-white' : 'bg-card border-border text-muted-foreground'} w-9 h-9 font-semibold text-base`}>
                          {step.completed ? <Check className="w-5 h-5" /> : idx + 1}
                        </div>
                        {/* Line to next step */}
                        {!isLast && (
                          idx === 1 ? (
                            // Special case: line after step 2 is fully green if step3Complete, else half green/half gray
                            step3Complete ? (
                              <div className="flex-1 h-1 min-w-[32px] mx-2 rounded-full bg-green-500"></div>
                            ) : (
                              <div className="flex-1 flex h-1 min-w-[32px] mx-2 rounded-full overflow-hidden">
                                <div className="w-1/3 h-full bg-green-500 rounded-l-full" />
                                                                  <div className="w-2/3 h-full bg-muted rounded-r-full" />
                              </div>
                            )
                          ) : (
                            <div className={`flex-1 h-1 mx-2 rounded-full ${step.completed && arr[idx+1].completed ? 'bg-green-500' : 'bg-muted'}`}></div>
                          )
                        )}
                      </div>
                      {/* Label with dropdown chevron */}
                      <button
                        className={`mt-3 text-sm w-max flex items-center gap-2 focus:outline-none ${step.completed ? 'text-foreground font-semibold' : 'text-muted-foreground font-normal'}`}
                        onClick={() => setExpandedStep(isExpanded ? null : idx)}
                        aria-expanded={isExpanded}
                        aria-controls={`milestone-desc-${idx}`}
                      >
                        {step.label}
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                      {/* Description dropdown */}
                      <div
                        id={`milestone-desc-${idx}`}
                        className={`transition-all duration-200 text-sm pr-5 text-muted-foreground ${isExpanded ? 'max-h-32 opacity-100 mt-1' : 'max-h-0 opacity-0 overflow-hidden'}`}
                        style={{ minWidth: '220px' }}
                      >
                        {step.description}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        {/* End Milestone Tracker Section */}

        {/* Partial Results Warning */}
        {/* <div className="flex gap-3 items-start border-l-4 border-yellow-400 rounded-lg p-5 bg-yellow-900/20 text-yellow-100">
          <EyeOff className="h-5 w-5 mt-2 text-yellow-200"/>
          <div className="text-sm leading-snug">
            <p className="font-semibold text-yellow-200 py-1 px-1">Partial Results Shown</p>
            <p className="text-muted-foreground px-1">
              This is a preview of your diagnostic results. Get a detailed report by clicking below.
            </p>
          </div>
        </div> */}

        {/* Footer */}
        <footer className="sticky left-0 right-0 bottom-0 py-2 bg-background backdrop-blur-md border-t border-border">
          <div className="max-w-5xl mx-auto px-1 py-5 flex gap-2 items-center justify-between">
            <Button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  sessionStorage.removeItem('toolsHubMilestoneStep3Complete');
                }
                onRetakeDiagnostic();
              }}
              className="flex-1 bg-background text-foreground border border-border hover:bg-background-100 rounded-lg"
            >
              Retake Diagnostic
            </Button>
            <Button
              onClick={onGetFullReport}
              className="flex-1 bg-foreground text-background hover:bg-foreground-100 rounded-lg"
            >
              Get My Results
            </Button>
          </div>
        </footer>
      </div>
    </motion.div>
  )
}
