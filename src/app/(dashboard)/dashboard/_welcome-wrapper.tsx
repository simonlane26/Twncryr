'use client'

import { useState, useEffect } from 'react'
import WelcomeWizard from './welcome/_wizard'

// Wraps the dashboard page and shows the welcome wizard
// once per business, tracked in localStorage
export default function DashboardWelcomeWrapper({
  businessId,
  businessName,
  townName,
  children,
}: {
  businessId: string
  businessName: string
  townName: string
  children: React.ReactNode
}) {
  const [showWizard, setShowWizard] = useState(false)

  useEffect(() => {
    const key = `twncryr_welcomed_${businessId}`
    if (!localStorage.getItem(key)) {
      setShowWizard(true)
    }
  }, [businessId])

  function handleComplete() {
    localStorage.setItem(`twncryr_welcomed_${businessId}`, '1')
    setShowWizard(false)
  }

  return (
    <>
      {showWizard && (
        <WelcomeWizard
          businessName={businessName}
          townName={townName}
          onComplete={handleComplete}
        />
      )}
      {children}
    </>
  )
}
