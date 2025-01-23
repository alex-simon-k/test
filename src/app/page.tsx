'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import SignInForm from '@/app/components/auth/SignInForm'
import { db } from '@/lib/firebase/firebase'
import { doc, getDoc } from 'firebase/firestore'

export default function Home() {
  console.log('=== Home Page Mounting ===')
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      const checkUserType = async () => {
        try {
          const userRef = doc(db, 'users', user.uid)
          const userSnap = await getDoc(userRef)
          
          if (userSnap.exists()) {
            const userData = userSnap.data()
            if (userData.userType === 'student') {
              router.push('/dashboard/student')
            } else if (userData.userType === 'company') {
              router.push('/dashboard/company')
            }
          }
        } catch (error) {
          console.error('Error checking user type:', error)
        }
      }
      checkUserType()
    }
  }, [user, router])

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Bidaaya</h1>
          <p className="text-gray-600 text-lg">
            Connect with real-world projects and internship opportunities
          </p>
        </div>
        <SignInForm />
      </div>
    </main>
  )
}
