'use client'

import {
  Check,
  CheckCircle,
  CreditCard,
  ExternalLink,
  Key,
  Loader2,
  LogOut,
  User,
} from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'

import { CheckoutButton } from '@/components/checkout-button'
import { Button } from '@/components/ui/button'
import { useSubscription } from '@/hooks/use-subscription'
import { useToast } from '@/hooks/use-toast'
import { useUser } from '@/hooks/use-user'
import { cn } from '@/lib/utils'

type SettingsTab = 'account' | 'subscription' | 'api-keys'

function SettingsContent() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('account')
  const { user, isLoading: userLoading, signOut } = useUser()
  const { subscription, isLoading: subLoading, refetch } = useSubscription()
  const searchParams = useSearchParams()
  const [showSuccess, setShowSuccess] = useState(false)

  // Handle checkout success
  useEffect(() => {
    if (searchParams.get('checkout') === 'success') {
      setShowSuccess(true)
      setActiveTab('subscription')
      // Refetch subscription after successful checkout
      const timer = setTimeout(() => {
        refetch()
      }, 2000)
      // Clear URL params
      window.history.replaceState({}, '', '/settings')
      return () => clearTimeout(timer)
    }
    return undefined
  }, [searchParams, refetch])

  const tabs = [
    { id: 'account' as const, label: 'Account', icon: User },
    { id: 'subscription' as const, label: 'Abo', icon: CreditCard },
    { id: 'api-keys' as const, label: 'API Keys', icon: Key },
  ]

  if (userLoading || subLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Einstellungen</h1>
        <p className="mt-1 text-gray-600">Verwalte dein Konto und deine Einstellungen</p>
      </div>

      {/* Success message */}
      {showSuccess && (
        <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <div>
            <p className="font-medium text-green-900">Zahlung erfolgreich!</p>
            <p className="text-sm text-green-700">
              Dein Account wird in wenigen Sekunden aktualisiert.
            </p>
          </div>
        </div>
      )}

      <div className="flex gap-8">
        {/* Sidebar */}
        <nav className="w-48 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                activeTab === tab.id
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'account' && (
            <AccountSettings
              user={
                user
                  ? {
                      name: user.name || 'User',
                      email: user.email,
                      avatarUrl: user.avatarUrl,
                    }
                  : null
              }
              onSignOut={signOut}
            />
          )}
          {activeTab === 'subscription' && <SubscriptionSettings subscription={subscription} />}
          {activeTab === 'api-keys' && <ApiKeySettings subscription={subscription} />}
        </div>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      }
    >
      <SettingsContent />
    </Suspense>
  )
}

interface AccountSettingsProps {
  user: {
    name: string
    email: string
    avatarUrl: string | null
  } | null
  onSignOut: () => Promise<void>
}

function AccountSettings({ user, onSignOut }: AccountSettingsProps) {
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleSignOut = async () => {
    setIsSigningOut(true)
    await onSignOut()
  }

  if (!user) {
    return (
      <div className="rounded-lg border bg-white p-6">
        <p className="text-gray-500">Nicht angemeldet</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">Profil</h2>
        <p className="mt-1 text-sm text-gray-500">Deine Account-Informationen</p>

        <div className="mt-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-600">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-gray-900">{user.name}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">Danger Zone</h2>
        <p className="mt-1 text-sm text-gray-500">Irreversible Aktionen</p>

        <div className="mt-6">
          <Button
            variant="outline"
            className="text-red-600 hover:bg-red-50"
            onClick={handleSignOut}
            disabled={isSigningOut}
          >
            {isSigningOut ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="mr-2 h-4 w-4" />
            )}
            Abmelden
          </Button>
        </div>
      </div>
    </div>
  )
}

interface SubscriptionSettingsProps {
  subscription: {
    plan: 'free' | 'pro' | 'byok'
    status: string
    currentPeriodEnd: string | null
  }
}

