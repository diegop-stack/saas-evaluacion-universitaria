'use client'

import { useState, useEffect } from 'react'
import { RulesModal } from '@/components/auth/RulesModal'
import { useRouter } from 'next/navigation'

interface RulesDashboardOverlayProps {
  userProfile: {
    id: string
    full_name: string
    dni: string
    nationality: string
    accepted_policies: boolean
  }
}

export function RulesDashboardOverlay({ userProfile }: RulesDashboardOverlayProps) {
  const [showModal, setShowModal] = useState(false)
  const [isAccepting, setIsAccepting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!userProfile.accepted_policies) {
      setShowModal(true)
    }
  }, [userProfile.accepted_policies])

  const handleAccept = async () => {
    setIsAccepting(true)
    try {
      const resp = await fetch('/api/auth/policies', {
        method: 'POST',
      })
      if (resp.ok) {
        setShowModal(false)
        router.refresh()
      } else {
         console.error('Error al aceptar políticas')
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsAccepting(false)
    }
  }

  if (!showModal) return null

  return (
    <RulesModal 
      isOpen={showModal} 
      onAccept={handleAccept} 
      isSubmitting={isAccepting}
      userData={{
        fullName: userProfile.full_name,
        dni: userProfile.dni,
        nationality: userProfile.nationality
      }}
    />
  )
}
