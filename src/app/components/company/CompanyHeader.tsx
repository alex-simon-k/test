'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import Image from 'next/image'

export default function CompanyHeader() {
  const { user, signOut } = useAuth()
  const [showMenu, setShowMenu] = useState(false)

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">Bidaaya</h1>
            <span className="ml-2 text-sm text-gray-500">Company Dashboard</span>
          </div>
          
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center space-x-3 focus:outline-none"
            >
              {user?.photoURL ? (
                <Image
                  src={user.photoURL}
                  alt="Profile"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                  {user?.email?.[0].toUpperCase()}
                </div>
              )}
              <span className="text-gray-700">{user?.email}</span>
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                <div className="py-1">
                  <button
                    onClick={() => signOut()}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
} 