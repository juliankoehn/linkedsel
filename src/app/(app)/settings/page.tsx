'use client'

import {
  User,
  CreditCard,
  Key,
  LogOut,
  Check,
  ExternalLink,
} from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type SettingsTab = 'account' | 'subscription' | 'api-keys'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('account')

  // TODO: Get from auth context
  const user = {
    name: 'Demo User',
    email: 'demo@example.com',
    avatarUrl: null,
  }

  // TODO: Get from subscription context
  const subscription = {
    plan: 'free' as 'free' | 'pro' | 'byok',
    status: 'active',
    currentPeriodEnd: null as string | null,
  }

  const tabs = [
    { id: 'account' as const, label: 'Account', icon: User },
    { id: 'subscription' as const, label: 'Abo', icon: CreditCard },
    { id: 'api-keys' as const, label: 'API Keys', icon: Key },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Einstellungen</h1>
        <p className="mt-1 text-gray-600">
          Verwalte dein Konto und deine Einstellungen
        </p>
      </div>

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
                  ? 'bg-brand-50 text-brand-700'
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
          {activeTab === 'account' && <AccountSettings user={user} />}
          {activeTab === 'subscription' && (
            <SubscriptionSettings subscription={subscription} />
          )}
          {activeTab === 'api-keys' && (
            <ApiKeySettings subscription={subscription} />
          )}
        </div>
      </div>
    </div>
  )
}

interface AccountSettingsProps {
  user: {
    name: string
    email: string
    avatarUrl: string | null
  }
}

function AccountSettings({ user }: AccountSettingsProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">Profil</h2>
        <p className="mt-1 text-sm text-gray-500">
          Deine Account-Informationen
        </p>

        <div className="mt-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="bg-brand-100 text-brand-600 flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold">
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
          <Button variant="outline" className="text-red-600 hover:bg-red-50">
            <LogOut className="mr-2 h-4 w-4" />
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
  const plans = [
    {
      id: 'free' as const,
      name: 'Free',
      price: '0€',
      features: [
        'Unbegrenzte Carousels',
        'Basic Templates',
        'PDF Export',
        'Watermark',
      ],
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

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">Aktueller Plan</h2>
        <p className="mt-1 text-sm text-gray-500">Dein aktueller Abo-Status</p>

        <div className="border-brand-500 bg-brand-50 mt-6 flex items-center justify-between rounded-lg border-2 p-4">
          <div>
            <p className="text-brand-700 text-lg font-bold">
              {currentPlan?.name || 'Free'}
            </p>
            <p className="text-brand-600 text-sm">{currentPlan?.price}</p>
          </div>
          <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
            Aktiv
          </span>
        </div>

        {subscription.plan !== 'free' && subscription.currentPeriodEnd && (
          <p className="mt-4 text-sm text-gray-500">
            Verlängert sich am{' '}
            {new Date(subscription.currentPeriodEnd).toLocaleDateString(
              'de-DE'
            )}
          </p>
        )}
      </div>

      <div className="rounded-lg border bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Verfügbare Pläne
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Wähle den Plan, der zu dir passt
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                'rounded-lg border p-4',
                subscription.plan === plan.id
                  ? 'border-brand-500 bg-brand-50'
                  : 'border-gray-200'
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
              ) : (
                <Button
                  variant={plan.id === 'pro' ? 'default' : 'outline'}
                  className="w-full"
                >
                  {subscription.plan === 'free' ? 'Upgraden' : 'Wechseln'}
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {subscription.plan !== 'free' && (
        <div className="rounded-lg border bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">Abo verwalten</h2>
          <p className="mt-1 text-sm text-gray-500">
            Zahlungsmethode ändern oder Abo kündigen
          </p>

          <div className="mt-6">
            <Button variant="outline">
              <ExternalLink className="mr-2 h-4 w-4" />
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

  const canUseApiKeys =
    subscription.plan === 'byok' || subscription.plan === 'pro'

  if (!canUseApiKeys) {
    return (
      <div className="rounded-lg border bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">API Keys</h2>
        <p className="mt-1 text-sm text-gray-500">
          Bring Your Own Key (BYOK) für AI Features
        </p>

        <div className="mt-6 rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
          <Key className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            API Keys sind ab BYOK verfügbar
          </h3>
          <p className="mt-2 text-gray-600">
            Upgrade auf BYOK oder Pro, um eigene API Keys für AI Content
            Generation zu nutzen.
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
            <label className="block text-sm font-medium text-gray-700">
              OpenAI API Key
            </label>
            <p className="mt-1 text-xs text-gray-500">
              Für GPT-basierte Content Generation
            </p>
            <div className="mt-2 flex gap-2">
              <input
                type={showOpenai ? 'text' : 'password'}
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                placeholder="sk-..."
                className="focus:border-brand-500 focus:ring-brand-500 flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-1 focus:outline-none"
              />
              <Button
                variant="outline"
                onClick={() => setShowOpenai(!showOpenai)}
              >
                {showOpenai ? 'Verstecken' : 'Anzeigen'}
              </Button>
              <Button>Speichern</Button>
            </div>
          </div>

          {/* Anthropic */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Anthropic API Key
            </label>
            <p className="mt-1 text-xs text-gray-500">
              Für Claude-basierte Content Generation
            </p>
            <div className="mt-2 flex gap-2">
              <input
                type={showAnthropic ? 'text' : 'password'}
                value={anthropicKey}
                onChange={(e) => setAnthropicKey(e.target.value)}
                placeholder="sk-ant-..."
                className="focus:border-brand-500 focus:ring-brand-500 flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-1 focus:outline-none"
              />
              <Button
                variant="outline"
                onClick={() => setShowAnthropic(!showAnthropic)}
              >
                {showAnthropic ? 'Verstecken' : 'Anzeigen'}
              </Button>
              <Button>Speichern</Button>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm text-amber-800">
          <strong>Hinweis:</strong> Deine API Keys werden verschlüsselt
          gespeichert und nur für die AI Content Generation in deinem Account
          verwendet.
        </p>
      </div>
    </div>
  )
}
