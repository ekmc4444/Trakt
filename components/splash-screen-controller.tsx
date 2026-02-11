import { useEffect } from 'react'
import { SplashScreen } from 'expo-router'
import { useAuthContext } from '@/hooks/use-auth-context'

export function SplashScreenController() {
  const { isLoading } = useAuthContext()

  useEffect(() => {
    let mounted = true
    let fallbackTimer: NodeJS.Timeout | number | null = null

    // Prevent auto-hide once when component mounts
    SplashScreen.preventAutoHideAsync().catch((e) => {
      console.warn('Failed to prevent auto hide splash:', e)
    })

    // Fallback: ensure the splash is hidden after 7s if something goes wrong
    fallbackTimer = setTimeout(() => {
      if (!mounted) return
      SplashScreen.hideAsync().catch((e) => {
        console.warn('Failed to hide splash (fallback):', e)
      })
    }, 7000)

    return () => {
      mounted = false
      if (fallbackTimer) clearTimeout(fallbackTimer as any)
    }
  }, [])

  useEffect(() => {
    // When auth loading finishes, hide the splash
    if (!isLoading) {
      SplashScreen.hideAsync().catch((e) => {
        console.warn('Failed to hide splash:', e)
      })
    }
  }, [isLoading])

  return null
}