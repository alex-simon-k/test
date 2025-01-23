'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'

export default function SignInForm() {
  const router = useRouter()
  const { signInWithGoogle, user, loading } = useAuth()
  const [userType, setUserType] = useState<'student' | 'company'>('student')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // This effect will run when the user state changes
    if (user && !loading) {
      console.log('User authenticated:', user.email)
      console.log('Redirecting to:', `/dashboard/${userType}`)
      router.push(`/dashboard/${userType}`)
    }
  }, [user, loading, userType, router])

  const handleGoogleSignIn = async () => {
    if (isLoading) return
    
    setIsLoading(true)
    setError('')

    try {
      console.log('Starting Google sign in...')
      await signInWithGoogle(userType)
      console.log('Sign in function completed')
    } catch (error) {
      console.error('Sign in error:', error)
      setError('An error occurred during sign in. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-8 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-8 text-center text-gray-900">
        Welcome to Internship Platform
      </h2>

      <div className="mb-8">
        <label className="block text-sm font-medium mb-2 text-gray-900">I am a:</label>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setUserType('student')}
            className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium ${
              userType === 'student' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-900'
            }`}
            disabled={isLoading}
          >
            Student
          </button>
          <button
            type="button"
            onClick={() => setUserType('company')}
            className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium ${
              userType === 'company' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-900'
            }`}
            disabled={isLoading}
          >
            Company
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        className={`w-full py-3 px-4 flex items-center justify-center gap-3 bg-white border-2 border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 font-medium transition-colors ${
          isLoading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
        )}
        {isLoading ? 'Signing in...' : 'Continue with Google'}
      </button>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm text-center">
          {error}
        </div>
      )}
    </div>
  )
} 