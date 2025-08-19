// Dashboard Tracking System
// This file handles all dynamic dashboard functionality

export interface PhaseData {
  completed: boolean
  phase: string
  score: number
  completedAt: number
  answers: boolean[]
}

export interface DiagnosticProgress {
  toolName: string
  completed: boolean
  score: number
  currentQuestion: number
  totalQuestions: number
  answers: DiagnosticAnswer[]
  startedAt: number
  completedAt?: number
  sessionId: string
  insights?: Array<{
    description: string
  }>
}

export interface DiagnosticAnswer {
  questionId: string
  question: string
  answer: "Yes" | "No"
}



export interface ReportData {
  toolName: string
  name: string
  email: string
  score: number
  requestedAt: number
  reportContent?: string
  downloaded: boolean
}

export interface DashboardData {
  userData: {
    name: string
    email: string
    lastActive: number
  }
  phase: PhaseData
  diagnostics: DiagnosticProgress[]
  reports: ReportData[]
  insights: any[]
}

// Storage keys
const STORAGE_KEYS = {
  DASHBOARD_DATA: 'nblk_dashboard_data',
  PHASE_DATA: 'nblk_phase_data',
  DIAGNOSTIC_PROGRESS: 'nblk_diagnostic_progress',
  USER_ACTIVITIES: 'nblk_user_activities',
  REPORTS: 'nblk_reports',
  USER_DATA: 'nblk_user_data'
}

// Initialize dashboard data
export const initializeDashboardData = (): DashboardData => {
  if (typeof window === 'undefined') {
    return getDefaultDashboardData()
  }

  const existing = localStorage.getItem(STORAGE_KEYS.DASHBOARD_DATA)
  if (existing) {
    try {
      return JSON.parse(existing)
    } catch {
      return getDefaultDashboardData()
    }
  }

  return getDefaultDashboardData()
}

const getDefaultDashboardData = (): DashboardData => ({
  userData: {
    name: "",
    email: "",
    lastActive: Date.now()
  },
  phase: {
    completed: false,
    phase: "",
    score: 0,
    completedAt: 0,
    answers: []
  },
  diagnostics: [],
  reports: [],
  insights: []
})

// Save dashboard data
export const saveDashboardData = (data: DashboardData) => {
  if (typeof window === 'undefined') return
  
  localStorage.setItem(STORAGE_KEYS.DASHBOARD_DATA, JSON.stringify(data))
}











// Get dashboard data
export const getDashboardData = (): DashboardData => {
  if (typeof window === 'undefined') {
    return getDefaultDashboardData()
  }

  const data = localStorage.getItem(STORAGE_KEYS.DASHBOARD_DATA)
  if (!data) {
    const defaultData = getDefaultDashboardData()
    saveDashboardData(defaultData)
    return defaultData
  }

  try {
    return JSON.parse(data)
  } catch {
    const defaultData = getDefaultDashboardData()
    saveDashboardData(defaultData)
    return defaultData
  }
}

// Phase tracking
export const savePhaseCompletion = (phase: string, score: number, answers: boolean[]) => {
  console.log(`💾 savePhaseCompletion called for phase: ${phase}, score: ${score}`)
  
  const data = getDashboardData()
  data.phase = {
    completed: true,
    phase,
    score,
    completedAt: Date.now(),
    answers
  }
  
  console.log(`💾 Saving phase completion data to localStorage`)
  saveDashboardData(data)
  console.log(`✅ Phase completion saved successfully`)
  return data
}

export const getPhaseData = (): PhaseData => {
  return getDashboardData().phase
}

// Diagnostic tracking
export const saveDiagnosticProgress = (progress: DiagnosticProgress) => {
  console.log(`💾 Saving diagnostic progress: ${progress.toolName}, Completed: ${progress.completed}, Score: ${progress.score}`)
  
  const data = getDashboardData()
  const existingIndex = data.diagnostics.findIndex(d => d.toolName === progress.toolName)
  
  if (existingIndex >= 0) {
    data.diagnostics[existingIndex] = progress
    console.log(`🔄 Updated existing diagnostic: ${progress.toolName}`)
  } else {
    data.diagnostics.push(progress)
    console.log(`➕ Added new diagnostic: ${progress.toolName}`)
  }
  
  // Note: Activity tracking removed - only saving progress data
  
  saveDashboardData(data)
  console.log(`💾 Dashboard data saved. Total diagnostics: ${data.diagnostics.length}`)
  return data
}

