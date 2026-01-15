'use client'

import { Loader2 } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { useUser } from '@/hooks/use-user'

interface CheckoutButtonProps {
  plan: 'byok' | 'pro'
  variant?: 'default' | 'outline'
  className?: string
  children: React.ReactNode
}

export function CheckoutButton({
  plan,
  variant = 'default',
  className,
  children,
}: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { user, isLoading: userLoading } = useUser()
  const { toast } = useToast()

  const handleCheckout = async () => {
    if (!user) {
      // Redirect to login
      window.location.href = '/auth/login?redirect=/pricing'
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Checkout failed')
      }

      // Redirect to LemonSqueezy checkout
      window.location.href = data.url
    } catch (error) {
      console.error('Checkout error:', error)
      toast({
        title: 'Fehler',
        description:
          error instanceof Error ? error.message : 'Checkout fehlgeschlagen',
        variant: 'destructive',
      })
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant={variant}
      className={className}
      onClick={handleCheckout}
      disabled={isLoading || userLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Wird geladen...
        </>
      ) : (
        children
      )}
    </Button>
  )
}
