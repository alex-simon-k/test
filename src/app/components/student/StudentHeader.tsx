'use client'

import { useAuth } from '@/lib/hooks/useAuth'
import Image from 'next/image'
import Link from 'next/link'

export default function StudentHeader() {
  const { user, signOut } = useAuth()

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/dashboard/student" className="text-xl font-semibold text-gray-900">
              Student Dashboard
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              href="/projects"
              className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              Browse Projects
            </Link>
            <div className="relative group">
              <button className="flex items-center space-x-2">
                {user?.photoURL ? (
                  <Image
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-medium">
                      {user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
                <span className="text-sm font-medium text-gray-700">
                  {user?.displayName || user?.email?.split('@')[0] || 'User'}
                </span>
              </button>
              <div className="absolute right-0 mt-2 w-48 py-1 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ease-in-out">
                <button
                  onClick={() => signOut()}
                  className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
} 