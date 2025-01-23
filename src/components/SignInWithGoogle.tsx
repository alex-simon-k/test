"use client";

import { useAuth } from '@/lib/hooks/useAuth';
import Image from 'next/image';

export default function SignInWithGoogle() {
  const { signInWithGoogle } = useAuth();

  const handleSignIn = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    await signInWithGoogle('company');
  };

  return (
    <button
      onClick={handleSignIn}
      className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
    >
      <Image
        src="/google-logo.png"
        alt="Google Logo"
        width={20}
        height={20}
        className="mr-2"
      />
      Sign in with Google
    </button>
  );
}
