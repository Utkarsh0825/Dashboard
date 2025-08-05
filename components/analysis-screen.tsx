"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { ThemeToggle } from "@/components/ui/theme-toggle"

const tips = [
  "analyzing responses",
  "deploying AI models",
  "generating reports",
  "getting things ready",
]

export default function AnalysisScreen() {
  const [tipIndex, setTipIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % tips.length)
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center text-center px-4">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      
      <h1 className="mb-4 text-2xl md:text-4xl font-bold text-foreground">
            NNX1™ Small Business Solutions
          </h1>
      <motion.p
        key={tips[tipIndex]}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.3 }}
        className="text-base text-muted-foreground"
      >
        {tips[tipIndex]}
      </motion.p>
    </div>
  )
}