function SubscriptionSettings({ subscription }: SubscriptionSettingsProps) {
  const [isLoadingPortal, setIsLoadingPortal] = useState(false)
  const { toast } = useToast()

  const plans = [
    {
      id: 'free' as const,
      name: 'Free',
      price: '0€',
      features: ['Unbegrenzte Carousels', 'Basic Templates', 'PDF Export', 'Watermark'],
    },
    {
      id: 'byok' as const,
      name: 'BYOK',
      price: '4€/Monat',
      features: [
        'Alles aus Free',
        'Kein Watermark',
        'Premium Templates',
        'Brand Kits',
        'Eigener API Key',
      ],
    },
    {
      id: 'pro' as const,
      name: 'Pro',
      price: '9€/Monat',
      features: ['Alles aus BYOK', 'AI Content Generation', 'Priority Support'],
    },
  ]

  const currentPlan = plans.find((p) => p.id === subscription.plan)

  const handleOpenPortal = async () => {
    setIsLoadingPortal(true)
    try {
      const response = await fetch('/api/customer-portal', {
        method: 'POST',
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Portal konnte nicht geöffnet werden')
      }

      window.open(data.url, '_blank')
    } catch (error) {
      console.error('Portal error:', error)
      toast({
        title: 'Fehler',
        description: error instanceof Error ? error.message : 'Verbindungsfehler',
        variant: 'destructive',
      })
    } finally {
      setIsLoadingPortal(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">Aktueller Plan</h2>
        <p className="mt-1 text-sm text-gray-500">Dein aktueller Abo-Status</p>

        <div className="mt-6 flex items-center justify-between rounded-lg border-2 border-blue-500 bg-blue-50 p-4">
          <div>
            <p className="text-lg font-bold text-blue-700">{currentPlan?.name || 'Free'}</p>
            <p className="text-sm text-blue-600">{currentPlan?.price}</p>
          </div>
          <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
            Aktiv
          </span>
        </div>

        {subscription.plan !== 'free' && subscription.currentPeriodEnd && (
          <p className="mt-4 text-sm text-gray-500">
            Verlängert sich am {new Date(subscription.currentPeriodEnd).toLocaleDateString('de-DE')}
          </p>
        )}
      </div>

      <div className="rounded-lg border bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">Verfügbare Pläne</h2>
        <p className="mt-1 text-sm text-gray-500">Wähle den Plan, der zu dir passt</p>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                'rounded-lg border p-4',
                subscription.plan === plan.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              )}
            >
              <div className="mb-4">
                <p className="font-semibold text-gray-900">{plan.name}</p>
                <p className="text-2xl font-bold text-gray-900">{plan.price}</p>
              </div>

              <ul className="mb-4 space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>

              {subscription.plan === plan.id ? (
                <Button variant="outline" disabled className="w-full">
                  Aktueller Plan
                </Button>
              ) : plan.id === 'free' ? (
                <Button variant="outline" disabled className="w-full">
                  Free
                </Button>
              ) : (
                <CheckoutButton
                  plan={plan.id}
                  variant={plan.id === 'pro' ? 'default' : 'outline'}
                  className="w-full"
                >
                  {subscription.plan === 'free' ? 'Upgraden' : 'Wechseln'}
                </CheckoutButton>
              )}
            </div>
          ))}
        </div>
      </div>

      {subscription.plan !== 'free' && (
        <div className="rounded-lg border bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">Abo verwalten</h2>
          <p className="mt-1 text-sm text-gray-500">Zahlungsmethode ändern oder Abo kündigen</p>

          <div className="mt-6">
            <Button variant="outline" onClick={handleOpenPortal} disabled={isLoadingPortal}>
              {isLoadingPortal ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ExternalLink className="mr-2 h-4 w-4" />
              )}
              Kundenportal öffnen
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

interface ApiKeySettingsProps {
  subscription: {
    plan: 'free' | 'pro' | 'byok'
  }
}

function ApiKeySettings({ subscription }: ApiKeySettingsProps) {
  const [openaiKey, setOpenaiKey] = useState('')
  const [anthropicKey, setAnthropicKey] = useState('')
  const [showOpenai, setShowOpenai] = useState(false)
  const [showAnthropic, setShowAnthropic] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  const canUseApiKeys = subscription.plan === 'byok' || subscription.plan === 'pro'

  const handleSaveKey = async (provider: 'openai' | 'anthropic') => {
    const key = provider === 'openai' ? openaiKey : anthropicKey
    if (!key) {
      toast({ title: 'Kein API Key eingegeben', variant: 'destructive' })
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch('/api/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, key }),
      })

      if (response.ok) {
        toast({ title: 'API Key gespeichert' })
        if (provider === 'openai') {
          setOpenaiKey('')
        } else {
          setAnthropicKey('')
        }
      } else {
        const data = await response.json()
        toast({
          title: 'Fehler',
          description: data.error,
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Failed to save API key:', error)
      toast({ title: 'Verbindungsfehler', variant: 'destructive' })
    } finally {
      setIsSaving(false)
    }
  }

  if (!canUseApiKeys) {
    return (
      <div className="rounded-lg border bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">API Keys</h2>
        <p className="mt-1 text-sm text-gray-500">Bring Your Own Key (BYOK) für AI Features</p>

        <div className="mt-6 rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
          <Key className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            API Keys sind ab BYOK verfügbar
          </h3>
          <p className="mt-2 text-gray-600">
            Upgrade auf BYOK oder Pro, um eigene API Keys für AI Content Generation zu nutzen.
          </p>
          <div className="mt-6">
            <Button asChild>
              <a href="/pricing">Upgrade</a>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">API Keys</h2>
        <p className="mt-1 text-sm text-gray-500">
          Nutze deine eigenen API Keys für AI Content Generation
        </p>

        <div className="mt-6 space-y-6">
          {/* OpenAI */}
          <div>
            <label className="block text-sm font-medium text-gray-700">OpenAI API Key</label>
            <p className="mt-1 text-xs text-gray-500">Für GPT-basierte Content Generation</p>
            <div className="mt-2 flex gap-2">
              <input
                type={showOpenai ? 'text' : 'password'}
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                placeholder="sk-..."
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
              <Button variant="outline" onClick={() => setShowOpenai(!showOpenai)}>
                {showOpenai ? 'Verstecken' : 'Anzeigen'}
              </Button>
              <Button onClick={() => handleSaveKey('openai')} disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Speichern'}
              </Button>
            </div>
          </div>

          {/* Anthropic */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Anthropic API Key</label>
            <p className="mt-1 text-xs text-gray-500">Für Claude-basierte Content Generation</p>
            <div className="mt-2 flex gap-2">
              <input
                type={showAnthropic ? 'text' : 'password'}
                value={anthropicKey}
                onChange={(e) => setAnthropicKey(e.target.value)}
                placeholder="sk-ant-..."
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
              <Button variant="outline" onClick={() => setShowAnthropic(!showAnthropic)}>
                {showAnthropic ? 'Verstecken' : 'Anzeigen'}
              </Button>
              <Button onClick={() => handleSaveKey('anthropic')} disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Speichern'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm text-amber-800">
          <strong>Hinweis:</strong> Deine API Keys werden verschlüsselt gespeichert und nur für die
          AI Content Generation in deinem Account verwendet.
        </p>
      </div>
    </div>
  )
}
