import { useState, useEffect } from 'react'
import { getActivities, activityManager } from '@/lib/activity-manager'

export const useActivities = (limit: number = 10) => {
  const [activities, setActivities] = useState(getActivities(limit))

  useEffect(() => {
    // Update activities immediately when they change
    const updateActivities = () => {
      setActivities(getActivities(limit))
    }

    // Listen for activity updates
    const interval = setInterval(updateActivities, 1000) // Check every second

    return () => clearInterval(interval)
  }, [limit])

  return activities
}
