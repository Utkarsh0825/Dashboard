// Ultra-fast Activity Manager - Zero Lag, Instant Updates
interface Activity {
  id: string
  type: 'phase_started' | 'phase_completed' | 'diagnostic_started' | 'diagnostic_completed' | 'report_viewed' | 'report_sent'
  toolName?: string
  phase?: string
  score?: number
  timestamp: number
  description: string
}

class InstantActivityManager {
  private cache = new Map<string, Activity>()
  private pending: Activity[] = []
  private processing = false
  private maxActivities = 50
  private storageKey = 'nblk_activity_cache'

  constructor() {
    this.loadFromStorage()
  }

  // Instant activity logging - never blocks UI
  logActivity(activityData: Omit<Activity, 'id' | 'timestamp'>): void {
    const activity: Activity = {
      ...activityData,
      id: this.generateId(),
      timestamp: Date.now()
    }

    // 1. Instant UI update (synchronous)
    this.updateCache(activity)

    // 2. Queue for background processing (non-blocking)
    this.pending.push(activity)

    // 3. Process when browser is idle
    if (!this.processing) {
      this.processPending()
    }
  }

  // Get activities instantly from memory
  getActivities(limit: number = 10): Activity[] {
    return Array.from(this.cache.values())
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit)
  }

  // Clear all activities
  clearActivities(): void {
    this.cache.clear()
    this.pending.length = 0
    // Check if we're in a browser environment
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(this.storageKey)
    }
  }

  // Check for duplicates (prevent same activity within 5 seconds)
  private isDuplicate(activity: Activity): boolean {
    const recent = Array.from(this.cache.values())
      .filter(a => a.type === activity.type && a.toolName === activity.toolName)
      .sort((a, b) => b.timestamp - a.timestamp)[0]

    if (recent && (activity.timestamp - recent.timestamp) < 5000) {
      return true
    }
    return false
  }

  // Update cache instantly
  private updateCache(activity: Activity): void {
    // Prevent duplicates
    if (this.isDuplicate(activity)) {
      return
    }

    // Add to cache
    this.cache.set(activity.id, activity)

    // Keep only recent activities
    if (this.cache.size > this.maxActivities) {
      const oldest = Array.from(this.cache.values())
        .sort((a, b) => a.timestamp - b.timestamp)[0]
      if (oldest) {
        this.cache.delete(oldest.id)
      }
    }
  }

  // Background processing - never blocks UI
  private processPending(): void {
    if (this.pending.length === 0) {
      this.processing = false
      return
    }

    this.processing = true

    // Use requestIdleCallback for background processing
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        this.savePendingActivities()
      }, { timeout: 1000 })
    } else {
      // Fallback for older browsers
      setTimeout(() => {
        this.savePendingActivities()
      }, 0)
    }
  }

  // Save pending activities to storage
  private savePendingActivities(): void {
    const activitiesToSave = [...this.pending]
    this.pending.length = 0

    try {
      // Check if we're in a browser environment
      if (typeof window !== 'undefined' && window.localStorage) {
        // Save to localStorage
        const existing = localStorage.getItem(this.storageKey)
        const stored = existing ? JSON.parse(existing) : []
        const updated = [...activitiesToSave, ...stored].slice(0, this.maxActivities)
        localStorage.setItem(this.storageKey, JSON.stringify(updated))
      }
    } catch (error) {
      console.warn('Activity storage failed:', error)
      // Re-queue failed activities
      this.pending.unshift(...activitiesToSave)
    }

    this.processing = false

    // Process any new pending activities
    if (this.pending.length > 0) {
      this.processPending()
    }
  }

  // Load activities from storage (background)
  private loadFromStorage(): void {
    try {
      // Check if we're in a browser environment
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem(this.storageKey)
        if (stored) {
          const activities: Activity[] = JSON.parse(stored)
          activities.forEach(activity => {
            this.cache.set(activity.id, activity)
          })
        }
      }
    } catch (error) {
      console.warn('Activity loading failed:', error)
    }
  }

  // Save current cache to storage
  private saveToStorage(): void {
    try {
      // Check if we're in a browser environment
      if (typeof window !== 'undefined' && window.localStorage) {
        const activities = Array.from(this.cache.values())
        localStorage.setItem(this.storageKey, JSON.stringify(activities))
      }
    } catch (error) {
      console.warn('Activity save failed:', error)
    }
  }

  // Generate unique ID
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
  }
}

// Global activity manager instance
export const activityManager = new InstantActivityManager()

// Convenience functions for easy integration
export const logActivity = (activityData: Omit<Activity, 'id' | 'timestamp'>) => {
  activityManager.logActivity(activityData)
}

export const getActivities = (limit?: number) => {
  return activityManager.getActivities(limit)
}

export const clearActivities = () => {
  activityManager.clearActivities()
}

// Activity type helpers
export const ActivityTypes = {
  PHASE_STARTED: 'phase_started' as const,
  PHASE_COMPLETED: 'phase_completed' as const,
  DIAGNOSTIC_STARTED: 'diagnostic_started' as const,
  DIAGNOSTIC_COMPLETED: 'diagnostic_completed' as const,
  REPORT_VIEWED: 'report_viewed' as const,
  REPORT_SENT: 'report_sent' as const
}
