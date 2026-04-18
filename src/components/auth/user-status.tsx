'use client'

import { Button } from '@/components/ui/button'
import { useRouter } from '@/i18n/navigation'
import { formatUserDisplayName } from '@/lib/auth/utils'
import { useAuth } from '@/shared/providers/auth-provider'

export function UserStatus() {
  const { user, isAuthenticated, logout, isLoading } = useAuth()
  const router = useRouter()

  if (isLoading) {
    return (
      <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900" />
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
      <div>
        <h3 className="font-medium text-green-800">
          Welcome back, {formatUserDisplayName(user)}!
        </h3>
        <p className="text-sm text-green-600 mt-1">
          {user.contactVerified
            ? 'Contact is verified'
            : 'Contact is not verified yet. You can verify it later.'}
        </p>
      </div>
      <div className="flex space-x-2">
        {!user.contactVerified && user.contact && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/auth/verify?contact=${encodeURIComponent(user.contact ?? '')}`)}
          >
            Verify contact
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push('/profile')}
        >
          Profile
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={logout}
          disabled={isLoading}
        >
          {isLoading ? 'Signing out...' : 'Sign Out'}
        </Button>
      </div>
    </div>
  )
}
