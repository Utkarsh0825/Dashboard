"use client"

import { useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"

interface SignUpModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SignUpModal({ isOpen, onClose }: SignUpModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    industry: "",
    zipCode: "",
    email: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    if (!formData.name || !formData.company || !formData.industry || !formData.zipCode || !formData.email) {
      alert("Please fill in all fields")
      return
    }

    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Show success message
      setShowSuccess(true)
      
      // Don't auto-close - let user close manually
      
    } catch (error) {
      console.error("Error submitting form:", error)
      alert("There was an error submitting your information. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setShowSuccess(false)
    onClose()
    // Reset form
    setFormData({
      name: "",
      company: "",
      industry: "",
      zipCode: "",
      email: ""
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-card border border-border">
        <div className="flex flex-col items-center gap-6">
          {/* Header */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-3">Sign Up</h2>
            {!showSuccess && (
              <>
                <p className="text-muted-foreground text-base leading-relaxed">
                  Sign up to unlock your personalized dashboard — coming soon.
                </p>
                <p className="text-muted-foreground text-base leading-relaxed mt-2">
                  Track your progress, view tailored insights, and access your full diagnostic history once the full experience launches. Sign up now to be first in line when it goes live.
                </p>
              </>
            )}
          </div>
          
          {/* Success Message */}
          {showSuccess && (
            <div className="w-full p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-center">
              <div className="text-green-500 font-semibold mb-2">✓ Successfully Signed Up!</div>
              <div className="text-sm text-muted-foreground mb-4">
                We'll notify you when the full experience launches. Check your email for confirmation.
              </div>
              <button
                onClick={handleClose}
                className="px-6 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Close
              </button>
            </div>
          )}
          
          {/* Form */}
          {!showSuccess && (
            <form onSubmit={handleSubmit} className="w-full space-y-4">
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Preferred Name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Name of Company"
                  value={formData.company}
                  onChange={(e) => handleInputChange("company", e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Industry"
                  value={formData.industry}
                  onChange={(e) => handleInputChange("industry", e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Zip Code"
                  value={formData.zipCode}
                  onChange={(e) => handleInputChange("zipCode", e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <input
                  type="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSubmitting ? "Signing Up..." : "Sign Up Now"}
              </button>
            </form>
          )}
          
          {/* Privacy Statement */}
          {!showSuccess && (
            <p className="text-center text-xs text-muted-foreground">
              Your information is secure and won't be shared. We'll notify you when the full experience launches.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 