export const getDiagnosticProgress = (toolName: string): DiagnosticProgress | null => {
  const data = getDashboardData()
  return data.diagnostics.find(d => d.toolName === toolName) || null
}

export const getAllDiagnosticProgress = (): DiagnosticProgress[] => {
  return getDashboardData().diagnostics
}

// Save insights for a diagnostic
export const saveDiagnosticInsights = (toolName: string, insights: Array<{ description: string }>) => {
  const data = getDashboardData()
  const diagnostic = data.diagnostics.find(d => d.toolName === toolName)
  
  if (diagnostic) {
    diagnostic.insights = insights
    console.log(`💡 Saved insights for ${toolName}:`, insights)
    saveDashboardData(data)
  } else {
    console.warn(`⚠️ No diagnostic found for ${toolName} to save insights`)
  }
  
  return data
}

// Get insights for a diagnostic
export const getDiagnosticInsights = (toolName: string): Array<{ description: string }> | null => {
  const data = getDashboardData()
  const diagnostic = data.diagnostics.find(d => d.toolName === toolName)
  return diagnostic?.insights || null
}

// Report tracking
export const saveReportRequest = (reportData: Omit<ReportData, 'requestedAt' | 'downloaded'>) => {
  console.log(`💾 saveReportRequest called for: ${reportData.toolName}, score: ${reportData.score}`)
  
  const data = getDashboardData()
  const newReport: ReportData = {
    ...reportData,
    requestedAt: Date.now(),
    downloaded: false
  }
  
  data.reports.push(newReport)
  data.userData.name = reportData.name
  data.userData.email = reportData.email
  

  
  console.log(`💾 Report data saved. Total reports: ${data.reports.length}`)
  saveDashboardData(data)
  return data
}

export const markReportDownloaded = (toolName: string) => {
  const data = getDashboardData()
  const report = data.reports.find(r => r.toolName === toolName)
  if (report) {
    report.downloaded = true
    saveDashboardData(data)
  }
  return data
}

export const getReports = (): ReportData[] => {
  return getDashboardData().reports
}

// User data
export const updateUserData = (name: string, email: string) => {
  const data = getDashboardData()
  data.userData.name = name
  data.userData.email = email
  data.userData.lastActive = Date.now()
  
  saveDashboardData(data)
  return data
}

export const getUserData = () => {
  return getDashboardData().userData
}



// Utility functions
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9)
}

export const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
  
  if (diffInHours < 24) {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: true 
    })
  } else {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }
}

export const formatLastActive = (timestamp: number): string => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
  
  if (diffInHours < 1) {
    return 'Just now'
  } else if (diffInHours < 24) {
    const hours = Math.floor(diffInHours)
    return `${hours} hour${hours > 1 ? 's' : ''} ago`
  } else {
    const days = Math.floor(diffInHours / 24)
    return `${days} day${days > 1 ? 's' : ''} ago`
  }
}

// Dashboard metrics
export const getDashboardMetrics = () => {
  const data = getDashboardData()
  const completedDiagnostics = data.diagnostics.filter(d => d.completed)
  const totalScore = completedDiagnostics.reduce((sum, d) => sum + d.score, 0)
  const averageScore = completedDiagnostics.length > 0 ? Math.round(totalScore / completedDiagnostics.length) : 0
  
  return {
    totalDiagnostics: 3, // Fixed number of available diagnostics
    completed: completedDiagnostics.length,
    averageScore,
    lastActivity: data.userData.lastActive,
    phaseCompleted: data.phase.completed,
    phase: data.phase.phase,
    phaseScore: data.phase.score
  }
}

// Resume functionality
export const getResumeData = (toolName: string) => {
  const progress = getDiagnosticProgress(toolName)
  if (!progress || progress.completed) return null
  
  return {
    toolName: progress.toolName,
    currentQuestion: progress.currentQuestion,
    totalQuestions: progress.totalQuestions,
    sessionId: progress.sessionId,
    answers: progress.answers
  }
}

// Clear all data (for testing)
export const clearDashboardData = () => {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEYS.DASHBOARD_DATA)
}

// Clear specific diagnostic progress
export const clearDiagnosticProgress = (toolName: string) => {
  const data = getDashboardData()
  data.diagnostics = data.diagnostics.filter(d => d.toolName !== toolName)
  saveDashboardData(data)
  return data
}
