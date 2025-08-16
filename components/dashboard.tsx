"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ChevronLeft, X as CloseIcon, ChevronDown, RefreshCw, Target, TrendingUp, BarChart3, Play, Download, Share2, AlertTriangle, Zap, Activity, CheckCircle, Clock, Eye, ArrowRight, FileText, ExternalLink } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { Switch } from "@/components/ui/switch"
import { 
  getDashboardData, 
  getDashboardMetrics, 
  getRecentActivities, 
  getPhaseData, 
  getAllDiagnosticProgress,
  getReports,
  getUserData,
  formatTimestamp,
  formatLastActive,
  saveDiagnosticProgress,
  markReportDownloaded,
  updateUserActivity,
  clearDiagnosticProgress
} from "@/lib/dashboard-tracking"

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
  const [showAllTools, setShowAllTools] = useState(true)
  const [showReportModal, setShowReportModal] = useState(false)
  const [selectedReport, setSelectedReport] = useState<any>(null)
  const [dashboardData, setDashboardData] = useState(getDashboardData())
  const [metrics, setMetrics] = useState(getDashboardMetrics())
  const [activities, setActivities] = useState(getRecentActivities())
  const [phaseData, setPhaseData] = useState(getPhaseData())
  const [diagnosticProgress, setDiagnosticProgress] = useState(getAllDiagnosticProgress())
  const [reports, setReports] = useState(getReports())
  const [userData, setUserData] = useState(getUserData())
  const mobileMenuRef = useRef<HTMLDivElement>(null)

  // Refresh dashboard data
  useEffect(() => {
    const refreshData = () => {
      const newData = getDashboardData()
      const newMetrics = getDashboardMetrics()
      const newActivities = getRecentActivities()
      const newPhaseData = getPhaseData()
      const newDiagnosticProgress = getAllDiagnosticProgress()
      const newReports = getReports()
      const newUserData = getUserData()
      
      console.log(`🔄 Dashboard refresh - Activities: ${newActivities.length}, Diagnostics: ${newDiagnosticProgress.length}, Completed: ${newDiagnosticProgress.filter(d => d.completed).length}`)
      if (newActivities.length > 0) {
        console.log(`📊 Latest activity: ${newActivities[0].description}`)
      }
      
      setDashboardData(newData)
      setMetrics(newMetrics)
      setActivities(newActivities)
      setPhaseData(newPhaseData)
      setDiagnosticProgress(newDiagnosticProgress)
      setReports(newReports)
      setUserData(newUserData)
    }

    refreshData()
    
    // Refresh data every 2 seconds for more responsive updates
    const interval = setInterval(refreshData, 2000)
    
    return () => clearInterval(interval)
  }, [])

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

  // Handle phase test navigation
  const handlePhaseTest = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0)
    }
    navigateToView("tools")
    // This will open the phase modal in tools hub
  }

  // Handle diagnostic navigation with resume functionality
  const handleDiagnosticStart = (toolName: string) => {
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0)
    }
    
    const progress = diagnosticProgress.find(d => d.toolName === toolName)
    if (progress && !progress.completed) {
      // Resume from where user left off
      navigateToView("diagnostic")
      // The diagnostic flow will handle resuming
    } else if (progress && progress.completed) {
      // Ask user if they want to retake or view results
      const choice = confirm('This diagnostic is completed. Would you like to retake it? Click OK to retake, Cancel to view results.')
      if (choice) {
        handleRetakeDiagnostic(toolName)
      } else {
        navigateToView("partial-report")
      }
    } else {
      // Start new diagnostic
      onExploreTools()
    }
  }

  // Handle viewing results for completed diagnostics
  const handleViewResults = (toolName: string) => {
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0)
    }
    
    // Find the diagnostic progress data
    console.log(`🔍 Looking for tool: "${toolName}"`)
    console.log(`🔍 Available diagnostics:`, diagnosticProgress.map(d => ({ name: d.toolName, completed: d.completed, score: d.score })))
    
    const progress = diagnosticProgress.find(d => d.toolName === toolName)
    if (progress && progress.completed) {
      console.log(`📊 View Results - Tool: ${progress.toolName}, Score: ${progress.score}`)
      // Store the data in sessionStorage so the partial report can access it
      sessionStorage.setItem('dashboard_view_results', JSON.stringify({
        toolName: progress.toolName,
        score: progress.score,
        answers: progress.answers
      }))
    } else {
      console.log(`❌ No progress found for tool: ${toolName}`)
    }
    
    navigateToView("partial-report")
  }

  // Handle retaking diagnostics
  const handleRetakeDiagnostic = (toolName: string) => {
    if (confirm('Are you sure you want to retake this diagnostic? This will clear your previous progress.')) {
      clearDiagnosticProgress(toolName)
      forceRefresh()
      if (typeof window !== 'undefined') {
        window.scrollTo(0, 0)
      }
      navigateToView("tools")
    }
  }

  // Handle report download
  const handleReportDownload = (report: any) => {
    setSelectedReport(report)
    setShowReportModal(true)
    markReportDownloaded(report.toolName)
  }

  // Handle sharing
  const handleShare = (report: any) => {
    const shareText = `Check out my ${report.toolName} diagnostic results! Score: ${report.score}%`
    const shareUrl = window.location.origin
    
    if (navigator.share) {
      navigator.share({
        title: `${report.toolName} Diagnostic Results`,
        text: shareText,
        url: shareUrl
      })
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${shareText}\n${shareUrl}`)
      alert('Share link copied to clipboard!')
    }
  }

  // Handle reset
  const handleReset = () => {
    if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
      localStorage.removeItem('nblk_dashboard_data')
      window.location.reload()
    }
  }

  // Force refresh dashboard data
  const forceRefresh = () => {
    const newData = getDashboardData()
    const newMetrics = getDashboardMetrics()
    const newActivities = getRecentActivities()
    const newPhaseData = getPhaseData()
    const newDiagnosticProgress = getAllDiagnosticProgress()
    const newReports = getReports()
    const newUserData = getUserData()
    
    setDashboardData(newData)
    setMetrics(newMetrics)
    setActivities(newActivities)
    setPhaseData(newPhaseData)
    setDiagnosticProgress(newDiagnosticProgress)
    setReports(newReports)
    setUserData(newUserData)
  }

  // Test activity function
  const testActivity = () => {
    updateUserActivity({
      type: 'diagnostic_completed',
      toolName: 'Test Tool',
      score: 85,
      description: 'Test activity added manually'
    })
    forceRefresh()
  }

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
              variant="destructive"
              size="sm"
              className="text-xs px-3 py-1 rounded-lg"
              onClick={handleReset}
            >
              Start Fresh (Reset)
            </Button>
            <Button 
              variant="ghost"
              size="sm"
              className="p-2"
              onClick={forceRefresh}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost"
              size="sm"
              className="p-2"
              onClick={testActivity}
            >
              Test
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
                  navigateToView("how-it-works")
                }}
                className="block w-full text-left text-foreground hover:text-muted-foreground transition-colors py-3 text-lg"
              >
                How it Works
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
      <div className="flex-1 max-w-6xl mx-auto px-8 py-8">
        {/* Phase Progress Section - Show if phase is completed */}
        {phaseData.completed && (
          <div className="mb-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold mb-2">Phase Assessment Complete</h2>
                <p className="text-blue-100">Your business is in the <strong>{phaseData.phase}</strong> phase</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">{phaseData.score}%</div>
                <div className="text-blue-100 text-sm">Completion Score</div>
              </div>
            </div>
            <div className="w-full bg-blue-400/30 rounded-full h-3 mb-2">
              <div 
                className="bg-white h-3 rounded-full transition-all duration-500" 
                style={{width: `${phaseData.score}%`}}
              ></div>
            </div>
            <p className="text-blue-100 text-sm">
              Completed on {new Date(phaseData.completedAt).toLocaleDateString()}
              </p>
            </div>
        )}

        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {userData.name || "Business Owner"}!
          </h1>
          <p className="text-muted-foreground text-lg">
            Here's your personalized business diagnostic overview
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Last active: {formatLastActive(userData.lastActive)}
          </p>
          
          {/* Phase Test Prompt - Show if phase not completed */}
          {!phaseData.completed && (
            <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <div className="flex items-center gap-3">
                <Target className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Take the Phase Assessment first to get personalized insights
                  </p>
                  <p className="text-xs text-muted-foreground">
                    This will help us understand your business stage and provide better recommendations
                  </p>
                </div>
                <Button 
                  onClick={handlePhaseTest}
                  size="sm"
                  className="bg-yellow-500 hover:bg-yellow-600 text-white"
                >
                  Start Phase Test
                </Button>
              </div>
            </div>
          )}
            </div>
            


        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Total Diagnostics</h3>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            </div>
            <p className="text-2xl font-bold text-foreground mb-1">{metrics.totalDiagnostics}</p>
            <p className="text-xs text-muted-foreground mb-3">Available assessments</p>
            <div className="flex items-center text-xs text-blue-500 cursor-pointer" onClick={onExploreTools}>
              <span>All tools ready</span>
              <div className="ml-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Completed</h3>
            </div>
            <p className="text-2xl font-bold text-foreground mb-1">{metrics.completed}</p>
            <p className="text-xs text-muted-foreground mb-3">
              {Math.round((metrics.completed / metrics.totalDiagnostics) * 100)}% completion rate
            </p>
            <div className="w-full bg-gray-700 rounded-full h-1">
              <div 
                className="bg-blue-500 h-1 rounded-full transition-all duration-500" 
                style={{width: `${(metrics.completed / metrics.totalDiagnostics) * 100}%`}}
              ></div>
            </div>
            </div>
            
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Average Score</h3>
            </div>
            <p className="text-2xl font-bold text-foreground mb-1">{metrics.averageScore}%</p>
            <p className="text-xs text-muted-foreground mb-3">
              {metrics.averageScore > 0 ? `Based on ${metrics.completed} completed` : 'No scores yet'}
            </p>
            <div className="flex items-center text-xs text-blue-500">
              <span>Performance tracking</span>
              <div className="ml-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            </div>
        </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Last Activity</h3>
            </div>
            <p className="text-2xl font-bold text-foreground mb-1">
              {formatLastActive(metrics.lastActivity)}
            </p>
            <p className="text-xs text-muted-foreground mb-3">
              {activities.length > 0 ? activities[0].description : 'No recent activity'}
            </p>
            <div className="flex items-center text-xs text-blue-500 cursor-pointer" onClick={onExploreTools}>
              <span>Keep momentum going</span>
            </div>
          </div>
        </div>

        {/* Progress Overview Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
              <h2 className="text-xl font-semibold text-foreground">Progress Overview</h2>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Show all tools</span>
              <Switch 
                checked={showAllTools} 
                onCheckedChange={setShowAllTools}
              />
            </div>
          </div>
          <p className="text-muted-foreground mb-6">Track your completion status across all diagnostics.</p>
          
          {showAllTools && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Data Hygiene Card */}
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Target className="w-5 h-5 text-muted-foreground" />
                  <h3 className="text-base font-medium text-foreground">Data Hygiene & Business Clarity</h3>
                </div>
                <div className="flex items-center justify-between mb-4">
                  {(() => {
                    const progress = diagnosticProgress.find(d => d.toolName === "Data Hygiene & Business Clarity Diagnostic")
                    if (!progress) {
                      return <span className="text-xs bg-gray-600 text-white px-2 py-1 rounded">Not Started</span>
                    } else if (progress.completed) {
                      return <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">Completed</span>
                    } else {
                      return <span className="text-xs bg-yellow-600 text-white px-2 py-1 rounded">In Progress</span>
                    }
                  })()}
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="text-foreground">
                      {(() => {
                        const progress = diagnosticProgress.find(d => d.toolName === "Data Hygiene & Business Clarity Diagnostic")
                        if (!progress) return "0/10"
                        if (progress.completed) return `${progress.totalQuestions}/${progress.totalQuestions}`
                        return `${progress.currentQuestion}/${progress.totalQuestions}`
                      })()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-500" 
                      style={{
                        width: (() => {
                          const progress = diagnosticProgress.find(d => d.toolName === "Data Hygiene & Business Clarity Diagnostic")
                          if (!progress) return '0%'
                          return `${(progress.currentQuestion / progress.totalQuestions) * 100}%`
                        })()
                      }}
                    ></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <button 
                    onClick={() => handleDiagnosticStart("Data Hygiene & Business Clarity Diagnostic")}
                    className="w-full bg-white text-black hover:bg-gray-100 py-2 px-4 rounded text-sm font-medium"
                  >
                    {(() => {
                      const progress = diagnosticProgress.find(d => d.toolName === "Data Hygiene & Business Clarity Diagnostic")
                      if (!progress) return "Start Diagnostic"
                      if (progress.completed) return "Retake Diagnostic"
                      return "Resume Diagnostic"
                    })()}
                  </button>
                  {(() => {
                    const progress = diagnosticProgress.find(d => d.toolName === "Data Hygiene & Business Clarity Diagnostic")
                    if (progress && progress.completed) {
                      return (
                        <button 
                          onClick={() => handleViewResults("Data Hygiene & Business Clarity Diagnostic")}
                          className="w-full bg-blue-500 text-white hover:bg-blue-600 py-2 px-4 rounded text-sm font-medium"
                        >
                          View Results
                        </button>
                      )
                    }
                    return null
                  })()}
                </div>
              </div>

              {/* Marketing Card */}
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className="w-5 h-5 text-muted-foreground" />
                  <h3 className="text-base font-medium text-foreground">Marketing Effectiveness</h3>
                </div>
                <div className="flex items-center justify-between mb-4">
                  {(() => {
                    const progress = diagnosticProgress.find(d => d.toolName === "Marketing Effectiveness Diagnostic")
                    if (!progress) {
                      return <span className="text-xs bg-gray-600 text-white px-2 py-1 rounded">Not Started</span>
                    } else if (progress.completed) {
                      return <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">Completed</span>
                    } else {
                      return <span className="text-xs bg-yellow-600 text-white px-2 py-1 rounded">In Progress</span>
                    }
                  })()}
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="text-foreground">
                      {(() => {
                        const progress = diagnosticProgress.find(d => d.toolName === "Marketing Effectiveness Diagnostic")
                        if (!progress) return "0/10"
                        if (progress.completed) return `${progress.totalQuestions}/${progress.totalQuestions}`
                        return `${progress.currentQuestion}/${progress.totalQuestions}`
                      })()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-500" 
                      style={{
                        width: (() => {
                          const progress = diagnosticProgress.find(d => d.toolName === "Marketing Effectiveness Diagnostic")
                          if (!progress) return '0%'
                          return `${(progress.currentQuestion / progress.totalQuestions) * 100}%`
                        })()
                      }}
                    ></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <button 
                    onClick={() => handleDiagnosticStart("Marketing Effectiveness Diagnostic")}
                    className="w-full bg-white text-black hover:bg-gray-100 py-2 px-4 rounded text-sm font-medium"
                  >
                    {(() => {
                      const progress = diagnosticProgress.find(d => d.toolName === "Marketing Effectiveness Diagnostic")
                      if (!progress) return "Start Diagnostic"
                      if (progress.completed) return "Retake Diagnostic"
                      return "Resume Diagnostic"
                    })()}
                  </button>
                  {(() => {
                    const progress = diagnosticProgress.find(d => d.toolName === "Marketing Effectiveness Diagnostic")
                    if (progress && progress.completed) {
                      return (
                        <button 
                          onClick={() => handleViewResults("Marketing Effectiveness Diagnostic")}
                          className="w-full bg-blue-500 text-white hover:bg-blue-600 py-2 px-4 rounded text-sm font-medium"
                        >
                          View Results
                        </button>
                      )
                    }
                    return null
                  })()}
                </div>
              </div>

              {/* Cash Flow Card */}
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <BarChart3 className="w-5 h-5 text-muted-foreground" />
                  <h3 className="text-base font-medium text-foreground">Cash Flow & Financial Clarity</h3>
                </div>
                <div className="flex items-center justify-between mb-4">
                  {(() => {
                    const progress = diagnosticProgress.find(d => d.toolName === "Cash Flow & Financial Clarity Diagnostic")
                    if (!progress) {
                      return <span className="text-xs bg-gray-600 text-white px-2 py-1 rounded">Not Started</span>
                    } else if (progress.completed) {
                      return <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">Completed</span>
                    } else {
                      return <span className="text-xs bg-yellow-600 text-white px-2 py-1 rounded">In Progress</span>
                    }
                  })()}
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="text-foreground">
                      {(() => {
                        const progress = diagnosticProgress.find(d => d.toolName === "Cash Flow & Financial Clarity Diagnostic")
                        if (!progress) return "0/10"
                        if (progress.completed) return `${progress.totalQuestions}/${progress.totalQuestions}`
                        return `${progress.currentQuestion}/${progress.totalQuestions}`
                      })()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-500" 
                      style={{
                        width: (() => {
                          const progress = diagnosticProgress.find(d => d.toolName === "Cash Flow & Financial Clarity Diagnostic")
                          if (!progress) return '0%'
                          return `${(progress.currentQuestion / progress.totalQuestions) * 100}%`
                        })()
                      }}
                    ></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <button 
                    onClick={() => handleDiagnosticStart("Cash Flow & Financial Clarity Diagnostic")}
                    className="w-full bg-white text-black hover:bg-gray-100 py-2 px-4 rounded text-sm font-medium"
                  >
                    {(() => {
                      const progress = diagnosticProgress.find(d => d.toolName === "Cash Flow & Financial Clarity Diagnostic")
                      if (!progress) return "Start Diagnostic"
                      if (progress.completed) return "Retake Diagnostic"
                      return "Resume Diagnostic"
                    })()}
                  </button>
                  {(() => {
                    const progress = diagnosticProgress.find(d => d.toolName === "Cash Flow & Financial Clarity Diagnostic")
                    if (progress && progress.completed) {
                      return (
                        <button 
                          onClick={() => handleViewResults("Cash Flow & Financial Clarity Diagnostic")}
                          className="w-full bg-blue-500 text-white hover:bg-blue-600 py-2 px-4 rounded text-sm font-medium"
                        >
                          View Results
                        </button>
                      )
                    }
                    return null
                  })()}
                </div>
              </div>

              {/* Operational Efficiency Card */}
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-5 h-5 bg-gray-400 rounded-full"></div>
                  <h3 className="text-base font-medium text-foreground">Operational Efficiency</h3>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs bg-gray-600 text-white px-2 py-1 rounded">Coming Soon</span>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="text-foreground">0/10</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-gray-500 h-2 rounded-full" style={{width: '0%'}}></div>
                  </div>
                </div>
                <button 
                  disabled
                  className="w-full bg-gray-600 text-gray-400 py-2 px-4 rounded text-sm font-medium cursor-not-allowed"
                >
                  Coming Soon
                </button>
              </div>

              {/* Customer Retention Card */}
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-5 h-5 bg-gray-400 rounded-full"></div>
                  <h3 className="text-base font-medium text-foreground">Customer Retention & Growth</h3>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs bg-gray-600 text-white px-2 py-1 rounded">Coming Soon</span>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="text-foreground">0/10</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-gray-500 h-2 rounded-full" style={{width: '0%'}}></div>
                  </div>
                </div>
                <button 
                  disabled
                  className="w-full bg-gray-600 text-gray-400 py-2 px-4 rounded text-sm font-medium cursor-not-allowed"
                >
                  Coming Soon
                </button>
              </div>

              {/* Team Support Card */}
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-5 h-5 bg-gray-400 rounded-full"></div>
                  <h3 className="text-base font-medium text-foreground">Support & Grow Your Team</h3>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs bg-gray-600 text-white px-2 py-1 rounded">Coming Soon</span>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="text-foreground">0/10</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-gray-500 h-2 rounded-full" style={{width: '0%'}}></div>
                  </div>
                </div>
                <button 
                  disabled
                  className="w-full bg-gray-600 text-gray-400 py-2 px-4 rounded text-sm font-medium cursor-not-allowed"
                >
                  Coming Soon
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Business Health Overview Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-blue-500" />
            <h2 className="text-2xl font-bold text-foreground">Business Health Overview</h2>
          </div>
          <p className="text-muted-foreground mb-6">Key areas to focus on for business growth</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Data Hygiene & Business Clarity */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Target className="w-5 h-5 text-muted-foreground" />
                <h3 className="text-lg font-semibold text-foreground">Data Hygiene & Business Clarity</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">Organize and optimize your business data</p>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-foreground">Data Organization</span>
                  <span className="text-xs bg-gray-600 text-white px-2 py-1 rounded">Foundation</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-foreground">Business Processes</span>
                  <span className="text-xs bg-gray-600 text-white px-2 py-1 rounded">Efficiency</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-foreground">System Integration</span>
                  <span className="text-xs bg-gray-600 text-white px-2 py-1 rounded">Optimization</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-sm text-foreground">Data Security</span>
                  <span className="text-xs bg-gray-600 text-white px-2 py-1 rounded">Protection</span>
                </div>
              </div>
              
              <button 
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.scrollTo(0, 0)
                  }
                  onExploreTools()
                }}
                className="w-full bg-gray-800 text-white hover:bg-gray-700 py-2 px-4 rounded text-sm font-medium"
              >
                Assess Data Health
              </button>
            </div>

            {/* Marketing Effectiveness */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-5 h-5 text-muted-foreground" />
                <h3 className="text-lg font-semibold text-foreground">Marketing Effectiveness</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">Essential marketing practices for business success</p>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-foreground">Target Audience</span>
                  <span className="text-xs bg-gray-600 text-white px-2 py-1 rounded">Critical</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-foreground">Brand Consistency</span>
                  <span className="text-xs bg-gray-600 text-white px-2 py-1 rounded">Important</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-foreground">Customer Feedback</span>
                  <span className="text-xs bg-gray-600 text-white px-2 py-1 rounded">Essential</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-sm text-foreground">ROI Tracking</span>
                  <span className="text-xs bg-gray-600 text-white px-2 py-1 rounded">Key Metric</span>
                </div>
              </div>
              
              <button 
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.scrollTo(0, 0)
                  }
                  onExploreTools()
                }}
                className="w-full bg-gray-800 text-white hover:bg-gray-700 py-2 px-4 rounded text-sm font-medium"
              >
                Assess Marketing Health
              </button>
            </div>

            {/* Cash Flow & Financial Clarity */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <BarChart3 className="w-5 h-5 text-muted-foreground" />
                <h3 className="text-lg font-semibold text-foreground">Cash Flow & Financial Clarity</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">Core financial practices for stability</p>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-foreground">Expense Tracking</span>
                  <span className="text-xs bg-gray-600 text-white px-2 py-1 rounded">Foundation</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-foreground">Cash Flow Forecast</span>
                  <span className="text-xs bg-gray-600 text-white px-2 py-1 rounded">Planning</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-foreground">Emergency Funds</span>
                  <span className="text-xs bg-gray-600 text-white px-2 py-1 rounded">Security</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-sm text-foreground">Profitability</span>
                  <span className="text-xs bg-gray-600 text-white px-2 py-1 rounded">Goal</span>
                </div>
              </div>
              
              <button 
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.scrollTo(0, 0)
                  }
                  onExploreTools()
                }}
                className="w-full bg-gray-800 text-white hover:bg-gray-700 py-2 px-4 rounded text-sm font-medium"
              >
                Assess Financial Health
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <Zap className="w-5 h-5 text-yellow-500" />
            <h2 className="text-xl font-semibold text-foreground">Quick Actions</h2>
          </div>
          <p className="text-muted-foreground mb-6">Get things done faster with these shortcuts.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="bg-card border border-border rounded-lg p-6 text-center hover:bg-card/80 transition-colors cursor-pointer" onClick={() => {
              if (typeof window !== 'undefined') {
                window.scrollTo(0, 0)
              }
              onExploreTools()
            }}>
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Play className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Start New Diagnostic</h3>
              <p className="text-sm text-muted-foreground mb-4">Begin a fresh assessment to track your progress.</p>
              <button className="w-full bg-transparent border border-gray-600 text-white hover:bg-gray-600 py-2 px-4 rounded text-sm">
                Get Started
              </button>
            </div>

            <div className="bg-card border border-border rounded-lg p-6 text-center hover:bg-card/80 transition-colors cursor-pointer">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Download className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Download Reports</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {reports.length > 0 ? `${reports.length} report${reports.length > 1 ? 's' : ''} available` : 'No reports available yet'}
              </p>
              <button 
                onClick={() => reports.length > 0 ? handleReportDownload(reports[0]) : onExploreTools()}
                className={`w-full py-2 px-4 rounded text-sm ${
                  reports.length > 0 
                    ? 'bg-transparent border border-gray-600 text-white hover:bg-gray-600' 
                    : 'bg-gray-600 text-gray-300 cursor-not-allowed'
                }`}
              >
                {reports.length > 0 ? 'Download All' : 'Generate First'}
              </button>
            </div>

            <div className="bg-card border border-border rounded-lg p-6 text-center hover:bg-card/80 transition-colors cursor-pointer">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Get Detailed Reports</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {diagnosticProgress.filter(d => d.completed).length > 0 
                  ? `${diagnosticProgress.filter(d => d.completed).length} diagnostic${diagnosticProgress.filter(d => d.completed).length > 1 ? 's' : ''} ready for detailed reports` 
                  : 'Complete a diagnostic to get detailed reports'}
              </p>
              <button 
                onClick={() => {
                  if (diagnosticProgress.filter(d => d.completed).length > 0) {
                    // Navigate to email capture for the first completed diagnostic
                    const completedDiagnostic = diagnosticProgress.find(d => d.completed)
                    if (completedDiagnostic) {
                      navigateToView("email-capture")
                    }
                  } else {
                    onExploreTools()
                  }
                }}
                className={`w-full py-2 px-4 rounded text-sm ${
                  diagnosticProgress.filter(d => d.completed).length > 0 
                    ? 'bg-transparent border border-gray-600 text-white hover:bg-gray-600' 
                    : 'bg-gray-600 text-gray-300 cursor-not-allowed'
                }`}
              >
                {diagnosticProgress.filter(d => d.completed).length > 0 ? 'Get Detailed Report' : 'Complete First'}
              </button>
            </div>

            <div className="bg-card border border-border rounded-lg p-6 text-center hover:bg-card/80 transition-colors cursor-pointer">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Share2 className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Share Results</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {reports.length > 0 ? 'Share your progress with your team or advisors.' : 'Complete a diagnostic to share results.'}
              </p>
              <button 
                onClick={() => reports.length > 0 ? handleShare(reports[0]) : onExploreTools()}
                className={`w-full py-2 px-4 rounded text-sm ${
                  reports.length > 0 
                    ? 'bg-transparent border border-gray-600 text-white hover:bg-gray-600' 
                    : 'bg-gray-600 text-gray-300 cursor-not-allowed'
                }`}
              >
                {reports.length > 0 ? 'Share Now' : 'Complete First'}
              </button>
            </div>

            <div className="bg-card border border-border rounded-lg p-6 text-center hover:bg-card/80 transition-colors cursor-pointer">
              <div className="w-12 h-12 border-2 border-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Assess Phase</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {phaseData.completed ? 'Reassess your business phase for updated insights.' : 'Take the phase assessment to understand your business stage.'}
              </p>
              <button 
                onClick={handlePhaseTest}
                className="w-full bg-transparent border border-gray-600 text-white hover:bg-gray-600 py-2 px-4 rounded text-sm"
              >
                {phaseData.completed ? 'Reassess Now' : 'Assess Now'}
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Insights & Recommendations */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              <h3 className="text-lg font-semibold text-foreground">Insights & Recommendations</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-6">Personalized insights based on your diagnostic results</p>
            
            {diagnosticProgress.filter(d => d.completed).length > 0 ? (
              <div className="space-y-4">
                {diagnosticProgress.filter(d => d.completed).slice(0, 3).map((diagnostic, index) => {
                  // Generate insights based on the diagnostic results
                  const yesAnswers = diagnostic.answers.filter(a => a.answer === "Yes")
                  const noAnswers = diagnostic.answers.filter(a => a.answer === "No")
                  const yesCount = yesAnswers.length
                  const noCount = noAnswers.length
                  
                  let insights = []
                  
                  if (yesCount === 10) {
                    insights = [
                      "Excellent! Your business shows strong practices across all areas.",
                      "You have a solid foundation for growth and scaling.",
                      "Consider advanced optimization opportunities for next-level growth."
                    ]
                  } else if (noCount === 10) {
                    insights = [
                      "Taking this diagnostic is your first step toward business success.",
                      "Start with one simple improvement this week.",
                      "Get your detailed report to see which steps will have the biggest impact."
                    ]
                  } else if (yesCount >= 7) {
                    insights = [
                      `You have strong practices in ${yesCount} out of 10 areas.`,
                      `Focus on the ${noCount} areas for improvement to optimize further.`,
                      "Your foundation is solid - now optimize for growth."
                    ]
                  } else {
                    insights = [
                      `You have ${yesCount} good practices in place.`,
                      `Focus on the ${noCount} areas that need attention.`,
                      "Start with the easiest improvements for quick wins."
                    ]
                  }
                  
                  return (
                    <div key={index} className="p-4 bg-gray-800/50 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-foreground">{diagnostic.toolName}</h4>
                        <span className="text-sm text-blue-500">{diagnostic.score}%</span>
                      </div>
                      <div className="space-y-2">
                        {insights.map((insight, insightIndex) => (
                          <div key={insightIndex} className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                            <p className="text-sm text-muted-foreground">{insight}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="w-6 h-6 bg-white rounded-sm"></div>
                </div>
                <h3 className="font-semibold text-foreground mb-2">Get Started</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Complete your first diagnostic to see your progress and insights.
                </p>
                <button onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.scrollTo(0, 0)
                  }
                  onExploreTools()
                }} className="bg-black text-white hover:bg-gray-800 py-2 px-4 rounded text-sm font-medium">
                  Start Diagnostic
                </button>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-blue-500" />
              <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-6">Your latest diagnostic activities and progress</p>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {activities.length > 0 ? (
                activities.map((activity, index) => (
                  <div key={activity.id} className="flex items-center gap-3 p-3 hover:bg-gray-800 rounded-lg transition-colors cursor-pointer">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      activity.type === 'phase_completed' ? 'bg-purple-500' :
                      activity.type === 'diagnostic_completed' ? 'bg-green-500' :
                      activity.type === 'report_requested' ? 'bg-blue-500' :
                      activity.type === 'report_downloaded' ? 'bg-orange-500' :
                      'bg-blue-500'
                    }`}>
                      {activity.type === 'phase_completed' ? (
                        <Target className="w-4 h-4 text-white" />
                      ) : activity.type === 'diagnostic_completed' ? (
                        <CheckCircle className="w-4 h-4 text-white" />
                      ) : activity.type === 'report_requested' ? (
                        <FileText className="w-4 h-4 text-white" />
                      ) : activity.type === 'report_downloaded' ? (
                        <Download className="w-4 h-4 text-white" />
                      ) : (
                        <Play className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.type === 'diagnostic_completed' && activity.score ? `Scored ${activity.score}%` :
                         activity.type === 'phase_completed' && activity.score ? `Phase: ${activity.phase} (${activity.score}%)` :
                         activity.type === 'report_requested' ? 'Report requested via email' :
                         activity.type === 'report_downloaded' ? 'Report downloaded' :
                         'Activity logged'}
                      </p>
                      <p className="text-xs text-muted-foreground">{formatTimestamp(activity.timestamp)}</p>
                    </div>
                    <div className="w-4 h-4 text-muted-foreground">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-gray-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-sm text-muted-foreground">No recent activity</p>
                  <p className="text-xs text-muted-foreground mt-1">Start a diagnostic to see your activity here</p>
                </div>
              )}
            </div>
          </div>
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

      {/* Report Modal */}
      <Dialog open={showReportModal} onOpenChange={setShowReportModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {selectedReport?.toolName} Diagnostic Report
            </DialogTitle>
            <DialogDescription>
              Report for {selectedReport?.name} - Score: {selectedReport?.score}%
            </DialogDescription>
          </DialogHeader>
          
          {selectedReport && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                <div>
                  <h3 className="font-semibold text-foreground">{selectedReport.toolName}</h3>
                  <p className="text-sm text-muted-foreground">Completed on {new Date(selectedReport.requestedAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-500">{selectedReport.score}%</div>
                  <div className="text-sm text-muted-foreground">Completion Score</div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-foreground">Report Summary</h4>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleShare(selectedReport)}
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`mailto:?subject=${selectedReport.toolName} Diagnostic Report&body=Check out my ${selectedReport.toolName} diagnostic results! Score: ${selectedReport.score}%`)}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Email
                    </Button>
                  </div>
                </div>
                
                <div className="p-4 bg-gray-800 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    {selectedReport.score >= 70 ? 'Excellent performance! Your business shows strong practices in this area.' :
                     selectedReport.score >= 50 ? 'Good progress. There are opportunities for improvement in specific areas.' :
                     'Room for improvement. Focus on the key areas identified in the diagnostic.'}
                  </p>
                </div>
                
                <div className="text-center text-sm text-muted-foreground">
                  <p>Full detailed report has been sent to {selectedReport.email}</p>
                  <p className="mt-1">Check your email for the complete analysis and recommendations.</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 